import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';   // import navigate
import './LoginSignup.css';

// Importing the images (icons) used in the form inputs
import user_icon from '../Assets/person.png';
import password_icon from '../Assets/password.png';
import account_icon from '../Assets/account.png';
import id_icon from '../Assets/id.png';

const LoginSignup = ({ onLoginSuccess }) => {
  const [action, setAction] = useState("Sign Up");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();   // setup navigation

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

  // Validate single field
  const validateField = (name, value) => {
    if (!patterns[name]) return true;
    return patterns[name].test(value);
  };

  // Validate all fields
  const validateForm = (formData) => {
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      if (formData[key] && !validateField(key, formData[key])) {
        newErrors[key] = validationMessages[key];
      } else if (!formData[key] && key !== 'fullName' && key !== 'idNumber') {
        newErrors[key] = `${key.charAt(0).toUpperCase() + key.slice(1)} is required`;
      }
    });
    if (action === "Sign Up") {
      if (!formData.fullName) newErrors.fullName = 'Full name is required';
      if (!formData.idNumber) newErrors.idNumber = 'ID number is required';
    }
    return newErrors;
  };

  // Clear all form fields
  const clearFormFields = () => {
    document.querySelectorAll('input').forEach(input => {
      input.value = '';
    });
  };

  // Handle form submission
  const handleSubmit = async () => {
    setLoading(true);
    setErrors({});
    setSuccessMessage('');

    const formData = {
      username: document.querySelector('input[placeholder="Username"]')?.value || '',
      accountNumber: document.querySelector('input[placeholder="Account Number"]')?.value || '',
      password: document.querySelector('input[placeholder="Password"]')?.value || ''
    };

    if (action === "Sign Up") {
      formData.fullName = document.querySelector('input[placeholder="Name"]')?.value || '';
      formData.idNumber = document.querySelector('input[placeholder="ID Number"]')?.value || '';
    }

    // Client-side validation
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`https://localhost:5000/api/auth/${action === "Sign Up" ? 'signup' : 'login'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        if (action === "Sign Up") {
          // After signup, switch to login mode
          setSuccessMessage('Account created successfully! Please login with your new credentials.');
          setAction("Login");
          clearFormFields();
          setErrors({});
        } else {
          // Login success
          localStorage.setItem('token', data.token);
          localStorage.setItem('userData', JSON.stringify(data.user));
          localStorage.setItem('userType', 'customer');
          
          alert('Login successful!');
          
          if (onLoginSuccess) onLoginSuccess(data.user);

          // redirect to Payment page with user data
          navigate('/payments', { state: { user: data.user } });
        }
      } else {
        if (data.errors) {
          const errorObj = {};
          data.errors.forEach(err => {
            if (err.includes('name')) errorObj.fullName = err;
            else if (err.includes('ID')) errorObj.idNumber = err;
            else if (err.includes('Username')) errorObj.username = err;
            else if (err.includes('Account')) errorObj.accountNumber = err;
            else if (err.includes('Password')) errorObj.password = err;
          });
          setErrors(errorObj);
        } else {
          alert(`Error: ${data.message}`);
        }
      }
    } catch (error) {
      alert(`Network error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle input change
  const handleInputChange = (e, fieldName) => {
    const value = e.target.value;
    if (successMessage) setSuccessMessage('');
    if (errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
    if (value && !validateField(fieldName, value)) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: validationMessages[fieldName]
      }));
    }
  };

  const handleModeSwitch = (newAction) => {
    setAction(newAction);
    setErrors({});
    setSuccessMessage('');
    clearFormFields();
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
                  placeholder='Name'
                  onChange={(e) => handleInputChange(e, 'fullName')}
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
                  placeholder='ID Number'
                  onChange={(e) => handleInputChange(e, 'idNumber')}
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
              placeholder='Username'
              onChange={(e) => handleInputChange(e, 'username')}
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
              placeholder='Account Number'
              onChange={(e) => handleInputChange(e, 'accountNumber')}
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
              placeholder='Password'
              onChange={(e) => handleInputChange(e, 'password')}
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
        {action === "Login" && (
          <div className="submit gray" onClick={() => handleModeSwitch("Sign Up")}>
            Sign Up
          </div>
        )}

        <div className={`submit ${loading ? 'loading' : ''}`} onClick={!loading ? handleSubmit : undefined}>
          {loading ? 'Processing...' : action}
        </div>

        {action === "Sign Up" && (
          <div className="submit gray" onClick={() => handleModeSwitch("Login")}>
            Login
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginSignup;
