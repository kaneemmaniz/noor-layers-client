import React from 'react';
import './Button.css';

const Button = ({ children, variant = 'primary', ...props }) => (
  <button className={`nl-btn nl-btn-${variant}`} {...props}>
    {children}
  </button>
);

export default Button;
