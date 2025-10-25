import { useState, useEffect } from 'react';
import { Mail, Users, Send, CheckCircle, Clock, AlertCircle, Download, Trash2, Settings, Template } from 'lucide-react';

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

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  category: string;
}

export default function NotificatieBeheer() {
  const [users, setUsers] = useState<NotificationUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [customMessage, setCustomMessage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [showTemplateSettings, setShowTemplateSettings] = useState(false);

  // Default email templates
  const defaultTemplates: EmailTemplate[] = [
    {
      id: 'site_live',
      name: 'Site Live Aankondiging',
      subject: 'BitBeheer is nu live! 🚀',
      content: `Beste {{name}},

Geweldig nieuws! BitBeheer is nu officieel live en klaar om je te helpen bij je Bitcoin investeringen.

Wat kun je nu doen:
• Persoonlijke 1-op-1 begeleiding boeken
• Bitcoin geschiedenis en data bekijken
• Portfolio beheer tools gebruiken
• Veilig Bitcoin kopen en bewaren

Log in op https://www.bitbeheer.nl om te beginnen!

Met vriendelijke groet,
Het BitBeheer team`,
      category: 'opening_website'
    },
    {
      id: 'welcome',
      name: 'Welkom Bericht',
      subject: 'Welkom bij BitBeheer! 👋',
      content: `Beste {{name}},

Welkom bij BitBeheer! Bedankt voor je interesse in onze Bitcoin begeleiding.

We helpen je graag met:
• Veilig Bitcoin kopen
• Eigen beheer van je Bitcoin
• Persoonlijke begeleiding op maat

Heb je vragen? Neem gerust contact met ons op!

Met vriendelijke groet,
Het BitBeheer team`,
      category: 'account_aanmelden'
    }
  ];

  // Load users and templates
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load users
        const response = await fetch('/api/users');
        if (response.ok) {
          const data = await response.json();
          setUsers(data.users || []);
        } else {
          // Fallback to localStorage
          const storedUsers = localStorage.getItem('bitbeheer_emails');
          if (storedUsers) {
            setUsers(JSON.parse(storedUsers));
          }
        }

        // Load templates
        const templatesResponse = await fetch('/api/email-templates');
        if (templatesResponse.ok) {
          const templatesData = await templatesResponse.json();
          setEmailTemplates(templatesData.templates || defaultTemplates);
        } else {
          setEmailTemplates(defaultTemplates);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        // Fallback to localStorage
        const storedUsers = localStorage.getItem('bitbeheer_emails');
        if (storedUsers) {
          setUsers(JSON.parse(storedUsers));
        }
        setEmailTemplates(defaultTemplates);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter users by category
  const filteredUsers = selectedCategory === 'all' 
    ? users 
    : users.filter(user => user.category === selectedCategory);

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(users.map(user => user.category)))];

  const sentCount = filteredUsers.filter(user => user.emailSent).length;
  const pendingCount = filteredUsers.filter(user => !user.emailSent).length;

  // Handle user selection
  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  // Select all users in current category
  const selectAllUsers = () => {
    const allUserIds = filteredUsers.map(user => user.id);
    setSelectedUsers(allUserIds);
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedUsers([]);
  };

  // Send bulk email
  const sendBulkEmail = async () => {
    if (selectedUsers.length === 0) {
      alert('Selecteer eerst gebruikers om e-mails naar te versturen.');
      return;
    }

    setIsSending(true);
    setSendStatus('sending');

    try {
      const selectedUserData = users.filter(user => selectedUsers.includes(user.id));
      const template = emailTemplates.find(t => t.id === selectedTemplate);
      
      const emailData = {
        users: selectedUserData,
        message: customMessage || (template ? template.content : ''),
        subject: template ? template.subject : 'Bericht van BitBeheer',
        fromEmail: 'update@bitbeheer.nl'
      };

      const response = await fetch('/api/send-bulk-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });

      if (response.ok) {
        setSendStatus('sent');
        // Update users as sent
        setUsers(prevUsers => 
          prevUsers.map(user => 
            selectedUsers.includes(user.id) 
              ? { ...user, emailSent: true, emailSentDate: new Date().toISOString() }
              : user
          )
        );
        setSelectedUsers([]);
        setCustomMessage('');
      } else {
        setSendStatus('error');
      }
    } catch (error) {
      console.error('Error sending bulk email:', error);
      setSendStatus('error');
    } finally {
      setIsSending(false);
    }
  };

  // Delete user
  const deleteUser = async (userId: string) => {
    if (confirm('Weet je zeker dat je deze gebruiker wilt verwijderen?')) {
      try {
        const response = await fetch(`/api/users/${userId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
        } else {
          // Fallback to localStorage
          const updatedUsers = users.filter(user => user.id !== userId);
          setUsers(updatedUsers);
          localStorage.setItem('bitbeheer_emails', JSON.stringify(updatedUsers));
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        // Fallback to localStorage
        const updatedUsers = users.filter(user => user.id !== userId);
        setUsers(updatedUsers);
        localStorage.setItem('bitbeheer_emails', JSON.stringify(updatedUsers));
      }
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    const csvData = filteredUsers.map(user => ({
      'E-mail': user.email,
      'Naam': user.name,
      'Bericht': user.message,
      'Categorie': user.category,
      'Datum': user.date,
      'E-mail Verzonden': user.emailSent ? 'Ja' : 'Nee',
      'Verzend Datum': user.emailSentDate || ''
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).map(value => `"${value}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bitbeheer_notificaties.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

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
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">E-mail Beheer</h1>
            <p className="text-gray-600">Beheer notificatie e-mails en verstuur bulk berichten</p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-xl">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{filteredUsers.length}</h3>
                  <p className="text-gray-600">Totaal Gebruikers</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-4">
                <div className="bg-green-100 p-3 rounded-xl">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{sentCount}</h3>
                  <p className="text-gray-600">E-mails Verzonden</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
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

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-4">
                <div className="bg-purple-100 p-3 rounded-xl">
                  <Mail className="w-8 h-8 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{selectedUsers.length}</h3>
                  <p className="text-gray-600">Geselecteerd</p>
                </div>
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Categorie Filter</h3>
              <div className="flex items-center gap-4">
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
                <button
                  onClick={exportToCSV}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
              </div>
            </div>
          </div>

          {/* Bulk Email Section */}
          <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Bulk E-mail Versturen</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowTemplateSettings(!showTemplateSettings)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Template Instellingen
                </button>
              </div>
            </div>

            {/* Template Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-mail Template
              </label>
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">Kies een template...</option>
                {emailTemplates.map(template => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Message */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bericht voor alle geselecteerde e-mails
              </label>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Typ je bericht hier... (of gebruik een template hierboven)"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            {/* Send Button */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={sendBulkEmail}
                  disabled={isSending || selectedUsers.length === 0}
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
                      Verstuur naar {selectedUsers.length} e-mails
                    </>
                  )}
                </button>
                <span className="text-sm text-gray-600">
                  {selectedUsers.length} van {filteredUsers.length} e-mails geselecteerd
                </span>
              </div>
            </div>

            {/* Status Messages */}
            {sendStatus === 'sent' && (
              <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                E-mails succesvol verzonden!
              </div>
            )}
            {sendStatus === 'error' && (
              <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Er is een fout opgetreden bij het verzenden van de e-mails.
              </div>
            )}
          </div>

          {/* User List */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">E-mail Lijst</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={selectAllUsers}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Alles Selecteren
                </button>
                <button
                  onClick={clearSelection}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Selectie Wissen
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {filteredUsers.map((user, index) => (
                <div key={user.id || index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => toggleUserSelection(user.id)}
                      className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{user.email}</span>
                        {user.emailSent && (
                          <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                            Verzonden
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">{user.name}</span>
                        {user.message && (
                          <>
                            <span className="mx-2">•</span>
                            <span>{user.message}</span>
                          </>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {user.date}
                        {user.emailSentDate && (
                          <>
                            <span className="mx-2">•</span>
                            <span>Verzonden: {new Date(user.emailSentDate).toLocaleString('nl-NL')}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteUser(user.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {filteredUsers.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p>Geen gebruikers gevonden voor deze categorie.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
