const jwt = require('jsonwebtoken');

/**
 * Admin Login
 * Simple password check against .env for SaaS Admin Access
 */
exports.login = async (req, res) => {
  try {
    const { password } = req.body;

    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ message: 'Invalid Admin Password' });
    }

    const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, {
      expiresIn: '24h',
    });

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
