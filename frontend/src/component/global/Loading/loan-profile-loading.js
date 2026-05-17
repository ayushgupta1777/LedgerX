import React from "react";
import "../../../style/global/loading/loan-profile.css";

const DashboardSkeleton = () => {
  return (
    <div className="dashboard-skeleton">
      {/* Header Section */}
      <div className="skeleton-header">
        <div className="skeleton-logo"></div>
        <div className="skeleton-text small"></div>
        <div className="skeleton-text medium"></div>
        <div className="skeleton-btn"></div>
      </div>

      {/* Grid Cards */}
      <div className="skeleton-cards">
        <div className="skeleton-card"></div>
        <div className="skeleton-card"></div>
        <div className="skeleton-card"></div>
        <div className="skeleton-card"></div>
      </div>

      {/* Bottom Buttons */}
      <div className="skeleton-buttons">
        <div className="skeleton-btn wide"></div>
        <div className="skeleton-btn small"></div>
      </div>

      <div className="over-sf">
      <div className="skeleton-fab">
      </div>
      </div>

    </div>
  );
};

export default DashboardSkeleton;
