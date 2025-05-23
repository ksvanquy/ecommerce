import React from 'react';

interface HeartIconProps {
  isFavorite: boolean;
  onClick: () => void;
  className?: string;
}

const HeartIcon: React.FC<HeartIconProps> = ({ isFavorite, onClick, className }) => (
  <button onClick={onClick} aria-label="Add to wishlist" type="button" className={className}>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6"
      fill={isFavorite ? 'red' : 'none'}
      viewBox="0 0 24 24"
      stroke={isFavorite ? 'red' : 'currentColor'}
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
      />
    </svg>
  </button>
);

export default HeartIcon; 