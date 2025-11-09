import { CheckCircle, Clock, XCircle, Send, RefreshCw } from 'lucide-react';

interface SignupProcessFlowProps {
  user?: {
    email_verified?: boolean;
    first_appointment_completed?: boolean;
    account_approved?: boolean;
    created_at?: string;
    verified_at?: string;
    email?: string;
    verification_token_created?: string;
    email_sent_date?: string;
  };
  showLegend?: boolean;
  onResendVerificationEmail?: () => void;
  isResendingEmail?: boolean;
}

export default function SignupProcessFlow({ user, showLegend = true, onResendVerificationEmail, isResendingEmail = false }: SignupProcessFlowProps) {
  const getCurrentStep = () => {
    if (!user) return 0;
    if (user.account_approved && user.first_appointment_completed) return 4;
    if (user.first_appointment_completed) return 3;
    if (user.email_verified) return 2;
    return 1;
  };

  const currentStep = getCurrentStep();

  const steps = [
    {
      number: 1,
      title: 'Gebruiker vult aanmeldformulier in',
      description: 'Gebruiker geeft naam, email en eventueel bericht op via het aanmeldformulier op de website.',
      email: {
        type: 'Verificatie Email',
        when: 'Direct na aanmelding',
        emailType: 'verification',
        content: 'Welkomstbericht met verificatielink (geldig 5 dagen)',
        tracking: 'Verstuurd, Geopend, Geklikt, Antwoord ontvangen'
      },
      status: {
        field: 'created_at',
        value: user?.created_at ? 'Aangemeld' : null
      },
      color: 'blue'
    },
    {
      number: 2,
      title: 'Gebruiker klikt op verificatielink',
      description: 'Gebruiker opent de email en klikt op de verificatielink om het account te activeren.',
      status: {
        field: 'email_verified',
        value: user?.email_verified ? 'Geverifieerd' : null,
        verifiedAt: user?.verified_at
      },
      color: 'green'
    },
    {
      number: 3,
      title: '20 minuten kennismakingsgesprek',
      description: 'Admin plant een 20 minuten kennismakingsgesprek via Microsoft Teams met de gebruiker.',
      email: {
        type: 'Afspraak Bevestiging',
        when: 'Na het plannen van de afspraak',
        emailType: 'appointment',
        content: 'Teams link, datum/tijd, instructies',
        tracking: 'Verstuurd, Geopend, Geklikt, Antwoord ontvangen'
      },
      status: {
        field: 'first_appointment_completed',
        value: user?.first_appointment_completed ? 'Gesprek voltooid' : null
      },
      color: 'purple'
    },
    {
      number: 4,
      title: 'Gesprek voltooid - Account goedgekeurd',
      description: 'Na het gesprek keurt de admin het account goed en wordt de gebruiker volledig geactiveerd.',
      email: {
        type: 'Welkom Email',
        when: 'Na account goedkeuring',
        emailType: 'welcome',
        content: 'Welkomstbericht, inloggegevens, volgende stappen',
        tracking: 'Verstuurd, Geopend, Geklikt, Antwoord ontvangen'
      },
      status: {
        field: 'account_approved',
        value: user?.account_approved ? 'Volledig geactiveerd' : null
      },
      color: 'orange'
    }
  ];

  const getStepStatus = (stepNumber: number) => {
    if (stepNumber < currentStep) return 'completed';
    if (stepNumber === currentStep) return 'current';
    return 'pending';
  };

  const getColorClasses = (color: string, status: string) => {
    // If step is pending (not completed), use gray colors
    if (status === 'pending') {
      return {
        border: 'border-gray-300',
        bg: 'bg-gray-300',
        lightBg: 'bg-gray-50',
        borderLight: 'border-gray-200',
        text: 'text-gray-600',
        textLight: 'text-gray-500'
      };
    }

    const colors: Record<string, Record<string, string>> = {
      blue: {
        border: 'border-blue-500',
        bg: 'bg-blue-500',
        lightBg: 'bg-blue-50',
        borderLight: 'border-blue-200',
        text: 'text-blue-900',
        textLight: 'text-blue-800'
      },
      green: {
        border: 'border-green-500',
        bg: 'bg-green-500',
        lightBg: 'bg-green-50',
        borderLight: 'border-green-200',
        text: 'text-green-900',
        textLight: 'text-green-800'
      },
      purple: {
        border: 'border-purple-500',
        bg: 'bg-purple-500',
        lightBg: 'bg-purple-50',
        borderLight: 'border-purple-200',
        text: 'text-purple-900',
        textLight: 'text-purple-800'
      },
      orange: {
        border: 'border-orange-500',
        bg: 'bg-orange-500',
        lightBg: 'bg-orange-50',
        borderLight: 'border-orange-200',
        text: 'text-orange-900',
        textLight: 'text-orange-800'
      }
    };

    return colors[color] || colors.blue;
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      return date.toLocaleString('nl-NL', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return null;
    }
  };

  return (
    <div className="space-y-6">
      {steps.map((step, index) => {
        const status = getStepStatus(step.number);
        const colors = getColorClasses(step.color, status);
        const isLast = index === steps.length - 1;

        return (
          <div key={step.number} className={`border-l-4 ${colors.border} pl-6 ${!isLast ? 'pb-6' : ''}`}>
            <div className="flex items-start gap-4">
              <div className={`flex-shrink-0 w-10 h-10 ${colors.bg} text-white rounded-full flex items-center justify-center font-bold relative`}>
                {status === 'completed' ? (
                  <CheckCircle className="w-6 h-6" />
                ) : status === 'current' ? (
                  <Clock className="w-6 h-6" />
                ) : (
                  step.number
                )}
                {status === 'current' && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full animate-pulse"></span>
                )}
              </div>
              <div className="flex-1">
                <h3 className={`text-lg font-semibold mb-2 ${
                  status === 'completed' ? 'text-gray-900' : 
                  status === 'current' ? 'text-orange-600' : 
                  'text-gray-500'
                }`}>
                  {step.title}
                </h3>
                <p className={`mb-3 ${
                  status === 'completed' ? 'text-gray-600' : 
                  status === 'current' ? 'text-gray-600' : 
                  'text-gray-400'
                }`}>
                  {step.description}
                </p>
                
                {step.email && (
                  <div className={`${colors.lightBg} border ${colors.borderLight} rounded-lg p-4 mb-3`}>
                    <p className={`text-sm font-medium ${colors.text} mb-2`}>📧 Email: {step.email.type}</p>
                    <p className={`text-sm ${colors.textLight}`}>
                      <strong>Wanneer:</strong> {step.email.when}<br />
                      <strong>Type:</strong> {step.email.emailType}<br />
                      <strong>Inhoud:</strong> {step.email.content}<br />
                      <strong>Status tracking:</strong> {step.email.tracking}
                    </p>
                    {step.email.emailType === 'verification' && user?.email && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className={`text-sm ${colors.textLight} mb-2`}>
                          <strong>Verzonden naar:</strong> {user.email}<br />
                          {user.email_sent_date && (
                            <>
                              <strong>Verzonden op:</strong> {formatDate(user.email_sent_date) || 'Onbekend'}<br />
                            </>
                          )}
                          {user.verification_token_created && !user.email_sent_date && (
                            <>
                              <strong>Aangemaakt op:</strong> {formatDate(user.verification_token_created) || 'Onbekend'}<br />
                            </>
                          )}
                        </p>
                        {!user.email_verified && onResendVerificationEmail && (
                          <button
                            onClick={onResendVerificationEmail}
                            disabled={isResendingEmail}
                            className="mt-2 flex items-center gap-2 px-3 py-1.5 bg-orange-600 text-white text-xs rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isResendingEmail ? (
                              <>
                                <RefreshCw className="w-3 h-3 animate-spin" />
                                Verzenden...
                              </>
                            ) : (
                              <>
                                <Send className="w-3 h-3" />
                                Opnieuw versturen
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {step.status && (
                  <div className={`${colors.lightBg} border ${colors.borderLight} rounded-lg p-4`}>
                    <p className={`text-sm font-medium ${colors.text} mb-2`}>
                      ✅ Account Status
                    </p>
                    <p className={`text-sm ${colors.textLight}`}>
                      <strong>{step.status.field}:</strong> {step.status.value || 'Nog niet bereikt'}<br />
                      {step.status.verifiedAt && (
                        <>
                          <strong>Geverifieerd op:</strong> {new Date(step.status.verifiedAt).toLocaleString('nl-NL')}
                        </>
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {showLegend && (
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Legenda</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Status:</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Voltooid - Deze stap is afgerond
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-500" />
                  Huidige stap - Hier ben je nu
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold">?</span>
                  Nog te doen - Deze stap komt nog
                </li>
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
      )}
    </div>
  );
}

