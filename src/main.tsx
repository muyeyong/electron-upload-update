import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import CheckUpload from './components/checkUpload'
import ErrorPage from './components/error-page'
import './samples/node-api'
import 'styles/index.css'
import 'antd/dist/antd.css'
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
    path: '/check-upload',
    element: <CheckUpload />
  }
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  /* 
    从 React 18 开始的严格模式，每当组件在开发中挂载时，React 会模拟立即卸载和重新挂载组件
    useEffect 会执行两次
   */
  // <React.StrictMode>
     <RouterProvider router={router} />
  // </React.StrictMode>
)

postMessage({ payload: 'removeLoading' }, '*')
