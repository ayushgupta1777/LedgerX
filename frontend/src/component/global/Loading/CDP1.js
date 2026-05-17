import React from "react";
import "../../../style/global/loading/CDP1.css"; // Import the separate CSS file


const ChatLoading = () => {
  return (
    <div className="chat-container_CDP1_loading">
      {/* Header Section */}
      <div className="chat-header_CDP1_loading">
        <div className="profile-placeholder_CDP1_loading"></div>
        <div className="text-placeholder_CDP1_loading name-placeholder_CDP1_loading"></div>
        <div className="text-placeholder_CDP1_loading balance-placeholder_CDP1_loading"></div>
      </div>

      {/* Chat Body */}
      <div className="chat-body_CDP1_loading">
        <div className="message-placeholder_CDP1_loading"></div>
        <div className="message-placeholder_CDP1_loading"></div>
        <div className="message-placeholder_CDP1_loading small-message_CDP1_loading"></div>
      </div>

      {/* Chat Footer */}
      <div className="chat-footer_CDP1_loading">
        <div className="input-placeholder_CDP1_loading"></div>
        <div className="send-button-placeholder_CDP1_loading"></div>
      </div>
    </div>
  );
};

export default ChatLoading;

