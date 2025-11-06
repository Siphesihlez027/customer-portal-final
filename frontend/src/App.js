import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import Home from './Components/Home/Home';
import LoginSignup from './Components/LoginSignup/LoginSignup';
import EmployeeLogin from './Components/EmployeeLogin/EmployeeLogin';
import Payment from './Components/Payment/Payment';
import EmployeePayment from './Components/EmployeePayment/EmployeePayment';

// Wrapper for Payment to pass user data from state/localStorage
const PaymentWrapper = () => {
  const location = useLocation();
  const user = location.state?.user || JSON.parse(localStorage.getItem('userData'));
  return <Payment user={user} />;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Homepage */}
          <Route path="/" element={<Home />} />

          {/* Customer Routes */}
          <Route path="/auth/login" element={<LoginSignup initialAction="Login" />} />
          <Route path="/auth/signup" element={<LoginSignup initialAction="Sign Up" />} />
          <Route path="/payments" element={<PaymentWrapper />} />

          {/* Employee Routes */}
          <Route path="/employee-login" element={<EmployeeLogin />} />
          <Route path="/employee-payments" element={<EmployeePayment />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
