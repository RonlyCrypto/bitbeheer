import { useState, useEffect } from 'react';
import { CheckCircle, Clock, XCircle, Send, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

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
  accordionMode?: boolean; // If true, only current step is expanded
  simpleMode?: boolean; // If true, show simplified version for users
}

export default function SignupProcessFlow({ user, showLegend = true, onResendVerificationEmail, isResendingEmail = false, accordionMode = false, simpleMode = false }: SignupProcessFlowProps) {
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set());
  
  // Debug: log user data to see what's being passed
  useEffect(() => {
    if (simpleMode && user) {
      console.log('SignupProcessFlow - User data:', {
        email_verified: user.email_verified,
        first_appointment_completed: user.first_appointment_completed,
        account_approved: user.account_approved
      });
    }
  }, [user, simpleMode]);
  const getCurrentStep = () => {
    if (!user) return 0;
    if (simpleMode) {
      // Simple mode: 3 steps instead of 4
      // Step 1: Aanmelden gelukt (always visible)
      // Step 2: 20min gesprek (visible when email verified)
      // Step 3: Gesprek goedgekeurd (visible when appointment completed)
      if (user.account_approved && user.first_appointment_completed) return 3;
      if (user.first_appointment_completed) return 3; // Show step 3 when appointment is completed (waiting for approval)
      if (user.email_verified) return 2; // Show step 2 when email is verified (waiting for appointment)
      return 1; // Show step 1 when just registered (waiting for email verification)
    } else {
      // Full mode: 4 steps
      if (user.account_approved && user.first_appointment_completed) return 4;
      if (user.first_appointment_completed) return 3;
      if (user.email_verified) return 2;
      return 1;
    }
  };

  const currentStep = getCurrentStep();

  // Initialize expanded steps: in accordion mode, only current step is expanded
  useEffect(() => {
    if (accordionMode && currentStep > 0) {
      setExpandedSteps(new Set([currentStep]));
    }
  }, [accordionMode, currentStep]);

  const toggleStep = (stepNumber: number) => {
    if (!accordionMode) return; // Don't allow toggling if not in accordion mode
    
    setExpandedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stepNumber)) {
        newSet.delete(stepNumber);
      } else {
        newSet.add(stepNumber);
      }
      return newSet;
    });
  };

  const isStepExpanded = (stepNumber: number) => {
    if (!accordionMode) return true; // Always expanded if not in accordion mode
    // Current step is always expanded
    if (stepNumber === currentStep) return true;
    return expandedSteps.has(stepNumber);
  };

  const steps = simpleMode ? [
    {
      number: 1,
      title: 'Aanmelden gelukt',
      simpleText: 'Nu wachten op email bevestiging',
      color: 'blue'
    },
    {
      number: 2,
      title: '20min gesprek',
      simpleText: 'Plan je 20min gesprek',
      color: 'green'
    },
    {
      number: 3,
      title: 'Gesprek goedgekeurd',
      simpleText: 'Na het gesprek keurt de admin het account goed en wordt de gebruiker volledig geactiveerd.',
      color: 'orange'
    }
  ] : [
    {
      number: 1,
      title: 'Gebruiker vult aanmeldformulier in',
      description: 'Gebruiker geeft naam, email en eventueel bericht op via het aanmeldformulier op de website.',
      actionText: 'Je hebt je al aangemeld! Controleer je email inbox voor de verificatielink.',
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
      actionText: 'Controleer je email inbox en klik op de verificatielink om je account te activeren. De link is 5 dagen geldig.',
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
      actionText: 'Plan je eerste kennismakingsgesprek van 20 minuten. Klik op de knop hieronder om een afspraak in te plannen.',
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
      actionText: 'Wacht op goedkeuring van de admin. Na het gesprek wordt je account volledig geactiveerd.',
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
    if (simpleMode) {
      // In simple mode, determine status based on user progress
      // Check in reverse order to handle completed states correctly
      if (stepNumber === 1) {
        // Step 1: Aanmelden gelukt
        // Current if user exists but email not verified
        if (user && !user.email_verified) return 'current';
        // Completed if email is verified (moved to step 2)
        if (user?.email_verified) return 'completed';
        return 'pending';
      }
      if (stepNumber === 2) {
        // Step 2: 20min gesprek
        // Current if email verified but appointment not completed
        if (user?.email_verified && !user?.first_appointment_completed) return 'current';
        // Completed if appointment is completed (moved to step 3)
        if (user?.first_appointment_completed) return 'completed';
        // Pending if email not verified yet
        return 'pending';
      }
      if (stepNumber === 3) {
        // Step 3: Gesprek goedgekeurd
        // Current if appointment completed but account not approved
        if (user?.first_appointment_completed && !user?.account_approved) return 'current';
        // Completed if account approved
        if (user?.account_approved) return 'completed';
        // Pending if appointment not completed yet
        return 'pending';
      }
    }
    // Full mode logic
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
    <div className="space-y-4">
      {steps.map((step, index) => {
        const status = getStepStatus(step.number);
        const colors = getColorClasses(step.color, status);
        const isLast = index === steps.length - 1;
        const isExpanded = isStepExpanded(step.number);
        const isCompleted = status === 'completed';
        const isCurrent = status === 'current';

        return (
          <div key={step.number} className={`border-l-4 ${colors.border} rounded-lg ${isExpanded ? 'bg-gray-50' : ''} transition-colors`}>
            {/* Step Header - Always visible */}
            <button
              onClick={() => accordionMode && !isCurrent && toggleStep(step.number)}
              disabled={accordionMode && isCurrent}
              className={`w-full flex items-start gap-4 p-4 ${accordionMode && !isCurrent ? 'cursor-pointer hover:bg-gray-100' : 'cursor-default'} transition-colors`}
            >
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
              <div className="flex-1 text-left">
                <h3 className={`text-lg font-semibold mb-1 ${
                  status === 'completed' ? 'text-gray-700' : 
                  status === 'current' ? 'text-orange-600' : 
                  'text-gray-500'
                }`}>
                  {step.title}
                </h3>
                {isCompleted && accordionMode && !simpleMode && (
                  <p className="text-sm text-gray-500">Voltooid</p>
                )}
                {isCurrent && accordionMode && !simpleMode && (
                  <p className="text-sm text-orange-600 font-medium">Huidige stap - Open voor details</p>
                )}
                {simpleMode && isCurrent && (
                  <p className="text-sm text-gray-600 mt-1">{step.simpleText}</p>
                )}
              </div>
              {accordionMode && !isCurrent && (
                <div className="flex-shrink-0">
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              )}
            </button>

            {/* Step Content - Only visible when expanded or current */}
            {(isExpanded || isCurrent) && (
              <div className="px-4 pb-4 pl-14">
                {simpleMode ? (
                  // Simple mode: only show simpleText
                  <p className={`${
                    status === 'completed' ? 'text-gray-600' : 
                    status === 'current' ? 'text-gray-700' : 
                    'text-gray-400'
                  }`}>
                    {step.simpleText}
                  </p>
                ) : (
                  // Full mode: show all details
                  <>
                    <p className={`mb-4 ${
                      status === 'completed' ? 'text-gray-600' : 
                      status === 'current' ? 'text-gray-700' : 
                      'text-gray-400'
                    }`}>
                      {step.description}
                    </p>

                    {/* Action Text for current step */}
                    {isCurrent && step.actionText && (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                        <p className="text-sm font-medium text-orange-900 mb-1">📋 Wat moet je doen:</p>
                        <p className="text-sm text-orange-800">{step.actionText}</p>
                      </div>
                    )}
                    
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
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}

      {showLegend && !simpleMode && (
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

