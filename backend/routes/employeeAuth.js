const express = require('express');
const Employee = require('../models/Employee');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Employee login
router.post('/login', async (req, res) => {
  try {
    const { employeeId, password } = req.body;

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

    // Generate JWT token
    const token = jwt.sign(
      { 
        employeeId: employee.employeeId,
        role: employee.role,
        type: 'employee'
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      message: 'Employee login successful',
      employee: {
        id: employee._id,
        employeeId: employee.employeeId,
        fullName: employee.fullName,
        role: employee.role,
        department: employee.department
      },
      token: token
    });

  } catch (error) {
    res.status(500).json({
      message: 'Error during employee login',
      error: error.message
    });
  }
});

module.exports = router;