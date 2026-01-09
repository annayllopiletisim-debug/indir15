'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { FileSpreadsheet, Upload, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface ImportResult {
  success: boolean;
  imported: number;
  errors: string[];
}

export default function AdminImportPage() {
  const [sheetUrl, setSheetUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  const handleImport = async () => {
    if (!sheetUrl.trim()) {
      alert('Lütfen Google Sheets URL\'i girin');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/import/sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sheetUrl }),
      });

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ success: false, imported: 0, errors: ['Bağlantı hatası'] });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <FileSpreadsheet className="w-8 h-8 text-green-500" />
        <h1 className="text-2xl font-bold text-white">Google Sheets'ten İçe Aktar</h1>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">İndirim Verilerini İçe Aktar</h2>
        
        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-2">Google Sheets URL</label>
          <input
            type="text"
            value={sheetUrl}
            onChange={(e) => setSheetUrl(e.target.value)}
            placeholder="https://docs.google.com/spreadsheets/d/..."
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500"
          />
        </div>

        <div className="bg-slate-700/50 rounded-lg p-4 mb-4">
          <h3 className="text-sm font-medium text-gray-300 mb-2">Gerekli Sütunlar:</h3>
          <ul className="text-sm text-gray-400 space-y-1">
            <li>• <strong>brand_name</strong> - Mağaza adı (zorunlu)</li>
            <li>• <strong>title</strong> - İndirim başlığı (zorunlu)</li>
            <li>• <strong>description</strong> - Açıklama</li>
            <li>• <strong>discount_text</strong> - İndirim oranı (örn: %50)</li>
            <li>• <strong>destination_url</strong> - Hedef URL</li>
            <li>• <strong>expiry_date</strong> - Bitiş tarihi (YYYY-MM-DD)</li>
            <li>• <strong>image_url</strong> - Görsel URL</li>
          </ul>
        </div>

        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-4">
          <p className="text-sm text-yellow-400">
            <strong>Not:</strong> Google Sheets dosyanızın "Bağlantıya sahip herkes görüntüleyebilir" 
            olarak paylaşıldığından emin olun.
          </p>
        </div>

        <button
          onClick={handleImport}
          disabled={loading || !sheetUrl.trim()}
          className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              İçe Aktarılıyor...
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              İçe Aktar
            </>
          )}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className={`rounded-xl border p-6 ${
          result.success 
            ? 'bg-green-500/10 border-green-500/30' 
            : 'bg-red-500/10 border-red-500/30'
        }`}>
          <div className="flex items-center gap-3 mb-4">
            {result.success ? (
              <CheckCircle className="w-6 h-6 text-green-500" />
            ) : (
              <AlertCircle className="w-6 h-6 text-red-500" />
            )}
            <h3 className={`text-lg font-semibold ${result.success ? 'text-green-400' : 'text-red-400'}`}>
              {result.success ? 'İçe Aktarma Başarılı' : 'İçe Aktarma Tamamlandı'}
            </h3>
          </div>
          
          <p className="text-gray-300 mb-2">
            <strong>{result.imported}</strong> indirim başarıyla içe aktarıldı.
          </p>

          {result.errors.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-400 mb-2">Hatalar:</h4>
              <ul className="text-sm text-red-400 space-y-1 max-h-40 overflow-y-auto">
                {result.errors.map((error, i) => (
                  <li key={i}>• {error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
