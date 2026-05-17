import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Calendar, CheckCircle, Clock, Bell, User, AlertCircle } from 'lucide-react';
import '../../../style/loans/dynamic/LoanReminders.css';

const LoanReminders = () => {
    const [reminders, setReminders] = useState([]);
    const [activeTab, setActiveTab] = useState('all');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchReminders = async () => {
            try {
                const token = localStorage.getItem('token');
                // build API URL in a safer way in case base URL has trailing slash
                const base = process.env.REACT_APP_API_BASE_URL || '';
                const apiUrl = `${base.replace(/\/+$/, '')}/loan-reminders`;
                console.log('fetching loan reminders from', apiUrl);

                const response = await axios.get(apiUrl, {
                    headers: { 'x-auth-token': token },
                });

                setReminders(response.data);
                setLoading(false);
            } catch (error) {
                if (error.response && error.response.status === 404) {
                    console.error('Loan reminders endpoint not found (404).'
                        + ' Please make sure your API base URL is correct and the backend route is deployed.');
                } else {
                    console.error('Error fetching reminders:', error);
                }
                setLoading(false);
            }
        };

        fetchReminders();
    }, []);

    const handleMarkRead = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const base = process.env.REACT_APP_API_BASE_URL || '';
            const apiUrl = `${base.replace(/\/+$/, '')}/loan-reminders/${id}/seen`;

            await axios.patch(apiUrl, {}, {
                headers: { 'x-auth-token': token },
            });

            setReminders(prev => prev.map(r => r.id === id ? { ...r, isRead: true } : r));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    // Filtering logic
    const filteredReminders = reminders.filter(reminder => {
        if (activeTab === 'all') return true;

        const today = new Date();
        const dueDate = new Date(reminder.dueDate);

        return dueDate.getFullYear() === today.getFullYear() &&
            dueDate.getMonth() === today.getMonth() &&
            dueDate.getDate() === today.getDate();
    });

    if (loading) {
        return (
            <div className="loan-reminders-container">
                <div className="loading-state">
                    <Clock size={48} className="animate-spin text-blue-500 mb-4" />
                    <p>Calculating interest reminders...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="loan-reminders-container">
            <header className="reminders-header">
                <div>
                    <h1>Loan Reminders</h1>
                    <p style={{ color: '#64748b', marginTop: '0.5rem' }}>Monthly interest collection schedule</p>
                </div>

                <div className="header-actions">
                    <div className="tab-switcher">
                        <button
                            className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                            onClick={() => setActiveTab('all')}
                        >
                            All
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'today' ? 'active' : ''}`}
                            onClick={() => setActiveTab('today')}
                        >
                            Today
                        </button>
                    </div>

                    <button className="back-btn" onClick={() => navigate(-1)}>
                        <ArrowLeft size={18} />
                        Back
                    </button>
                </div>
            </header>

            {filteredReminders.length === 0 ? (
                <div className="empty-state">
                    <Bell size={64} style={{ color: '#cbd5e1', marginBottom: '1.5rem' }} />
                    <h2>No reminders yet</h2>
                    <p style={{ color: '#64748b' }}>
                        {activeTab === 'today'
                            ? "You don't have any interest collections scheduled for today."
                            : "Reminders will appear here after the first month of a loan."}
                    </p>
                </div>
            ) : (
                <div className="reminders-grid">
                    {filteredReminders.map((reminder) => (
                        <div key={reminder.id} className={`reminder-card ${reminder.isRead ? 'read' : 'unread'}`}>
                            <div className="card-header">
                                <div className="flex items-center gap-2">
                                    <User size={20} className="text-gray-400" />
                                    <h2 className="customer-name">{reminder.customerName}</h2>
                                </div>
                                <span className="status-indicator">
                                    {reminder.isRead ? 'Read' : 'New'}
                                </span>
                            </div>

                            <div className="interest-period">
                                <Calendar size={16} />
                                {reminder.period}
                            </div>

                            <div className="amount-box">
                                <div className="amount-row">
                                    <span className="amount-label">MONTHLY INTEREST</span>
                                    <span className="amount-value">₹{Math.floor(reminder.interestAmount).toLocaleString('en-IN')}</span>
                                </div>
                                <div className="amount-row total-interest">
                                    <span className="amount-label">TOTAL ACCRUED</span>
                                    <span className="amount-value">₹{Math.floor(reminder.totalAccrued).toLocaleString('en-IN')}</span>
                                </div>
                            </div>

                            <div className="card-actions">
                                {!reminder.isRead ? (
                                    <button
                                        className="mark-read-btn"
                                        onClick={() => handleMarkRead(reminder.id)}
                                    >
                                        Mark as Checked
                                    </button>
                                ) : (
                                    <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                                        <CheckCircle size={16} />
                                        Checked
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LoanReminders;
