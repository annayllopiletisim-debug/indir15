'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { Loader2, Mail, Trash2, Eye, EyeOff } from 'lucide-react';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function AdminContactPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/contact');
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string, is_read: boolean) => {
    try {
      await fetch(`/api/contact/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_read }),
      });
      fetchMessages();
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const deleteMessage = async (id: string) => {
    if (!confirm('Bu mesajı silmek istediğinizden emin misiniz?')) return;
    try {
      await fetch(`/api/contact/${id}`, { method: 'DELETE' });
      setSelectedMessage(null);
      fetchMessages();
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const unreadCount = messages.filter(m => !m.is_read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-white">İletişim Mesajları</h1>
          {unreadCount > 0 && (
            <span className="px-3 py-1 bg-red-500 text-white rounded-full text-sm font-bold">
              {unreadCount} yeni
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Message List */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <div className="divide-y divide-slate-700 max-h-[600px] overflow-y-auto">
            {messages.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <Mail className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Henüz mesaj yok</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  onClick={() => {
                    setSelectedMessage(msg);
                    if (!msg.is_read) markAsRead(msg.id, true);
                  }}
                  className={`p-4 cursor-pointer hover:bg-slate-700/50 transition-colors ${
                    selectedMessage?.id === msg.id ? 'bg-slate-700' : ''
                  } ${!msg.is_read ? 'border-l-4 border-purple-500' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${!msg.is_read ? 'text-white' : 'text-gray-300'}`}>
                          {msg.name}
                        </span>
                        {!msg.is_read && (
                          <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400">{msg.email}</p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(msg.created_at).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mt-2 line-clamp-2">{msg.message}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Message Detail */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          {selectedMessage ? (
            <div>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedMessage.name}</h2>
                  <a href={`mailto:${selectedMessage.email}`} className="text-purple-400 hover:underline">
                    {selectedMessage.email}
                  </a>
                  <p className="text-sm text-gray-400 mt-1">
                    {new Date(selectedMessage.created_at).toLocaleString('tr-TR')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => markAsRead(selectedMessage.id, !selectedMessage.is_read)}
                    className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-slate-700"
                    title={selectedMessage.is_read ? 'Okunmadı olarak işaretle' : 'Okundu olarak işaretle'}
                  >
                    {selectedMessage.is_read ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => deleteMessage(selectedMessage.id)}
                    className="p-2 text-gray-400 hover:text-red-400 rounded-lg hover:bg-slate-700"
                    title="Sil"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              {selectedMessage.subject && (
                <div className="mb-4">
                  <span className="text-sm text-gray-400">Konu:</span>
                  <p className="text-white font-medium">{selectedMessage.subject}</p>
                </div>
              )}
              <div className="bg-slate-900 rounded-xl p-4">
                <p className="text-gray-300 whitespace-pre-wrap">{selectedMessage.message}</p>
              </div>
              <a
                href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject || 'İletişim Formu'}`}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700"
              >
                <Mail className="w-4 h-4" />
                Yanıtla
              </a>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              <div className="text-center">
                <Mail className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Mesaj seçin</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
