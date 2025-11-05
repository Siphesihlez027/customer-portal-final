const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
 req.session.destroy((err) => {
    if (err) {
     return res.status(500).json({ message: 'Could not log out, please try again.' });
    }
    // Clear the cookie
    res.clearCookie('connect.sid'); // 'connect.sid' is the default session cookie name
    res.status(200).json({ message: 'Logged out successfully' });
 });
});

module.exports = router;