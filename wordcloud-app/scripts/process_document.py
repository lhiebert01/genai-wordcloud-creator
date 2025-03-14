
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
            text += page.extract_text() + "\n"
    return text

def extract_text_from_docx(file_path):
    doc = docx.Document(file_path)
    text = ""
    for para in doc.paragraphs:
        text += para.text + "\n"
    return text

def extract_text_from_txt(file_path):
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as file:
        return file.read()

def process_text(text):
    # Convert to lowercase
    text = text.lower()
    
    # Remove special characters and numbers
    text = re.sub(r'[^\w\s]', '', text)
    text = re.sub(r'\d+', '', text)
    
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
