import React from "react";
import "../../../style/global/loading/Home_i.css"; // Import CSS file


const DashboardSkeleton = () => {
    return (
      <div className="dashboard-skeleton">
        {/* Header Section */}
        <div className="skeleton-header"></div>
  
        {/* Balance Section */}
        <div className="skeleton-balance"></div>
        <div className="skeleton-subtext"></div>
  
        {/* Transaction History */}
        <div className="skeleton-title"></div>
        <div className="skeleton-transaction"></div>
        <div className="skeleton-transaction"></div>
  
        {/* Action Buttons */}
        <div className="skeleton-buttons">
          <div className="skeleton-btn"></div>
          <div className="skeleton-btn"></div>
        </div>
  
        {/* Investment Card */}
        <div className="skeleton-investment"></div>
  
        {/* Small Icons Section */}
        <div className="skeleton-icons">
          <div className="skeleton-icon"></div>
          <div className="skeleton-icon"></div>
          <div className="skeleton-icon"></div>
        </div>
  
        {/* Floating Button */}
        {/* <div className="skeleton-fab"></div> */}
      </div>
    );
  };
  
  export default DashboardSkeleton;