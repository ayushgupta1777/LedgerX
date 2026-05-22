import React from 'react';
import '../../style/global/SkeletonLoader.css';

/**
 * SkeletonLoader component to render premium, high-performance shimmer placeholders.
 * Supports standard types: text, circle, rect, card, list, and complex preset layouts.
 */
const SkeletonLoader = ({
  variant = 'text',
  width,
  height,
  count = 1,
  className = '',
  style = {},
}) => {
  const getStyles = () => {
    const customStyles = { ...style };
    if (width) customStyles.width = width;
    if (height) customStyles.height = height;
    return customStyles;
  };

  const renderSingleSkeleton = (index) => {
    const baseClass = `skeleton-element skeleton-${variant} skeleton-shimmer ${className}`;

    if (variant === 'card') {
      return (
        <div key={index} className={`skeleton-card-container ${className}`} style={getStyles()}>
          <div className="skeleton-element skeleton-circle skeleton-shimmer" style={{ width: '48px', height: '48px' }} />
          <div className="skeleton-card-content">
            <div className="skeleton-element skeleton-text skeleton-shimmer" style={{ width: '60%', height: '16px', marginBottom: '8px' }} />
            <div className="skeleton-element skeleton-text skeleton-shimmer" style={{ width: '40%', height: '12px' }} />
          </div>
        </div>
      );
    }

    if (variant === 'list-item') {
      return (
        <div key={index} className={`skeleton-list-item-container ${className}`} style={getStyles()}>
          <div className="skeleton-element skeleton-circle skeleton-shimmer" style={{ width: '40px', height: '40px' }} />
          <div className="skeleton-list-item-content">
            <div className="skeleton-element skeleton-text skeleton-shimmer" style={{ width: '50%', height: '14px', marginBottom: '6px' }} />
            <div className="skeleton-element skeleton-text skeleton-shimmer" style={{ width: '30%', height: '10px' }} />
          </div>
          <div className="skeleton-element skeleton-rect skeleton-shimmer" style={{ width: '60px', height: '20px', marginLeft: 'auto', borderRadius: '4px' }} />
        </div>
      );
    }

    return (
      <div
        key={index}
        className={baseClass}
        style={getStyles()}
      />
    );
  };

  if (count > 1) {
    return (
      <div className={`skeleton-group skeleton-group-${variant}`}>
        {Array.from({ length: count }).map((_, idx) => renderSingleSkeleton(idx))}
      </div>
    );
  }

  return renderSingleSkeleton(0);
};

export default SkeletonLoader;
