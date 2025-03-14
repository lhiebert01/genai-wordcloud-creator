import React, { useState } from 'react';
import Head from 'next/head';
import FileUpload from '../components/FileUpload';
import WordCloud from '../components/WordCloud';

interface WordCloudData {
  text: string;
  value: number;
}

export default function Home() {
  const [wordCloudData, setWordCloudData] = useState<WordCloudData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [colorScheme, setColorScheme] = useState<string>('default');
  const [maxWords, setMaxWords] = useState<number>(150);

  const colorSchemes = {
    default: ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b'],
    blues: ['#045a8d', '#2b8cbe', '#74a9cf', '#a6bddb', '#d0d1e6', '#f1eef6'],
    greens: ['#00441b', '#1b7837', '#5aae61', '#a6dba0', '#d9f0d3', '#f7fcf5'],
    reds: ['#67000d', '#a50f15', '#cb181d', '#ef3b2c', '#fb6a4a', '#fcbba1'],
    purples: ['#3f007d', '#54278f', '#756bb1', '#9e9ac8', '#cbc9e2', '#f2f0f7'],
  };

  const handleFileUpload = async (files: File[]) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('documents', file);
      });

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.wordCloudData && Array.isArray(data.wordCloudData)) {
        setWordCloudData(data.wordCloudData.slice(0, maxWords));
      } else {
        throw new Error('Invalid data format received from server');
      }
    } catch (err) {
      console.error('Error uploading files:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setWordCloudData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMaxWordsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setMaxWords(value);
    
    // If we already have data, update the displayed words
    if (wordCloudData.length > 0) {
      const originalData = [...wordCloudData];
      setWordCloudData(originalData.slice(0, value));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Word Cloud Generator</title>
        <meta name="description" content="Generate beautiful word clouds from your documents" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Word Cloud Generator</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <FileUpload onFileUpload={handleFileUpload} isLoading={isLoading} />
              
              {wordCloudData.length > 0 && (
                <div className="card">
                  <h2 className="text-xl font-bold mb-4">Customization</h2>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Color Scheme
                    </label>
                    <select
                      value={colorScheme}
                      onChange={(e) => setColorScheme(e.target.value)}
                      className="input-field"
                    >
                      <option value="default">Default</option>
                      <option value="blues">Blues</option>
                      <option value="greens">Greens</option>
                      <option value="reds">Reds</option>
                      <option value="purples">Purples</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Maximum Words: {maxWords}
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="300"
                      step="10"
                      value={maxWords}
                      onChange={handleMaxWordsChange}
                      className="w-full"
                    />
                  </div>
                </div>
              )}
            </div>
            
            <div className="lg:col-span-2">
              {isLoading ? (
                <div className="card flex items-center justify-center p-10">
                  <div className="text-center">
                    <svg 
                      className="animate-spin h-10 w-10 text-primary-500 mx-auto mb-4" 
                      xmlns="http://www.w3.org/2000/svg" 
                      fill="none" 
                      viewBox="0 0 24 24"
                    >
                      <circle 
                        className="opacity-25" 
                        cx="12" 
                        cy="12" 
                        r="10" 
                        stroke="currentColor" 
                        strokeWidth="4"
                      ></circle>
                      <path 
                        className="opacity-75" 
                        fill="currentColor" 
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <p className="text-gray-600">Processing your documents...</p>
                    <p className="text-sm text-gray-500 mt-2">This may take a moment depending on file size</p>
                  </div>
                </div>
              ) : error ? (
                <div className="card p-6 bg-red-50 border border-red-200">
                  <div className="flex items-center mb-3">
                    <svg 
                      className="h-6 w-6 text-red-500 mr-3" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                      />
                    </svg>
                    <h3 className="text-lg font-medium text-red-800">Error</h3>
                  </div>
                  <p className="text-red-700">{error}</p>
                  <p className="mt-3 text-sm text-red-600">
                    Please try again or check if your documents are in the supported format.
                  </p>
                </div>
              ) : wordCloudData.length > 0 ? (
                <WordCloud 
                  words={wordCloudData} 
                  colors={colorSchemes[colorScheme as keyof typeof colorSchemes]}
                />
              ) : (
                <div className="card flex flex-col items-center justify-center p-10 text-center">
                  <svg 
                    className="w-16 h-16 text-gray-400 mb-4" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={1} 
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                    />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Word Cloud Generated Yet</h3>
                  <p className="text-gray-500 max-w-md">
                    Upload your documents (PDF, DOCX, or TXT) to generate a beautiful word cloud visualization
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            Word Cloud Generator © {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}
