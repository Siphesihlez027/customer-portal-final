import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className='home-container'>
      <div className='home-header'>
        <h1>International Payments Portal</h1>
        <p>Secure Banking System</p>
        <div className='underline'></div>
      </div>

      <div className='portal-selection'>
        <div className='portal-card' onClick={() => navigate('/auth/login')}>
          <div className='portal-icon'>👤</div>
          <h3>Customer Portal</h3>
          <p>Make international payments and track your transactions</p>
          <div className='portal-button'>Enter as Customer</div>
        </div>

        <div className='portal-card' onClick={() => navigate('/employee-login')}>
          <div className='portal-icon'>👨‍💼</div>
          <h3>Employee Portal</h3>
          <p>Approve and manage customer payments</p>
          <div className='portal-button'>Enter as Employee</div>
        </div>
      </div>

      <div className='home-footer'>
        <p>Secure • Reliable • Fast</p>
      </div>
    </div>
  );
};

export default Home;