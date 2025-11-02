import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Send, Users, RefreshCw } from 'lucide-react';
import { usePermissions } from '../contexts/PermissionsContext';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';

interface SupportMessage {
  id: string;
  email: string;
  body: string;
  created_at: string;
  from_admin: boolean;
  user_id?: string;
  user_name?: string;
  user_lastname?: string;
  admin_email?: string;
  admin_name?: string;
  sent_by_account?: string;
  is_read?: boolean;
  read_at?: string;
}

export default function AdminChat() {
  const { user } = useSupabaseAuth();
  const { isImpersonating, impersonatedUser } = usePermissions();
  const [selectedEmail, setSelectedEmail] = useState<string>('');
  const [customers, setCustomers] = useState<string[]>([]);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [reply, setReply] = useState('');

  const getInitials = (email: string, isAdmin: boolean) => {
    if (isAdmin) return 'A';
    const parts = email.split('@')[0].split(/[._-]/);
    return parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase().slice(0, 2) : email[0].toUpperCase();
  };

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
    try {
      // Load all messages first to get unique user emails
      const { data, error } = await supabase
        .from('support_messages')
        .select('email, from_admin')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error loading customers:', error);
        return;
      }
      
      if (data) {
        // Get unique customer emails (exclude admin email and only users who sent messages)
        // Include both messages from users (from_admin = false) and admin replies to users
        const userEmails = data
          .filter((msg: any) => msg.email !== 'admin@bitbeheer.nl') // Exclude admin email
          .map((msg: any) => msg.email);
        
        const unique = Array.from(new Set(userEmails));
        setCustomers(unique);
        if (!selectedEmail && unique.length > 0) {
          setSelectedEmail(unique[0]);
        }
      }
    } catch (error) {
      console.error('Error in loadCustomers:', error);
    }
  };

  const loadMessages = async () => {
    if (!selectedEmail) return;
    // Load messages where:
    // - User sent message (email = selectedEmail and from_admin = false)
    // - OR admin replied to this user (email = selectedEmail and from_admin = true)
    const { data, error } = await supabase
      .from('support_messages')
      .select('*')
      .eq('email', selectedEmail) // Filter by user email to ensure separate chats
      .order('created_at', { ascending: true });
    
    if (!error && data) {
      // Double-check that all messages belong to the selected user
      // This ensures no mixing of chats
      const filteredMessages = data.filter((msg: any) => msg.email === selectedEmail);
      setMessages(filteredMessages as any);
      // Mark chat as read when opened
      await markChatAsRead(selectedEmail);
    }
  };

  const markChatAsRead = async (userEmail: string) => {
    try {
      // Check if read status exists
      const { data: existing } = await supabase
        .from('chat_read_status')
        .select('id')
        .eq('user_email', userEmail)
        .eq('admin_email', 'admin@bitbeheer.nl')
        .single();

      const readStatus = {
        user_email: userEmail,
        admin_email: 'admin@bitbeheer.nl',
        last_read_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (existing) {
        // Update existing
        await supabase
          .from('chat_read_status')
          .update(readStatus)
          .eq('id', existing.id);
      } else {
        // Insert new
        await supabase
          .from('chat_read_status')
          .insert([readStatus]);
      }
    } catch (error) {
      console.error('Error marking chat as read:', error);
      // Silently fail - table might not exist yet
    }
  };

  useEffect(() => { loadCustomers(); }, []);
  useEffect(() => { loadMessages(); }, [selectedEmail]);

  const sendReply = async () => {
    if (!selectedEmail || !reply.trim()) return;
    try {
      // Get user info for selected email
      const { data: userData } = await supabase
        .from('users')
        .select('id, email, first_name, last_name')
        .eq('email', selectedEmail)
        .maybeSingle();
      
      // Determine which account is sending (impersonated user or admin)
      const sentByAccount = isImpersonating && impersonatedUser ? impersonatedUser : (user?.email || 'admin@bitbeheer.nl');
      
      // Get admin info
      const adminEmail = user?.email || 'admin@bitbeheer.nl';
      const adminName = user?.user_metadata?.name || user?.user_metadata?.first_name || 'Admin';
      
      // Ensure we're sending to the correct user by using selectedEmail
      const messageData = {
        email: selectedEmail, // This ensures the message is linked to the correct user's chat
        body: reply.trim(),
        from_admin: true,
        created_at: new Date().toISOString(),
        user_id: userData?.id || null,
        user_name: userData?.first_name || null,
        user_lastname: userData?.last_name || null,
        admin_email: adminEmail,
        admin_name: adminName,
        sent_by_account: sentByAccount, // Track which account sent it (for impersonation)
        is_read: false,
        message_type: 'support',
        priority: 'normal'
      };
      
      const { error } = await supabase
        .from('support_messages')
        .insert([messageData]);
      
      if (error) throw error;
      
      setReply('');
      await loadMessages();
      
      // Refresh metrics after sending reply
      if (window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('refreshMetrics'));
      }
    } catch (e: any) {
      console.error('Reply send error', e);
      alert(`Antwoord verzenden mislukt: ${e.message || 'Controleer of de support_messages tabel bestaat in Supabase'}`);
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
          {customers.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">Geen gebruikers met chat berichten</p>
          ) : (
            customers.map((email) => (
              <button
                key={email}
                onClick={() => setSelectedEmail(email)}
                className={`w-full text-left px-3 py-2 rounded-lg border transition-colors ${
                  selectedEmail === email 
                    ? 'bg-orange-50 border-orange-300 text-orange-900 font-medium' 
                    : 'bg-white hover:bg-gray-50 border-gray-200'
                }`}
                title={`Chat met ${email}`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${selectedEmail === email ? 'bg-orange-500' : 'bg-gray-300'}`}></div>
                  <span className="text-sm truncate">{email}</span>
                </div>
              </button>
            ))
          )}
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
              {messages.map((m) => {
                const userColor = colorForEmail(m.email);
                const avatarColor = userColor.bubble.includes('blue') ? 'bg-blue-500' : 
                                   userColor.bubble.includes('green') ? 'bg-green-500' : 
                                   userColor.bubble.includes('purple') ? 'bg-purple-500' : 
                                   userColor.bubble.includes('pink') ? 'bg-pink-500' : 
                                   userColor.bubble.includes('teal') ? 'bg-teal-500' : 'bg-amber-500';
                return (
                  <div key={m.id} className={`flex items-start gap-2 ${m.from_admin ? 'justify-end' : 'justify-start'}`}>
                    {!m.from_admin && (
                      <div className={`w-8 h-8 rounded-full text-white flex items-center justify-center text-xs font-semibold flex-shrink-0 ${avatarColor}`}>
                        {getInitials(m.email, false)}
                      </div>
                    )}
                    <div className="max-w-[75%]">
                      <div className={`text-[11px] mb-1 ${m.from_admin ? 'text-right text-gray-500' : `text-left ${userColor.label}`}`}>
                        {m.from_admin ? 'Admin' : m.email} • {formatStamp(m.created_at)}
                      </div>
                      <div className={`px-3 py-2 rounded-lg text-sm shadow-sm ${m.from_admin ? 'bg-orange-600 text-white' : `border ${userColor.bubble}`}`}>
                        <div>{m.body}</div>
                      </div>
                    </div>
                    {m.from_admin && (
                      <div className="w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
                        A
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className="mt-3 flex gap-2">
          <input
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && reply.trim()) sendReply(); }}
            placeholder="Schrijf een antwoord..."
            className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
          <button onClick={sendReply} className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2">
            <Send className="w-4 h-4" />
            Stuur
          </button>
        </div>
      </div>
    </div>
  );
}


