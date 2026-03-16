import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import './index.css'
import Home from './pages/Home.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import Answer from './pages/Answer.jsx'
import Contact from './pages/Contact.jsx'
import Privacy from './pages/Privacy.jsx'
import Terms from './pages/Terms.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Services from './pages/Services.jsx'
import ServiceDetail from './pages/ServiceDetail.jsx'
import ClientDashboard from './pages/ClientDashboard.jsx'
import ProviderDashboard from './pages/ProviderDashboard.jsx'
import UserProfile from './pages/UserProfile.jsx'
import ServiceRequest from './pages/ServiceRequest.jsx'
import Layout from './components/Layout.jsx'

// Create the router with future flags
const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <Layout />,
      children: [
        { index: true, element: <Home /> },
        { path: "Answer/:id", element: <Answer /> },
        { path: "contact", element: <Contact /> },
        { path: "privacy", element: <Privacy /> },
        { path: "terms", element: <Terms /> },
        { path: "login", element: <Login /> },
        { path: "login/:role", element: <Login /> },
        { path: "register", element: <Register /> },
        { path: "services", element: <Services /> },
        { path: "service/:serviceId", element: <ServiceDetail /> },
        { path: "client/dashboard", element: <ClientDashboard /> },
        { path: "provider/dashboard", element: <ProviderDashboard /> },
        { path: "profile", element: <UserProfile /> },
        { path: "profile/:userId", element: <UserProfile /> },
        { path: "service-request/:requestId", element: <ServiceRequest /> }
      ]
    }
  ],
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }
  }
)

createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <ThemeProvider>
      <ErrorBoundary>
        <RouterProvider router={router} />
      </ErrorBoundary>
    </ThemeProvider>
  </AuthProvider>
)
