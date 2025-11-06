import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api'; // Import the centralized API utility
import './LoginSignup.css';

// Importing the images (icons) used in the form inputs
import user_icon from '../Assets/person.png';
import password_icon from '../Assets/password.png';
import account_icon from '../Assets/account.png';
import id_icon from '../Assets/id.png';

const LoginSignup = ({ onLoginSuccess, initialAction = "Login" }) => {
  const [action, setAction] = useState(initialAction);
  const [formData, setFormData] = useState({
    fullName: '',
    idNumber: '',
    username: '',
    accountNumber: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  // Validation patterns (matching backend)
  const patterns = {
    fullName: /^[a-zA-Z\s]{2,50}$/,
    idNumber: /^\d{13}$/,
    username: /^[a-zA-Z0-9_]{3,20}$/,
    accountNumber: /^\d{10,12}$/,
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/
  };

  // Validation messages
  const validationMessages = {
    fullName: 'Full name must be 2-50 characters, letters and spaces only',
    idNumber: 'ID number must be exactly 13 digits',
    username: 'Username must be 3-20 characters, alphanumeric and underscore only',
    accountNumber: 'Account number must be 10-12 digits',
    password: 'Password must be 8-20 characters with uppercase, lowercase, digit, and special character'
  };

  const validateField = (name, value) => {
    if (!patterns[name]) return true;
    return patterns[name].test(value);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (value && !validateField(name, value)) {
      setErrors(prev => ({ ...prev, [name]: validationMessages[name] }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      if (action === "Sign Up" || (key !== 'fullName' && key !== 'idNumber')) {
        if (!formData[key]) {
          newErrors[key] = `${key.charAt(0).toUpperCase() + key.slice(1)} is required`;
        } else if (!validateField(key, formData[key])) {
          newErrors[key] = validationMessages[key];
        }
      }
    });
    return newErrors;
  };

  const handleSubmit = async () => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    setErrors({});
    setSuccessMessage('');

    try {
      const endpoint = action === "Sign Up" ? '/auth/signup' : '/auth/login';
      const response = await api.post(endpoint, formData);
      const data = response.data;

      if (response.status === 200 || response.status === 201) {
        if (action === "Sign Up") {
          setSuccessMessage('Account created successfully!');
          setFormData({
            fullName: '',
            idNumber: '',
            username: '',
            accountNumber: '',
            password: ''
          });
        } else {
          localStorage.setItem('userData', JSON.stringify(data.user)); // This is still useful!

          alert('Login successful!'); 
          if (onLoginSuccess) onLoginSuccess(data.user);
          navigate('/payments', { state: { user: data.user } });
        }
      }
    } catch (error) {
      const errorMessage = error.response ? error.response.data.message : error.message;
      alert(`Error: ${errorMessage}`);
      if (error.response && error.response.data.errors) {
        const errorObj = {};
        error.response.data.errors.forEach(err => {
          if (err.includes('name')) errorObj.fullName = err;
          else if (err.includes('ID')) errorObj.idNumber = err;
          else if (err.includes('Username')) errorObj.username = err;
          else if (err.includes('Account')) errorObj.accountNumber = err;
          else if (err.includes('Password')) errorObj.password = err;
        });
        setErrors(errorObj);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleModeSwitch = (newAction) => {
    setAction(newAction);
    setErrors({});
    setSuccessMessage('');
    setFormData({
      fullName: '',
      idNumber: '',
      username: '',
      accountNumber: '',
      password: ''
    });
  };

  const handleCancel = () => {
    navigate('/employee-payments');
  };

  return (
    <div className='container'>
      {/* Header */}
      <div className='header'>
        <div className='text'>{action}</div>
        <div className='underline'></div>
      </div>

      {/* Success Message */}
      {successMessage && <div className='success-message'>{successMessage}</div>}

      {/* Inputs */}
      <div className='inputs'>
        {action === "Sign Up" && (
          <>
            <div className='input-wrapper'>
              <div className={`input ${errors.fullName ? 'error' : ''}`}>
                <img src={user_icon} alt="user icon" style={{ width: "21px", height: "25px" }}/>
                <input 
                  type="text" 
                  name="fullName"
                  placeholder='Name'
                  value={formData.fullName}
                  onChange={handleInputChange}
                  maxLength="50"
                />
              </div>
              {errors.fullName && <span className='error-message'>{errors.fullName}</span>}
            </div>
            
            <div className='input-wrapper'>
              <div className={`input ${errors.idNumber ? 'error' : ''}`}>
                <img src={id_icon} alt="id icon" style={{ width: "21px", height: "25px" }}/>
                <input 
                  type="text" 
                  name="idNumber"
                  placeholder='ID Number'
                  value={formData.idNumber}
                  onChange={handleInputChange}
                  maxLength="13"
                />
              </div>
              {errors.idNumber && <span className='error-message'>{errors.idNumber}</span>}
            </div>
          </>
        )}

        <div className='input-wrapper'>
          <div className={`input ${errors.username ? 'error' : ''}`}>
            <img src={user_icon} alt="username icon" style={{ width: "21px", height: "25px" }}/>
            <input 
              type="text" 
              name="username"
              placeholder='Username'
              value={formData.username}
              onChange={handleInputChange}
              maxLength="20"
            />
          </div>
          {errors.username && <span className='error-message'>{errors.username}</span>}
        </div>

        <div className='input-wrapper'>
          <div className={`input ${errors.accountNumber ? 'error' : ''}`}>
            <img src={account_icon} alt="account icon" style={{ width: "21px", height: "25px" }}/>
            <input 
              type="text" 
              name="accountNumber"
              placeholder='Account Number'
              value={formData.accountNumber}
              onChange={handleInputChange}
              maxLength="12"
            />
          </div>
          {errors.accountNumber && <span className='error-message'>{errors.accountNumber}</span>}
        </div>

        <div className='input-wrapper'>
          <div className={`input ${errors.password ? 'error' : ''}`}>
            <img src={password_icon} alt="password icon" style={{ width: "18px", height: "20px" }}/>
            <input 
              type="password" 
              name="password"
              placeholder='Password'
              value={formData.password}
              onChange={handleInputChange}
              maxLength="20"
            />
          </div>
          {errors.password && <span className='error-message'>{errors.password}</span>}
        </div>

        {action === "Sign Up" && (
          <div className='password-hint'>
            Password must contain at least: 1 uppercase, 1 lowercase, 1 digit, 1 special character (@$!%*?&)
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className='submit-container'>       
        <div className={`submit ${loading ? 'loading' : ''}`} onClick={!loading ? handleSubmit : undefined}>
          {loading ? 'Processing...' : action}
        </div>

        {action === "Sign Up" && (
          <div className="submit gray" onClick={handleCancel}>
            Cancel
          </div>
        )}
      </div>

        {action === "Login" && (
            <div className='home-link' onClick={() => navigate('/')}>
                Back to Home
            </div>
        )}
    </div>
  );
};

export default LoginSignup;
