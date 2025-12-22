import React, { useState } from 'react';
import { Mail, Send, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setStatus('error');
      setMessage('Geçerli bir e-posta adresi girin');
      return;
    }

    setStatus('loading');
    
    try {
      await axios.post(`${API}/newsletter/subscribe`, { email });
      setStatus('success');
      setMessage('Abone oldunuz');
      setEmail('');
      
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 5000);
    } catch (error) {
      setStatus('error');
      if (error.response?.status === 409) {
        setMessage('Bu e-posta zaten kayıtlı');
      } else {
        setMessage('Bir hata oluştu');
      }
      
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 3000);
    }
  };

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="max-w-xl mx-auto glass-effect p-5 rounded-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-primary/10">
            <Mail className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-heading font-bold">Fırsatları kaçırmayın</h3>
            <p className="text-sm text-muted-foreground">Yeni indirimleri e-posta ile alın</p>
          </div>
        </div>

        {status === 'success' ? (
          <div className="flex items-center gap-2 text-green-500 py-2">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">{message}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-posta adresiniz"
                className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                disabled={status === 'loading'}
              />
              {status === 'error' && message && (
                <div className="absolute -bottom-5 left-0 flex items-center gap-1 text-destructive text-xs">
                  <AlertCircle className="w-3 h-3" />
                  <span>{message}</span>
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={status === 'loading'}
              className="px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {status === 'loading' ? (
                <span>...</span>
              ) : (
                <>
                  <span>Abone Ol</span>
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </section>
  );
};

export default Newsletter;
