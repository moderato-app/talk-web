import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import './prose.css'
import {NextUIProvider} from '@nextui-org/react'

import {createBrowserRouter, RouterProvider,} from "react-router-dom"
import Auth from "./auth/auth.tsx"
import Error from "./error.tsx"
import Home from "./home/home.tsx"
import {Experiment} from "./experiment/experiment.tsx"
import {HelmetProvider} from 'react-helmet-async'

const router = createBrowserRouter([
    {
        path: "/",
        element: <Home/>,
        errorElement: <Error/>,
    },
    {
        path: "/chat",
        element: <Home/>,
        errorElement: <Error/>,
    },
    {
        path: "/auth",
        element: <Auth/>,
        errorElement: <Error/>,
    },
    {
        path: "/exp",
        element: <Experiment/>,
        errorElement: <Error/>,
    },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <HelmetProvider>
            <NextUIProvider>
                <RouterProvider router={router}/>
            </NextUIProvider>
        </HelmetProvider>
    </React.StrictMode>,
)
