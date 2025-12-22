import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { setAuthToken, setAuthUser } from '../utils/auth';
import { Helmet } from 'react-helmet-async';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin
        ? { username: formData.username, password: formData.password }
        : formData;

      const response = await axios.post(`${API}${endpoint}`, payload);
      const { token, user } = response.data;

      setAuthToken(token);
      setAuthUser(user);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin Giriş - SavvySaver</title>
      </Helmet>

      <div className="min-h-screen flex items-center justify-center px-4" data-testid="admin-login-page">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center">
              <span className="text-white font-heading font-bold text-2xl">SS</span>
            </div>
            <h1 className="text-3xl font-heading font-bold text-gradient">Admin Panel</h1>
          </div>

          <div className="glass-effect p-8 rounded-3xl">
            <div className="flex space-x-2 mb-6">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2 rounded-lg transition-all ${
                  isLogin
                    ? 'bg-gradient-to-r from-neon-purple to-neon-pink'
                    : 'bg-void-subtle hover:bg-white/5'
                }`}
                data-testid="login-tab"
              >
                Giriş Yap
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2 rounded-lg transition-all ${
                  !isLogin
                    ? 'bg-gradient-to-r from-neon-purple to-neon-pink'
                    : 'bg-void-subtle hover:bg-white/5'
                }`}
                data-testid="register-tab"
              >
                Kayıt Ol
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Kullanıcı Adı</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-4 py-3 bg-void-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-purple"
                  required
                  data-testid="username-input"
                />
              </div>

              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium mb-2">E-posta</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-void-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-purple"
                    required
                    data-testid="email-input"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Şifre</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 bg-void-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-purple"
                  required
                  data-testid="password-input"
                />
              </div>

              {error && (
                <div className="p-3 bg-destructive/20 text-destructive rounded-lg text-sm" data-testid="error-message">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-neon-purple to-neon-pink rounded-lg font-medium hover:shadow-lg hover:shadow-neon-purple/50 transition-all disabled:opacity-50"
                data-testid="submit-btn"
              >
                {loading ? 'Yükleniyor...' : isLogin ? 'Giriş Yap' : 'Kayıt Ol'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminLoginPage;