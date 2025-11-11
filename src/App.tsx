import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import FinancingList from './pages/FinancingList'
import FinancingDetail from './pages/FinancingDetail'
import FinancingCreate from './pages/FinancingCreate'
import SalesOverview from './pages/SalesOverview'
import AccessDenied from './pages/AccessDenied'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route element={<ProtectedRoute adminOnly />}> 
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/financiamentos" element={<FinancingList />} />
            <Route path="/financiamentos/novo" element={<FinancingCreate />} />
            <Route path="/financiamentos/:id" element={<FinancingDetail />} />
            <Route path="/vendas" element={<SalesOverview />} />
          </Route>

          <Route path="/acesso-negado" element={<AccessDenied />} />
          <Route path="*" element={<div style={{padding:20}}>Página não encontrada. <a href="/">Ir para Início</a></div>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
