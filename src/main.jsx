import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Import our test connection function
import { testSupabaseConnection } from './supabaseClient.js';

// Test the connection on boot
testSupabaseConnection();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
