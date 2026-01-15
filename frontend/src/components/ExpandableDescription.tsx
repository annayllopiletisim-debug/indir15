'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ExpandableDescriptionProps {
  description: string;
  previewLength?: number;
  className?: string;
}

export default function ExpandableDescription({ 
  description, 
  previewLength = 200,
  className = ''
}: ExpandableDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // If description is short enough, just show it
  if (description.length <= previewLength) {
    return (
      <div className={`text-gray-600 leading-relaxed ${className}`}>
        {description}
      </div>
    );
  }
  
  // Find a good break point (end of sentence or word)
  let breakPoint = previewLength;
  const sentenceEnd = description.lastIndexOf('.', previewLength);
  if (sentenceEnd > previewLength * 0.6) {
    breakPoint = sentenceEnd + 1;
  } else {
    const wordEnd = description.lastIndexOf(' ', previewLength);
    if (wordEnd > previewLength * 0.6) {
      breakPoint = wordEnd;
    }
  }
  
  const previewText = description.slice(0, breakPoint);
  const remainingText = description.slice(breakPoint);
  
  return (
    <div className={`text-gray-600 leading-relaxed ${className}`}>
      <span>{previewText}</span>
      {!isExpanded && remainingText && (
        <span>...</span>
      )}
      {isExpanded && (
        <span>{remainingText}</span>
      )}
      
      {remainingText && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center gap-1 ml-2 text-purple-600 hover:text-purple-700 font-medium text-sm transition-colors"
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
