import React, { useState, useEffect } from "react";
import axios from "axios";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import "../../../style/loans/LoanTrendsGraph.css";
import { FaArrowLeft } from "react-icons/fa"; // Importing Font Awesome icon
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeftLong } from "@fortawesome/free-solid-svg-icons";

const LoanTrendsGraph = () => {
  const [data, setData] = useState([]);
  const [selectedRange, setSelectedRange] = useState("1W");
  const [totalLoans, setTotalLoans] = useState(0);
  const [rangeLoans, setRangeLoans] = useState(0);
  const [percentageIncrease, setPercentageIncrease] = useState(0);
  const navigate = useNavigate();


  useEffect(() => {
    const token = localStorage.getItem("token");
    axios.get(`${process.env.REACT_APP_API_BASE_URL}/loan-trends`, {
      headers: { "x-auth-token": token },
      params: { range: selectedRange },
    })
    .then(response => {
      const { trendData = [], totalLoans = 0, rangeLoans = 0, percentageIncrease = 0 } = response.data;
      setData(trendData);
      setTotalLoans(totalLoans);
      setRangeLoans(rangeLoans);
      setPercentageIncrease(percentageIncrease);
      
    })
    .catch(error => {
      console.error("Error fetching loan trends:", error);
    });
  }, [selectedRange]);

  return (
    <>
 <nav className="nav-t">
      <a onClick={() => navigate(-1)} className="arrow-t">
      <FontAwesomeIcon icon={faArrowLeftLong} className="arrow-icon-t" />
      Back to Home
      </a>
      <div className="heart-view">Trends</div>
    </nav>


    <div className="loan-trends-container">
      <div className="loan-trends-header">
      <h2 className="total-loans">₹ {totalLoans.toFixed(2)}</h2>
      <div className={`percentage-change ${percentageIncrease >= 0 ? "positive" : "negative"}`}>
      {percentageIncrease >= 0 ? "▲" : "▼"} {percentageIncrease.toFixed(2)}% 
          (Last {selectedRange}: ₹ {rangeLoans.toFixed(2)})
        </div>
      </div>

      <div className="range-selector">
        {["1H", "1D", "1W", "1M", "1Y", "ALL"].map(range => (
          <button 
          className={`range-button ${selectedRange === range ? "active" : ""}`} 
          key={range} 
            onClick={() => setSelectedRange(range)}
          >
            {range}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
          <defs>
            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#007bff" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#007bff" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis 
  dataKey="date" 
  tick={{ fontSize: 14, fontWeight: "500" }} 
  tickFormatter={(date) => {
    if (!date) return "";  // Ensure the date is not undefined/null
    const parsedDate = new Date(date);
    return isNaN(parsedDate) ? "Invalid Date" : parsedDate.toLocaleDateString();
  }} 
/>
                    <YAxis tick={{ fontSize: 14, fontWeight: "500" }} />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip formatter={(value) => `₹ ${value.toFixed(2)}`} />
          <Area type="monotone" dataKey="loanAmount" stroke="#007bff" fillOpacity={1} fill="url(#colorUv)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
    </>
  );
};

export default LoanTrendsGraph;