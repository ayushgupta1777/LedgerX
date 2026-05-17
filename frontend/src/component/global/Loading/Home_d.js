import React from "react";
import "../../../style/global/loading/Home_d.css"; // Import the separate CSS file


const HomeLoading = () => {
  return (
    <div className="home-container_home_d-loading">
      <div className="header_home_d-loading">
        <div className="profile-placeholder_home_d-loading"></div>
        <div className="title-placeholder_home_d-loading"></div>
      </div>

      <div className="content_home_d-loading">
        <div className="card_home_d-loading large-card_home_d-loading"></div>
        <div className="card-grid_home_d-loading">
          <div className="card_home_d-loading"></div>
          <div className="card_home_d-loading"></div>
          <div className="card_home_d-loading"></div>
          <div className="card_home_d-loading"></div>
        </div>
      </div>
    </div>
  );
};

export default HomeLoading;
