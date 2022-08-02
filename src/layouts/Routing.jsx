import React from 'react'
import { Routes, BrowserRouter, Route } from 'react-router-dom'

import App from '@/layouts/App'

import PagesHome from '@/pages/Home'
import PagesNotFound from '@/pages/NotFound'

function Routing() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<PagesHome />} />
          <Route path="*" element={<PagesNotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default Routing
