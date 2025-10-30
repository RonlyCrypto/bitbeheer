import React, { useEffect, useState } from 'react';
import { Send, MessageSquare, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';

interface SupportMessage {
  id: string;
  email: string;
  body: string;
  created_at: string;
  from_admin: boolean;
}

export default function Helpdesk() {
  const { user } = useSupabaseAuth();
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const getInitials = (email: string, isAdmin: boolean) => {
    if (isAdmin) return 'A';
    const parts = email.split('@')[0].split(/[._-]/);
    return parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase().slice(0, 2) : email[0].toUpperCase();
  };

  const formatStamp = (iso: string) => {
    const d = new Date(iso);
    const day = d.toLocaleDateString('nl-NL', { weekday: 'short', day: '2-digit', month: '2-digit' });
    const time = d.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
    return `${day} • ${time}`;
  };

  const loadMessages = async () => {
    if (!user?.email) return;
    const { data, error } = await supabase
      .from('support_messages')
      .select('*')
      .eq('email', user.email)
      .order('created_at', { ascending: true });
    if (!error && data) setMessages(data as any);
  };

  useEffect(() => {
    loadMessages();
    // Optional: poll every 10s for fresh messages
    const t = setInterval(loadMessages, 10000);
    return () => clearInterval(t);
  }, [user?.email]);

  const sendMessage = async () => {
    if (!user?.email || !newMessage.trim()) return;
    setLoading(true);
    try {
      const body = newMessage.trim();
      // Optimistic update
      const optimistic: SupportMessage = {
        id: `temp-${Date.now()}`,
        email: user.email,
        body,
        created_at: new Date().toISOString(),
        from_admin: false
      };
      setMessages((prev) => [...prev, optimistic]);
      setNewMessage('');

      const { error } = await supabase
        .from('support_messages')
        .insert([{ email: user.email, body, from_admin: false, created_at: optimistic.created_at }]);
      if (error) throw error;
      await loadMessages();
    } catch (e: any) {
      console.error('Support send error', e);
      // Remove optimistic update on error
      setMessages((prev) => prev.filter(m => !m.id.startsWith('temp-')));
      setNewMessage(body || newMessage); // Restore message
      alert(`Bericht verzenden mislukt: ${e.message || 'Controleer of de support_messages tabel bestaat in Supabase'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-orange-600" />
        <h3 className="text-xl font-semibold">Helpdesk</h3>
        <button onClick={loadMessages} className="ml-auto text-gray-500 hover:text-gray-700">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
      <div className="border rounded-xl p-4 bg-white max-h-96 overflow-y-auto">
        {messages.length === 0 ? (
          <p className="text-gray-500">Nog geen berichten. Stel je vraag hieronder.</p>
        ) : (
          <div className="space-y-3">
            {messages.map((m) => (
              <div key={m.id} className={`flex items-start gap-2 ${m.from_admin ? 'justify-end' : 'justify-start'}`}>
                {!m.from_admin && (
                  <div className="w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
                    {getInitials(user?.email || '', false)}
                  </div>
                )}
                <div className="max-w-[75%]">
                  <div className={`text-[11px] mb-1 ${m.from_admin ? 'text-right text-gray-500' : 'text-left text-gray-500'}`}>
                    {m.from_admin ? 'Admin' : 'Jij'} • {formatStamp(m.created_at)}
                  </div>
                  <div className={`px-3 py-2 rounded-lg text-sm ${m.from_admin ? 'bg-gray-100 text-gray-800' : 'bg-orange-600 text-white'} shadow-sm` }>
                    <div>{m.body}</div>
                  </div>
                </div>
                {m.from_admin && (
                  <div className="w-8 h-8 rounded-full bg-gray-400 text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
                    A
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !loading && newMessage.trim()) sendMessage(); }}
          placeholder="Schrijf je bericht..."
          className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        />
        <button onClick={sendMessage} disabled={loading} className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-60 flex items-center gap-2">
          <Send className="w-4 h-4" />
          Verstuur
        </button>
      </div>
    </div>
  );
}


