interface EmailData {
  email: string;
  name?: string;
  message?: string;
}

export class EmailService {
  private static readonly API_URL = 'https://api.emailjs.com/api/v1.0/email/send';
  private static readonly SERVICE_ID = 'service_bitbeheer';
  private static readonly TEMPLATE_ID = 'template_notification';
  private static readonly PUBLIC_KEY = 'YOUR_EMAILJS_PUBLIC_KEY'; // Replace with actual key

  static async sendNotificationRequest(data: EmailData): Promise<boolean> {
    try {
      const templateParams = {
        to_email: 'update@bitbeheer.nl',
        from_email: data.email,
        from_name: data.name || 'Bezoeker',
        message: data.message || 'Ik wil graag op de hoogte blijven van wanneer BitBeheer live gaat.',
        subject: 'Notificatie Aanvraag - BitBeheer'
      };

      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service_id: this.SERVICE_ID,
          template_id: this.TEMPLATE_ID,
          user_id: this.PUBLIC_KEY,
          template_params: templateParams
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  // Alternative: Use a simple backend endpoint
  static async sendToBackend(data: EmailData): Promise<boolean> {
    try {
      const response = await fetch('/api/send-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          name: data.name || 'Bezoeker',
          message: data.message || 'Notificatie aanvraag voor BitBeheer'
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Error sending to backend:', error);
      return false;
    }
  }
}
