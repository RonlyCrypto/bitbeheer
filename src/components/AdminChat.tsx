import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Send, Users, RefreshCw, Edit2, Trash2 } from 'lucide-react';
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

interface CustomerWithUnread {
  email: string;
  firstName?: string;
  lastName?: string;
  hasUnread: boolean;
  unreadCount?: number;
}

export default function AdminChat() {
  const { user } = useSupabaseAuth();
  const { isImpersonating, impersonatedUser } = usePermissions();
  const [selectedEmail, setSelectedEmail] = useState<string>('');
  const selectedEmailRef = useRef<string>('');
  const [customers, setCustomers] = useState<CustomerWithUnread[]>([]);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [reply, setReply] = useState('');
  const [lastReadTime, setLastReadTime] = useState<Date | null>(null);
  const [hideNewSeparator, setHideNewSeparator] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

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

  const loadCustomers = async (preserveSelection: boolean = true) => {
    try {
      // Load all messages first to get unique user emails
      const { data: allMessages, error } = await supabase
        .from('support_messages')
        .select('email, from_admin, created_at')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error loading customers:', error);
        return;
      }
      
      if (allMessages) {
        // Get unique customer emails (exclude admin email)
        const userEmails = allMessages
          .filter((msg: any) => msg.email !== 'admin@bitbeheer.nl')
          .map((msg: any) => msg.email);
        
        const uniqueEmails = Array.from(new Set(userEmails));
        
        // Load read status for all chats
        const { data: readStatuses } = await supabase
          .from('chat_read_status')
          .select('user_email, last_read_at')
          .eq('admin_email', 'admin@bitbeheer.nl');
        
        // Load user names from accounts table
        const { data: accountsData } = await supabase
          .from('accounts')
          .select('email, first_name, last_name')
          .in('email', uniqueEmails);
        
        // Create a map for quick lookup
        const nameMap = new Map<string, { firstName?: string; lastName?: string }>();
        accountsData?.forEach((acc: any) => {
          nameMap.set(acc.email, {
            firstName: acc.first_name || undefined,
            lastName: acc.last_name || undefined
          });
        });
        
        // Check unread status for each customer
        const customersWithUnread: CustomerWithUnread[] = uniqueEmails.map(email => {
          const readStatus = readStatuses?.find(r => r.user_email === email);
          const userMessages = allMessages.filter((m: any) => m.email === email && !m.from_admin);
          
          let hasUnread = false;
          let unreadCount = 0;
          
          if (!readStatus) {
            // No read status = all messages are unread
            hasUnread = userMessages.length > 0;
            unreadCount = userMessages.length;
          } else {
            // Check messages newer than last_read_at
            const readTime = new Date(readStatus.last_read_at).getTime();
            const newMessages = userMessages.filter((msg: any) => {
              const msgTime = new Date(msg.created_at).getTime();
              return msgTime > readTime;
            });
            hasUnread = newMessages.length > 0;
            unreadCount = newMessages.length;
          }
          
          const nameInfo = nameMap.get(email);
          
          return {
            email,
            firstName: nameInfo?.firstName,
            lastName: nameInfo?.lastName,
            hasUnread,
            unreadCount: unreadCount > 0 ? unreadCount : undefined
          };
        });
        
        // Sort: unread first, then by most recent message
        customersWithUnread.sort((a, b) => {
          if (a.hasUnread && !b.hasUnread) return -1;
          if (!a.hasUnread && b.hasUnread) return 1;
          return 0;
        });
        
        setCustomers(customersWithUnread);
        
        // Only change selectedEmail if we should (preserveSelection controls this)
        const currentSelectedEmail = selectedEmailRef.current;
        if (preserveSelection) {
          // Preserve current selection if it exists in the list
          const currentSelection = customersWithUnread.find(c => c.email === currentSelectedEmail);
          if (!currentSelection && currentSelectedEmail) {
            // Selected email no longer exists, but don't auto-switch - user probably navigated away
            // Only auto-select if there's no selection at all
            // Don't change - keep current selection
          }
          // If selectedEmail exists in list, keep it - don't change
        } else {
          // Initial load or forced refresh - select first if nothing selected
          if (!currentSelectedEmail && customersWithUnread.length > 0) {
            setSelectedEmail(customersWithUnread[0].email);
            selectedEmailRef.current = customersWithUnread[0].email;
          }
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
      
      // Get last read time for this chat
      const { data: readStatus } = await supabase
        .from('chat_read_status')
        .select('last_read_at')
        .eq('user_email', selectedEmail)
        .eq('admin_email', 'admin@bitbeheer.nl')
        .maybeSingle();
      
      setLastReadTime(readStatus?.last_read_at ? new Date(readStatus.last_read_at) : null);
      setHideNewSeparator(false);
      
      // Mark chat as read when opened
      await markChatAsRead(selectedEmail);
      
      // Hide "Nieuw" separator after 4 seconds
      setTimeout(() => {
        setHideNewSeparator(true);
      }, 4000);
    }
  };

  const markChatAsRead = async (userEmail: string) => {
    try {
      // Check if read status exists
      const { data: existing } = await supabase
        .from('chat_read_status')
        .select('id')
        .eq('user_email', userEmail)
        .maybeSingle();

      const readStatus = {
        user_email: userEmail,
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
      
      // Update local state to remove unread indicator
      setCustomers(prev => prev.map(c => 
        c.email === userEmail 
          ? { ...c, hasUnread: false, unreadCount: undefined }
          : c
      ));
      
      // Immediately refresh metrics in AdminDashboard to update badge
      if (window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('refreshMetrics'));
      }
      
      // Also reload customers to ensure badge is updated correctly (preserve selection)
      setTimeout(() => {
        loadCustomers(true);
      }, 500);
    } catch (error) {
      console.error('Error marking chat as read:', error);
      // Silently fail - table might not exist yet
    }
  };

  useEffect(() => { 
    loadCustomers(false); // Initial load - can auto-select
    
    // Refresh customer list every 10 seconds to update unread status
    const interval = setInterval(() => {
      // Preserve selectedEmail when refreshing
      loadCustomers(true);
    }, 10000);
    return () => clearInterval(interval);
  }, []); // Empty dependency array - only run on mount
  
  // Keep ref in sync with state
  useEffect(() => {
    selectedEmailRef.current = selectedEmail;
  }, [selectedEmail]);
  
  useEffect(() => { 
    setEditingMessageId(null);
    setEditText('');
    loadMessages(); 
  }, [selectedEmail]);
  
  const handleEditMessage = (message: SupportMessage) => {
    if (!message.from_admin) return;
    setEditingMessageId(message.id);
    setEditText(message.body);
  };
  
  const handleSaveEdit = async (messageId: string) => {
    if (!editText.trim()) return;
    
    try {
      const { error } = await supabase
        .from('support_messages')
        .update({ body: editText.trim() })
        .eq('id', messageId);
      
      if (error) throw error;
      
      setEditingMessageId(null);
      setEditText('');
      await loadMessages();
    } catch (e: any) {
      console.error('Error updating message:', e);
      alert(`Bericht bijwerken mislukt: ${e.message}`);
    }
  };
  
  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('Weet je zeker dat je dit bericht wilt verwijderen?')) return;
    
    try {
      const { error } = await supabase
        .from('support_messages')
        .delete()
        .eq('id', messageId);
      
      if (error) throw error;
      
      await loadMessages();
      
      // Refresh metrics after deleting message
      if (window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('refreshMetrics'));
      }
    } catch (e: any) {
      console.error('Error deleting message:', e);
      alert(`Bericht verwijderen mislukt: ${e.message}`);
    }
  };

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
        // Trigger event for user dashboard to update badge
        window.dispatchEvent(new CustomEvent('newAdminMessage', { detail: { userEmail: selectedEmail } }));
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
            customers.map((customer) => (
              <button
                key={customer.email}
                onClick={() => setSelectedEmail(customer.email)}
                className={`w-full text-left px-3 py-2 rounded-lg border transition-all ${
                  selectedEmail === customer.email 
                    ? 'bg-orange-50 border-orange-300 text-orange-900 shadow-sm' 
                    : customer.hasUnread
                      ? 'bg-red-50 border-red-200 hover:bg-red-100'
                      : 'bg-white hover:bg-gray-50 border-gray-200'
                }`}
                title={`Chat met ${customer.firstName && customer.lastName ? `${customer.firstName} ${customer.lastName}` : customer.email}${customer.hasUnread ? ` (${customer.unreadCount} ongelezen)` : ''}`}
              >
                <div className="flex items-center gap-2 justify-between">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      selectedEmail === customer.email 
                        ? 'bg-orange-500' 
                        : customer.hasUnread
                          ? 'bg-red-500 animate-pulse'
                          : 'bg-gray-300'
                    }`}></div>
                    <span className={`text-sm truncate ${customer.hasUnread ? 'font-bold' : 'font-normal'}`}>
                      {customer.firstName && customer.lastName 
                        ? `${customer.firstName} ${customer.lastName}`
                        : customer.email}
                    </span>
                  </div>
                  {customer.hasUnread && (
                    <span className="flex-shrink-0 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                      {customer.unreadCount && customer.unreadCount > 0 ? customer.unreadCount : '!'}
                    </span>
                  )}
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
              {messages.map((m, index) => {
                const userColor = colorForEmail(m.email);
                const avatarColor = userColor.bubble.includes('blue') ? 'bg-blue-500' : 
                                   userColor.bubble.includes('green') ? 'bg-green-500' : 
                                   userColor.bubble.includes('purple') ? 'bg-purple-500' : 
                                   userColor.bubble.includes('pink') ? 'bg-pink-500' : 
                                   userColor.bubble.includes('teal') ? 'bg-teal-500' : 'bg-amber-500';
                
                // Check if this message is unread (newer than last_read_at)
                const isUnread = lastReadTime && !hideNewSeparator 
                  ? new Date(m.created_at).getTime() > lastReadTime.getTime() && !m.from_admin
                  : false;
                
                // Check if we need to show "Nieuw" separator (first unread user message after admin message or start)
                const showNewSeparator = !hideNewSeparator && isUnread && (
                  index === 0 || // First message in chat
                  messages[index - 1].from_admin || // Previous message was from admin
                  (lastReadTime && new Date(messages[index - 1].created_at).getTime() <= lastReadTime.getTime()) // Previous message was read
                );
                
                const isEditing = editingMessageId === m.id;
                
                return (
                  <React.Fragment key={m.id}>
                    {showNewSeparator && (
                      <div className="relative py-2">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-red-300"></div>
                        </div>
                        <div className="relative flex justify-center">
                          <span className="bg-gray-50 px-2 text-xs font-semibold text-red-600">Nieuw</span>
                        </div>
                      </div>
                    )}
                    <div className={`flex items-start gap-2 ${m.from_admin ? 'justify-end' : 'justify-start'} group`}>
                      {!m.from_admin && (
                        <div className={`w-8 h-8 rounded-full text-white flex items-center justify-center text-xs font-semibold flex-shrink-0 ${avatarColor}`}>
                          {getInitials(m.email, false)}
                        </div>
                      )}
                      <div className="max-w-[75%]">
                        <div className={`text-[11px] mb-1 ${m.from_admin ? 'text-right text-gray-500' : `text-left ${userColor.label}`}`}>
                          {m.from_admin ? 'Admin' : m.email} • {formatStamp(m.created_at)}
                        </div>
                        {isEditing ? (
                          <div className="flex gap-2 items-end">
                            <input
                              type="text"
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveEdit(m.id);
                                if (e.key === 'Escape') {
                                  setEditingMessageId(null);
                                  setEditText('');
                                }
                              }}
                              className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveEdit(m.id)}
                              className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            >
                              Opslaan
                            </button>
                            <button
                              onClick={() => {
                                setEditingMessageId(null);
                                setEditText('');
                              }}
                              className="px-3 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
                            >
                              Annuleren
                            </button>
                          </div>
                        ) : (
                          <div className={`px-3 py-2 rounded-lg text-sm shadow-sm relative ${m.from_admin ? 'bg-orange-600 text-white' : `border ${userColor.bubble}`}`}>
                            <div>{m.body}</div>
                            {m.from_admin && (
                              <div className="absolute -right-8 top-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                <button
                                  onClick={() => handleEditMessage(m)}
                                  className="p-1 bg-gray-700 text-white rounded hover:bg-gray-800"
                                  title="Bewerken"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => handleDeleteMessage(m.id)}
                                  className="p-1 bg-red-600 text-white rounded hover:bg-red-700"
                                  title="Verwijderen"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      {m.from_admin && (
                        <div className="w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
                          A
                        </div>
                      )}
                    </div>
                  </React.Fragment>
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


