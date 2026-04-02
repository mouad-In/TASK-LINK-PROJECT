import React from 'react';

const Card = ({ 
  children, 
  title, 
  subtitle,
  footer,
  className = '',
  hover = false,
  onClick,
  ...props 
}) => {
  return (
    <div 
      className={`bg-white rounded-lg shadow-md ${hover ? 'hover:shadow-lg transition-shadow cursor-pointer' : ''} ${className}`}
      onClick={onClick}
      {...props}
    >
      {(title || subtitle) && (
        <div className="px-6 py-4 border-b border-gray-200">
          {title && <h3 className="text-lg font-semibold text-gray-800">{title}</h3>}
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
      )}
      <div className="px-6 py-4">
        {children}
      </div>
      {footer && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;

