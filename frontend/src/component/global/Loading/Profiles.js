import React from "react";
import "../../../style/global/loading/Profiles.css"; // Import the separate CSS file



const TransactionProfilesLoading = () => {
  return (
    <div className="transaction_profiles_loading">
      <div className="search-bar_profiles_loading"></div>

      <div className="transaction-list_profiles_loading">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="transaction-item_profiles_loading">
            <div className="profile-image_profiles_loading"></div>
            <div className="text-content_profiles_loading">
              <div className="text-line_profiles_loading short"></div>
              <div className="text-line_profiles_loading medium"></div>
              <div className="text-line_profiles_loading long"></div>
            </div>
            <div className="status-badge_profiles_loading"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransactionProfilesLoading;
