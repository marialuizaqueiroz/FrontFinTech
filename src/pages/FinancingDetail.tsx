import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { financingAPI, Financing } from '../services/api'

export default function FinancingDetail(){
  const { id } = useParams()
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const [item, setItem] = useState<Financing | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Estados editáveis
  const [customer, setCustomer] = useState('')
  const [amount, setAmount] = useState(0)
  const [status, setStatus] = useState<'pending' | 'approved' | 'signed' | 'rejected'>('pending')
  const [termMonths, setTermMonths] = useState(0)

  useEffect(()=>{
    const fetchData = async () =>{
      if (!id) return
      setLoading(true)
      setError(null)
      try {
        const data = await financingAPI.get(id)
        setItem(data)
        setCustomer(data.customer)
        setAmount(data.amount)
        setStatus(data.status)
        setTermMonths(data.termMonths)
      } catch (err: any) {
        console.error('Error fetching financing:', err)
        setError(err.response?.data?.message || 'Erro ao carregar financiamento')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  },[id])

  const save = async () => {
    if (!item || !id) return
    setSaving(true)
    setError(null)
    try {
      const updatedData = await financingAPI.update(id, {
        customer,
        amount,
        status,
        termMonths
      })
      setItem(updatedData)
      alert('✅ Dados atualizados com sucesso!')
    } catch (err: any) {
      console.error('Error updating financing:', err)
      setError(err.response?.data?.message || 'Erro ao atualizar financiamento')
      alert('❌ Erro ao salvar alterações')
    } finally {
      setSaving(false)
    }
  }

  const hasChanges = () => {
    if (!item) return false
    return customer !== item.customer || 
           amount !== item.amount || 
           status !== item.status || 
           termMonths !== item.termMonths
  }

  const handleDelete = async () => {
    if (!id || !item) return
    
    const confirmDelete = window.confirm(`Tem certeza que deseja excluir o financiamento de ${item.customer}?`)
    if (!confirmDelete) return

    try {
      await financingAPI.delete(id)
      alert('✅ Financiamento excluído com sucesso!')
      navigate('/financiamentos')
    } catch (err: any) {
      console.error('Error deleting financing:', err)
      alert('❌ Erro ao excluir financiamento')
    }
  }

  const getStatusColor = (s: string) => {
    const colors: Record<string, string> = {
      pending: '#fbbf24',
      approved: '#10b981',
      rejected: '#ef4444',
      signed: '#3b82f6'
    }
    return colors[s] || '#6b7280'
  }

  const getStatusLabel = (s: string) => {
    const labels: Record<string, string> = {
      pending: 'Pendente',
      approved: 'Aprovado',
      rejected: 'Rejeitado',
      signed: 'Assinado'
    }
    return labels[s] || s
  }

  if (loading) {
    return (
      <div style={{minHeight: '100vh', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{textAlign: 'center', color: '#6b7280'}}>
          <div style={{fontSize: '48px', marginBottom: '16px'}}>⏳</div>
          <div>Carregando...</div>
        </div>
      </div>
    )
  }

  if (!item) {
    return (
      <div style={{minHeight: '100vh', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{textAlign: 'center'}}>
          <div style={{fontSize: '48px', marginBottom: '16px'}}>❌</div>
          <div style={{color: '#6b7280', marginBottom: '24px'}}>Financiamento não encontrado</div>
          <Link to="/financiamentos" style={{
            padding: '10px 20px',
            backgroundColor: '#3b82f6',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '6px',
            fontWeight: '500'
          }}>
            Voltar para Lista
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{minHeight: '100vh', backgroundColor: '#f3f4f6'}}>
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
          <h1 style={{margin: 0, fontSize: '24px', fontWeight: '600', color: '#111827'}}>
            Detalhes do Financiamento
          </h1>
          <p style={{margin: '4px 0 0', color: '#6b7280', fontSize: '14px'}}>
            {user?.name} ({user?.role})
          </p>
        </div>
        <div style={{display: 'flex', gap: '12px'}}>
          <Link 
            to="/dashboard"
            style={{
              padding: '8px 16px',
              backgroundColor: '#3b82f6',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px',
              fontWeight: '500',
              display: 'inline-block'
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
              fontWeight: '500',
              display: 'inline-block'
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

      <div style={{padding: '24px', maxWidth: '1000px', margin: '0 auto'}}>
        {/* Card Principal */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          overflow: 'hidden',
          marginBottom: '24px'
        }}>
          {/* Header do Card */}
          <div style={{
            padding: '24px',
            borderBottom: '1px solid #e5e7eb',
            backgroundColor: '#f9fafb'
          }}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start'}}>
              <div>
                <div style={{color: '#6b7280', fontSize: '13px', fontWeight: '500', marginBottom: '4px'}}>
                  ID DO FINANCIAMENTO
                </div>
                <div style={{fontSize: '24px', fontWeight: '700', color: '#111827', fontFamily: 'monospace'}}>
                  {item.id}
                </div>
              </div>
              <div style={{
                backgroundColor: getStatusColor(item.status),
                color: 'white',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                {getStatusLabel(item.status)}
              </div>
            </div>
          </div>

          {/* Formulário de Edição */}
          <div style={{padding: '24px'}}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '24px',
              marginBottom: '32px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  color: '#6b7280',
                  fontSize: '13px',
                  fontWeight: '500',
                  marginBottom: '8px'
                }}>
                  👤 CLIENTE
                </label>
                <input
                  type="text"
                  value={customer}
                  onChange={(e) => setCustomer(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  color: '#6b7280',
                  fontSize: '13px',
                  fontWeight: '500',
                  marginBottom: '8px'
                }}>
                  💰 VALOR DO FINANCIAMENTO
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  step="0.01"
                  min="0"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '18px',
                    fontWeight: '700',
                    color: '#059669',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  color: '#6b7280',
                  fontSize: '13px',
                  fontWeight: '500',
                  marginBottom: '8px'
                }}>
                  📅 PRAZO (meses)
                </label>
                <input
                  type="number"
                  value={termMonths}
                  onChange={(e) => setTermMonths(Number(e.target.value))}
                  min="1"
                  max="360"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <div style={{
                  color: '#6b7280',
                  fontSize: '13px',
                  fontWeight: '500',
                  marginBottom: '8px'
                }}>
                  🗓️ DATA DE CRIAÇÃO
                </div>
                <div style={{
                  padding: '12px',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#6b7280'
                }}>
                  {new Date(item.createdAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}
                </div>
              </div>
            </div>

            {/* Formulário de Status */}
            <div style={{
              padding: '24px',
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              border: '1px solid #e5e7eb'
            }}>
              <h3 style={{margin: '0 0 16px', fontSize: '16px', fontWeight: '600', color: '#111827'}}>
                ⚙️ Status do Financiamento
              </h3>
              <div style={{display: 'flex', gap: '12px', alignItems: 'end', marginBottom: '16px'}}>
                <div style={{flex: 1}}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151'
                  }}>
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={e=>setStatus(e.target.value as 'pending' | 'approved' | 'signed' | 'rejected')}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      backgroundColor: 'white',
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    <option value="pending">Pendente</option>
                    <option value="approved">Aprovado</option>
                    <option value="rejected">Rejeitado</option>
                    <option value="signed">Assinado</option>
                  </select>
                </div>
                <button
                  onClick={save}
                  disabled={saving || !hasChanges()}
                  style={{
                    padding: '12px 32px',
                    backgroundColor: (saving || !hasChanges()) ? '#9ca3af' : '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: (saving || !hasChanges()) ? 'not-allowed' : 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s'
                  }}
                >
                  {saving ? '💾 Salvando...' : '💾 Salvar Todas as Alterações'}
                </button>
              </div>
              
              {/* Botão Deletar */}
              <div style={{ paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
                <button
                  onClick={handleDelete}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  🗑️ Excluir Financiamento
                </button>
              </div>

              {hasChanges() && (
                <div style={{
                  marginTop: '12px',
                  padding: '12px',
                  backgroundColor: '#fef3c7',
                  border: '1px solid #fde68a',
                  borderRadius: '6px',
                  fontSize: '13px',
                  color: '#92400e'
                }}>
                  ⚠️ Você tem alterações não salvas. Clique em "Salvar Todas as Alterações" para aplicar.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Card de Informações Adicionais */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          padding: '24px'
        }}>
          <h3 style={{margin: '0 0 16px', fontSize: '16px', fontWeight: '600', color: '#111827'}}>
            📋 Informações Adicionais
          </h3>
          <div style={{color: '#6b7280', fontSize: '14px', lineHeight: '1.6'}}>
            <p>Este é um financiamento mockado para demonstração. Em um sistema real, aqui você poderia ver:</p>
            <ul style={{marginLeft: '20px'}}>
              <li>Timeline de aprovação e etapas</li>
              <li>Documentos anexados pelo cliente</li>
              <li>Histórico de alterações de status</li>
              <li>Informações de contrato assinado</li>
              <li>Detalhes de cálculo de juros e parcelas</li>
              <li>Pontos de engajamento ganhos/consumidos</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
