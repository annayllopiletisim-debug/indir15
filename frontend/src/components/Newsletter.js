import React, { useState } from 'react';
import { Mail, Send, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
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
      setMessage('Başarıyla abone oldunuz!');
      setEmail('');
      
      // Reset after 5 seconds
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 5000);
    } catch (error) {
      setStatus('error');
      if (error.response?.status === 409) {
        setMessage('Bu e-posta zaten kayıtlı');
      } else {
        setMessage('Bir hata oluştu, tekrar deneyin');
      }
      
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 3000);
    }
  };

  return (
    <section className="container mx-auto px-4 py-8 lg:py-12">
      <div className="max-w-2xl mx-auto glass-effect p-6 lg:p-8 rounded-2xl text-center">
        <div className="inline-flex items-center justify-center p-3 rounded-full bg-primary/20 mb-4">
          <Mail className="w-6 h-6 text-primary" />
        </div>
        
        <h2 className="text-xl lg:text-2xl font-heading font-bold mb-2">
          Fırsatları Kaçırmayın!
        </h2>
        <p className="text-muted-foreground mb-6 text-sm lg:text-base">
          En güncel indirim ve kuponları e-posta ile alın
        </p>

        {status === 'success' ? (
          <div className="flex items-center justify-center gap-2 text-green-500 py-3">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">{message}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-posta adresiniz"
                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
                disabled={status === 'loading'}
              />
              {status === 'error' && message && (
                <div className="absolute -bottom-6 left-0 flex items-center gap-1 text-destructive text-xs">
                  <AlertCircle className="w-3 h-3" />
                  <span>{message}</span>
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={status === 'loading'}
              className="px-6 py-3 bg-gradient-to-r from-primary to-pink-500 rounded-xl font-medium hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {status === 'loading' ? (
                <span className="animate-pulse">Kaydediliyor...</span>
              ) : (
                <>
                  <span>Abone Ol</span>
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
        
        <p className="text-xs text-muted-foreground mt-6">
          Spam göndermiyoruz. İstediğiniz zaman abonelikten çıkabilirsiniz.
        </p>
      </div>
    </section>
  );
};

export default Newsletter;
