import React from "react";
import SkeletonLoader from "../SkeletonLoader";
import "../../../style/global/loading/Home_i.css"; // Import CSS file

const DashboardSkeleton = () => {
  return (
    <div className="dashboard-skeleton page-fade-in">
      {/* Header Section */}
      <SkeletonLoader variant="rect" height="120px" style={{ borderRadius: 'var(--radius-md)', marginBottom: '20px' }} />

      {/* Balance Section */}
      <SkeletonLoader variant="text" width="80%" height="30px" style={{ marginBottom: '10px' }} />
      <SkeletonLoader variant="text" width="50%" height="14px" style={{ marginBottom: '20px' }} />

      {/* Transaction History */}
      <SkeletonLoader variant="text" width="40%" height="16px" style={{ marginBottom: '12px' }} />
      <SkeletonLoader variant="rect" height="50px" style={{ borderRadius: 'var(--radius-sm)', marginBottom: '10px' }} />
      <SkeletonLoader variant="rect" height="50px" style={{ borderRadius: 'var(--radius-sm)', marginBottom: '20px' }} />

      {/* Action Buttons */}
      <div className="skeleton-buttons">
        <SkeletonLoader variant="rect" width="48%" height="50px" style={{ borderRadius: 'var(--radius-sm)' }} />
        <SkeletonLoader variant="rect" width="48%" height="50px" style={{ borderRadius: 'var(--radius-sm)' }} />
      </div>

      {/* Investment Card */}
      <SkeletonLoader variant="rect" height="80px" style={{ borderRadius: 'var(--radius-md)', marginBottom: '15px' }} />

      {/* Small Icons Section */}
      <div className="skeleton-icons">
        <SkeletonLoader variant="rect" width="30%" height="50px" style={{ borderRadius: 'var(--radius-sm)' }} />
        <SkeletonLoader variant="rect" width="30%" height="50px" style={{ borderRadius: 'var(--radius-sm)' }} />
        <SkeletonLoader variant="rect" width="30%" height="50px" style={{ borderRadius: 'var(--radius-sm)' }} />
      </div>
    </div>
  );
};

export default DashboardSkeleton;