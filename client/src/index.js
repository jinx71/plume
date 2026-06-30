import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

// React 17 mounts with ReactDOM.render (not createRoot). StrictMode is safe
// here — on 17 it does not double-invoke effects, so the single Socket.io
// connection and fetch-on-mount logic behave exactly once.
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
