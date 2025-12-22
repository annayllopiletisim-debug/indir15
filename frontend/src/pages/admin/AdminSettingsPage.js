import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import api from '../../utils/api';
import { Settings, ToggleLeft, ToggleRight, Save, Loader2 } from 'lucide-react';

const AdminSettingsPage = () => {
  const [settings, setSettings] = useState({
    sticky_cta_enabled: true,
    sticky_cta_variant: "A"
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/site-settings');
      setSettings(res.data);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await api.put('/site-settings', settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Ayarlar kaydedilemedi');
    } finally {
      setSaving(false);
    }
  };

  const toggleCtaEnabled = () => {
    setSettings(prev => ({
      ...prev,
      sticky_cta_enabled: !prev.sticky_cta_enabled
    }));
  };

  const setCtaVariant = (variant) => {
    setSettings(prev => ({
      ...prev,
      sticky_cta_variant: variant
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Site Ayarları - Admin Panel</title>
      </Helmet>

      <div data-testid="admin-settings-page">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Settings className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-heading font-bold">Site Ayarları</h1>
          </div>
          
          <button
            onClick={handleSave}
            disabled={saving}
            className={`
              px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all
              ${saved 
                ? 'bg-green-500 text-white' 
                : 'bg-gradient-to-r from-neon-purple to-neon-pink hover:shadow-lg'
              }
            `}
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : saved ? (
              '✓ Kaydedildi'
            ) : (
              <>
                <Save className="w-4 h-4" />
                Kaydet
              </>
            )}
          </button>
        </div>

        {/* Sticky CTA Bar Settings */}
        <div className="glass-effect rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-heading font-bold mb-6 flex items-center gap-2">
            📌 Sticky CTA Bar Ayarları
          </h2>

          {/* Enable/Disable Toggle */}
          <div className="flex items-center justify-between py-4 border-b border-white/10">
            <div>
              <h3 className="font-medium mb-1">Sticky CTA Bar Aktif</h3>
              <p className="text-sm text-muted-foreground">
                Mağazalar ve kategori sayfalarında altta sabit CTA bar'ı göster/gizle
              </p>
            </div>
            <button
              onClick={toggleCtaEnabled}
              className="focus:outline-none"
            >
              {settings.sticky_cta_enabled ? (
                <ToggleRight className="w-12 h-12 text-green-500" />
              ) : (
                <ToggleLeft className="w-12 h-12 text-gray-500" />
              )}
            </button>
          </div>

          {/* A/B Variant Selection */}
          <div className="py-4">
            <h3 className="font-medium mb-3">CTA Metin Varyantı (A/B Test)</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Hangi CTA metninin daha iyi dönüşüm sağladığını test edin
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Variant A */}
              <button
                onClick={() => setCtaVariant("A")}
                className={`
                  p-4 rounded-xl border-2 text-left transition-all
                  ${settings.sticky_cta_variant === "A" 
                    ? 'border-primary bg-primary/10' 
                    : 'border-white/10 hover:border-white/30'
                  }
                `}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className={`
                    w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                    ${settings.sticky_cta_variant === "A" 
                      ? 'bg-primary text-white' 
                      : 'bg-white/10'
                    }
                  `}>
                    A
                  </span>
                  <span className="font-medium">Varsayılan</span>
                  {settings.sticky_cta_variant === "A" && (
                    <span className="ml-auto text-xs text-primary">✓ Aktif</span>
                  )}
                </div>
                <div className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium inline-block">
                  İndirimleri Göster (24)
                </div>
              </button>

              {/* Variant B */}
              <button
                onClick={() => setCtaVariant("B")}
                className={`
                  p-4 rounded-xl border-2 text-left transition-all
                  ${settings.sticky_cta_variant === "B" 
                    ? 'border-primary bg-primary/10' 
                    : 'border-white/10 hover:border-white/30'
                  }
                `}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className={`
                    w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                    ${settings.sticky_cta_variant === "B" 
                      ? 'bg-primary text-white' 
                      : 'bg-white/10'
                    }
                  `}>
                    B
                  </span>
                  <span className="font-medium">Alternatif</span>
                  {settings.sticky_cta_variant === "B" && (
                    <span className="ml-auto text-xs text-primary">✓ Aktif</span>
                  )}
                </div>
                <div className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium inline-block">
                  24 Sonucu Gör
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
          <h3 className="font-medium text-blue-400 mb-2">💡 İpucu</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Sticky CTA bar, kullanıcı mağaza seçtiğinde altta görünür</li>
            <li>• CTA'da canlı indirim sayısı gösterilir (API'den çekilir)</li>
            <li>• 0 sonuç varsa CTA disabled olur</li>
            <li>• A/B test sonuçları için Google Analytics'te "sticky_cta_click" eventini takip edin</li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default AdminSettingsPage;
