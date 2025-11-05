const express = require('express');
const router = express.Router();
// const Payment = require('../models/Payment'); // You'll need to import your model

// This route path will be: GET /api/employee-payments/
// It is already protected by the 'isAuthenticated' middleware in server.js
router.get('/', async (req, res) => {
  try {
    // Because of the middleware, you can safely access the employee's session data
    console.log('Fetching payments for employee:', req.session.user.fullName);

    // TODO: Add your logic here to find payments that need approval
    // Example: const pendingPayments = await Payment.find({ status: 'Pending' });

    // For now, we will send back an empty array, which matches your screenshot ("Pending Payments (0)")
    res.status(200).json([]); 

  } catch (error) {
    res.status(500).json({ message: 'Error fetching employee payments', error: error.message });
}
});

module.exports = router;