import React from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCode } from "@fortawesome/free-solid-svg-icons";
import '../../../style/global/CompanyWatermark.css';

const CompanyWatermark = ({ companyName = "Adsngrow", companyUrl = "https://adsngrow.in",  showIcon = true  }) => {

//   companyName = "CZONE", 
//   companyUrl = "#",
//   showIcon = true 
// }) => {
  const handleClick = (e) => {
    if (companyUrl === "#") {
      e.preventDefault();
      return;
    }
  };

  return (
    <div className="company-watermark">
      <div className="company-watermark-content">
        {/* {showIcon && (
          <FontAwesomeIcon icon={faCode} className="company-watermark-icon" />
        )} */}
        <span className="company-watermark-text">Developed by</span>
        <a 
          href={companyUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="company-watermark-link"
          onClick={handleClick}
        >
          {companyName}
        </a>
      </div>
    </div>
  );
};

export default CompanyWatermark;                           