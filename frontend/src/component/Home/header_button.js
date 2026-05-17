// import React from "react";
// import { useNavigate } from "react-router-dom";
// import "../../style/user_auth/header.css";

// export default function UniqueButtonGroup() {
//   const navigate = useNavigate();

//   return (
//     <div className="unique-button-container">
//       {/* Navigate to About */}
//       <button 
//         className="unique-button unique-button-primary" 
//         onClick={() => navigate('/about')}
//       >
//         Go to About
//         <span className="ripple"></span>
//       </button>

//       {/* Navigate to Home */}
//       <button 
//         className="unique-button unique-button-secondary" 
//         onClick={() => navigate('/')}
//       >
//         Go to Home
//         <span className="ripple"></span>
//       </button>
//     </div>
//   );
// }


import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import '../../style/user_auth/header_button.css';
import Netflix from "../../component/global/netflix";
import { ThreeDot } from 'react-loading-indicators';

export default function UniqueButtonGroup() {
  const navigate = useNavigate();
      const [loading, setLoading] = useState(true); // Add loading state
      const [showImage, setShowImage] = useState(false);


      const PING_BACKENDS = [
        { name: "Render Server", url: `${process.env.REACT_APP_API_BASE_URL}/ping` },
        { name: "Second Server", url: `${process.env.REACT_APP_API_BASE_URL}/ping` },
      ];
      
      const preloadBackend = async () => {
        try {
          const responses = await Promise.all(
            PING_BACKENDS.map(async (server) => {
              const response = await axios.get(server.url);
              console.log(`${server.name} responded with status:`, response.status);
              return { name: server.name, status: response.status };
            })
          );
          console.log("All servers warmed up:", responses);
        } catch (error) {
          console.error("Backend ping failed:", error);
        }
      };
      
      // Call it when the app starts
      preloadBackend();
      


  
  useEffect(() => {
    const currentTime = Date.now();
    const lastShownTime = localStorage.getItem("lastShownTime");

    if (!lastShownTime || currentTime - Number(lastShownTime) >= 15000) {
      setShowImage(true);
      
      const timer = setTimeout(() => {
        setShowImage(false);
        localStorage.setItem("lastShownTime", Date.now().toString()); // Move inside timeout
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, []);



  if (showImage) {
    return (
      <div
        className="loading-container"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          width: "100%",
          backgroundColor: "#f9f9f9",
        }}
      >
        {showImage ? (

          <Netflix />
        ) : (
          <ThreeDot color="#32cd32" size="medium" text="" textColor="" />
        )}
      </div>
    );
  }

  return (
    <div className="unique-button-container">
      <button 
        className="unique-button unique-button-primary" 
        onClick={() => navigate('/home')}
      >
Loan book
        <span className="ripple"></span>

      </button>

      <button 
        className="unique-button unique-button-secondary" 
        onClick={() => navigate('/ac')}
      >
        Account Book
        <span className="ripple"></span>

      </button>
    </div>
  );
}
