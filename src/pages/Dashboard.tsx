import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { financingAPI, Financing } from '../services/api'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'

export default function Dashboard() {
  const { logout, user } = useAuth()
  const [items, setItems] = useState<Financing[]>([])
  const [loading, setLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'count' | 'value'>('count')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await financingAPI.list()
        setItems(data)
      } catch (err: any) {
        console.error('Error fetching financings:', err)
        setError(err.response?.data?.message || 'Erro ao carregar dados')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const getStatusStats = () => {
    const stats: Record<string, { count: number; value: number; label: string; color: string }> = {
      pending: { count: 0, value: 0, label: 'Pendente', color: '#fbbf24' },
      approved: { count: 0, value: 0, label: 'Aprovado', color: '#10b981' },
      rejected: { count: 0, value: 0, label: 'Rejeitado', color: '#ef4444' },
      signed: { count: 0, value: 0, label: 'Assinado', color: '#3b82f6' }
    }

    items.forEach(item => {
      if (stats[item.status]) {
        stats[item.status].count++
        stats[item.status].value += item.amount
      }
    })

    return Object.entries(stats).map(([key, data]) => ({
      name: data.label,
      count: data.count,
      value: data.value,
      percentage: viewMode === 'count' 
        ? ((data.count / items.length) * 100).toFixed(1)
        : ((data.value / items.reduce((sum, i) => sum + i.amount, 0)) * 100).toFixed(1),
      color: data.color
    }))
  }

  const chartData = getStatusStats()
  const totalValue = items.reduce((sum, item) => sum + item.amount, 0)
  const totalCount = items.length

  const RADIAN = Math.PI / 180
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        style={{ fontSize: '14px', fontWeight: 'bold' }}
      >
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '600', color: '#111827' }}>
            📊 Dashboard - Análise de Financiamentos
          </h1>
          <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '14px' }}>
            {user?.name} ({user?.role})
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link
            to="/financiamentos"
            style={{
              padding: '8px 16px',
              backgroundColor: '#3b82f6',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px',
              fontWeight: '500'
            }}
          >
            📋 Lista
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

      <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Carregando...</div>
        ) : error ? (
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
        ) : (
          <>
            {/* Cards de Resumo */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px',
              marginBottom: '24px'
            }}>
              <div style={{
                backgroundColor: 'white',
                padding: '24px',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                borderLeft: '4px solid #3b82f6'
              }}>
                <div style={{ color: '#6b7280', fontSize: '14px', marginBottom: '8px' }}>Total de Financiamentos</div>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#111827' }}>{totalCount}</div>
              </div>

              <div style={{
                backgroundColor: 'white',
                padding: '24px',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                borderLeft: '4px solid #10b981'
              }}>
                <div style={{ color: '#6b7280', fontSize: '14px', marginBottom: '8px' }}>Valor Total</div>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#059669' }}>
                  R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>

              <div style={{
                backgroundColor: 'white',
                padding: '24px',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                borderLeft: '4px solid #fbbf24'
              }}>
                <div style={{ color: '#6b7280', fontSize: '14px', marginBottom: '8px' }}>Ticket Médio</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#111827' }}>
                  R$ {(totalValue / totalCount).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>

              <div style={{
                backgroundColor: 'white',
                padding: '24px',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                borderLeft: '4px solid #ef4444'
              }}>
                <div style={{ color: '#6b7280', fontSize: '14px', marginBottom: '8px' }}>Taxa de Aprovação</div>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#111827' }}>
                  {((items.filter(i => i.status === 'approved' || i.status === 'signed').length / totalCount) * 100).toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Controle de Visualização */}
            <div style={{
              backgroundColor: 'white',
              padding: '16px 24px',
              borderRadius: '12px',
              marginBottom: '20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ fontWeight: '600', fontSize: '16px', color: '#111827' }}>
                📈 Distribuição por Status
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setViewMode('count')}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: viewMode === 'count' ? '#3b82f6' : '#e5e7eb',
                    color: viewMode === 'count' ? 'white' : '#374151',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    fontSize: '14px'
                  }}
                >
                  👥 Por Número de Clientes
                </button>
                <button
                  onClick={() => setViewMode('value')}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: viewMode === 'value' ? '#3b82f6' : '#e5e7eb',
                    color: viewMode === 'value' ? 'white' : '#374151',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    fontSize: '14px'
                  }}
                >
                  💰 Por Valor Total
                </button>
              </div>
            </div>

            {/* Gráficos */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
              gap: '20px'
            }}>
              {/* Gráfico de Pizza */}
              <div style={{
                backgroundColor: 'white',
                padding: '24px',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <h3 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: '600', color: '#111827' }}>
                  🥧 Gráfico de Pizza - {viewMode === 'count' ? 'Quantidade' : 'Valor'}
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey={viewMode === 'count' ? 'count' : 'value'}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any) => {
                        if (viewMode === 'value') {
                          return `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                        }
                        return `${value} cliente(s)`
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Gráfico de Barras */}
              <div style={{
                backgroundColor: 'white',
                padding: '24px',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <h3 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: '600', color: '#111827' }}>
                  📊 Gráfico de Barras - {viewMode === 'count' ? 'Quantidade' : 'Valor'}
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: any) => {
                        if (viewMode === 'value') {
                          return `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                        }
                        return `${value} cliente(s)`
                      }}
                    />
                    <Bar dataKey={viewMode === 'count' ? 'count' : 'value'} radius={[8, 8, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Tabela de Estatísticas */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              marginTop: '20px',
              overflow: 'hidden'
            }}>
              <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#111827' }}>
                  📋 Detalhamento por Status
                </h3>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: '#f9fafb' }}>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '12px 20px', fontWeight: '600', fontSize: '13px', color: '#374151' }}>Status</th>
                    <th style={{ textAlign: 'right', padding: '12px 20px', fontWeight: '600', fontSize: '13px', color: '#374151' }}>Quantidade</th>
                    <th style={{ textAlign: 'right', padding: '12px 20px', fontWeight: '600', fontSize: '13px', color: '#374151' }}>% Clientes</th>
                    <th style={{ textAlign: 'right', padding: '12px 20px', fontWeight: '600', fontSize: '13px', color: '#374151' }}>Valor Total</th>
                    <th style={{ textAlign: 'right', padding: '12px 20px', fontWeight: '600', fontSize: '13px', color: '#374151' }}>% Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {chartData.map((stat, idx) => (
                    <tr key={stat.name} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{
                          backgroundColor: stat.color,
                          color: 'white',
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '13px',
                          fontWeight: '500'
                        }}>
                          {stat.name}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', padding: '16px 20px', fontSize: '16px', fontWeight: '600' }}>
                        {stat.count}
                      </td>
                      <td style={{ textAlign: 'right', padding: '16px 20px', color: '#6b7280' }}>
                        {((stat.count / totalCount) * 100).toFixed(1)}%
                      </td>
                      <td style={{ textAlign: 'right', padding: '16px 20px', fontSize: '16px', fontWeight: '600', color: '#059669' }}>
                        R$ {stat.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ textAlign: 'right', padding: '16px 20px', color: '#6b7280' }}>
                        {((stat.value / totalValue) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot style={{ backgroundColor: '#f9fafb', fontWeight: '700' }}>
                  <tr>
                    <td style={{ padding: '16px 20px', fontSize: '14px' }}>TOTAL</td>
                    <td style={{ textAlign: 'right', padding: '16px 20px', fontSize: '18px' }}>{totalCount}</td>
                    <td style={{ textAlign: 'right', padding: '16px 20px' }}>100%</td>
                    <td style={{ textAlign: 'right', padding: '16px 20px', fontSize: '18px', color: '#059669' }}>
                      R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ textAlign: 'right', padding: '16px 20px' }}>100%</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
