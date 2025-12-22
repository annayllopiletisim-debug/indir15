import React, { useState } from 'react';
import { X, Download, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CatalogViewer = ({ catalog, onClose }) => {
  const [zoom, setZoom] = useState(100);

  if (!catalog) return null;

  const pdfUrl = catalog.pdf_url.startsWith('/uploads/')
    ? `${process.env.REACT_APP_BACKEND_URL}${catalog.pdf_url}`
    : catalog.pdf_url;

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));

  const handleDownload = () => {
    window.open(pdfUrl, '_blank');
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/90 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="font-heading font-bold text-lg">{catalog.title}</h3>
          
          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-void-subtle rounded-lg p-1">
              <button
                onClick={handleZoomOut}
                className="p-2 hover:bg-white/10 rounded transition-colors"
                title="Uzaklaştır"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="px-2 text-sm min-w-[3rem] text-center">{zoom}%</span>
              <button
                onClick={handleZoomIn}
                className="p-2 hover:bg-white/10 rounded transition-colors"
                title="Yaklaştır"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            {/* Download Button */}
            <button
              onClick={handleDownload}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="PDF İndir"
            >
              <Download className="w-5 h-5" />
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 overflow-auto p-4">
          <div 
            className="mx-auto transition-all duration-200"
            style={{ 
              width: `${zoom}%`,
              maxWidth: '1200px'
            }}
          >
            <iframe
              src={`${pdfUrl}#toolbar=0&view=FitH`}
              className="w-full bg-white rounded-lg"
              style={{ height: 'calc(100vh - 120px)' }}
              title={catalog.title}
            />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CatalogViewer;
