import React from "react";

const GrayButton = ({ onClick, children, className = "" }) => {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-1 text-gray rounded bg-gray-200 hover:bg-gray-300 ${className}`}
    >
      {children}
    </button>
  );
};

export default GrayButton;
