import React, { useState, useEffect } from "react";
import axios from "axios";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import "../../../style/loans/LoanTrendsGraph.css";

const LoanTrendsGraph = () => {
  const [data, setData] = useState([]);
  const [selectedRange, setSelectedRange] = useState("1W");
  const [totalLoans, setTotalLoans] = useState(0);
  const [rangeLoans, setRangeLoans] = useState(0);
  const [previousLoans, setPreviousLoans] = useState(0);
  const [percentageIncrease, setPercentageIncrease] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios.get(`${process.env.REACT_APP_API_BASE_URL}/loan-trends`, {
      headers: { "x-auth-token": token },
      params: { range: selectedRange },
    })
    .then(response => {
      const { trendData = [], totalLoans = 0, rangeLoans = 0, previousLoans = 0 } = response.data;
      setData(trendData);
      setTotalLoans(totalLoans);
      setRangeLoans(rangeLoans);
      setPreviousLoans(previousLoans);
      
      // Calculate percentage increase relative to total loans
      const increase = previousLoans > 0 ? ((rangeLoans / previousLoans) * 100) : 0;
      setPercentageIncrease(increase);
    })
    .catch(error => {
      console.error("Error fetching loan trends:", error);
    });
  }, [selectedRange]);

  return (
    <div className="loan-trends-container">
      <div className="loan-trends-header">
        <h2 className="total-loans">${totalLoans.toFixed(2)}</h2>
        <div className={`percentage-change ${percentageIncrease >= 0 ? "positive" : "negative"}`}>
          {percentageIncrease >= 0 ? "▲" : "▼"} {percentageIncrease.toFixed(2)}% 
          (Last {selectedRange}: ${rangeLoans.toFixed(2)})
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

      <ResponsiveContainer width="100%" height={350}>
        <AreaChart data={data} margin={{ top: 20, right: 40, left: 0, bottom: 10 }}>
          <defs>
            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#007bff" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#007bff" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="date" tick={{ fontSize: 14, fontWeight: "500" }} tickFormatter={(date) => new Date(date).toLocaleDateString()} />
          <YAxis tick={{ fontSize: 14, fontWeight: "500" }} />
          <CartesianGrid strokeDasharray="3 3" opacity={0.5} />
          <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
          <Area type="monotone" dataKey="loanAmount" stroke="#007bff" strokeWidth={3} fillOpacity={1} fill="url(#colorUv)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LoanTrendsGraph;


