import React from "react";
import "../../../style/global/loading/transaction.css"; // Import the separate CSS file

const TransactionsLoading = () => {
  return (
    <div className="transactions-container-transaction_page_loading">
      <div className="search-bar-transaction_page_loading skeleton-box-transaction_page_loading"></div>

      <div className="tab-menu-transaction_page_loading">
        <div className="tab-transaction_page_loading active-tab-transaction_page_loading skeleton-box-transaction_page_loading"></div>
        <div className="tab-transaction_page_loading skeleton-box-transaction_page_loading"></div>
        <div className="tab-transaction_page_loading skeleton-box-transaction_page_loading"></div>
      </div>

      <div className="transactions-box-transaction_page_loading">
        <div className="transactions-header-transaction_page_loading">
          <div className="transactions-title-transaction_page_loading skeleton-box-transaction_page_loading"></div>
          <div className="transactions-button-transaction_page_loading skeleton-box-transaction_page_loading"></div>
        </div>

        <table className="transactions-table-transaction_page_loading">
          <thead>
            <tr className="transactions-header-row-transaction_page_loading">
              <th><div className="skeleton-box-transaction_page_loading"></div></th>
              <th><div className="skeleton-box-transaction_page_loading"></div></th>
              <th><div className="skeleton-box-transaction_page_loading"></div></th>
              <th><div className="skeleton-box-transaction_page_loading"></div></th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 6 }).map((_, index) => (
              <tr key={index} className="transactions-skeleton-row-transaction_page_loading">
                <td><div className="skeleton-box-transaction_page_loading"></div></td>
                <td><div className="skeleton-box-transaction_page_loading"></div></td>
                <td><div className="skeleton-box-transaction_page_loading"></div></td>
                <td><div className="skeleton-box-transaction_page_loading"></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionsLoading;
