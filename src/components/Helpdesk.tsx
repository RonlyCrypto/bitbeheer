import React, { useEffect, useRef, useState } from 'react';
import { Send, MessageSquare, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { usePermissions } from '../contexts/PermissionsContext';

interface SupportMessage {
  id: string;
  email: string;
  body: string;
  created_at: string;
  from_admin: boolean;
}

interface HelpdeskProps {
  onMessageRead?: () => Promise<void>;
}

export default function Helpdesk({ onMessageRead }: HelpdeskProps) {
  const { user } = useSupabaseAuth();
  const { isImpersonating, impersonatedUser } = usePermissions();
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastReadTime, setLastReadTime] = useState<string | null>(null);
  
  // Get effective user email (impersonated user if impersonating, otherwise real user)
  const effectiveUserEmail = isImpersonating && impersonatedUser ? impersonatedUser : user?.email;
  const [userProfile, setUserProfile] = useState<{ first_name?: string; last_name?: string; name?: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Calculate new message count (messages after last read)
  const newMessageCount = lastReadTime 
    ? messages.filter(m => new Date(m.created_at) > new Date(lastReadTime)).length 
    : 0;

  const getInitials = (email: string, firstName?: string, lastName?: string, isAdmin: boolean = false) => {
    if (isAdmin) return 'A';
    // Use first_name and last_name if available
    if (firstName && lastName) {
      return (firstName[0] + lastName[0]).toUpperCase().slice(0, 2);
    }
    if (firstName) {
      return firstName.substring(0, 2).toUpperCase();
    }
    // Fallback to email parsing
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
    if (!effectiveUserEmail) return;
    // Load only messages for this specific user (using effective email for impersonation)
    // Messages where:
    // - User sent message (email = effectiveUserEmail and from_admin = false)
    // - OR admin replied to this user (email = effectiveUserEmail and from_admin = true)
    const { data, error } = await supabase
      .from('support_messages')
      .select('*')
      .eq('email', effectiveUserEmail) // Filter by effective user email to ensure separate chats
      .order('created_at', { ascending: true });
    
    if (!error && data) {
      // Double-check that all messages belong to this user
      // This ensures no mixing of chats
      const filteredMessages = data.filter((msg: any) => msg.email === effectiveUserEmail);
      setMessages(filteredMessages as any);
    }
  };

  // Mark chat as read when component mounts and load last read time
  useEffect(() => {
    const markAsRead = async () => {
      // Set lastReadTime to now
      const now = new Date().toISOString();
      setLastReadTime(now);
      
      // Call onMessageRead callback
      if (onMessageRead) {
        await onMessageRead();
      }
    };
    
    markAsRead();
  }, [onMessageRead]);

  // Load user profile for initials/name display
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!effectiveUserEmail) return;
      
      try {
        // First try accounts table (where registration data is stored)
        const { data: accountData } = await supabase
          .from('accounts')
          .select('first_name, last_name, name')
          .eq('email', effectiveUserEmail)
          .maybeSingle();
        
        if (accountData) {
          setUserProfile({
            first_name: accountData.first_name || null,
            last_name: accountData.last_name || null,
            name: accountData.name || null
          });
          return;
        }
        
        // Fallback to users table
        const { data: userData } = await supabase
          .from('users')
          .select('first_name, last_name, name')
          .eq('email', effectiveUserEmail)
          .maybeSingle();
        
        if (userData) {
          setUserProfile({
            first_name: userData.first_name || null,
            last_name: userData.last_name || null,
            name: userData.name || null
          });
        }
      } catch (error) {
        console.error('Error loading user profile for Helpdesk:', error);
      }
    };
    
    loadUserProfile();
  }, [effectiveUserEmail]);

  // Auto-scroll naar beneden bij nieuwe berichten
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!effectiveUserEmail) return;

    loadMessages();
    // Mark messages as read when component mounts
    if (onMessageRead) {
      onMessageRead();
    }

    // Subscribe to real-time messages for this user
    const channel = supabase
      .channel(`support_messages_${effectiveUserEmail}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'support_messages',
          filter: `email=eq.${effectiveUserEmail}`
        },
        () => {
          // Reload messages when any change occurs
          loadMessages();
        }
      )
      .subscribe();

    // Fallback polling every 10s for fresh messages
    const t = setInterval(loadMessages, 10000);

    return () => {
      clearInterval(t);
      supabase.removeChannel(channel);
    };
  }, [effectiveUserEmail, onMessageRead]);

  const sendMessage = async () => {
    if (!effectiveUserEmail || !newMessage.trim()) {
      console.warn('Cannot send: no user email or empty message', { email: effectiveUserEmail, message: newMessage.trim() });
      return;
    }
    setLoading(true);
    const body = newMessage.trim();
    try {
      // Sending message (no email in logs)
      
      // Check current session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      console.log('Current session:', { session: sessionData?.session, error: sessionError });
      
      // Optimistic update
      const optimistic: SupportMessage = {
        id: `temp-${Date.now()}`,
        email: effectiveUserEmail,
        body,
        created_at: new Date().toISOString(),
        from_admin: false
      };
      setMessages((prev) => [...prev, optimistic]);
      setNewMessage('');

      // Get user info from users or accounts table (use effective email for impersonation)
      const { data: userData } = await supabase
        .from('users')
        .select('id, email, first_name, last_name')
        .eq('email', effectiveUserEmail)
        .maybeSingle();
      
      const messageData = {
        email: effectiveUserEmail, // Use effective email (impersonated user if impersonating)
        body,
        from_admin: false, // Always false for user messages
        created_at: optimistic.created_at,
        user_id: userData?.id || null,
        user_name: userData?.first_name || user?.user_metadata?.first_name || null,
        user_lastname: userData?.last_name || user?.user_metadata?.last_name || null,
        sent_by_account: effectiveUserEmail, // Track which account sent it (impersonated user if impersonating)
        is_read: false,
        message_type: 'support',
        priority: 'normal'
      };

      const { data, error } = await supabase
        .from('support_messages')
        .insert([messageData])
        .select();
      
      console.log('Insert result:', { data, error });
      
      if (error) {
        console.error('Supabase insert error:', error);
        throw error;
      }
      
      console.log('Message sent successfully:', data);
      await loadMessages();
    } catch (e: any) {
      console.error('Support send error:', e);
      // Remove optimistic update on error
      setMessages((prev) => prev.filter(m => !m.id.startsWith('temp-')));
      setNewMessage(body); // Restore message
      
      const errorMsg = e.message || e.error?.message || JSON.stringify(e);
      alert(`Bericht verzenden mislukt: ${errorMsg}\n\nControleer:\n1. Is de support_messages tabel aangemaakt?\n2. Zijn de RLS policies correct ingesteld?\n3. Is de gebruiker ingelogd?`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="border rounded-xl p-4 bg-white max-h-96 overflow-y-auto">
        {messages.length === 0 ? (
          <p className="text-gray-500">Nog geen berichten. Stel je vraag hieronder.</p>
        ) : (
          <div className="space-y-3">
            {messages.map((m, idx) => {
              const isNew = lastReadTime && new Date(m.created_at) > new Date(lastReadTime);
              const isLastOldMessage = lastReadTime && 
                idx === messages.findIndex(msg => new Date(msg.created_at) > new Date(lastReadTime)) - 1 &&
                idx >= 0 &&
                new Date(m.created_at) <= new Date(lastReadTime);
              
              return (
                <div key={m.id}>
                  {/* Show "Nieuw" divider before new messages */}
                  {isNew && idx === messages.findIndex(msg => new Date(msg.created_at) > new Date(lastReadTime!)) && (
                    <div className="flex items-center gap-3 my-4">
                      <div className="flex-1 h-px bg-gray-300"></div>
                      <span className="text-xs font-semibold text-orange-600 px-2">
                        Nieuw ({newMessageCount})
                      </span>
                      <div className="flex-1 h-px bg-gray-300"></div>
                    </div>
                  )}
                  
                  <div className={`flex items-start gap-2 ${m.from_admin ? 'justify-end' : 'justify-start'}`}>
                    {!m.from_admin && (
                      <div className="w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
                        {getInitials(effectiveUserEmail || '', userProfile?.first_name || undefined, userProfile?.last_name || undefined, false)}
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
                </div>
              );
            })}
            <div ref={messagesEndRef} />
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


