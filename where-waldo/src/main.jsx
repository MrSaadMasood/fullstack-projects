import React from 'react'
import ReactDOM from 'react-dom/client'
import "./index.css"
import App from './Components/App'
import { Outlet, Route, RouterProvider, createBrowserRouter, createRoutesFromElements } from 'react-router-dom'
import GameSelectionPage from './Components/GameSelection'
import ErrorPage from './Components/ErrorPage'

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path='/' element={<GameSelectionPage/>} ></Route>
        <Route path='/game/:id' element={<App />}/>
        <Route path='*' element={<ErrorPage />} />
    </>
  )
)
ReactDOM.createRoot(document.getElementById('root')).render(
  <RouterProvider router={router} >
  <React.StrictMode>
    <Outlet />
  </React.StrictMode>
</RouterProvider>
)
