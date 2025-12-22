import React from 'react';

/**
 * AlphabetNav - Horizontal alphabet filter bar
 * 
 * Props:
 * - letters: Array of available letters (e.g., ['A', 'B', 'C', ...])
 * - selectedLetter: Currently selected letter (null for all)
 * - onSelect: Callback when letter is clicked
 */
const AlphabetNav = ({ letters = [], selectedLetter = null, onSelect }) => {
  // Generate full alphabet
  const alphabet = 'ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ'.split('');
  
  return (
    <div className="flex flex-wrap gap-1 mb-6">
      {/* All button */}
      <button
        onClick={() => onSelect(null)}
        className={`
          px-3 py-1.5 rounded-lg text-sm font-medium transition-all
          ${selectedLetter === null
            ? 'bg-primary text-white'
            : 'bg-muted hover:bg-muted/80 text-muted-foreground'
          }
        `}
      >
        Tümü
      </button>
      
      {/* Letter buttons */}
      {alphabet.map((letter) => {
        const hasItems = letters.includes(letter);
        const isSelected = selectedLetter === letter;
        
        return (
          <button
            key={letter}
            onClick={() => hasItems && onSelect(letter)}
            disabled={!hasItems}
            className={`
              w-8 h-8 rounded-lg text-sm font-medium transition-all
              ${isSelected
                ? 'bg-primary text-white'
                : hasItems
                  ? 'bg-muted hover:bg-primary/20 text-foreground'
                  : 'bg-muted/30 text-muted-foreground/40 cursor-not-allowed'
              }
            `}
          >
            {letter}
          </button>
        );
      })}
    </div>
  );
};

export default AlphabetNav;
