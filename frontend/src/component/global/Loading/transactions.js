import React from "react";
import SkeletonLoader from "../SkeletonLoader";
import "../../../style/global/loading/transaction.css"; // Import the separate CSS file

const TransactionsLoading = () => {
  return (
    <div className="transactions-container-transaction_page_loading page-fade-in">
      <SkeletonLoader variant="rect" height="48px" style={{ borderRadius: 'var(--radius-sm)', marginBottom: '16px' }} />

      <div className="tab-menu-transaction_page_loading">
        <SkeletonLoader variant="rect" width="30%" height="40px" style={{ borderRadius: 'var(--radius-sm)' }} />
        <SkeletonLoader variant="rect" width="30%" height="40px" style={{ borderRadius: 'var(--radius-sm)' }} />
        <SkeletonLoader variant="rect" width="30%" height="40px" style={{ borderRadius: 'var(--radius-sm)' }} />
      </div>

      <div className="transactions-box-transaction_page_loading">
        <div className="transactions-header-transaction_page_loading">
          <SkeletonLoader variant="text" width="120px" height="18px" style={{ margin: 0 }} />
          <SkeletonLoader variant="rect" width="100px" height="36px" style={{ borderRadius: 'var(--radius-sm)' }} />
        </div>

        <table className="transactions-table-transaction_page_loading">
          <thead>
            <tr className="transactions-header-row-transaction_page_loading">
              <th><SkeletonLoader variant="text" width="40px" height="12px" style={{ margin: '0 auto' }} /></th>
              <th><SkeletonLoader variant="text" width="60px" height="12px" style={{ margin: '0 auto' }} /></th>
              <th><SkeletonLoader variant="text" width="50px" height="12px" style={{ margin: '0 auto' }} /></th>
              <th><SkeletonLoader variant="text" width="40px" height="12px" style={{ margin: '0 auto' }} /></th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 6 }).map((_, index) => (
              <tr key={index} className="transactions-skeleton-row-transaction_page_loading">
                <td><SkeletonLoader variant="text" width="50px" height="12px" style={{ margin: '0 auto' }} /></td>
                <td><SkeletonLoader variant="text" width="70px" height="12px" style={{ margin: '0 auto' }} /></td>
                <td><SkeletonLoader variant="text" width="60px" height="12px" style={{ margin: '0 auto' }} /></td>
                <td><SkeletonLoader variant="text" width="40px" height="12px" style={{ margin: '0 auto' }} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionsLoading;

