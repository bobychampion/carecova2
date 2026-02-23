import React from 'react';
import './SkeletonLoader.css'; // We'll create this or add to index.css

export default function SkeletonLoader({ type = 'card', count = 1, className = '' }) {
    const renderSkeleton = () => {
        switch (type) {
            case 'text':
                return <div className={`skeleton skeleton-text ${className}`}></div>;
            case 'title':
                return <div className={`skeleton skeleton-title ${className}`}></div>;
            case 'avatar':
                return <div className={`skeleton skeleton-avatar ${className}`}></div>;
            case 'card':
            default:
                return (
                    <div className={`skeleton-card ${className}`}>
                        <div className="skeleton skeleton-title w-3/4 mb-4"></div>
                        <div className="skeleton skeleton-text w-full mb-2"></div>
                        <div className="skeleton skeleton-text w-5/6 mb-2"></div>
                        <div className="skeleton skeleton-text w-4/6 mb-4"></div>
                        <div className="flex gap-2">
                            <div className="skeleton skeleton-button"></div>
                            <div className="skeleton skeleton-button"></div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <>
            {Array(count)
                .fill(0)
                .map((_, i) => (
                    <React.Fragment key={i}>{renderSkeleton()}</React.Fragment>
                ))}
        </>
    );
}
