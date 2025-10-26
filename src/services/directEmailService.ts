import { supabase } from '../lib/supabase';

interface EmailData {
  to: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  type?: 'contact' | 'notification' | 'welcome';
}

export class DirectEmailService {
  static async sendEmail(data: EmailData): Promise<{ success: boolean; message: string; emailId?: string }> {
    try {
      // Use backend API for secure email sending
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: data.to,
          subject: data.subject,
          htmlContent: data.htmlContent,
          textContent: data.textContent,
          type: data.type || 'notification'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Email sending failed:', errorData);
        return { success: false, message: 'Email service error' };
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Email sending error:', error);
      return { success: false, message: 'Failed to send email' };
    }
  }

  static async sendNotificationRequest(userEmail: string, userName: string, userMessage: string): Promise<boolean> {
    const emailContent = `
      <h2>Nieuwe notificatie aanmelding</h2>
      <p><strong>Naam:</strong> ${userName}</p>
      <p><strong>E-mail:</strong> ${userEmail}</p>
      <p><strong>Bericht:</strong> ${userMessage}</p>
      <p><strong>Datum:</strong> ${new Date().toLocaleString('nl-NL')}</p>
    `;

    const result = await this.sendEmail({
      to: 'update@bitbeheer.nl',
      subject: 'Nieuwe notificatie aanmelding - BitBeheer',
      htmlContent: emailContent,
      textContent: `Nieuwe notificatie aanmelding van ${userName} (${userEmail}): ${userMessage}`,
      type: 'notification'
    });

    return result.success;
  }

  static async sendContactForm(name: string, email: string, subject: string, message: string, phone?: string): Promise<boolean> {
    const emailContent = `
      <h2>Nieuwe contact aanvraag</h2>
      <p><strong>Naam:</strong> ${name}</p>
      <p><strong>E-mail:</strong> ${email}</p>
      ${phone ? `<p><strong>Telefoon:</strong> ${phone}</p>` : ''}
      <p><strong>Onderwerp:</strong> ${subject}</p>
      <p><strong>Bericht:</strong></p>
      <p>${message}</p>
      <p><strong>Datum:</strong> ${new Date().toLocaleString('nl-NL')}</p>
    `;

    const result = await this.sendEmail({
      to: 'info@bitbeheer.nl',
      subject: `Contact formulier: ${subject}`,
      htmlContent: emailContent,
      textContent: `Contact van ${name} (${email}): ${subject}\n\n${message}`,
      type: 'contact'
    });

    return result.success;
  }

  static async sendBulkEmail(users: any[], subject: string, message: string, fromEmail: string): Promise<{ success: boolean; sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;

    for (const user of users) {
      const emailContent = `
        <h2>${subject}</h2>
        <p>Beste ${user.name || 'gebruiker'},</p>
        <div>${message}</div>
        <p>Met vriendelijke groet,<br>Het BitBeheer team</p>
      `;

      const result = await this.sendEmail({
        to: user.email,
        subject: subject,
        htmlContent: emailContent,
        textContent: message,
        type: 'notification'
      });

      if (result.success) {
        sent++;
      } else {
        failed++;
      }
    }

    return { success: sent > 0, sent, failed };
  }
}
