import React, { useEffect, useRef, useState } from 'react';
import { select, scaleLinear, scaleOrdinal } from 'd3';
import cloud from 'd3-cloud';

interface WordCloudProps {
  words: Array<{
    text: string;
    value: number;
  }>;
  width?: number;
  height?: number;
  colors?: string[];
  fontSizes?: [number, number];
  rotations?: number[];
}

interface CloudWord {
  text: string;
  value: number;
  size?: number;
  x?: number;
  y?: number;
  rotate?: number;
}

const WordCloud: React.FC<WordCloudProps> = ({
  words,
  width = 800,
  height = 600,
  colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b'],
  fontSizes = [12, 80],
  rotations = [0, 90]
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isRendered, setIsRendered] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string>('');

  useEffect(() => {
    if (!words || words.length === 0 || !svgRef.current) {
      return;
    }

    // Clear previous content
    select(svgRef.current).selectAll('*').remove();

    const layout = cloud<CloudWord>()
      .size([width, height])
      .words(words.map(d => ({ ...d })))
      .padding(5)
      .rotate(() => rotations[Math.floor(Math.random() * rotations.length)])
      .font('Inter')
      .fontSize((d: CloudWord) => {
        const [min, max] = fontSizes;
        const maxValue = Math.max(...words.map(w => w.value));
        const minValue = Math.min(...words.map(w => w.value));
        const scale = scaleLinear()
          .domain([minValue, maxValue])
          .range([min, max]);
        return scale(d.value);
      })
      .on('end', draw);

    layout.start();

    function draw(words: CloudWord[]) {
      const colorScale = scaleOrdinal<string>().range(colors);

      select(svgRef.current)
        .attr('width', layout.size()[0])
        .attr('height', layout.size()[1])
        .append('g')
        .attr('transform', `translate(${layout.size()[0] / 2},${layout.size()[1] / 2})`)
        .selectAll('text')
        .data(words)
        .enter()
        .append('text')
        .style('font-size', (d: CloudWord) => `${d.size}px`)
        .style('font-family', 'Inter, sans-serif')
        .style('fill', (_, i: number) => colorScale(i.toString()))
        .attr('text-anchor', 'middle')
        .attr('transform', (d: CloudWord) => `translate(${d.x},${d.y}) rotate(${d.rotate})`)
        .text((d: CloudWord) => d.text);

      setIsRendered(true);
    }
  }, [words, width, height, colors, fontSizes, rotations]);

  const handleDownload = () => {
    if (!svgRef.current || !isRendered) return;

    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    const img = new Image();
    
    img.onload = () => {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      
      const pngUrl = canvas.toDataURL('image/png');
      setDownloadUrl(pngUrl);
      
      // Trigger download
      const a = document.createElement('a');
      a.href = pngUrl;
      a.download = 'wordcloud.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };
    
    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
  };

  if (!words || words.length === 0) {
    return (
      <div className="card flex items-center justify-center p-10 text-gray-500">
        <p>No data available to generate word cloud</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Word Cloud</h2>
        <button 
          onClick={handleDownload}
          disabled={!isRendered}
          className={`btn-primary flex items-center ${!isRendered ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <svg 
            className="w-5 h-5 mr-2" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" 
            />
          </svg>
          Download PNG
        </button>
      </div>
      
      <div className="overflow-hidden bg-white rounded-lg">
        <svg 
          ref={svgRef} 
          width={width} 
          height={height}
          className="mx-auto"
        ></svg>
      </div>
      
      <div className="mt-4">
        <h3 className="text-md font-semibold mb-2">Top Words</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {words.slice(0, 12).map((word, index) => (
            <div 
              key={index} 
              className="flex justify-between items-center p-2 bg-gray-50 rounded"
            >
              <span className="font-medium">{word.text}</span>
              <span className="text-gray-500 text-sm">{word.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WordCloud;
