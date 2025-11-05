import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api'; // Import the centralized API utility
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
       // Use the centralized API utility
      const response = await api.post('/employee/auth/login', formData);

      const data = response.data;

      if (response.status === 200) {
        localStorage.setItem('userData', JSON.stringify(data.employee));
        localStorage.setItem('userType', 'employee');

        // The navigation to a new page is enough feedback.
        alert('Employee login successful!'); 
        navigate('/employee-payments');
              } else {
        // Axios wraps errors in `response.data`
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      // Handle axios-specific error structure
      const errorMessage = error.response ? error.response.data.message : error.message;
      alert(`Error: ${errorMessage}`);
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