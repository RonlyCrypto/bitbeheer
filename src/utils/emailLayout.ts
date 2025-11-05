/**
 * Email Layout Utility
 * Centralized email base layout that wraps all email content
 * When you update this layout, all emails will automatically use the new design
 */

export interface EmailVariables {
  name?: string;
  email?: string;
  date?: string;
  verification_link?: string;
  teams_link?: string;
  activation_deadline?: string;
  [key: string]: string | undefined;
}

/**
 * Get the base email HTML layout wrapper
 * This is the foundation that all emails use
 */
export function getEmailBaseLayout(innerContent: string): string {
  return `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>BitBeheer</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, sans-serif !important;}
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: Arial, sans-serif;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
    <tr>
      <td style="padding: 20px 0;">
        <table role="presentation" style="width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); border-collapse: collapse;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">BitBeheer</h1>
              <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 14px; opacity: 0.9;">Persoonlijke begeleiding bij het investeren in Bitcoin</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              ${innerContent}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 12px; line-height: 1.6;">
                <strong style="color: #1f2937;">BitBeheer</strong><br>
                Persoonlijke begeleiding bij het investeren in Bitcoin
              </p>
              <p style="margin: 15px 0 10px 0; color: #9ca3af; font-size: 11px; line-height: 1.5;">
                Deze email is verstuurd door BitBeheer<br>
                <a href="https://bitbeheer.nl" style="color: #f97316; text-decoration: none;">www.bitbeheer.nl</a>
              </p>
              <p style="margin: 15px 0 0 0; color: #9ca3af; font-size: 10px;">
                © ${new Date().getFullYear()} BitBeheer. Alle rechten voorbehouden.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Replace template variables in content
 */
export function replaceVariables(content: string, variables: EmailVariables = {}): string {
  let result = content;
  
  // Replace standard variables
  // Note: 'name' should be the first name (voornaam) from user profile
  const standardVars = {
    name: variables.name || 'gebruiker', // This should be first_name, not full name
    email: variables.email || 'gebruiker@example.com',
    date: variables.date || new Date().toLocaleDateString('nl-NL'),
    verification_link: variables.verification_link || 'https://bitbeheer.nl/verify',
    teams_link: variables.teams_link || '',
    activation_deadline: variables.activation_deadline || '5 dagen'
  };
  
  Object.entries(standardVars).forEach(([key, value]) => {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(regex, value);
  });
  
  // Replace custom variables
  Object.entries(variables).forEach(([key, value]) => {
    if (value !== undefined && !standardVars.hasOwnProperty(key)) {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      result = result.replace(regex, value);
    }
  });
  
  // Remove conditional blocks if variable is empty
  result = result.replace(/\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, varName, content) => {
    const varValue = variables[varName];
    return varValue && varValue.trim() !== '' ? content : '';
  });
  
  return result;
}

/**
 * Convert HTML body content to full email HTML
 */
export function wrapEmailBody(bodyContent: string, variables: EmailVariables = {}): string {
  // Replace variables in body content first
  const processedBody = replaceVariables(bodyContent, variables);
  
  // Wrap in base layout
  return getEmailBaseLayout(processedBody);
}

/**
 * Convert HTML to plain text (for text_content)
 */
export function htmlToPlainText(html: string): string {
  if (typeof window === 'undefined') {
    // Server-side: simple regex-based conversion
    return html
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\n\s*\n/g, '\n\n')
      .trim();
  } else {
    // Client-side: use DOM
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }
}

