const isAuthenticated = (req, res, next) => {
 if (req.session.user) {
    // User is logged in, proceed to the route
    next();
 } else {
    // No user in session
    res.status(401).json({ message: 'Not authenticated' });
 }
};

module.exports = isAuthenticated;