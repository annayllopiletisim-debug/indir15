import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { 
  FileSpreadsheet, 
  Upload, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Loader2,
  ExternalLink,
  Info
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { getAuthToken } from '../../utils/auth';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AdminImportPage = () => {
  const [sheetUrl, setSheetUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleImport = async (e) => {
    e.preventDefault();
    
    if (!sheetUrl.trim()) {
      setError('Lütfen bir Google Sheet URL\'si girin');
      return;
    }

    if (!sheetUrl.includes('docs.google.com/spreadsheets')) {
      setError('Geçerli bir Google Sheets URL\'si girin');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const token = getAuthToken();
      const response = await axios.post(
        `${API}/admin/import-sheet`,
        { sheet_url: sheetUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResult(response.data);
    } catch (err) {
      console.error('Import error:', err);
      setError(err.response?.data?.detail || 'İçe aktarma sırasında bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const expectedColumns = [
    { name: 'Türü', desc: 'İndirim veya Kupon', required: false },
    { name: 'Mağaza', desc: 'Mağaza adı (sistemdeki ile eşleşmeli)', required: true },
    { name: 'Başlık', desc: 'İndirim/kupon başlığı', required: true },
    { name: 'Açıklama (Kısa)', desc: 'Kartlarda görünecek kısa açıklama', required: false },
    { name: 'Uzun Açıklama (Detay Sayfası)', desc: 'Detay sayfasındaki uzun açıklama', required: false },
    { name: 'İndirim Metni', desc: 'Örn: %50 İndirim', required: false },
    { name: 'Bitiş Tarihi', desc: 'Örn: 1 Ocak 2026', required: false },
    { name: 'URL', desc: 'Hedef sayfa URL\'si', required: false },
    { name: 'Kupon Kodu', desc: 'Sadece kuponlar için', required: false },
    { name: 'Kullanım Koşulları', desc: 'Detay sayfasında gösterilir', required: false },
  ];

  return (
    <>
      <Helmet>
        <title>Sheet İçe Aktar - Admin</title>
      </Helmet>
      
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
            <FileSpreadsheet className="w-7 h-7" />
            Google Sheet'ten İçe Aktar
          </h1>
          <p className="text-muted-foreground mt-1">
            Google Sheet'teki verileri otomatik olarak indirim ve kuponlara dönüştürün
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-void-paper border border-white/5 rounded-xl p-6 mb-6">
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-400" />
            Nasıl Kullanılır?
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>Google Sheet'inizi <strong>"Bağlantıya sahip herkes görüntüleyebilir"</strong> olarak paylaşın</li>
            <li>Sheet URL'sini aşağıya yapıştırın</li>
            <li>"İçe Aktar" butonuna tıklayın</li>
            <li>Sistem mağaza eşleştirmesini otomatik yapacak</li>
          </ol>
        </div>

        {/* Expected Columns */}
        <div className="bg-void-paper border border-white/5 rounded-xl p-6 mb-6">
          <h2 className="font-semibold mb-3">Beklenen Sütunlar</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {expectedColumns.map((col) => (
              <div key={col.name} className="flex items-start gap-2 text-sm">
                <span className={`font-medium ${col.required ? 'text-primary' : 'text-muted-foreground'}`}>
                  {col.name}{col.required && '*'}:
                </span>
                <span className="text-muted-foreground">{col.desc}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">* Zorunlu alanlar</p>
        </div>

        {/* Import Form */}
        <form onSubmit={handleImport} className="bg-void-paper border border-white/5 rounded-xl p-6 mb-6">
          <label className="block text-sm font-medium mb-2">Google Sheet URL</label>
          <div className="flex gap-3">
            <Input
              type="url"
              value={sheetUrl}
              onChange={(e) => setSheetUrl(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/..."
              className="flex-1"
              disabled={loading}
            />
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  İşleniyor...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  İçe Aktar
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 text-red-400">
              <XCircle className="w-5 h-5" />
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-void-paper border border-white/5 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-blue-400">{result.total_rows}</div>
                <div className="text-sm text-muted-foreground">Toplam Satır</div>
              </div>
              <div className="bg-void-paper border border-white/5 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-green-400">{result.imported}</div>
                <div className="text-sm text-muted-foreground">Başarılı</div>
              </div>
              <div className="bg-void-paper border border-white/5 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-orange-400">{result.skipped}</div>
                <div className="text-sm text-muted-foreground">Atlanan</div>
              </div>
            </div>

            {/* Imported Items */}
            {result.imported_items?.length > 0 && (
              <div className="bg-void-paper border border-white/5 rounded-xl p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2 text-green-400">
                  <CheckCircle className="w-5 h-5" />
                  Başarıyla Eklenen ({result.imported_items.length})
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {result.imported_items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg">
                      <div>
                        <span className={`text-xs px-2 py-0.5 rounded mr-2 ${
                          item.type === 'kupon' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {item.type}
                        </span>
                        <span className="font-medium">{item.title}</span>
                        <span className="text-muted-foreground ml-2">({item.brand})</span>
                      </div>
                      <a 
                        href={item.type === 'kupon' ? `/admin/coupons` : `/admin/discounts`}
                        className="text-primary hover:underline text-sm"
                      >
                        Görüntüle →
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Errors */}
            {result.errors?.length > 0 && (
              <div className="bg-void-paper border border-white/5 rounded-xl p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2 text-orange-400">
                  <AlertTriangle className="w-5 h-5" />
                  Atlanan Satırlar ({result.errors.length})
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {result.errors.map((err, idx) => (
                    <div key={idx} className="p-3 bg-orange-500/10 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">
                          <strong>Satır {err.row}:</strong> {err.reason}
                        </span>
                      </div>
                      {err.data && (
                        <div className="text-xs text-muted-foreground mt-1 truncate">
                          {err.data}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Example Sheet Link */}
        <div className="mt-8 text-center">
          <a
            href="https://docs.google.com/spreadsheets/d/1rt0KjEJPiw4fV8ldO9qy0MKCQdRTAoDMowCbN-7GWCg/edit"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1"
          >
            <ExternalLink className="w-4 h-4" />
            Örnek Sheet'i Görüntüle
          </a>
        </div>
      </div>
    </>
  );
};

export default AdminImportPage;
