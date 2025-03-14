import { NextApiRequest, NextApiResponse } from 'next';
import multer, { FileFilterCallback } from 'multer';
import { promises as fs } from 'fs';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';

// Convert exec to promise-based
const execPromise = util.promisify(exec);

// Define types for multer
interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  destination: string;
  filename: string;
  path: string;
  size: number;
}

// Extend NextApiRequest to include files
interface NextApiRequestWithFiles extends NextApiRequest {
  files: MulterFile[];
}

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: async (req: Express.Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
      // Create uploads directory if it doesn't exist
      const uploadDir = path.join(process.cwd(), 'uploads');
      try {
        await fs.mkdir(uploadDir, { recursive: true });
        cb(null, uploadDir);
      } catch (error) {
        cb(error as Error, uploadDir);
      }
    },
    filename: (req: Express.Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
      // Create unique filename
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + '-' + file.originalname);
    }
  }),
  fileFilter: (req: Express.Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    // Accept only specific file types
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOCX, and TXT files are allowed.') as any, false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Helper to process the uploaded file using Python
async function processFileWithPython(filePath: string): Promise<any> {
  try {
    // Get file extension
    const ext = path.extname(filePath).toLowerCase();
    
    // Run Python script to process the file and generate word cloud data
    const scriptPath = path.join(process.cwd(), 'scripts', 'process_document.py');
    
    // Create the Python script directory if it doesn't exist
    await fs.mkdir(path.join(process.cwd(), 'scripts'), { recursive: true });
    
    // Create the Python script if it doesn't exist
    const pythonScript = `
import sys
import json
import re
import os
from collections import Counter

# For PDF processing
try:
    import PyPDF2
except ImportError:
    pass

# For DOCX processing
try:
    import docx
except ImportError:
    pass

# For NLP processing
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize

# Download NLTK resources if not already downloaded
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')

def extract_text_from_pdf(file_path):
    text = ""
    with open(file_path, 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        for page in reader.pages:
            text += page.extract_text() + "\\n"
    return text

def extract_text_from_docx(file_path):
    doc = docx.Document(file_path)
    text = ""
    for para in doc.paragraphs:
        text += para.text + "\\n"
    return text

def extract_text_from_txt(file_path):
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as file:
        return file.read()

def process_text(text):
    # Convert to lowercase
    text = text.lower()
    
    # Remove special characters and numbers
    text = re.sub(r'[^\\w\\s]', '', text)
    text = re.sub(r'\\d+', '', text)
    
    # Tokenize
    tokens = word_tokenize(text)
    
    # Remove stopwords
    stop_words = set(stopwords.words('english'))
    filtered_tokens = [word for word in tokens if word not in stop_words and len(word) > 2]
    
    # Count word frequencies
    word_counts = Counter(filtered_tokens)
    
    # Convert to list of dictionaries for word cloud
    word_cloud_data = [{"text": word, "value": count} for word, count in word_counts.most_common(300)]
    
    return word_cloud_data

def main():
    if len(sys.argv) != 2:
        print(json.dumps({"error": "Missing file path argument"}))
        sys.exit(1)
    
    file_path = sys.argv[1]
    
    if not os.path.exists(file_path):
        print(json.dumps({"error": f"File not found: {file_path}"}))
        sys.exit(1)
    
    try:
        # Extract text based on file extension
        ext = os.path.splitext(file_path)[1].lower()
        
        if ext == '.pdf':
            text = extract_text_from_pdf(file_path)
        elif ext == '.docx':
            text = extract_text_from_docx(file_path)
        elif ext == '.txt':
            text = extract_text_from_txt(file_path)
        else:
            print(json.dumps({"error": f"Unsupported file extension: {ext}"}))
            sys.exit(1)
        
        # Process the text and generate word cloud data
        word_cloud_data = process_text(text)
        
        # Return the result as JSON
        print(json.dumps({"wordCloudData": word_cloud_data}))
        
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()
`;
    
    await fs.writeFile(scriptPath, pythonScript);
    
    // Execute the Python script
    const { stdout, stderr } = await execPromise(`python ${scriptPath} "${filePath}"`);
    
    if (stderr) {
      console.error('Python script error:', stderr);
      throw new Error('Error processing file with Python');
    }
    
    // Parse the JSON output from the Python script
    return JSON.parse(stdout);
  } catch (error) {
    console.error('Error processing file:', error);
    throw error;
  }
}

// Wrap multer middleware to work with Next.js API routes
function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: any) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

// Disable Next.js body parsing for this route
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'uploads');
    await fs.mkdir(uploadDir, { recursive: true });

    // Run multer middleware
    await runMiddleware(req, res, upload.array('documents'));

    // Get the uploaded files
    const files = (req as NextApiRequestWithFiles).files;
    
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    console.log(`Processing ${files.length} files`);
    
    // Process each file and combine the results
    let allWordCloudData: any[] = [];
    
    for (const file of files) {
      try {
        console.log(`Processing file: ${file.originalname}`);
        const result = await processFileWithPython(file.path);
        
        if (result.wordCloudData) {
          allWordCloudData = [...allWordCloudData, ...result.wordCloudData];
        }
        
        // Delete the file after processing
        await fs.unlink(file.path);
      } catch (error) {
        console.error(`Error processing file ${file.originalname}:`, error);
        // Continue with other files even if one fails
      }
    }
    
    // Combine and deduplicate word cloud data
    const wordMap = new Map();
    
    allWordCloudData.forEach(item => {
      const text = item.text;
      const value = item.value;
      
      if (wordMap.has(text)) {
        wordMap.set(text, wordMap.get(text) + value);
      } else {
        wordMap.set(text, value);
      }
    });
    
    // Convert back to array and sort by value
    const combinedWordCloudData = Array.from(wordMap.entries())
      .map(([text, value]) => ({ text, value }))
      .sort((a, b) => b.value - a.value);
    
    return res.status(200).json({ wordCloudData: combinedWordCloudData });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Error processing files' });
  }
}
