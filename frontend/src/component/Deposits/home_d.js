import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "../../style/deposits/home_d.css"; // Import external CSS
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartLine, faFileLines, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import LoadingSKL from "../global/Loading/Home_d"

const spendingsData = [
  { value: 200 }, { value: 250 }, { value: 180 }, { value: 300 }, { value: 220 }, { value: 270 }, { value: 210 }
];

const incomeData = [
  { value: 150 }, { value: 200 }, { value: 350 }, { value: 250 }, { value: 300 }, { value: 280 }, { value: 260 }
];

const HomeFinanceDashboard = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState("");
  const [totalReceived, setTotalReceived] = useState(0);
  const [totalGiven, setTotalGiven] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTransactionSummary = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/transactions/summary`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
        });

        const data = await response.json();
        console.log("API Response:", data);

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch transactions");
        }

        setTotalReceived(data.totalReceived);
        setTotalGiven(data.totalGiven);
        setUserId(data.userId);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchTransactionSummary();
  }, []);

  const Networth = totalGiven + totalReceived;

  // ✅ Move useMemo **before** conditional returns
  const SpendingChart = useMemo(() => (
    <ResponsiveContainer width="100%" height={50}>
      <LineChart data={spendingsData}>
        <Line type="monotone" dataKey="value" stroke="#E44060" strokeWidth={2.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  ), []);

  const IncomeChart = useMemo(() => (
    <ResponsiveContainer width="100%" height={50}>
      <LineChart data={incomeData} animationDuration={0}>
        <Line type="monotone" dataKey="value" stroke="#FFA500" strokeWidth={2.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  ), []);

  // ✅ Conditional return statements come AFTER useMemo hooks
  if (loading) {
    return (
      // <div
      //   className="loading-container"
      //   style={{
      //     display: "flex",
      //     justifyContent: "center",
      //     alignItems: "center",
      //     height: "100vh",
      //     width: "100%",
      //     backgroundColor: "#f9f9f9",
      //   }}
      // >
      //     <ThreeDot color="#32cd32" size="medium" text="" textColor="" />
      // </div>
      <LoadingSKL/>
    );
  }  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="finance-dashboard">
      {/* Top Navigation */}
      <div className="finance-header">
        <h2 className="finance-title">{userId}</h2>
        <div className="finance-buttons">
          <button className="finance-btn">
            <FontAwesomeIcon icon={faChartLine} />
            <span className="finance-btn-text">Dashboard</span>
          </button>
          <button className="finance-btn">
            <FontAwesomeIcon icon={faFileLines} />
            <span className="finance-btn-text">Spreadsheet</span>
          </button>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="finance-grid">
        {/* Income Section */}
        <div className="finance-card balance-finance-card">
          <p className="finance-card-label">Income</p>
          <h2 className="finance-balance-amount">₹ {totalReceived}</h2>
          <div className="graph-container">
            {IncomeChart}
          </div>
        </div>

        {/* Total Net Worth */}
        <div className="finance-card net-worth-finance-card">
          <p className="finance-card-label">Total Net Worth</p>
          <h2 className="finance-net-worth-amount">₹ {Networth}</h2>
        </div>

        {/* Income Sources */}
        <div className="finance-card income-finance-card">
          <p className="finance-card-label">Income Source</p>
          <div className="finance-income-details">
            <p>E-commerce: <span className="finance-income-value">₹2,100</span></p>
            <p>Google Ads: <span className="finance-income-value finance-red-text">950</span></p>
          </div>
          <div className="finance-income-details">
            <p>My Shop: <span className="finance-income-value">₹8,000</span></p>
            <p>Salary: <span className="finance-income-value finance-green-text">₹13,000</span></p>
          </div>
        </div>

        {/* Spendings Section */}
        <div className="finance-card spending-finance-card">
          <p className="finance-card-label">Spendings</p>
          <h2 className="finance-spending-amount">₹ {totalGiven}</h2>
          <div className="graph-container">
            {SpendingChart}
          </div>
        </div>

        {/* Navigation Button */}
        <div className="redirect-to-ac" onClick={() => navigate("/ac")} >
          <span className="income-text">Next</span>
          <FontAwesomeIcon icon={faArrowRight} className="income-arrow" />
        </div>
      </div>
    </div>
  );
};

export default HomeFinanceDashboard;
