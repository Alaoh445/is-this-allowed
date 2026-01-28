import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Answer from './pages/Answer.jsx'
import Contact from './pages/Contact.jsx'
import Privacy from './pages/Privacy.jsx'
import Terms from './pages/Terms.jsx'

// Create the router with future flags
const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <Home />
    },
    {
      path: "/Answer/:id",
      element: <Answer />
    },
    {
      path: "/contact",
      element: <Contact />
    },
    {
      path: "/privacy",
      element: <Privacy />
    },
    {
      path: "/terms",
      element: <Terms />
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
  <RouterProvider router={router} />
)
