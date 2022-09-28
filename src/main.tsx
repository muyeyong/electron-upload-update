import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import AComponent from './components/aConponent'
import ErrorPage from './components/error-page'
import './samples/node-api'
import 'styles/index.css'
import {
  createHashRouter,
  RouterProvider,
} from "react-router-dom"

const router = createHashRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />
  },
  {
    path: '/a',
    element: <AComponent />
  }
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
     <RouterProvider router={router} />
  </React.StrictMode>
)

postMessage({ payload: 'removeLoading' }, '*')
