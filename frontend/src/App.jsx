import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Overview from './pages/Overview'
import Tenants from './pages/Tenants'
import Plans from './pages/Plans'
import Usage from './pages/Usage'
import './App.css'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Overview />} />
          <Route path="/tenants" element={<Tenants />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/usage" element={<Usage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
