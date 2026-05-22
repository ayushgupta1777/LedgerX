import React from "react";
import SkeletonLoader from "../SkeletonLoader";
import "../../../style/global/loading/Home_d.css"; // Import the separate CSS file

const HomeLoading = () => {
  return (
    <div className="home-container_home_d-loading page-fade-in">
      <div className="header_home_d-loading">
        <SkeletonLoader variant="circle" width="50px" height="50px" />
        <SkeletonLoader variant="text" width="150px" height="20px" style={{ margin: 0 }} />
      </div>

      <div className="content_home_d-loading">
        <SkeletonLoader variant="rect" height="160px" style={{ borderRadius: 'var(--radius-md)', marginBottom: '15px' }} />
        <div className="card-grid_home_d-loading">
          <SkeletonLoader variant="rect" height="120px" style={{ borderRadius: 'var(--radius-md)' }} />
          <SkeletonLoader variant="rect" height="120px" style={{ borderRadius: 'var(--radius-md)' }} />
          <SkeletonLoader variant="rect" height="120px" style={{ borderRadius: 'var(--radius-md)' }} />
          <SkeletonLoader variant="rect" height="120px" style={{ borderRadius: 'var(--radius-md)' }} />
        </div>
      </div>
    </div>
  );
};

export default HomeLoading;

