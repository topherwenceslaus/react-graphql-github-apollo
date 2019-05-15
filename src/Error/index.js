import React from 'react';
import './style.css';
const Error = ({ error }) => (
  <div className="ErrorMessage">
    <h1>{error.toString()}</h1>
  </div>
);

export default Error;
