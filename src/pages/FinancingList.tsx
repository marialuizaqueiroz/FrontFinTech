import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { financingAPI, Financing } from '../services/api'

export default function FinancingList(){
  const { logout, user } = useAuth()
  const [items, setItems] = useState<Financing[]>([])
  const [filteredItems, setFilteredItems] = useState<Financing[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [error, setError] = useState<string | null>(null)

  useEffect(()=>{
    const fetchData = async () =>{
      setLoading(true)
      try {
        const data = await financingAPI.list()
        setItems(data)
        setFilteredItems(data)
        setError(null)
      } catch (error: any) {
        console.error('Erro ao carregar financiamentos:', error)
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
        if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
          setError(`Não foi possível conectar à API em ${apiUrl}. Verifique se o backend está rodando.`)
        } else {
          setError(`Erro ao carregar dados: ${error.message}`)
        }
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  },[])

  useEffect(() => {
    let filtered = items

    // Filtro por termo de pesquisa
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtro por status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter)
    }

    setFilteredItems(filtered)
  }, [searchTerm, statusFilter, items])

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: '#fbbf24',
      approved: '#10b981',
      rejected: '#ef4444',
      signed: '#3b82f6'
    }
    return (
      <span style={{
        backgroundColor: colors[status] || '#6b7280',
        color: 'white',
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '13px',
        fontWeight: '500'
      }}>
        {status === 'pending' ? 'Pendente' : 
         status === 'approved' ? 'Aprovado' :
         status === 'rejected' ? 'Rejeitado' :
         status === 'signed' ? 'Assinado' : status}
      </span>
    )
  }

  return (
    <div className="page-container" style={{minHeight: '100vh', backgroundColor: '#f3f4f6'}}>
      {/* Header */}
      <div className="page-header" style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{margin: 0, fontSize: '24px', fontWeight: '600', color: '#111827'}}>
            Backoffice - Financiamentos
          </h1>
          <p style={{margin: '4px 0 0', color: '#6b7280', fontSize: '14px'}}>
            Olá, {user?.name} ({user?.role})
          </p>
        </div>
        <div className="page-actions" style={{ display: 'flex', gap: '12px' }}>
          <Link
            to="/dashboard"
            style={{
              padding: '8px 16px',
              backgroundColor: '#6b7280',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px',
              fontWeight: '500'
            }}
          >
            📊 Dashboard
          </Link>
          <Link
            to="/vendas"
            style={{
              padding: '8px 16px',
              backgroundColor: '#10b981',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px',
              fontWeight: '500'
            }}
          >
            Vendas & Produtos
          </Link>
          <button 
            onClick={logout}
            style={{
              padding: '8px 16px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Sair
          </button>
        </div>
      </div>

      <div style={{padding: '24px', maxWidth: '1400px', margin: '0 auto'}}>
        {error && (
          <div style={{
            padding: '16px',
            backgroundColor: '#fee2e2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            color: '#991b1b',
            marginBottom: '20px'
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Filtros */}
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>🔍 Filtros</h3>
            <Link
              to="/financiamentos/novo"
              style={{
                padding: '10px 20px',
                backgroundColor: '#10b981',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '6px',
                fontWeight: '500',
                fontSize: '14px',
                flexShrink: 0
              }}
            >
              ➕ Novo Financiamento
            </Link>
          </div>
          <div className="filters-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            alignItems: 'end'
          }}>
            <div>
              <label style={{display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px', color: '#374151'}}>
                🔍 Pesquisar
              </label>
              <input
                type="text"
                placeholder="Buscar por cliente ou ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>
            <div>
              <label style={{display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px', color: '#374151'}}>
                📊 Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  backgroundColor: 'white'
                }}
              >
                <option value="all">Todos</option>
                <option value="pending">Pendente</option>
                <option value="approved">Aprovado</option>
                <option value="rejected">Rejeitado</option>
                <option value="signed">Assinado</option>
              </select>
            </div>
            <div>
              <button
                onClick={() => { setSearchTerm(''); setStatusFilter('all') }}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  fontSize: '14px'
                }}
              >
                Limpar Filtros
              </button>
            </div>

          </div>
        </div>

        {/* Resultados */}
        <div className="table-wrapper responsive-table" style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          <div style={{padding: '16px 20px', borderBottom: '1px solid #e5e7eb'}}>
            <h2 style={{margin: 0, fontSize: '18px', fontWeight: '600', color: '#111827'}}>
              Financiamentos ({filteredItems.length})
            </h2>
          </div>

          {loading ? (
            <div style={{padding: '40px', textAlign: 'center', color: '#6b7280'}}>
              Carregando...
            </div>
          ) : filteredItems.length === 0 ? (
            <div style={{padding: '40px', textAlign: 'center', color: '#6b7280'}}>
              Nenhum financiamento encontrado.
            </div>
          ) : (
            <div style={{overflowX: 'auto'}}>
              <table style={{width:'100%', borderCollapse:'collapse'}}>
                <thead style={{backgroundColor: '#f9fafb'}}>
                  <tr>
                    <th style={{textAlign:'left', padding: '12px 20px', fontWeight: '600', fontSize: '13px', color: '#374151', textTransform: 'uppercase'}}>ID</th>
                    <th style={{textAlign:'left', padding: '12px 20px', fontWeight: '600', fontSize: '13px', color: '#374151', textTransform: 'uppercase'}}>Cliente</th>
                    <th style={{textAlign:'left', padding: '12px 20px', fontWeight: '600', fontSize: '13px', color: '#374151', textTransform: 'uppercase'}}>Valor</th>
                    <th style={{textAlign:'left', padding: '12px 20px', fontWeight: '600', fontSize: '13px', color: '#374151', textTransform: 'uppercase'}}>Status</th>
                    <th style={{textAlign:'left', padding: '12px 20px', fontWeight: '600', fontSize: '13px', color: '#374151', textTransform: 'uppercase'}}>Criado</th>
                    <th style={{textAlign:'right', padding: '12px 20px', fontWeight: '600', fontSize: '13px', color: '#374151', textTransform: 'uppercase'}}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((it, idx) => (
                    <tr key={it.id} style={{borderBottom: '1px solid #e5e7eb', backgroundColor: idx % 2 === 0 ? 'white' : '#fafafa'}}>
                      <td data-label="ID" style={{padding: '16px 20px', fontSize: '14px', color: '#111827', fontFamily: 'monospace'}}>{it.id}</td>
                      <td data-label="Cliente" style={{padding: '16px 20px', fontSize: '14px', color: '#111827', fontWeight: '500'}}>{it.customer}</td>
                      <td data-label="Valor" style={{padding: '16px 20px', fontSize: '14px', color: '#111827', fontWeight: '600'}}>
                        R$ {it.amount.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </td>
                      <td data-label="Status" style={{padding: '16px 20px'}}>{getStatusBadge(it.status)}</td>
                      <td data-label="Criado em" style={{padding: '16px 20px', fontSize: '14px', color: '#6b7280'}}>
                        {new Date(it.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td data-label="Ações" style={{padding: '16px 20px', textAlign: 'right'}}>
                        <Link 
                          to={`/financiamentos/${it.id}`}
                          style={{
                            padding: '6px 16px',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            textDecoration: 'none',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontWeight: '500',
                            display: 'inline-block'
                          }}
                        >
                          Ver Detalhes
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
