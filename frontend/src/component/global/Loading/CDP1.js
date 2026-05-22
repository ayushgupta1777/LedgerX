import React from "react";
import SkeletonLoader from "../SkeletonLoader";
import "../../../style/global/loading/CDP1.css"; // Import the separate CSS file

const ChatLoading = () => {
  return (
    <div className="chat-container_CDP1_loading page-fade-in">
      {/* Header Section */}
      <div className="chat-header_CDP1_loading">
        <SkeletonLoader variant="circle" width="40px" height="40px" />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <SkeletonLoader variant="text" width="100px" height="12px" style={{ margin: 0 }} />
          <SkeletonLoader variant="text" width="80px" height="8px" style={{ margin: 0 }} />
        </div>
      </div>

      {/* Chat Body */}
      <div className="chat-body_CDP1_loading">
        <SkeletonLoader variant="rect" width="60%" height="40px" style={{ borderRadius: '12px 12px 12px 0px' }} />
        <SkeletonLoader variant="rect" width="50%" height="32px" style={{ borderRadius: '12px 12px 12px 0px' }} />
        <SkeletonLoader variant="rect" width="40%" height="36px" style={{ borderRadius: '12px 12px 12px 0px' }} />
        <SkeletonLoader variant="rect" width="70%" height="44px" style={{ borderRadius: '12px 12px 12px 0px' }} />
      </div>

      {/* Chat Footer */}
      <div className="chat-footer_CDP1_loading">
        <SkeletonLoader variant="rect" height="40px" style={{ flex: 1, borderRadius: '20px' }} />
        <SkeletonLoader variant="circle" width="40px" height="40px" />
      </div>
    </div>
  );
};

export default ChatLoading;


