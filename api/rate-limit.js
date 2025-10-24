const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://clqbnkvnydlxtimiazqf.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_uxyF_aTNtzEwEoRav6A2Ww_H4AP7I_Y';

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { endpoint, maxRequests = 10, fingerprint } = req.body;
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    if (!endpoint) {
      return res.status(400).json({ error: 'Endpoint is required' });
    }

    // Check rate limit using Supabase function
    const { data: rateLimitResult, error: rateLimitError } = await supabase.rpc('check_rate_limit', {
      p_ip_address: ipAddress,
      p_endpoint: endpoint,
      p_max_requests: maxRequests,
      p_window_minutes: 60
    });

    if (rateLimitError) {
      console.error('Rate limit check failed:', rateLimitError);
      return res.status(500).json({ error: 'Rate limit check failed' });
    }

    // Log the request
    const { error: logError } = await supabase
      .from('form_submissions')
      .insert({
        form_type: endpoint,
        ip_address: ipAddress,
        user_agent: userAgent,
        fingerprint: fingerprint,
        data: { endpoint, maxRequests }
      });

    if (logError) {
      console.error('Failed to log form submission:', logError);
    }

    // Check for bot behavior
    const { data: botResult, error: botError } = await supabase.rpc('detect_bot', {
      p_ip_address: ipAddress,
      p_user_agent: userAgent,
      p_fingerprint: fingerprint
    });

    if (botError) {
      console.error('Bot detection failed:', botError);
    }

    // Block if bot detected
    if (botResult) {
      return res.status(429).json({ 
        allowed: false, 
        reason: 'Bot detected',
        retryAfter: 3600 // 1 hour
      });
    }

    // Block if rate limit exceeded
    if (!rateLimitResult) {
      return res.status(429).json({ 
        allowed: false, 
        reason: 'Rate limit exceeded',
        retryAfter: 3600 // 1 hour
      });
    }

    return res.status(200).json({ 
      allowed: true,
      remaining: maxRequests - 1
    });

  } catch (error) {
    console.error('Rate limit API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
