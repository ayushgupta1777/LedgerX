import React from 'react';
import { useNavigate } from 'react-router-dom';

const Loan = () => {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Loan Management</h1>
      <button onClick={() => navigate('/land_money_form')} style={buttonStyle}>
        Lend Money
      </button>
      <button onClick={() => navigate('/land_money_form')} style={buttonStyle}>
        Borrow Money
      </button>
    </div>
  );
};

const buttonStyle = {
  margin: '10px',
  padding: '15px 30px',
  fontSize: '16px',
  cursor: 'pointer',
};

export default Loan;