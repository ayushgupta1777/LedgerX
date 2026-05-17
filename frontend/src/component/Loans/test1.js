import React from "react";
import { Search } from "lucide-react";
import "../../style/SearchBarUnique.css"; // Import external CSS

const SearchBarUnique = () => {
  return (
    <div className="search-container-unique">
      <div className="search-box-unique">
        <input
          type="text"
          placeholder="Search..."
          className="search-input-unique"
        />
        <Search className="search-icon-unique" size={20} />
      </div>
    </div>
  );
};

export default SearchBarUnique;
