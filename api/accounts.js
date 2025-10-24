// API route for account management
// POST /api/accounts/register - Register new account
// POST /api/accounts/login - Login account
// POST /api/accounts/reset-password - Reset password
// GET /api/accounts - Get all accounts (admin only)

const crypto = require('crypto');

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { method } = req;
    const url = new URL(req.url, `http://${req.headers.host}`);
    const action = url.pathname.split('/').pop();

    // For now, we'll use a simple in-memory storage
    // In production, you would use a database like PostgreSQL, MongoDB, etc.
    let accounts = JSON.parse(process.env.STORED_ACCOUNTS || '[]');

    switch (method) {
      case 'POST':
        if (action === 'register') {
          // Register new account
          const { email, password, name } = req.body;
          
          if (!email || !password || !name) {
            return res.status(400).json({ error: 'Email, password and name are required' });
          }

          // Check if account already exists
          const existingAccount = accounts.find(account => account.email === email.toLowerCase());
          if (existingAccount) {
            return res.status(400).json({ error: 'Account already exists' });
          }

          // Generate random password for initial login
          const randomPassword = crypto.randomBytes(8).toString('hex');
          
          const newAccount = {
            id: Date.now().toString(),
            email: email.toLowerCase().trim(),
            name: name.trim(),
            password: randomPassword, // Temporary password
            originalPassword: password, // User's chosen password
            category: 'account_aanmelden',
            timestamp: new Date().toISOString(),
            date: new Date().toLocaleString('nl-NL'),
            isActive: true,
            loginCount: 0,
            lastLogin: null,
            passwordResetToken: null,
            passwordResetExpires: null
          };

          accounts.push(newAccount);
          process.env.STORED_ACCOUNTS = JSON.stringify(accounts);

          // Send welcome email with login credentials
          try {
            const nodemailer = require('nodemailer');
            
            let transporter;
            if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
              transporter = nodemailer.createTransporter({
                service: 'gmail',
                auth: {
                  user: process.env.GMAIL_USER,
                  pass: process.env.GMAIL_APP_PASSWORD
                }
              });
            } else if (process.env.TRANSIP_EMAIL && process.env.TRANSIP_PASSWORD) {
              transporter = nodemailer.createTransporter({
                host: 'smtp.transip.nl',
                port: 587,
                secure: false,
                auth: {
                  user: process.env.TRANSIP_EMAIL,
                  pass: process.env.TRANSIP_PASSWORD
                },
                tls: {
                  rejectUnauthorized: false
                }
              });
            }

            if (transporter) {
              await transporter.sendMail({
                from: process.env.GMAIL_USER || process.env.TRANSIP_EMAIL,
                to: email,
                subject: 'Welkom bij BitBeheer - Je Account is Aangemaakt',
                text: `Hallo ${name},

Je account bij BitBeheer is succesvol aangemaakt!

Je inloggegevens:
E-mail: ${email}
Tijdelijk wachtwoord: ${randomPassword}

BELANGRIJK: Log in met deze gegevens en wijzig je wachtwoord direct in je account.

Je kunt inloggen op: https://bitbeheer.nl

Met vriendelijke groet,
Het BitBeheer Team`,
                html: `
                  <h2>Welkom bij BitBeheer!</h2>
                  <p>Hallo ${name},</p>
                  <p>Je account bij BitBeheer is succesvol aangemaakt!</p>
                  
                  <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3>Je inloggegevens:</h3>
                    <p><strong>E-mail:</strong> ${email}</p>
                    <p><strong>Tijdelijk wachtwoord:</strong> ${randomPassword}</p>
                  </div>
                  
                  <p style="color: #dc2626; font-weight: bold;">
                    BELANGRIJK: Log in met deze gegevens en wijzig je wachtwoord direct in je account.
                  </p>
                  
                  <p>Je kunt inloggen op: <a href="https://bitbeheer.nl">https://bitbeheer.nl</a></p>
                  
                  <p>Met vriendelijke groet,<br>Het BitBeheer Team</p>
                `
              });
            }
          } catch (emailError) {
            console.error('Error sending welcome email:', emailError);
          }

          return res.status(201).json({ 
            success: true, 
            account: { id: newAccount.id, email: newAccount.email, name: newAccount.name },
            message: 'Account created successfully. Check your email for login credentials.' 
          });
        }

        if (action === 'login') {
          // Login account
          const { email, password } = req.body;
          
          if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
          }

          const account = accounts.find(acc => 
            acc.email === email.toLowerCase() && acc.isActive
          );

          if (!account) {
            return res.status(401).json({ error: 'Invalid credentials' });
          }

          // Check password (for now, we'll use the temporary password)
          if (account.password !== password) {
            return res.status(401).json({ error: 'Invalid credentials' });
          }

          // Update login info
          account.loginCount = (account.loginCount || 0) + 1;
          account.lastLogin = new Date().toLocaleString('nl-NL');
          process.env.STORED_ACCOUNTS = JSON.stringify(accounts);

          return res.status(200).json({ 
            success: true, 
            account: { 
              id: account.id, 
              email: account.email, 
              name: account.name,
              category: account.category,
              loginCount: account.loginCount,
              lastLogin: account.lastLogin
            },
            message: 'Login successful' 
          });
        }

        if (action === 'reset-password') {
          // Reset password
          const { email } = req.body;
          
          if (!email) {
            return res.status(400).json({ error: 'Email is required' });
          }

          const account = accounts.find(acc => 
            acc.email === email.toLowerCase() && acc.isActive
          );

          if (!account) {
            return res.status(404).json({ error: 'Account not found' });
          }

          // Generate new temporary password
          const newTempPassword = crypto.randomBytes(8).toString('hex');
          account.password = newTempPassword;
          account.passwordResetToken = crypto.randomBytes(32).toString('hex');
          account.passwordResetExpires = new Date(Date.now() + 3600000).toISOString(); // 1 hour
          
          process.env.STORED_ACCOUNTS = JSON.stringify(accounts);

          // Send password reset email
          try {
            const nodemailer = require('nodemailer');
            
            let transporter;
            if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
              transporter = nodemailer.createTransporter({
                service: 'gmail',
                auth: {
                  user: process.env.GMAIL_USER,
                  pass: process.env.GMAIL_APP_PASSWORD
                }
              });
            } else if (process.env.TRANSIP_EMAIL && process.env.TRANSIP_PASSWORD) {
              transporter = nodemailer.createTransporter({
                host: 'smtp.transip.nl',
                port: 587,
                secure: false,
                auth: {
                  user: process.env.TRANSIP_EMAIL,
                  pass: process.env.TRANSIP_PASSWORD
                },
                tls: {
                  rejectUnauthorized: false
                }
              });
            }

            if (transporter) {
              await transporter.sendMail({
                from: process.env.GMAIL_USER || process.env.TRANSIP_EMAIL,
                to: email,
                subject: 'BitBeheer - Wachtwoord Reset',
                text: `Hallo ${account.name},

Je hebt een wachtwoord reset aangevraagd voor je BitBeheer account.

Je nieuwe tijdelijke wachtwoord: ${newTempPassword}

BELANGRIJK: Log in met deze gegevens en wijzig je wachtwoord direct in je account.

Je kunt inloggen op: https://bitbeheer.nl

Met vriendelijke groet,
Het BitBeheer Team`,
                html: `
                  <h2>Wachtwoord Reset - BitBeheer</h2>
                  <p>Hallo ${account.name},</p>
                  <p>Je hebt een wachtwoord reset aangevraagd voor je BitBeheer account.</p>
                  
                  <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3>Je nieuwe tijdelijke wachtwoord:</h3>
                    <p><strong>${newTempPassword}</strong></p>
                  </div>
                  
                  <p style="color: #dc2626; font-weight: bold;">
                    BELANGRIJK: Log in met deze gegevens en wijzig je wachtwoord direct in je account.
                  </p>
                  
                  <p>Je kunt inloggen op: <a href="https://bitbeheer.nl">https://bitbeheer.nl</a></p>
                  
                  <p>Met vriendelijke groet,<br>Het BitBeheer Team</p>
                `
              });
            }
          } catch (emailError) {
            console.error('Error sending password reset email:', emailError);
          }

          return res.status(200).json({ 
            success: true, 
            message: 'Password reset email sent' 
          });
        }

        return res.status(400).json({ error: 'Invalid action' });

      case 'GET':
        // Get all accounts (admin only)
        // If no accounts in accounts storage, try to get from users API
        if (accounts.length === 0) {
          try {
            const users = JSON.parse(process.env.STORED_USERS || '[]');
            const accountUsers = users.filter(user => user.category === 'account_aanmelden');
            return res.status(200).json({ 
              success: true, 
              accounts: accountUsers,
              count: accountUsers.length 
            });
          } catch (error) {
            console.error('Error loading from users API:', error);
          }
        }
        
        return res.status(200).json({ 
          success: true, 
          accounts: accounts,
          count: accounts.length 
        });

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Error in accounts API:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: 'Er is een fout opgetreden bij het verwerken van je aanvraag'
    });
  }
};
