import React, { useState, useEffect } from 'react';
import './Payment.css';

const Payment = ({ user }) => {
  const [formData, setFormData] = useState({
    payeeAccountNumber: '',
    amount: '',
    currency: 'ZAR',
    provider: 'SWIFT',
    swiftCode: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'completed', 'failed'

  // Validation patterns
  const patterns = {
    accountNumber: /^\d{10,12}$/,
    amount: /^\d+(\.\d{1,2})?$/,
    swiftCode: /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/
  };

  // Currency options
  const currencies = [
    { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' }
  ];

  // Provider options
  const providers = ['SWIFT', 'Local Bank Transfer', 'PayPal', 'Wire Transfer'];

  // Load payment history on mount
  useEffect(() => {
    if (user?.id) {
      fetchPaymentHistory();
    }
  }, [user]);

  // Fetch payment history WITH TOKEN
  const fetchPaymentHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://localhost:5000/api/payments/user/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      
      if (response.ok) {
        setPaymentHistory(data.payments || []);
      } else {
        console.error('Error fetching payment history:', data.message);
      }
    } catch (error) {
      console.error('Error fetching payment history:', error);
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    // Update form data
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Real-time validation
    if (name === 'payeeAccountNumber' && value && !patterns.accountNumber.test(value)) {
      setErrors(prev => ({
        ...prev,
        payeeAccountNumber: 'Account number must be 10-12 digits'
      }));
    }

    if (name === 'amount') {
      const numValue = parseFloat(value);
      if (value && (!patterns.amount.test(value) || numValue <= 0 || numValue > 1000000)) {
        setErrors(prev => ({
          ...prev,
          amount: 'Amount must be between 0.01 and 1,000,000'
        }));
      }
    }

    if (name === 'swiftCode' && formData.provider === 'SWIFT') {
      const upperValue = value.toUpperCase();
      setFormData(prev => ({ ...prev, swiftCode: upperValue }));
      
      if (value && !patterns.swiftCode.test(upperValue)) {
        setErrors(prev => ({
          ...prev,
          swiftCode: 'Invalid SWIFT code format (e.g., ABSAZAJJ)'
        }));
      }
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.payeeAccountNumber) {
      newErrors.payeeAccountNumber = 'Payee account number is required';
    } else if (!patterns.accountNumber.test(formData.payeeAccountNumber)) {
      newErrors.payeeAccountNumber = 'Account number must be 10-12 digits';
    }

    if (!formData.amount) {
      newErrors.amount = 'Amount is required';
    } else {
      const numAmount = parseFloat(formData.amount);
      if (!patterns.amount.test(formData.amount) || numAmount <= 0 || numAmount > 1000000) {
        newErrors.amount = 'Amount must be between 0.01 and 1,000,000';
      }
    }

    if (formData.provider === 'SWIFT') {
      if (!formData.swiftCode) {
        newErrors.swiftCode = 'SWIFT code is required for SWIFT payments';
      } else if (!patterns.swiftCode.test(formData.swiftCode)) {
        newErrors.swiftCode = 'Invalid SWIFT code format';
      }
    }

    return newErrors;
  };

  // Handle form submission WITH TOKEN
  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('User object:', user);
    console.log('User ID:', user?.id);
    
    // Validate form
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://localhost:5000/api/payments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData) // Remove userId - server gets it from token
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Payment initiated successfully!\nTransaction Reference: ${data.payment.transactionReference}`);
        
        // Reset form
        setFormData({
          payeeAccountNumber: '',
          amount: '',
          currency: 'ZAR',
          provider: 'SWIFT',
          swiftCode: ''
        });
        
        // Refresh payment history
        fetchPaymentHistory();
      } else {
        if (data.errors) {
          const errorObj = {};
          data.errors.forEach(err => {
            if (err.includes('account')) errorObj.payeeAccountNumber = err;
            else if (err.includes('amount')) errorObj.amount = err;
            else if (err.includes('SWIFT')) errorObj.swiftCode = err;
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

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter payments based on selected filter
  const filteredPayments = filter === 'all' 
    ? paymentHistory 
    : paymentHistory.filter(payment => payment.status === filter);

  return (
    <div className='payment-container'>
      <div className='payment-header'>
        <h2>International Payment Portal</h2>
        <p>Welcome, {user?.fullName || 'User'} (Account: {user?.accountNumber})</p>
      </div>

      <div className='payment-form-container'>
        <h3>Make a Payment</h3>
        <form className='payment-form' onSubmit={handleSubmit}>
          
          <div className='form-group'>
            <label>Payee Account Number</label>
            <input
              type='text'
              name='payeeAccountNumber'
              value={formData.payeeAccountNumber}
              onChange={handleChange}
              maxLength='12'
              placeholder='Enter 10-12 digit account number'
              className={errors.payeeAccountNumber ? 'error' : ''}
            />
            {errors.payeeAccountNumber && (
              <span className='error-message'>{errors.payeeAccountNumber}</span>
            )}
          </div>

          <div className='form-group'>
            <label>Amount</label>
            <input
              type='number'
              name='amount'
              value={formData.amount}
              onChange={handleChange}
              step='0.01'
              min='0.01'
              max='1000000'
              placeholder='Enter amount'
              className={errors.amount ? 'error' : ''}
            />
            {errors.amount && (
              <span className='error-message'>{errors.amount}</span>
            )}
          </div>

          <div className='form-group'>
            <label>Currency</label>
            <select
              name='currency'
              value={formData.currency}
              onChange={handleChange}
            >
              {currencies.map(curr => (
                <option key={curr.code} value={curr.code}>
                  {curr.code} - {curr.name}
                </option>
              ))}
            </select>
          </div>

          <div className='form-group'>
            <label>Payment Provider</label>
            <select
              name='provider'
              value={formData.provider}
              onChange={handleChange}
            >
              {providers.map(provider => (
                <option key={provider} value={provider}>
                  {provider}
                </option>
              ))}
            </select>
          </div>

          {formData.provider === 'SWIFT' && (
            <div className='form-group'>
              <label>SWIFT Code</label>
              <input
                type='text'
                name='swiftCode'
                value={formData.swiftCode}
                onChange={handleChange}
                maxLength='11'
                placeholder='e.g., ABSAZAJJ'
                className={errors.swiftCode ? 'error' : ''}
                style={{ textTransform: 'uppercase' }}
              />
              {errors.swiftCode && (
                <span className='error-message'>{errors.swiftCode}</span>
              )}
              <div className='field-hint'>
                SWIFT code format: 6 letters (bank code) + 2 letters (country) + optional 3 characters (branch)
              </div>
            </div>
          )}

          <button 
            type='submit' 
            className='pay-button'
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Pay Now'}
          </button>
        </form>
      </div>

      <div className='history-section'>
        <div className='history-header'>
          <div className="section-header">
            <h3>Payment History ({paymentHistory.length})</h3>
            <div className="filter-controls">
              <button 
                className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All
              </button>
              <button 
                className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
                onClick={() => setFilter('pending')}
              >
                Pending
              </button>
              <button 
                className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
                onClick={() => setFilter('completed')}
              >
                Completed
              </button>
              <button 
                className={`filter-btn ${filter === 'failed' ? 'active' : ''}`}
                onClick={() => setFilter('failed')}
              >
                Failed
              </button>
            </div>
          </div>
          <button 
            className='toggle-history'
            onClick={() => setShowHistory(!showHistory)}
          >
            {showHistory ? 'Hide' : 'Show'} History
          </button>
        </div>

        {showHistory && (
          <div className='payment-history'>
            {filteredPayments.length === 0 ? (
              <div className="no-payments">
                <p>No payments found</p>
                <p className="sub-message">
                  {filter === 'all' 
                    ? 'Your payment history will appear here after making transactions' 
                    : `No ${filter} payments found`}
                </p>
              </div>
            ) : (
              <div className="all-payments-table-container">
                <table className="all-payments-table">
                  <thead>
                    <tr>
                      <th>Reference</th>
                      <th>To Account</th>
                      <th>Amount</th>
                      <th>Provider</th>
                      <th>SWIFT Code</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.map(payment => (
                      <tr key={payment._id}>
                        <td className="reference-cell">{payment.transactionReference}</td>
                        <td className="account-cell">{payment.payeeAccountNumber}</td>
                        <td className="amount-cell">
                          <span className="currency">{payment.currency}</span>
                          <span className="amount">{payment.amount?.toFixed(2)}</span>
                        </td>
                        <td className="provider-cell">{payment.provider}</td>
                        <td className="swift-cell">
                          {payment.swiftCode || 'N/A'}
                        </td>
                        <td className="status-cell">
                          <span className={`status status-${payment.status}`}>
                            {payment.status}
                          </span>
                        </td>
                        <td className="date-cell">{formatDate(payment.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Payment;