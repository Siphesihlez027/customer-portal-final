const express = require('express');
const Employee = require('../models/Employee');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Employee login
router.post('/login', async (req, res) => {
  try {
    const { employeeId, password } = req.body;
    // Check if there are any employees in the database
    const employeeCount = await Employee.countDocuments();
    if (employeeCount === 0) {
      return res.status(404).json({
        message: 'No employees found in the system. Please seed the database.'
      });
    }

    // Find employee by employeeId
    const employee = await Employee.findOne({ employeeId });

    if (!employee) {
      return res.status(400).json({
        message: 'Invalid employee credentials'
      });
    }

    // Check password
    const isMatch = await employee.matchPassword(password);

    if (!isMatch) {
      return res.status(400).json({
        message: 'Invalid employee credentials'
      });
    }

    // 1. Create the session object
      // We use 'user' as a standard key for both employees and customers
    req.session.user = {
      id: employee._id,
      employeeId: employee.employeeId,
      fullName: employee.fullName,
      role: employee.role,
      type: 'employee'
    };

    // 2. Save the session
    req.session.save();

    // 3. Send back the response (NO token)
    res.json({
      message: 'Employee login successful',
      employee: {
        id: employee._id,
        employeeId: employee.employeeId,
        fullName: employee.fullName,
        role: employee.role,
        department: employee.department
      }
    });

  } catch (error) {
    res.status(500).json({
      message: 'Error during employee login',
      error: error.message
    });
  }
});

module.exports = router;