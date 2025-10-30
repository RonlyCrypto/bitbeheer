import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Send, Users, RefreshCw } from 'lucide-react';

interface SupportMessage {
  id: string;
  email: string;
  body: string;
  created_at: string;
  from_admin: boolean;
}

export default function AdminChat() {
  const [selectedEmail, setSelectedEmail] = useState<string>('');
  const [customers, setCustomers] = useState<string[]>([]);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [reply, setReply] = useState('');

  const colorForEmail = (email: string) => {
    // Simple hash to pick a color
    const colors = [
      { bubble: 'bg-blue-50 border-blue-200 text-blue-900', label: 'text-blue-600' },
      { bubble: 'bg-green-50 border-green-200 text-green-900', label: 'text-green-600' },
      { bubble: 'bg-purple-50 border-purple-200 text-purple-900', label: 'text-purple-600' },
      { bubble: 'bg-pink-50 border-pink-200 text-pink-900', label: 'text-pink-600' },
      { bubble: 'bg-teal-50 border-teal-200 text-teal-900', label: 'text-teal-600' },
      { bubble: 'bg-amber-50 border-amber-200 text-amber-900', label: 'text-amber-600' },
    ];
    let hash = 0;
    for (let i = 0; i < email.length; i++) hash = (hash * 31 + email.charCodeAt(i)) >>> 0;
    return colors[hash % colors.length];
  };

  const formatStamp = (iso: string) => {
    const d = new Date(iso);
    const day = d.toLocaleDateString('nl-NL', { weekday: 'short', day: '2-digit', month: '2-digit' });
    const time = d.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
    return `${day} • ${time}`;
  };

  const loadCustomers = async () => {
    const { data, error } = await supabase
      .from('support_messages')
      .select('email')
      .order('created_at', { ascending: false });
    if (!error && data) {
      const unique = Array.from(new Set(data.map((d: any) => d.email)));
      setCustomers(unique);
      if (!selectedEmail && unique.length > 0) setSelectedEmail(unique[0]);
    }
  };

  const loadMessages = async () => {
    if (!selectedEmail) return;
    const { data, error } = await supabase
      .from('support_messages')
      .select('*')
      .eq('email', selectedEmail)
      .order('created_at', { ascending: true });
    if (!error && data) setMessages(data as any);
  };

  useEffect(() => { loadCustomers(); }, []);
  useEffect(() => { loadMessages(); }, [selectedEmail]);

  const sendReply = async () => {
    if (!selectedEmail || !reply.trim()) return;
    const { error } = await supabase
      .from('support_messages')
      .insert([{ email: selectedEmail, body: reply.trim(), from_admin: true, created_at: new Date().toISOString() }]);
    if (!error) {
      setReply('');
      await loadMessages();
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1 border rounded-xl p-4 bg-white">
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-5 h-5 text-orange-600" />
          <h3 className="font-semibold">Gebruikers</h3>
          <button onClick={loadCustomers} className="ml-auto text-gray-500 hover:text-gray-700"><RefreshCw className="w-4 h-4"/></button>
        </div>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {customers.map((email) => (
            <button
              key={email}
              onClick={() => setSelectedEmail(email)}
              className={`w-full text-left px-3 py-2 rounded-lg border ${selectedEmail === email ? 'bg-orange-50 border-orange-200' : 'bg-white hover:bg-gray-50'}`}
            >
              {email}
            </button>
          ))}
        </div>
      </div>
      <div className="md:col-span-2 border rounded-xl p-4 bg-white">
        <div className="flex items-center gap-2 mb-3">
          <h3 className="font-semibold">Chat met {selectedEmail || '—'}</h3>
          <button onClick={loadMessages} className="ml-auto text-gray-500 hover:text-gray-700"><RefreshCw className="w-4 h-4"/></button>
        </div>
        <div className="max-h-96 overflow-y-auto border rounded-lg p-3 bg-gray-50">
          {messages.length === 0 ? (
            <p className="text-gray-500">Geen berichten voor deze gebruiker.</p>
          ) : (
            <div className="space-y-3">
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.from_admin ? 'justify-end' : 'justify-start'}`}>
                  <div className="max-w-[75%]">
                    <div className={`text-[11px] mb-1 ${m.from_admin ? 'text-right text-gray-500' : `text-left ${colorForEmail(m.email).label}`}`}>
                      {m.from_admin ? 'Admin' : m.email} • {formatStamp(m.created_at)}
                    </div>
                    <div className={`px-3 py-2 rounded-lg text-sm shadow-sm ${m.from_admin ? 'bg-orange-600 text-white' : `border ${colorForEmail(m.email).bubble}`}`}>
                      <div>{m.body}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="mt-3 flex gap-2">
          <input value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Schrijf een antwoord..." className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
          <button onClick={sendReply} className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2">
            <Send className="w-4 h-4" />
            Stuur
          </button>
        </div>
      </div>
    </div>
  );
}


