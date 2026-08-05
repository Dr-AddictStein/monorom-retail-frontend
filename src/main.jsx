import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { RouterProvider } from "react-router-dom";
import { router } from './Routes/Routes';
import './index.css';
import { AuthContextProvider } from './context/AuthContext'
import { CartContextProvider } from './context/CartContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <AuthContextProvider>
        <CartContextProvider>
          <RouterProvider router={router} />
        </CartContextProvider>
      </AuthContextProvider>
    </HelmetProvider>
  </StrictMode>,
)
