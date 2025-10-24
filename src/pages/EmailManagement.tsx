import { useState, useEffect } from 'react';
import { Mail, Users, Send, Trash2, Eye, Download } from 'lucide-react';

interface EmailRecord {
  id: string;
  email: string;
  name: string;
  message: string;
  timestamp: string;
  date: string;
}

export default function EmailManagement() {
  const [emails, setEmails] = useState<EmailRecord[]>([]);
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bulkMessage, setBulkMessage] = useState('');

  // Load emails from localStorage (in production, this would be from a database)
  useEffect(() => {
    const loadEmails = () => {
      try {
        const storedEmails = localStorage.getItem('bitbeheer_emails');
        if (storedEmails) {
          setEmails(JSON.parse(storedEmails));
        }
      } catch (error) {
        console.error('Error loading emails:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadEmails();
  }, []);

  const handleSelectAll = () => {
    if (selectedEmails.length === emails.length) {
      setSelectedEmails([]);
    } else {
      setSelectedEmails(emails.map(email => email.id));
    }
  };

  const handleSelectEmail = (emailId: string) => {
    setSelectedEmails(prev => 
      prev.includes(emailId) 
        ? prev.filter(id => id !== emailId)
        : [...prev, emailId]
    );
  };

  const handleBulkEmail = () => {
    if (selectedEmails.length === 0) {
      alert('Selecteer eerst e-mail adressen om naar te versturen.');
      return;
    }

    if (!bulkMessage.trim()) {
      alert('Voer een bericht in voor de bulk e-mail.');
      return;
    }

    const selectedEmailAddresses = emails
      .filter(email => selectedEmails.includes(email.id))
      .map(email => email.email);

    // Create mailto link for bulk email
    const subject = 'BitBeheer is nu live!';
    const body = bulkMessage;
    const bcc = selectedEmailAddresses.join(', ');

    window.location.href = `mailto:?bcc=${encodeURIComponent(bcc)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleDeleteEmail = (emailId: string) => {
    if (confirm('Weet je zeker dat je deze e-mail wilt verwijderen?')) {
      const updatedEmails = emails.filter(email => email.id !== emailId);
      setEmails(updatedEmails);
      localStorage.setItem('bitbeheer_emails', JSON.stringify(updatedEmails));
      setSelectedEmails(prev => prev.filter(id => id !== emailId));
    }
  };

  const handleExportEmails = () => {
    const emailList = emails.map(email => `${email.email},${email.name},${email.date}`).join('\n');
    const csvContent = 'E-mail,Naam,Datum\n' + emailList;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bitbeheer_emails.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">E-mails laden...</p>
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
                  <h1 className="text-3xl font-bold text-gray-900">E-mail Beheer</h1>
                  <p className="text-gray-600">Beheer notificatie e-mails en verstuur bulk berichten</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleExportEmails}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
                <div className="text-sm text-gray-500">
                  {emails.length} e-mails
                </div>
              </div>
            </div>
          </div>

          {/* Bulk Email Section */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Bulk E-mail Versturen</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bericht voor alle geselecteerde e-mails
                </label>
                <textarea
                  value={bulkMessage}
                  onChange={(e) => setBulkMessage(e.target.value)}
                  placeholder="Voer hier je bericht in voor de bulk e-mail..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={handleBulkEmail}
                  disabled={selectedEmails.length === 0 || !bulkMessage.trim()}
                  className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  Verstuur naar {selectedEmails.length} e-mails
                </button>
                <span className="text-sm text-gray-500">
                  {selectedEmails.length} van {emails.length} e-mails geselecteerd
                </span>
              </div>
            </div>
          </div>

          {/* Email List */}
          <div className="bg-white rounded-lg shadow-lg">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">E-mail Lijst</h2>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedEmails.length === emails.length && emails.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-600">Selecteer alles</span>
                </div>
              </div>
            </div>

            <div className="divide-y divide-gray-200">
              {emails.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Mail className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Nog geen e-mails ontvangen</p>
                </div>
              ) : (
                emails.map((email) => (
                  <div key={email.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      <input
                        type="checkbox"
                        checked={selectedEmails.includes(email.id)}
                        onChange={() => handleSelectEmail(email.id)}
                        className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-medium text-gray-900">{email.email}</span>
                          <span className="text-sm text-gray-500">•</span>
                          <span className="text-sm text-gray-600">{email.name}</span>
                        </div>
                        {email.message && email.message !== 'Geen bericht' && (
                          <p className="text-sm text-gray-600 mb-2">{email.message}</p>
                        )}
                        <p className="text-xs text-gray-400">{email.date}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDeleteEmail(email.id)}
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
