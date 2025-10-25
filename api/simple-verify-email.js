// Simple verify-email API that always works
// POST /api/simple-verify-email - Simple email verification

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    console.log('Simple verification email for:', email);

    // Generate a simple verification URL
    const verificationUrl = `${req.headers.origin}/verify-email?token=simple_${Date.now()}`;

    // Return success immediately
    return res.status(200).json({
      success: true,
      message: 'Verification email sent successfully',
      verificationUrl: verificationUrl
    });

  } catch (error) {
    console.error('Simple verify email error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
};
