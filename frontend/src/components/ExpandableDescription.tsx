'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ExpandableDescriptionProps {
  description: string;
  previewLength?: number;
  className?: string;
}

// Helper function to format the description with proper structure
function formatDescription(text: string): React.ReactNode[] {
  const elements: React.ReactNode[] = [];
  
  // Split by lines
  const lines = text.split('\n').filter(line => line.trim());
  
  let currentParagraph: string[] = [];
  let keyIndex = 0;
  
  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      const text = currentParagraph.join(' ').trim();
      if (text) {
        elements.push(
          <p key={`p-${keyIndex++}`} className="mb-3 text-gray-600">
            {text}
          </p>
        );
      }
      currentParagraph = [];
    }
  };
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Check if line ends with ? (question = subheading)
    if (trimmedLine.endsWith('?')) {
      flushParagraph();
      elements.push(
        <h4 key={`h-${keyIndex++}`} className="font-semibold text-gray-800 mt-4 mb-2">
          {trimmedLine}
        </h4>
      );
    }
    // Check if line starts with bullet point
    else if (trimmedLine.startsWith('•') || trimmedLine.startsWith('●')) {
      flushParagraph();
      // Collect all bullet points
      const bulletText = trimmedLine.replace(/^[•●]\s*/, '');
      elements.push(
        <li key={`li-${keyIndex++}`} className="text-gray-600 ml-4 mb-1 list-disc list-inside">
          {bulletText}
        </li>
      );
    }
    // Regular paragraph text
    else {
      currentParagraph.push(trimmedLine);
    }
  }
  
  flushParagraph();
  
  return elements;
}

export default function ExpandableDescription({ 
  description, 
  previewLength = 200,
  className = ''
}: ExpandableDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Find the first paragraph (intro text before first question)
  const firstQuestionIndex = description.indexOf('?');
  const firstNewlineAfterIntro = description.indexOf('\n');
  
  let introEnd = Math.min(
    firstQuestionIndex > 0 ? firstQuestionIndex : description.length,
    firstNewlineAfterIntro > 0 ? firstNewlineAfterIntro : description.length
  );
  
  // Find a good break point for intro
  if (introEnd < 100) {
    // If intro is too short, find next sentence end
    const nextPeriod = description.indexOf('.', 100);
    if (nextPeriod > 0 && nextPeriod < 400) {
      introEnd = nextPeriod + 1;
    }
  }
  
  const introText = description.slice(0, introEnd).trim();
  const hasMore = description.length > introEnd + 10;
  
  // Format the full description
  const formattedContent = formatDescription(description);
  
  // Format just the intro for preview
  const introContent = (
    <p className="text-gray-600 mb-3">{introText}</p>
  );
  
  return (
    <div className={`${className}`}>
      {!isExpanded ? (
        <>
          {introContent}
          {hasMore && <span className="text-gray-400">...</span>}
        </>
      ) : (
        <div className="space-y-0">
          {formattedContent}
        </div>
      )}
      
      {hasMore && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center gap-1 mt-3 text-purple-600 hover:text-purple-700 font-medium text-sm transition-colors"
        >
          {isExpanded ? (
            <>
              Daha az göster
              <ChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              Devamını oku
              <ChevronDown className="w-4 h-4" />
            </>
          )}
        </button>
      )}
    </div>
  );
}
