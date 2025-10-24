import { Bitcoin, Clock, Shield, Users, Mail, ArrowRight, CheckCircle, AlertCircle, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';

export default function SoonOnlinePage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    // Simple validation
    if (!email || !email.includes('@')) {
      setSubmitStatus('error');
      setIsSubmitting(false);
      return;
    }

            try {
              // Try to save to backend API first
              const response = await fetch('/api/users', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  email: email.trim().toLowerCase(),
                  name: name?.trim() || 'Niet opgegeven',
                  message: message?.trim() || 'Geen bericht',
                  category: 'livegang'
                })
              });

              if (response.ok) {
                const data = await response.json();
                console.log('User saved to backend:', data);
              } else {
                console.error('Failed to save to backend, using localStorage fallback');
                // Fallback to localStorage for development
                const emailData = {
                  id: Date.now().toString(),
                  email: email.trim().toLowerCase(),
                  name: name?.trim() || 'Niet opgegeven',
                  message: message?.trim() || 'Geen bericht',
                  timestamp: new Date().toISOString(),
                  date: new Date().toLocaleString('nl-NL')
                };

                const existingEmails = JSON.parse(localStorage.getItem('bitbeheer_emails') || '[]');
                existingEmails.push(emailData);
                localStorage.setItem('bitbeheer_emails', JSON.stringify(existingEmails));
              }

              // Send email notification to admin via test-email API
              try {
                const emailResponse = await fetch('/api/test-email', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    email: email.trim().toLowerCase(),
                    name: name?.trim() || 'Niet opgegeven',
                    message: message?.trim() || 'Geen bericht',
                    category: 'livegang'
                  })
                });

                if (emailResponse.ok) {
                  const emailData = await emailResponse.json();
                  console.log('Email sent successfully:', emailData);
                } else {
                  console.error('Failed to send admin notification email');
                }
              } catch (emailError) {
                console.error('Error sending admin notification:', emailError);
              }

              setSubmitStatus('success');
              setEmail('');
              setName('');
              setMessage('');
            } catch (error) {
              console.error('Error submitting form:', error);
              setSubmitStatus('error');
            } finally {
              setIsSubmitting(false);
            }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-8">
              <div className="bg-white bg-opacity-20 p-4 rounded-2xl backdrop-blur-sm">
                <Bitcoin className="w-16 h-16" />
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
              Binnenkort Online
            </h1>
            <p className="text-xl md:text-2xl text-orange-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              BitBeheer - Persoonlijke Bitcoin Begeleiding
            </p>
            <div className="bg-white bg-opacity-20 rounded-2xl p-6 backdrop-blur-sm max-w-2xl mx-auto">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Clock className="w-8 h-8" />
                <span className="text-2xl font-bold">We zijn bijna klaar!</span>
              </div>
              <p className="text-orange-100">
                We werken hard aan de laatste details om je de beste Bitcoin begeleiding te kunnen bieden.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What's Coming Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Wat Komt Er Aan?
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                Persoonlijke 1-op-1 begeleiding voor Bitcoin investeren
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-8 text-center">
                <div className="bg-orange-500 p-4 rounded-xl w-fit mx-auto mb-6">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Veilig Bitcoin Kopen</h3>
                <p className="text-gray-600 leading-relaxed">
                  Leer stap voor stap hoe je veilig Bitcoin koopt via betrouwbare exchanges en wat je moet weten voordat je begint.
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 text-center">
                <div className="bg-blue-500 p-4 rounded-xl w-fit mx-auto mb-6">
                  <Bitcoin className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Eigen Beheer</h3>
                <p className="text-gray-600 leading-relaxed">
                  Het belangrijkste onderdeel: hoe bewaar je je Bitcoin veilig en houd je volledige controle over je eigen geld.
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8 text-center">
                <div className="bg-green-500 p-4 rounded-xl w-fit mx-auto mb-6">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Persoonlijke Begeleiding</h3>
                <p className="text-gray-600 leading-relaxed">
                  1-op-1 begeleiding op jouw tempo en niveau, met voorbeelden en echte data.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Notification Form Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="bg-orange-100 p-3 rounded-xl">
                <Mail className="w-8 h-8 text-orange-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">
                Blijf Op De Hoogte
              </h2>
            </div>
            <p className="text-gray-600 mb-8">
              Wil je op de hoogte blijven van wanneer we live gaan? Laat je gegevens achter en we sturen je een bericht zodra we klaar zijn.
            </p>

                    <div className="bg-white rounded-2xl p-8 shadow-lg">
                      {submitStatus === 'success' ? (
                        // Show only success message after successful submission
                        <div className="text-center">
                          <div className="bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-lg flex items-center justify-center gap-3 mb-4">
                            <CheckCircle className="w-6 h-6" />
                            <span className="text-lg font-medium">Bedankt! Je bent toegevoegd aan onze notificatie lijst.</span>
                          </div>
                          <p className="text-gray-600">We sturen je een e-mail zodra we live gaan.</p>
                        </div>
                      ) : (
                        // Show form only if not successful
                        <form onSubmit={handleSubmit} className="space-y-4">
                          {/* Error Messages */}
                          {submitStatus === 'error' && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                              <AlertCircle className="w-5 h-5" />
                              <span>Er is een fout opgetreden. Controleer je e-mail adres.</span>
                            </div>
                          )}

                          <div>
                            <input
                              type="text"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              placeholder="Je naam (optioneel)"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            />
                          </div>
                          
                          <div>
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="Je e-mailadres *"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                              required
                            />
                          </div>
                          
                          <div>
                            <textarea
                              value={message}
                              onChange={(e) => setMessage(e.target.value)}
                              placeholder="Extra bericht (optioneel)"
                              rows={3}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            />
                          </div>
                          
                          <button
                            type="submit"
                            disabled={isSubmitting || !email}
                            className="w-full bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isSubmitting ? (
                              <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Versturen...
                              </>
                            ) : (
                              <>
                                <Mail className="w-5 h-5" />
                                Notificatie Aanvragen
                                <ArrowRight className="w-5 h-5" />
                              </>
                            )}
                          </button>
                          
                          <p className="text-sm text-gray-500 text-center">
                            Je e-mail wordt automatisch opgeslagen en we sturen je een notificatie zodra we live gaan.
                          </p>
                        </form>
                      )}
                    </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                  <Bitcoin className="w-8 h-8 text-orange-500" />
                  <h3 className="text-2xl font-bold text-white">BitBeheer</h3>
                </div>
                <p className="text-gray-400 mb-4">
                  Persoonlijke begeleiding voor Bitcoin investeren
                </p>
                <div className="flex items-center justify-center md:justify-start gap-6 text-sm">
                  <span>© 2026 BitBeheer</span>
                  <span>•</span>
                  <span>Binnenkort online</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-400">
                  Admin toegang:
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      // Create a beautiful modal for login
                      const modal = document.createElement('div');
                      modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
                      modal.innerHTML = `
                        <div class="bg-white rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl">
                          <div class="text-center mb-6">
                            <div class="bg-orange-100 p-3 rounded-xl w-fit mx-auto mb-4">
                              <svg class="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                              </svg>
                            </div>
                            <h3 class="text-2xl font-bold text-gray-900 mb-2">Admin Login</h3>
                            <p class="text-gray-600">Voer je wachtwoord in om toegang te krijgen</p>
                          </div>
                          <form id="adminLoginForm" class="space-y-4">
                            <div>
                              <label class="block text-sm font-medium text-gray-700 mb-2">Wachtwoord</label>
                              <input 
                                type="password" 
                                id="adminPassword" 
                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                placeholder="Admin wachtwoord"
                                required
                              />
                            </div>
                            <div class="flex gap-3">
                              <button 
                                type="submit" 
                                class="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                              >
                                Inloggen
                              </button>
                              <button 
                                type="button" 
                                id="cancelLogin"
                                class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                              >
                                Annuleren
                              </button>
                            </div>
                                        <div class="text-xs text-gray-500 text-center">
                                          <p>Voer je wachtwoord in</p>
                                        </div>
                          </form>
                        </div>
                      `;
                      
                      document.body.appendChild(modal);
                      
                      const form = modal.querySelector('#adminLoginForm');
                      const passwordInput = modal.querySelector('#adminPassword');
                      const cancelBtn = modal.querySelector('#cancelLogin');
                      
                      form.addEventListener('submit', (e) => {
                        e.preventDefault();
                        const password = passwordInput.value;
                        
                                    // Use environment variables for security
                                    const adminPassword = process.env.REACT_APP_ADMIN_PASSWORD || 'admin123';
                                    const testPassword = process.env.REACT_APP_TEST_PASSWORD || 'test123';
                                    
                                    if (password === adminPassword) {
                                      // Set admin login in localStorage
                                      localStorage.setItem('admin_authenticated', 'true');
                                      localStorage.setItem('user_type', 'admin');
                                      document.body.removeChild(modal);
                                      alert('Admin login succesvol! Je wordt doorgestuurd naar de admin pagina.');
                                      window.location.href = '/admin';
                                    } else if (password === testPassword) {
                                      localStorage.setItem('admin_authenticated', 'true');
                                      localStorage.setItem('user_type', 'test');
                                      document.body.removeChild(modal);
                                      alert('Test gebruiker login succesvol! Je wordt doorgestuurd naar de admin pagina.');
                                      window.location.href = '/admin';
                                    } else {
                                      alert('Onjuist wachtwoord. Probeer opnieuw.');
                                    }
                      });
                      
                      cancelBtn.addEventListener('click', () => {
                        document.body.removeChild(modal);
                      });
                      
                      // Close on outside click
                      modal.addEventListener('click', (e) => {
                        if (e.target === modal) {
                          document.body.removeChild(modal);
                        }
                      });
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm rounded-lg transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Admin Login
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
