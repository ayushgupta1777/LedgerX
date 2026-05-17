import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Supplier = () => {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !phoneNumber ) {
      return alert('Name and phone number are required!');
    }
    const newSupplier = { name, phoneNumber };

    try {
      const token = localStorage.getItem('token');
      console.log('Token:', token);

      if (!token) {
        return alert('You are not logged in. Please log in to continue.');
      }
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/addSupplier`, newSupplier,
        { headers: { 'x-auth-token': token } }
      );

      const { supplierID } = response.data;
    setName('');
    setPhoneNumber('');
    navigate(`/supplier/${supplierID}`);
  } catch (error) {
    console.error('Error adding customer:', error.response?.data || error.message);
    alert(error.response?.data?.error || 'Failed to add customer.');
  }
};

  return (
    <form onSubmit={handleSubmit}>
      <h2>Add Supplier</h2>
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="text"
        placeholder="Phone Number"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
      />
      <button type="submit">Add Supplier</button>
    </form>
  );
};

export default Supplier;
