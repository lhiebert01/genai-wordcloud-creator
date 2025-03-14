# GenAI Word Cloud Creator ☁️

A powerful and customizable word cloud generator application that combines document analysis with ChatGPT integration. Create beautiful word clouds from documents or AI-generated content with various shapes and styles.

[![Streamlit App](https://static.streamlit.io/badges/streamlit_badge_black_white.svg)](https://genai-wordcloud-creator.streamlit.app/)
[![GitHub](https://img.shields.io/badge/github-%23121011.svg?style=flat&logo=github&logoColor=white)](https://github.com/lhiebert01/genai-wordcloud-creator)

## ✨ Features

- **Document Analysis**: Upload and analyze PDF, DOCX, or TXT files
- **ChatGPT Integration**: Generate content using OpenAI's GPT models
- **Editable AI Responses**: Edit ChatGPT responses before visualization
- **Customizable Word Cloud**: Adjust size, resolution, and appearance
- **Color Customization**: Choose from various color schemes and background colors
- **Word Filtering**: Remove common stop words and customize excluded terms
- **Word Frequency Analysis**: View detailed word frequency statistics
- **Export Options**: Download word clouds as PNG or word frequency data as CSV/TXT
- **Responsive Design**: Works on desktop and mobile devices
- **Persistent Display**: Word cloud remains visible when changing settings or downloading

## 🚀 Getting Started

### Prerequisites

- Python 3.12 or higher
- Conda (for environment management)

### Installation

```bash
# Clone the repository
git clone https://github.com/lhiebert01/genai-wordcloud-creator.git
cd genai-wordcloud-creator

# Create a conda environment
conda create -p venv python=3.12.9 -y

# Activate the environment
conda activate venv

# Install dependencies
pip install -r requirements.txt
```

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
OPENAI_API_KEY=your_openai_api_key_here
```

### Running the Application

```bash
streamlit run app.py
```

Open your browser and navigate to http://localhost:8501

## 📁 Project Structure

```
genai-wordcloud-creator/
├── app.py                 # Main Streamlit application
├── app_stable.py          # Stable backup of the application
├── app_stable_final.py    # Final stable version with all fixes
├── requirements.txt       # Python dependencies
├── .env                   # Environment variables (not in repo)
├── .gitignore             # Git ignore file
├── LICENSE                # MIT License file
├── README.md              # Project documentation
├── package.json           # Node.js package configuration
├── venv/                  # Python virtual environment (not in repo)
└── wordcloud-app/         # Next.js application (future implementation)
    ├── pages/             # Next.js pages
    │   ├── index.tsx      # Main page component
    │   └── api/           # API routes
    │       └── upload.ts  # File upload API endpoint
    ├── scripts/           # Python scripts for processing
    ├── styles/            # CSS styles
    ├── types/             # TypeScript type definitions
    └── uploads/           # Temporary storage for uploads (not in repo)
```

## 🔧 How It Works

### Document Processing

1. **Upload**: User uploads a document (PDF, DOCX, or TXT)
2. **Text Extraction**: The app extracts text based on file type
3. **Preprocessing**: Text is cleaned by removing special characters, numbers, and common stop words
4. **Visualization**: A word cloud is generated where word size represents frequency

### ChatGPT Integration

1. **User Input**: User enters a prompt or question
2. **API Call**: The app sends the prompt to OpenAI's API
3. **Response**: ChatGPT generates a response
4. **Editing**: User can edit the response if needed
5. **Visualization**: A word cloud is generated from the edited response

## 🌐 Deployment

### Streamlit Cloud

1. Push your code to GitHub
2. Log in to [Streamlit Cloud](https://streamlit.io/cloud)
3. Create a new app pointing to your GitHub repository
4. Set the environment variables (OPENAI_API_KEY)
5. Deploy the app

### Render

1. Push your code to GitHub
2. Create a new Web Service in Render
3. Connect to your GitHub repository
4. Configure as a Python application
5. Set the build command: `pip install -r requirements.txt`
6. Set the start command: `streamlit run app.py`
7. Add environment variables

### Heroku

1. Push your code to GitHub
2. Create a new Heroku app
3. Connect to your GitHub repository
4. Add the Python buildpack
5. Set environment variables
6. Deploy the app

## 📊 Usage Examples

### Document Analysis

1. Navigate to the "Upload Document" tab
2. Upload a PDF, DOCX, or TXT file
3. Click "Generate Word Cloud from Document"
4. Customize the appearance using the sidebar options
5. Download the word cloud or frequency data

### ChatGPT Content Generation

1. Navigate to the "ChatGPT" tab
2. Enter a prompt (e.g., "Write a 500-word essay about climate change")
3. Click "Submit"
4. Edit the response if needed
5. Click "Generate Word Cloud from ChatGPT Response"
6. Customize the appearance using the sidebar options
7. Download the word cloud or frequency data

## 🛠️ Customization Options

- **Maximum Words**: Control how many words appear in the cloud
- **Size and Resolution**: Adjust width and height for optimal display
- **Color Scheme**: Select from various color palettes
- **Background Color**: Choose any custom background color
- **Word Filtering**: Remove common stop words and customize excluded terms
- **Word Count Threshold**: Set minimum frequency for words to appear

## 👨‍💻 Developer

Developed by [Lindsay Hiebert](https://www.linkedin.com/in/lindsayhiebert/)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
