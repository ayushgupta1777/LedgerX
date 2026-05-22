import React from "react";
import SkeletonLoader from "../SkeletonLoader";
import "../../../style/global/loading/loan-profile.css";

const DashboardSkeleton = () => {
  return (
    <div className="dashboard-skeleton page-fade-in">
      {/* Header Section */}
      <div className="skeleton-header">
        <SkeletonLoader variant="circle" width="60px" height="60px" style={{ margin: '0 auto 12px' }} />
        <SkeletonLoader variant="text" width="40%" height="12px" style={{ margin: '0 auto 8px' }} />
        <SkeletonLoader variant="text" width="60%" height="18px" style={{ margin: '0 auto 16px' }} />
        <SkeletonLoader variant="rect" width="120px" height="36px" style={{ borderRadius: 'var(--radius-full)', margin: '0 auto' }} />
      </div>

      {/* Grid Cards */}
      <div className="skeleton-cards">
        <SkeletonLoader variant="rect" height="90px" style={{ borderRadius: 'var(--radius-md)' }} />
        <SkeletonLoader variant="rect" height="90px" style={{ borderRadius: 'var(--radius-md)' }} />
        <SkeletonLoader variant="rect" height="90px" style={{ borderRadius: 'var(--radius-md)' }} />
        <SkeletonLoader variant="rect" height="90px" style={{ borderRadius: 'var(--radius-md)' }} />
      </div>

      {/* Bottom Buttons */}
      <div className="skeleton-buttons">
        <SkeletonLoader variant="rect" width="70%" height="48px" style={{ borderRadius: 'var(--radius-full)' }} />
        <SkeletonLoader variant="rect" width="25%" height="48px" style={{ borderRadius: 'var(--radius-full)' }} />
      </div>
    </div>
  );
};

export default DashboardSkeleton;

