import React from 'react';
import './Card.css';

const Card = ({ children, className = '', ...props }) => (
  <div className={`nl-card ${className}`} {...props}>
    {children}
  </div>
);

export default Card;
