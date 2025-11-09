import { useState, useEffect } from 'react';
import { Mail, FileText, History, ArrowRight, CheckCircle, XCircle, Clock, Send, RefreshCw, Search, Filter } from 'lucide-react';
import { supabase } from '../lib/supabase';
import EmailTemplates from './EmailTemplates';

interface EmailHistory {
  id: string;
  to_email: string;
  from_email: string;
  subject: string;
  template_name: string | null;
  email_type: string;
  status: string;
  sent_at: string;
  opened_at: string | null;
  clicked_at: string | null;
  replied_at: string | null;
  bounced_at: string | null;
  resend_count: number;
  last_resent_at: string | null;
  related_user_email: string | null;
  error_message: string | null;
}

interface EmailStats {
  total: number;
  sent: number;
  failed: number;
  pending: number;
  verification: number;
  welcome: number;
  appointment: number;
  notification: number;
}

export default function EmailManagementTab() {
  const [activeTab, setActiveTab] = useState<'history' | 'templates' | 'flow'>('history');
  const [emailHistory, setEmailHistory] = useState<EmailHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<EmailStats>({
    total: 0,
    sent: 0,
    failed: 0,
    pending: 0,
    verification: 0,
    welcome: 0,
    appointment: 0,
    notification: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    if (activeTab === 'history') {
      loadEmailHistory();
    }
  }, [activeTab, filterType, filterStatus]);

  const loadEmailHistory = async () => {
    setLoading(true);
    try {
      // Load from email_history table
      let historyData: EmailHistory[] = [];
      try {
        let query = supabase
          .from('email_history')
          .select('*')
          .order('sent_at', { ascending: false })
          .limit(500);

        if (filterType !== 'all') {
          query = query.eq('email_type', filterType);
        }
        if (filterStatus !== 'all') {
          query = query.eq('status', filterStatus);
        }

        const { data, error } = await query;
        if (!error && data) {
          historyData = data.map((item: any) => ({
            id: item.id,
            to_email: item.to_email,
            from_email: item.from_email || 'noreply@bitbeheer.nl',
            subject: item.subject,
            template_name: item.template_name,
            email_type: item.email_type,
            status: item.status,
            sent_at: item.sent_at,
            opened_at: item.opened_at,
            clicked_at: item.clicked_at,
            replied_at: item.replied_at,
            bounced_at: item.bounced_at,
            resend_count: item.resend_count || 0,
            last_resent_at: item.last_resent_at,
            related_user_email: item.related_user_email,
            error_message: item.error_message
          }));
        }
      } catch (err) {
        console.log('email_history table not available:', err);
      }

      // Load from email_queue table
      try {
        const { data: queueData, error: queueError } = await supabase
          .from('email_queue')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(500);

        if (!queueError && queueData) {
          queueData.forEach((item: any) => {
            historyData.push({
              id: item.id,
              to_email: item.to_email,
              from_email: 'noreply@bitbeheer.nl',
              subject: item.subject,
              template_name: null,
              email_type: 'notification',
              status: item.status || 'pending',
              sent_at: item.sent_at || item.created_at,
              opened_at: null,
              clicked_at: null,
              replied_at: null,
              bounced_at: null,
              resend_count: 0,
              last_resent_at: null,
              related_user_email: null,
              error_message: item.error_message
            });
          });
        }
      } catch (err) {
        console.log('email_queue table not available:', err);
      }

      // Load from users table (emails that were sent)
      try {
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('email, email_sent, email_sent_date, created_at, name')
          .not('email_sent', 'is', null)
          .order('email_sent_date', { ascending: false })
          .limit(500);

        if (!usersError && usersData) {
          usersData.forEach((item: any) => {
            if (item.email_sent && item.email_sent_date) {
              historyData.push({
                id: `user-${item.email}`,
                to_email: item.email,
                from_email: 'noreply@bitbeheer.nl',
                subject: 'Welkom bij BitBeheer',
                template_name: 'welcome',
                email_type: 'notification',
                status: 'sent',
                sent_at: item.email_sent_date,
                opened_at: null,
                clicked_at: null,
                replied_at: null,
                bounced_at: null,
                resend_count: 0,
                last_resent_at: null,
                related_user_email: item.email,
                error_message: null
              });
            }
          });
        }
      } catch (err) {
        console.log('users table email tracking not available:', err);
      }

      // Sort by sent_at descending
      historyData.sort((a, b) => {
        const dateA = new Date(a.sent_at).getTime();
        const dateB = new Date(b.sent_at).getTime();
        return dateB - dateA;
      });

      setEmailHistory(historyData);
      calculateStats(historyData);
    } catch (error: any) {
      console.error('Error loading email history:', error);
      setEmailHistory([]);
      setStats({
        total: 0,
        sent: 0,
        failed: 0,
        pending: 0,
        verification: 0,
        welcome: 0,
        appointment: 0,
        notification: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (emails: EmailHistory[]) => {
    const newStats: EmailStats = {
      total: emails.length,
      sent: emails.filter(e => e.status === 'sent').length,
      failed: emails.filter(e => e.status === 'failed' || e.status === 'bounced').length,
      pending: emails.filter(e => e.status === 'pending').length,
      verification: emails.filter(e => e.email_type === 'verification').length,
      welcome: emails.filter(e => e.email_type === 'welcome' || e.template_name === 'welcome').length,
      appointment: emails.filter(e => e.email_type === 'appointment').length,
      notification: emails.filter(e => e.email_type === 'notification').length
    };
    setStats(newStats);
  };

  const getFilteredHistory = () => {
    let filtered = emailHistory;

    if (searchQuery) {
      filtered = filtered.filter(email =>
        email.to_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.template_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('nl-NL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; icon: any; text: string }> = {
      sent: { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Verstuurd' },
      failed: { color: 'bg-red-100 text-red-800', icon: XCircle, text: 'Mislukt' },
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, text: 'In wachtrij' },
      bounced: { color: 'bg-red-100 text-red-800', icon: XCircle, text: 'Bounced' }
    };

    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="w-3 h-3" />
        {badge.text}
      </span>
    );
  };

  const getEmailTypeBadge = (type: string) => {
    const types: Record<string, { color: string; text: string }> = {
      verification: { color: 'bg-blue-100 text-blue-800', text: 'Verificatie' },
      welcome: { color: 'bg-green-100 text-green-800', text: 'Welkom' },
      appointment: { color: 'bg-purple-100 text-purple-800', text: 'Afspraak' },
      notification: { color: 'bg-orange-100 text-orange-800', text: 'Notificatie' }
    };

    const typeInfo = types[type] || { color: 'bg-gray-100 text-gray-800', text: type };
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${typeInfo.color}`}>
        {typeInfo.text}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Sub-tabs */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px overflow-x-auto">
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'history'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <History className="w-4 h-4" />
              Email Geschiedenis
              {stats.total > 0 && (
                <span className="ml-1 px-2 py-0.5 text-xs bg-orange-100 text-orange-800 rounded-full">
                  {stats.total}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('flow')}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'flow'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <ArrowRight className="w-4 h-4" />
              Aanmeldproces Schema
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'templates'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FileText className="w-4 h-4" />
              Email Templates
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Totaal</div>
            </div>
            <div className="bg-green-50 rounded-lg shadow p-4">
              <div className="text-2xl font-bold text-green-600">{stats.sent}</div>
              <div className="text-sm text-green-700">Verstuurd</div>
            </div>
            <div className="bg-red-50 rounded-lg shadow p-4">
              <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
              <div className="text-sm text-red-700">Mislukt</div>
            </div>
            <div className="bg-yellow-50 rounded-lg shadow p-4">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-yellow-700">In wachtrij</div>
            </div>
            <div className="bg-blue-50 rounded-lg shadow p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.verification}</div>
              <div className="text-sm text-blue-700">Verificatie</div>
            </div>
            <div className="bg-green-50 rounded-lg shadow p-4">
              <div className="text-2xl font-bold text-green-600">{stats.welcome}</div>
              <div className="text-sm text-green-700">Welkom</div>
            </div>
            <div className="bg-purple-50 rounded-lg shadow p-4">
              <div className="text-2xl font-bold text-purple-600">{stats.appointment}</div>
              <div className="text-sm text-purple-700">Afspraak</div>
            </div>
            <div className="bg-orange-50 rounded-lg shadow p-4">
              <div className="text-2xl font-bold text-orange-600">{stats.notification}</div>
              <div className="text-sm text-orange-700">Notificatie</div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-lg p-4">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Zoek op email, onderwerp..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="all">Alle types</option>
                  <option value="verification">Verificatie</option>
                  <option value="welcome">Welkom</option>
                  <option value="appointment">Afspraak</option>
                  <option value="notification">Notificatie</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="all">Alle statussen</option>
                  <option value="sent">Verstuurd</option>
                  <option value="failed">Mislukt</option>
                  <option value="pending">In wachtrij</option>
                  <option value="bounced">Bounced</option>
                </select>
              </div>
              <button
                onClick={loadEmailHistory}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Vernieuwen
              </button>
            </div>
          </div>

          {/* Email History Table */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Datum/Tijd</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Naar</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Onderwerp</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Antwoord</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Opnieuw Verstuurd</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-2"></div>
                        <p className="text-gray-600">Geschiedenis laden...</p>
                      </td>
                    </tr>
                  ) : getFilteredHistory().length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                        <Mail className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>Geen email geschiedenis gevonden</p>
                        <p className="text-sm mt-2">
                          {emailHistory.length === 0 
                            ? 'Er zijn nog geen emails verstuurd of de email tabellen zijn nog niet beschikbaar.'
                            : 'Geen emails gevonden met de huidige filters.'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    getFilteredHistory().map((email) => (
                      <tr key={email.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(email.sent_at)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {email.to_email}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate" title={email.subject}>
                          {email.subject}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {getEmailTypeBadge(email.email_type)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {getStatusBadge(email.status)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {email.replied_at ? (
                            <span className="text-green-600">{formatDate(email.replied_at)}</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {email.resend_count > 0 ? (
                            <div>
                              <div className="text-orange-600 font-medium">{email.resend_count}x</div>
                              {email.last_resent_at && (
                                <div className="text-xs text-gray-400">{formatDate(email.last_resent_at)}</div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'templates' && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <EmailTemplates />
        </div>
      )}

      {activeTab === 'flow' && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Aanmeldproces Schema</h2>
          
          <div className="space-y-6">
            {/* Step 1 */}
            <div className="border-l-4 border-blue-500 pl-6 pb-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Gebruiker vult aanmeldformulier in</h3>
                  <p className="text-gray-600 mb-3">Gebruiker geeft naam, email en eventueel bericht op via het aanmeldformulier op de website.</p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-blue-900 mb-2">📧 Email: Verificatie Email</p>
                    <p className="text-sm text-blue-800">
                      <strong>Wanneer:</strong> Direct na aanmelding<br />
                      <strong>Type:</strong> verification<br />
                      <strong>Inhoud:</strong> Welkomstbericht met verificatielink (geldig 5 dagen)<br />
                      <strong>Status tracking:</strong> Verstuurd, Geopend, Geklikt, Antwoord ontvangen
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="border-l-4 border-green-500 pl-6 pb-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Gebruiker klikt op verificatielink</h3>
                  <p className="text-gray-600 mb-3">Gebruiker opent de email en klikt op de verificatielink om het account te activeren.</p>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-green-900 mb-2">✅ Account Status</p>
                    <p className="text-sm text-green-800">
                      <strong>email_verified:</strong> true<br />
                      <strong>Account status:</strong> Geverifieerd, wachtend op 20min gesprek
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="border-l-4 border-purple-500 pl-6 pb-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">20 minuten kennismakingsgesprek</h3>
                  <p className="text-gray-600 mb-3">Admin plant een 20 minuten kennismakingsgesprek via Microsoft Teams met de gebruiker.</p>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-purple-900 mb-2">📧 Email: Afspraak Bevestiging</p>
                    <p className="text-sm text-purple-800">
                      <strong>Wanneer:</strong> Na het plannen van de afspraak<br />
                      <strong>Type:</strong> appointment<br />
                      <strong>Inhoud:</strong> Teams link, datum/tijd, instructies<br />
                      <strong>Status tracking:</strong> Verstuurd, Geopend, Geklikt, Antwoord ontvangen
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="border-l-4 border-orange-500 pl-6 pb-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">
                  4
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Gesprek voltooid - Account goedgekeurd</h3>
                  <p className="text-gray-600 mb-3">Na het gesprek keurt de admin het account goed en wordt de gebruiker volledig geactiveerd.</p>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-orange-900 mb-2">📧 Email: Welkom Email</p>
                    <p className="text-sm text-orange-800">
                      <strong>Wanneer:</strong> Na account goedkeuring<br />
                      <strong>Type:</strong> welcome<br />
                      <strong>Inhoud:</strong> Welkomstbericht, inloggegevens, volgende stappen<br />
                      <strong>Status tracking:</strong> Verstuurd, Geopend, Geklikt, Antwoord ontvangen
                    </p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-3">
                    <p className="text-sm font-medium text-green-900 mb-2">✅ Account Status</p>
                    <p className="text-sm text-green-800">
                      <strong>first_appointment_completed:</strong> true<br />
                      <strong>account_approved:</strong> true<br />
                      <strong>Account status:</strong> Volledig geactiveerd
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 5 */}
            <div className="border-l-4 border-gray-400 pl-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-gray-400 text-white rounded-full flex items-center justify-center font-bold">
                  5
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Ongedaan maken / Opnieuw versturen</h3>
                  <p className="text-gray-600 mb-3">Als een email niet aankomt of de gebruiker reageert niet, kan de admin emails opnieuw versturen.</p>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-900 mb-2">🔄 Opnieuw Versturen</p>
                    <p className="text-sm text-gray-800">
                      <strong>Resend count:</strong> Wordt bijgewerkt bij elke nieuwe verzending<br />
                      <strong>Last resent at:</strong> Datum/tijd van laatste verzending<br />
                      <strong>Status:</strong> Wordt gereset naar 'pending' of 'sent'
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-8 bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Legenda</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Email Statussen:</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li><span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>Verstuurd - Email succesvol verzonden</li>
                  <li><span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-2"></span>Mislukt - Email kon niet verzonden worden</li>
                  <li><span className="inline-block w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>In wachtrij - Email wacht op verzending</li>
                  <li><span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-2"></span>Bounced - Email is teruggestuurd</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Email Types:</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li><span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-2"></span>Verificatie - Email verificatie link</li>
                  <li><span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>Welkom - Welkomst email na activatie</li>
                  <li><span className="inline-block w-3 h-3 bg-purple-500 rounded-full mr-2"></span>Afspraak - Afspraak bevestiging</li>
                  <li><span className="inline-block w-3 h-3 bg-orange-500 rounded-full mr-2"></span>Notificatie - Algemene notificatie</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

