import { useState, useEffect } from 'react';
import { Mail, Users, Send, CheckCircle, Clock, AlertCircle, Download, Trash2 } from 'lucide-react';

interface NotificationUser {
  id: string;
  email: string;
  name: string;
  message: string;
  category: string;
  date: string;
  timestamp: string;
  emailSent?: boolean;
  emailSentDate?: string;
}

export default function NotificatieBeheer() {
  const [users, setUsers] = useState<NotificationUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [customMessage, setCustomMessage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Load users from backend API
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await fetch('/api/users');
        if (response.ok) {
          const data = await response.json();
          setUsers(data.users || []);
        } else {
          console.error('Failed to load users:', response.statusText);
          // Fallback to localStorage for development
          const storedUsers = localStorage.getItem('bitbeheer_emails');
          if (storedUsers) {
            setUsers(JSON.parse(storedUsers));
          }
        }
      } catch (error) {
        console.error('Error loading users:', error);
        // Fallback to localStorage for development
        const storedUsers = localStorage.getItem('bitbeheer_emails');
        if (storedUsers) {
          setUsers(JSON.parse(storedUsers));
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, []);

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(user => user.id));
    }
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSendBulkEmail = async () => {
    if (selectedUsers.length === 0) {
      alert('Selecteer eerst gebruikers om naar te versturen.');
      return;
    }

    setIsSending(true);
    setSendStatus('sending');

    try {
      const selectedUserEmails = users
        .filter(user => selectedUsers.includes(user.id))
        .map(user => user.email);

      // Create mailto link for bulk email
      const subject = 'BitBeheer is nu live! 🚀';
      const body = customMessage || `Beste Bitcoin investeerder,

Geweldig nieuws! BitBeheer is nu live en klaar om je te helpen met je Bitcoin reis.

🎯 Wat je nu kunt doen:
• Persoonlijke 1-op-1 begeleiding boeken
• Veilig Bitcoin kopen en bewaren leren
• Eigen beheer van je Bitcoin opzetten
• Alle tools en resources gebruiken

Ga naar: https://bitbeheer.nl

Met vriendelijke groet,
Giovanni - BitBeheer`;

      const bcc = selectedUserEmails.join(', ');
      
      // Open mailto for bulk sending
      window.open(`mailto:?bcc=${encodeURIComponent(bcc)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');

      // Update users as email sent via backend API
      const emailSentDate = new Date().toLocaleString('nl-NL');
      
      // Update each selected user via API
      for (const userId of selectedUsers) {
        try {
          await fetch(`/api/users/${userId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              emailSent: true,
              emailSentDate: emailSentDate
            })
          });
        } catch (error) {
          console.error('Error updating user email status:', error);
        }
      }

      // Update local state
      const updatedUsers = users.map(user => {
        if (selectedUsers.includes(user.id)) {
          return {
            ...user,
            emailSent: true,
            emailSentDate: emailSentDate
          };
        }
        return user;
      });

      setUsers(updatedUsers);
      
      // Also update localStorage as fallback
      localStorage.setItem('bitbeheer_emails', JSON.stringify(updatedUsers));
      
      setSendStatus('sent');
      setSelectedUsers([]);
      setCustomMessage('');
      
      // Reset status after 3 seconds
      setTimeout(() => setSendStatus('idle'), 3000);

    } catch (error) {
      console.error('Error sending bulk email:', error);
      setSendStatus('error');
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Weet je zeker dat je deze gebruiker wilt verwijderen?')) {
      try {
        const response = await fetch(`/api/users/${userId}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          const updatedUsers = users.filter(user => user.id !== userId);
          setUsers(updatedUsers);
          setSelectedUsers(prev => prev.filter(id => id !== userId));
        } else {
          console.error('Failed to delete user:', response.statusText);
          // Fallback to localStorage for development
          const updatedUsers = users.filter(user => user.id !== userId);
          setUsers(updatedUsers);
          localStorage.setItem('bitbeheer_emails', JSON.stringify(updatedUsers));
          setSelectedUsers(prev => prev.filter(id => id !== userId));
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        // Fallback to localStorage for development
        const updatedUsers = users.filter(user => user.id !== userId);
        setUsers(updatedUsers);
        localStorage.setItem('bitbeheer_emails', JSON.stringify(updatedUsers));
        setSelectedUsers(prev => prev.filter(id => id !== userId));
      }
    }
  };

  const handleExportUsers = () => {
    const csvContent = 'E-mail,Naam,Bericht,Datum,E-mail Verzonden\n' + 
      users.map(user => 
        `${user.email},${user.name},${user.message},${user.date},${user.emailSent ? 'Ja' : 'Nee'}`
      ).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bitbeheer_notificaties.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Filter users by category
  const filteredUsers = selectedCategory === 'all' 
    ? users 
    : users.filter(user => user.category === selectedCategory);

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(users.map(user => user.category)))];

  const sentCount = filteredUsers.filter(user => user.emailSent).length;
  const pendingCount = filteredUsers.filter(user => !user.emailSent).length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Gebruikers laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-orange-100 p-3 rounded-xl">
                  <Mail className="w-8 h-8 text-orange-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Notificatie Beheer</h1>
                  <p className="text-gray-600">Beheer aangemelde gebruikers en verstuur live aankondigingen</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleExportUsers}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
                <div className="text-sm text-gray-500">
                  {users.length} gebruikers
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-xl">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{users.length}</h3>
                  <p className="text-gray-600">Totaal Aangemeld</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center gap-4">
                <div className="bg-green-100 p-3 rounded-xl">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{sentCount}</h3>
                  <p className="text-gray-600">E-mail Verzonden</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center gap-4">
                <div className="bg-orange-100 p-3 rounded-xl">
                  <Clock className="w-8 h-8 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{pendingCount}</h3>
                  <p className="text-gray-600">Nog Te Verzenden</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bulk Email Section */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Live Aankondiging Verzenden</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Aangepast bericht (optioneel)
                </label>
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Laat leeg voor standaard bericht..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              
              <div className="flex items-center gap-4">
                <button
                  onClick={handleSendBulkEmail}
                  disabled={selectedUsers.length === 0 || isSending}
                  className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Verzenden...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Verstuur naar {selectedUsers.length} gebruikers
                    </>
                  )}
                </button>
                
                {sendStatus === 'sent' && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span>E-mails verzonden!</span>
                  </div>
                )}
                
                {sendStatus === 'error' && (
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <span>Fout bij verzenden</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Users List */}
          <div className="bg-white rounded-lg shadow-lg">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-bold text-gray-900">Aangemelde Gebruikers ({filteredUsers.length})</h2>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category === 'all' ? 'Alle Categorieën' : category}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-600">Selecteer alles</span>
                </div>
              </div>
            </div>

            <div className="divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Mail className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Nog geen gebruikers aangemeld voor deze categorie</p>
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <div key={user.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleSelectUser(user.id)}
                        className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-medium text-gray-900">{user.email}</span>
                          <span className="text-sm text-gray-500">•</span>
                          <span className="text-sm text-gray-600">{user.name}</span>
                          <span className="text-sm text-gray-500">•</span>
                          <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                            {user.category}
                          </span>
                          {user.emailSent && (
                            <div className="flex items-center gap-1 text-green-600">
                              <CheckCircle className="w-4 h-4" />
                              <span className="text-xs">Verzonden</span>
                            </div>
                          )}
                        </div>
                        {user.message && user.message !== 'Geen bericht' && (
                          <p className="text-sm text-gray-600 mb-2">{user.message}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <span>Aangemeld: {user.date}</span>
                          {user.emailSentDate && (
                            <span>E-mail verzonden: {user.emailSentDate}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Verwijderen"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
