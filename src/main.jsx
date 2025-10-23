import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './ui/App.jsx';
import Instance from './ui/Instance.jsx';
import './index.css';

// Configure routes for the application. The root path lists all instances and
// a parameterized route shows an individual instance's QR code and status.
const router = createBrowserRouter([
  { path: '/', element: <App /> },
  { path: '/instance/:id', element: <Instance /> },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);