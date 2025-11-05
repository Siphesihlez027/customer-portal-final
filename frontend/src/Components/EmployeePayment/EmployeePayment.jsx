import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './EmployeePayment.css';

const EmployeePayment = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();
  const employee = JSON.parse(localStorage.getItem('userData') || '{}');

  useEffect(() => {
    fetchAllPayments();
  }, []);

  const fetchAllPayments = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      console.log('Fetching payments with token:', token ? 'Token exists' : 'No token');
      
      const response = await fetch('https://localhost:5000/api/payments', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      console.log('Payments API response:', data);

      if (response.ok) {
        setPayments(data.payments || []);
        console.log(`Set ${data.payments?.length || 0} payments`);
      } else {
        setError(data.message || 'Failed to fetch payments');
        console.error('Error fetching payments:', data.message);
        setPayments([]);
      }
    } catch (error) {
      console.error('Network error fetching payments:', error);
      setError('Network error: ' + error.message);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (paymentId) => {
    if (!window.confirm('Are you sure you want to approve this payment?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://localhost:5000/api/payments/verify/${paymentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action: 'complete' })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Payment approved successfully!');
        fetchAllPayments();
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      alert(`Network error: ${error.message}`);
    }
  };

  const handleReject = async (paymentId) => {
    if (!window.confirm('Are you sure you want to reject this payment?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://localhost:5000/api/payments/verify/${paymentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action: 'fail' })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Payment rejected successfully!');
        fetchAllPayments();
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      alert(`Network error: ${error.message}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    localStorage.removeItem('userType');
    navigate('/');
  };

  // Filter payments based on selected filter
  const filteredPayments = filter === 'all' 
    ? payments 
    : payments.filter(payment => payment.status === filter);

  const pendingPayments = payments.filter(payment => payment.status === 'pending');

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

  // Safe access to user data
  const getUserDisplayName = (payment) => {
    if (!payment.userId) return 'Unknown Customer';
    if (typeof payment.userId === 'string') return 'Customer (ID: ' + payment.userId + ')';
    return payment.userId.fullName || 'Unknown Customer';
  };

  const getUserAccount = (payment) => {
    if (!payment.userId) return 'N/A';
    if (typeof payment.userId === 'string') return 'N/A';
    return payment.userId.accountNumber || 'N/A';
  };

  const getUserUsername = (payment) => {
    if (!payment.userId) return 'N/A';
    if (typeof payment.userId === 'string') return 'N/A';
    return payment.userId.username || 'N/A';
  };

  if (loading) {
    return (
      <div className="employee-payment-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="employee-payment-container">
      <div className="employee-header">
        <div className="header-content">
          <h1>Employee Payment Portal</h1>
          <p>Welcome, {employee.fullName} ({employee.role || 'Employee'})</p>
        </div>
        <div className="header-actions">
          <button className="refresh-btn" onClick={fetchAllPayments}>
            Refresh
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <p>{error}</p>
          <button onClick={fetchAllPayments}>Try Again</button>
        </div>
      )}

      {/* Pending Payments Section */}
      <div className="payments-section">
        <div className="section-header">
          <h2>Pending Payments for Approval ({pendingPayments.length})</h2>
        </div>
        
        {pendingPayments.length === 0 ? (
          <div className="no-payments">
            <p>No pending payments found</p>
            <p className="sub-message">When customers create payments, they will appear here for approval.</p>
          </div>
        ) : (
          <div className="payments-grid">
            {pendingPayments.map(payment => (
              <div key={payment._id} className="payment-card pending">
                <div className="payment-info">
                  <div className="payment-header">
                    <h3>Transaction: {payment.transactionReference}</h3>
                    <span className={`status status-${payment.status}`}>
                      {payment.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="payment-details-grid">
                    <div className="detail-group">
                      <h4>Customer Information</h4>
                      <div className="detail-row">
                        <span className="detail-label">Full Name:</span>
                        <span className="detail-value">{getUserDisplayName(payment)}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Account Number:</span>
                        <span className="detail-value">{getUserAccount(payment)}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Username:</span>
                        <span className="detail-value">{getUserUsername(payment)}</span>
                      </div>
                    </div>
                    
                    <div className="detail-group">
                      <h4>Payment Details</h4>
                      <div className="detail-row">
                        <span className="detail-label">To Account:</span>
                        <span className="detail-value">{payment.payeeAccountNumber}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Amount:</span>
                        <span className="detail-value">{payment.currency} {payment.amount?.toFixed(2)}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Provider:</span>
                        <span className="detail-value">{payment.provider}</span>
                      </div>
                      {payment.swiftCode && (
                        <div className="detail-row">
                          <span className="detail-label">SWIFT Code:</span>
                          <span className="detail-value">{payment.swiftCode}</span>
                        </div>
                      )}
                      <div className="detail-row">
                        <span className="detail-label">Date:</span>
                        <span className="detail-value">{formatDate(payment.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="payment-actions">
                  <div className="action-buttons">
                    <button 
                      className="btn-approve"
                      onClick={() => handleApprove(payment._id)}
                    >
                      ✓ Approve
                    </button>
                    <button 
                      className="btn-reject"
                      onClick={() => handleReject(payment._id)}
                    >
                      ✗ Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All Payments Section */}
      <div className="payments-section">
        <div className="section-header">
          <h2>All Payments ({payments.length})</h2>
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

        {filteredPayments.length === 0 ? (
          <div className="no-payments">
            <p>No payments found for selected filter</p>
          </div>
        ) : (
          <div className="all-payments-table-container">
            <table className="all-payments-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Customer</th>
                  <th>From Account</th>
                  <th>To Account</th>
                  <th>Amount</th>
                  <th>Provider</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map(payment => (
                  <tr key={payment._id}>
                    <td className="reference-cell">{payment.transactionReference}</td>
                    <td className="customer-cell">
                      <div className="customer-info">
                        <div className="customer-name">{getUserDisplayName(payment)}</div>
                        <div className="customer-username">{getUserUsername(payment)}</div>
                      </div>
                    </td>
                    <td className="account-cell">{getUserAccount(payment)}</td>
                    <td className="account-cell">{payment.payeeAccountNumber}</td>
                    <td className="amount-cell">
                      <span className="currency">{payment.currency}</span>
                      <span className="amount">{payment.amount?.toFixed(2)}</span>
                    </td>
                    <td className="provider-cell">{payment.provider}</td>
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
    </div>
  );
};

export default EmployeePayment;