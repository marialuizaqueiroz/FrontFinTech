import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { financingAPI, CreateFinancingDTO } from '../services/api'

export default function FinancingCreate() {
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Estados do formulário
  const [customer, setCustomer] = useState('')
  const [amount, setAmount] = useState('')
  const [status, setStatus] = useState<'pending' | 'approved' | 'signed' | 'rejected'>('pending')
  const [termMonths, setTermMonths] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validação
    if (!customer.trim()) {
      setError('Nome do cliente é obrigatório')
      return
    }
    if (!amount || parseFloat(amount) <= 0) {
      setError('Valor deve ser maior que zero')
      return
    }
    if (!termMonths || parseInt(termMonths) <= 0) {
      setError('Prazo deve ser maior que zero')
      return
    }

    setLoading(true)

    try {
      const data: CreateFinancingDTO = {
        customer: customer.trim(),
        amount: parseFloat(amount),
        status,
        termMonths: parseInt(termMonths)
      }

      await financingAPI.create(data)
      alert('✅ Financiamento criado com sucesso!')
      navigate('/financiamentos')
    } catch (err: any) {
      console.error('Error creating financing:', err)
      setError(err.response?.data?.message || 'Erro ao criar financiamento')
    } finally {
      setLoading(false)
    }
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
            ➕ Novo Financiamento
          </h1>
          <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '14px' }}>
            {user?.name} ({user?.role})
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link
            to="/dashboard"
            style={{
              padding: '8px 16px',
              backgroundColor: '#3b82f6',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px',
              fontWeight: '500'
            }}
          >
            📊 Dashboard
          </Link>
          <Link
            to="/financiamentos"
            style={{
              padding: '8px 16px',
              backgroundColor: '#6b7280',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px',
              fontWeight: '500'
            }}
          >
            ← Voltar
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

      <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
        {/* Card do Formulário */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '24px',
            borderBottom: '1px solid #e5e7eb',
            backgroundColor: '#f9fafb'
          }}>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#111827' }}>
              📝 Dados do Financiamento
            </h2>
          </div>

          <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
            {error && (
              <div style={{
                padding: '16px',
                backgroundColor: '#fee2e2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                color: '#991b1b',
                marginBottom: '24px'
              }}>
                ⚠️ {error}
              </div>
            )}

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '24px',
              marginBottom: '24px'
            }}>
              {/* Nome do Cliente */}
              <div>
                <label style={{
                  display: 'block',
                  color: '#374151',
                  fontSize: '14px',
                  fontWeight: '500',
                  marginBottom: '8px'
                }}>
                  👤 Nome do Cliente *
                </label>
                <input
                  type="text"
                  value={customer}
                  onChange={(e) => setCustomer(e.target.value)}
                  placeholder="Ex: João Silva"
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '16px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Valor */}
              <div>
                <label style={{
                  display: 'block',
                  color: '#374151',
                  fontSize: '14px',
                  fontWeight: '500',
                  marginBottom: '8px'
                }}>
                  💰 Valor do Financiamento *
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Ex: 50000"
                  step="0.01"
                  min="0"
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '16px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Prazo */}
              <div>
                <label style={{
                  display: 'block',
                  color: '#374151',
                  fontSize: '14px',
                  fontWeight: '500',
                  marginBottom: '8px'
                }}>
                  📅 Prazo (meses) *
                </label>
                <input
                  type="number"
                  value={termMonths}
                  onChange={(e) => setTermMonths(e.target.value)}
                  placeholder="Ex: 60"
                  min="1"
                  max="360"
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '16px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Status */}
              <div>
                <label style={{
                  display: 'block',
                  color: '#374151',
                  fontSize: '14px',
                  fontWeight: '500',
                  marginBottom: '8px'
                }}>
                  📊 Status *
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'pending' | 'approved' | 'signed' | 'rejected')}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '16px',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="pending">Pendente</option>
                  <option value="approved">Aprovado</option>
                  <option value="signed">Assinado</option>
                  <option value="rejected">Rejeitado</option>
                </select>
              </div>
            </div>

            {/* Botões */}
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end',
              paddingTop: '24px',
              borderTop: '1px solid #e5e7eb'
            }}>
              <Link
                to="/financiamentos"
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#e5e7eb',
                  color: '#374151',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontWeight: '500',
                  display: 'inline-block'
                }}
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '12px 32px',
                  backgroundColor: loading ? '#9ca3af' : '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {loading ? '💾 Salvando...' : '💾 Criar Financiamento'}
              </button>
            </div>
          </form>
        </div>

        {/* Informações */}
        <div style={{
          marginTop: '24px',
          padding: '16px',
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '8px',
          fontSize: '14px',
          color: '#1e40af'
        }}>
          <strong>ℹ️ Dica:</strong> Todos os campos marcados com * são obrigatórios. O ID será gerado automaticamente pelo sistema.
        </div>
      </div>
    </div>
  )
}
