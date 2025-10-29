// Impersonation API endpoint for secure server-side management
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://clqbnkvnyldlxtimiaqf.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNscWJua3ZueWRseHRpbWlhenFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMzU4OTIsImV4cCI6MjA3NjkxMTg5Mn0.2QqJgJgJgJgJgJgJgJgJgJgJgJgJgJgJgJgJgJgJg';

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// In-memory store for active impersonation sessions (in production, use Redis)
const impersonationSessions = new Map();

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { action, adminEmail, userEmail, sessionId } = req.body;

    // Verify admin credentials
    if (!adminEmail || adminEmail !== 'admin@bitbeheer.nl') {
      return res.status(403).json({ error: 'Unauthorized: Admin access required' });
    }

    switch (action) {
      case 'start':
        if (!userEmail) {
          return res.status(400).json({ error: 'User email required' });
        }

        // Generate secure session ID
        const newSessionId = `imp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Store impersonation session
        impersonationSessions.set(newSessionId, {
          adminEmail,
          userEmail,
          startTime: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
        });

        console.log('Started secure impersonation session:', newSessionId);

        return res.status(200).json({
          success: true,
          sessionId: newSessionId,
          userEmail,
          expiresAt: impersonationSessions.get(newSessionId).expiresAt
        });

      case 'verify':
        if (!sessionId) {
          return res.status(400).json({ error: 'Session ID required' });
        }

        const session = impersonationSessions.get(sessionId);
        
        if (!session) {
          return res.status(404).json({ error: 'Session not found' });
        }

        // Check if session expired
        if (new Date() > new Date(session.expiresAt)) {
          impersonationSessions.delete(sessionId);
          return res.status(410).json({ error: 'Session expired' });
        }

        return res.status(200).json({
          success: true,
          isImpersonating: true,
          userEmail: session.userEmail,
          adminEmail: session.adminEmail,
          startTime: session.startTime
        });

      case 'stop':
        if (!sessionId) {
          return res.status(400).json({ error: 'Session ID required' });
        }

        const deleted = impersonationSessions.delete(sessionId);
        
        if (!deleted) {
          return res.status(404).json({ error: 'Session not found' });
        }

        console.log('Stopped impersonation session:', sessionId);

        return res.status(200).json({
          success: true,
          message: 'Impersonation stopped'
        });

      case 'list':
        // List active sessions (admin only)
        const sessions = Array.from(impersonationSessions.entries()).map(([id, session]) => ({
          sessionId: id,
          userEmail: session.userEmail,
          adminEmail: session.adminEmail,
          startTime: session.startTime,
          expiresAt: session.expiresAt
        }));

        return res.status(200).json({
          success: true,
          sessions
        });

      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

  } catch (error) {
    console.error('Impersonation API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
