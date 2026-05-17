import React, { useRef, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faList ,faBell,faReceipt, faUser, faLayerGroup } from '@fortawesome/free-solid-svg-icons';
import debounce from "lodash.debounce";
import '../../style/user_auth/bottom_manu.css';

const iconNames = ['home', 'category', 'notification', 'user', 'book-icon'];
const BottomHeader = () => {
  const location = useLocation();
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  // const MemoizedComponent = React.memo(SomeComponent);

  // Define the route paths for each icon
   const routes = [
    { path: '/', icon: faHouse },
    { path: '/home', icon: faList },
    { path: '/ac', icon: faReceipt },
    { path: '/profile', icon: faUser },
    { path: '/cart', icon: faLayerGroup },
  ];
  const toggleCategoryMenu = () => {
    setIsCategoryOpen(!isCategoryOpen);
  };

  const handleOutsideClick = (e) => {
    if (!e.target.closest(".category-menu") && !e.target.closest(".category-icon")) {
      setIsCategoryOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleOutsideClick);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  const callback = (entries) => {
    entries.forEach((entry) => {
      console.log("Observed resize:", entry.contentRect);
    });
  };

  const resizeObserver = new ResizeObserver(
    debounce((entries) => {
      entries.forEach((entry) => {
        console.log("Resized:", entry.contentRect);
      });
    }, 100) // Debounce to limit to once every 100ms
  );

  // Suppress ResizeObserver errors
const originalError = console.error;
console.error = (...args) => {
  if (!args[0].includes("ResizeObserver")) {
    originalError(...args);
  }
};

  // useEffect(() => {
  //   const observer = new ResizeObserver(callback);
  //   observer.observe(someElement);
  
  //   return () => {
  //     observer.disconnect();
  //   };
  // }, []);

  const BottomMenu = () => {
    const someElement = useRef(null);
  
    useEffect(() => {
      const observer = new ResizeObserver((entries) => {
        entries.forEach((entry) => {
          console.log("Resized:", entry.contentRect);
        });
      });
      if (someElement.current) observer.observe(someElement.current);
  
      return () => observer.disconnect(); // Cleanup
    }, []);
  
    return <div ref={someElement}>Observed Element</div>;
  };
                                                         
        return (
          <div className="bottom-header">
            {routes.map((route, index) => (
              <div key={index}>
                {route.icon === faList ? (
                  <div className="category-icon" onClick={toggleCategoryMenu}>
                    <FontAwesomeIcon
                      className="img"
                      icon={route.icon}
                      style={{ color: "#080808" }}
                    />
                    {isCategoryOpen && (
                      <div className="category-menu">
                      <Link
                        to="/home"
                        className={`category-item ${
                          location.pathname === '/home' ? 'active' : ''
                        }`}
                      >                      
                        Loan
                      </Link>
                      <Link
                        to="/ac"
                        className={`category-item ${
                          location.pathname === '/ac' ? 'active' : ''
                        }`}
                      >
                        Account book
                      </Link>
                    </div>
                    )}
                  </div>
                ) : (
                  <Link to={route.path} key={index} className={`icon ${location.pathname === route.path ? 'active' : ''}`}>
            <div className="icon-container">
            <FontAwesomeIcon className='img' icon={route.icon} 
            style={{color: "#080808",}}
            />
              {/* <img src={require(`../../assets/images/${route.icon}.png`)} alt={route.icon.charAt(0).toUpperCase() + route.icon.slice(1)} /> */}
            </div>
          </Link>
                )}
              </div>
            ))}
          </div>
        );
      };
      
      export default BottomHeader;