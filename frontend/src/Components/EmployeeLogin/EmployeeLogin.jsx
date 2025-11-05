import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './EmployeeLogin.css';

import employee_icon from '../Assets/person.png';
import password_icon from '../Assets/password.png';
import id_icon from '../Assets/id.png';

const EmployeeLogin = () => {
  const [formData, setFormData] = useState({
    employeeId: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('https://localhost:5000/api/employee/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        // Store employee data and token
        localStorage.setItem('token', data.token);
        localStorage.setItem('userData', JSON.stringify(data.employee));
        localStorage.setItem('userType', 'employee');
        
        alert('Employee login successful!');
        navigate('/employee-payments');
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      alert(`Network error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='employee-login-container'>
      <div className='employee-login-header'>
        <div className='text'>Employee Portal Login</div>
        <div className='underline'></div>
      </div>

      <form onSubmit={handleSubmit} className='employee-login-inputs'>
        <div className='input'>
          <img src={id_icon} alt="employee id icon" />
          <input 
            type="text" 
            name="employeeId"
            placeholder='Employee ID' 
            value={formData.employeeId}
            onChange={handleChange}
            required
          />
        </div>

        <div className='input'>
          <img src={password_icon} alt="password icon" />
          <input 
            type="password" 
            name="password"
            placeholder='Password' 
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className='submit-btn' disabled={loading}>
          {loading ? 'Logging in...' : 'Employee Login'}
        </button>
      </form>


      <div className='portal-switch'>
        <p>Not an employee? <span onClick={() => navigate('/')}>Return to Home</span></p>
      </div>
    </div>
  );
};

export default EmployeeLogin;