import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { Outlet, Route, RouterProvider, createBrowserRouter, createRoutesFromElements } from 'react-router-dom'
import Home from './Components/Home.jsx'
import Login from './Components/Login.jsx'
import Signup from './Components/Signup.jsx'
import { AuthProvider } from './Components/Context/authContext.jsx'
import PrivateRoute from './Components/PrivateRoute.jsx'
import NewGroupForm from './Components/Forms/NewGroupForm.jsx'

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path='/' element={<PrivateRoute />} >
        <Route path='/' element={<Home />} index/>
        <Route path='/create-new-group' element={<NewGroupForm />} />
      </Route>
      <Route path='/login' element={<Login />} />
      <Route path='/sign-up' element={<Signup />} />
    </>
  )
)
ReactDOM.createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <RouterProvider router={router} >
    <React.StrictMode>
      <Outlet/>
    </React.StrictMode>,
    </RouterProvider>
  </AuthProvider>
)
