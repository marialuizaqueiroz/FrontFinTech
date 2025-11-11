import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { productAPI, saleAPI, Product, Sale } from '../services/api'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, CartesianGrid } from 'recharts'

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

type ProductFormState = {
  price: string
  stock: string
  status: Product['status']
  engagementRewardPoints: string
  description: string
}

const initialProductForm: ProductFormState = {
  price: '',
  stock: '',
  status: 'available',
  engagementRewardPoints: '',
  description: ''
}

const parseNumberField = (value: string, fallback: number) => {
  if (value.trim() === '') return fallback
  const parsed = Number(value)
  return Number.isNaN(parsed) ? fallback : parsed
}

export default function SalesOverview() {
  const { logout, user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewTab, setViewTab] = useState<'products' | 'sales'>('products')
  const [searchTerm, setSearchTerm] = useState('')
  const [productStatusFilter, setProductStatusFilter] = useState<'all' | Product['status']>('all')
  const [saleStatusFilter, setSaleStatusFilter] = useState<'all' | Sale['status']>('all')
  const [channelFilter, setChannelFilter] = useState<'all' | Sale['channel']>('all')
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [productForm, setProductForm] = useState<ProductFormState>(initialProductForm)
  const [isSavingProduct, setIsSavingProduct] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const [productData, saleData] = await Promise.all([
          productAPI.list(),
          saleAPI.list()
        ])
        setProducts(productData)
        setSales(saleData)
        setError(null)
      } catch (err: any) {
        console.error('Erro ao carregar dados de vendas/produtos:', err)
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
        if (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error')) {
          setError(`Não foi possível conectar à API em ${apiUrl}. Verifique se o backend está rodando.`)
        } else {
          setError(err.response?.data?.message || 'Erro ao carregar dados de vendas/produtos')
        }
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleOpenEditProduct = (product: Product) => {
    setEditingProduct(product)
    setProductForm({
      price: product.price.toString(),
      stock: product.stock.toString(),
      status: product.status,
      engagementRewardPoints: product.engagementRewardPoints.toString(),
      description: product.description || ''
    })
    setFormError(null)
  }

  const handleCloseEditProduct = () => {
    setEditingProduct(null)
    setProductForm(initialProductForm)
    setFormError(null)
  }

  const handleProductFormChange = (field: keyof ProductFormState, value: string) => {
    setProductForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmitProductEdit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!editingProduct) return

    setIsSavingProduct(true)
    setFormError(null)
    try {
      const payload = {
        price: parseNumberField(productForm.price, editingProduct.price),
        stock: parseNumberField(productForm.stock, editingProduct.stock),
        status: productForm.status,
        engagementRewardPoints: parseNumberField(
          productForm.engagementRewardPoints,
          editingProduct.engagementRewardPoints
        ),
        description: productForm.description.trim()
      }

      const updatedProduct = await productAPI.update(editingProduct.id, payload)
      setProducts(prev => prev.map(item => (item.id === updatedProduct.id ? updatedProduct : item)))
      handleCloseEditProduct()
    } catch (err: any) {
      console.error('Erro ao atualizar produto:', err)
      const message = err.response?.data?.message || 'Não foi possível atualizar o produto'
      setFormError(message)
    } finally {
      setIsSavingProduct(false)
    }
  }

  const filteredProducts = useMemo(() => {
    let list = [...products]
    if (searchTerm) {
      list = list.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    if (productStatusFilter !== 'all') {
      list = list.filter(item => item.status === productStatusFilter)
    }
    return list
  }, [products, searchTerm, productStatusFilter])

  const filteredSales = useMemo(() => {
    let list = [...sales]
    if (searchTerm) {
      list = list.filter(item =>
        item.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    if (saleStatusFilter !== 'all') {
      list = list.filter(item => item.status === saleStatusFilter)
    }
    if (channelFilter !== 'all') {
      list = list.filter(item => item.channel === channelFilter)
    }
    return list
  }, [sales, searchTerm, saleStatusFilter, channelFilter])

  const totalRevenue = useMemo(
    () => sales.reduce((sum, sale) => sum + sale.totalValue, 0),
    [sales]
  )

  const totalPointsEarned = useMemo(
    () => sales.reduce((sum, sale) => sum + sale.pointsEarned, 0),
    [sales]
  )

  const totalPointsUsed = useMemo(
    () => sales.reduce((sum, sale) => sum + sale.pointsUsed, 0),
    [sales]
  )

  const channelData = useMemo(() => {
    const data: Record<Sale['channel'], number> = {
      online: 0,
      store: 0,
      marketplace: 0
    }
    sales.forEach(sale => {
      data[sale.channel] += sale.totalValue
    })

    return Object.entries(data).map(([key, value]) => ({
      name: key === 'online' ? 'Online' : key === 'store' ? 'Loja Física' : 'Marketplace',
      value
    }))
  }, [sales])

  const productCategoryData = useMemo(() => {
    const data: Record<string, { count: number; stock: number }> = {}
    products.forEach(product => {
      if (!data[product.category]) {
        data[product.category] = { count: 0, stock: 0 }
      }
      data[product.category].count += 1
      data[product.category].stock += product.stock
    })
    return Object.entries(data).map(([category, stats]) => ({
      category,
      produtos: stats.count,
      estoque: stats.stock
    }))
  }, [products])

  const renderStatusBadge = (
    status: string,
    type: 'product' | 'sale' = 'sale'
  ) => {
    const palette = type === 'product'
      ? {
          available: '#10b981',
          out_of_stock: '#ef4444',
          inactive: '#6b7280'
        }
      : {
          processing: '#fbbf24',
          paid: '#3b82f6',
          shipped: '#06b6d4',
          delivered: '#22c55e',
          cancelled: '#ef4444',
          refunded: '#fb7185'
        }

    const labels: Record<string, string> = {
      available: 'Disponível',
      out_of_stock: 'Sem estoque',
      inactive: 'Inativo',
      processing: 'Processando',
      paid: 'Pago',
      shipped: 'Enviado',
      delivered: 'Entregue',
      cancelled: 'Cancelado',
      refunded: 'Reembolsado'
    }

    return (
      <span style={{
        backgroundColor: palette[status] || '#6b7280',
        color: 'white',
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: 600
      }}>
        {labels[status] || status}
      </span>
    )
  }

  const isLoading = loading
  const showProducts = viewTab === 'products'

  return (
    <div className="page-container" style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      <div className="page-header" style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 600, color: '#111827' }}>
            Backoffice - Produtos e Vendas
          </h1>
          <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '14px' }}>
            {user?.name} ({user?.role})
          </p>
        </div>
        <div className="page-actions" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <Link
            to="/dashboard"
            style={{
              padding: '8px 16px',
              backgroundColor: '#3b82f6',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px',
              fontWeight: 500
            }}
          >
            Dashboard
          </Link>
          <Link
            to="/financiamentos"
            style={{
              padding: '8px 16px',
              backgroundColor: '#6b7280',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px',
              fontWeight: 500
            }}
          >
            Ver Financiamentos
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
              fontWeight: 500
            }}
          >
            Sair
          </button>
        </div>
      </div>

      <div style={{ padding: '24px' }}>
        {error && (
          <div style={{
            marginBottom: '16px',
            padding: '16px',
            borderRadius: '8px',
            backgroundColor: '#fee2e2',
            border: '1px solid #fecaca',
            color: '#b91c1c'
          }}>
            {error}
          </div>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.08)'
          }}>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>Receita Total</p>
            <h2 style={{ margin: '8px 0 0', fontSize: '24px', color: '#111827' }}>
              {currency.format(totalRevenue)}
            </h2>
            <span style={{ fontSize: '12px', color: '#10b981' }}>Somatório de todas as vendas</span>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.08)'
          }}>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>Pontos Gerados</p>
            <h2 style={{ margin: '8px 0 0', fontSize: '24px', color: '#111827' }}>
              {totalPointsEarned.toLocaleString('pt-BR')}
            </h2>
            <span style={{ fontSize: '12px', color: '#10b981' }}>Integração com engajamento</span>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.08)'
          }}>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>Pontos Consumidos</p>
            <h2 style={{ margin: '8px 0 0', fontSize: '24px', color: '#111827' }}>
              {totalPointsUsed.toLocaleString('pt-BR')}
            </h2>
            <span style={{ fontSize: '12px', color: '#ef4444' }}>Descontos aplicados</span>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.08)'
          }}>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>Produtos Monitorados</p>
            <h2 style={{ margin: '8px 0 0', fontSize: '24px', color: '#111827' }}>
              {products.length}
            </h2>
            <span style={{ fontSize: '12px', color: '#6366f1' }}>Catálogo integrado à loja</span>
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px',
          boxShadow: '0 1px 2px rgba(0,0,0,0.08)'
        }}>
          <div
            className="tab-controls"
            style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '16px', alignItems: 'flex-start' }}
          >
            <div className="tab-buttons" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              <button
                onClick={() => setViewTab('products')}
                style={{
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: 600,
                  cursor: 'pointer',
                  backgroundColor: showProducts ? '#111827' : '#e5e7eb',
                  color: showProducts ? 'white' : '#111827',
                  flex: '0 0 auto'
                }}
              >
                Catálogo de Produtos
              </button>
              <button
                onClick={() => setViewTab('sales')}
                style={{
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: 600,
                  cursor: 'pointer',
                  backgroundColor: !showProducts ? '#111827' : '#e5e7eb',
                  color: !showProducts ? 'white' : '#111827',
                  flex: '0 0 auto'
                }}
              >
                Histórico de Vendas
              </button>
            </div>
            <div
              className="filters-stack"
              style={{ marginLeft: 'auto', display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end', flex: '1 1 320px' }}
            >
              <input
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder={showProducts ? 'Buscar por nome, SKU, categoria' : 'Buscar por cliente, produto ou ID'}
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  flex: '1 1 220px',
                  minWidth: '160px',
                  width: '100%'
                }}
              />
              {showProducts ? (
                <select
                  value={productStatusFilter}
                  onChange={e => setProductStatusFilter(e.target.value as typeof productStatusFilter)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    flex: '1 1 160px',
                    minWidth: '140px'
                  }}
                >
                  <option value="all">Todos os status</option>
                  <option value="available">Disponível</option>
                  <option value="out_of_stock">Sem estoque</option>
                  <option value="inactive">Inativo</option>
                </select>
              ) : (
                <>
                  <select
                    value={saleStatusFilter}
                    onChange={e => setSaleStatusFilter(e.target.value as typeof saleStatusFilter)}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #d1d5db',
                      flex: '1 1 160px',
                      minWidth: '140px'
                    }}
                  >
                    <option value="all">Todos os status</option>
                    <option value="processing">Processando</option>
                    <option value="paid">Pago</option>
                    <option value="shipped">Enviado</option>
                    <option value="delivered">Entregue</option>
                    <option value="cancelled">Cancelado</option>
                    <option value="refunded">Reembolsado</option>
                  </select>
                  <select
                    value={channelFilter}
                    onChange={e => setChannelFilter(e.target.value as typeof channelFilter)}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #d1d5db',
                      flex: '1 1 160px',
                      minWidth: '140px'
                    }}
                  >
                    <option value="all">Todos os canais</option>
                    <option value="online">Online</option>
                    <option value="store">Loja física</option>
                    <option value="marketplace">Marketplace</option>
                  </select>
                </>
              )}
            </div>
          </div>

          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
              Carregando dados...
            </div>
          ) : showProducts ? (
            <div className="table-wrapper responsive-table" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb', textAlign: 'left' }}>
                    {['SKU', 'Produto', 'Categoria', 'Preço', 'Estoque', 'Status', 'Vendas', 'Pontos', 'Ações'].map(header => (
                      <th
                        key={header}
                        style={{ padding: '12px', fontSize: '13px', color: '#6b7280', borderBottom: '1px solid #e5e7eb' }}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map(product => (
                    <tr key={product.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td data-label="SKU" style={{ padding: '12px', fontWeight: 600 }}>{product.sku}</td>
                      <td data-label="Produto" style={{ padding: '12px' }}>
                        <div style={{ fontWeight: 600 }}>{product.name}</div>
                        <div style={{ color: '#6b7280', fontSize: '13px' }}>{product.vendor}</div>
                      </td>
                      <td data-label="Categoria" style={{ padding: '12px', textTransform: 'capitalize' }}>{product.category}</td>
                      <td data-label="Preço" style={{ padding: '12px' }}>{currency.format(product.price)}</td>
                      <td data-label="Estoque" style={{ padding: '12px' }}>{product.stock}</td>
                      <td data-label="Status" style={{ padding: '12px' }}>{renderStatusBadge(product.status, 'product')}</td>
                      <td data-label="Vendas" style={{ padding: '12px' }}>{product.totalSales}</td>
                      <td data-label="Pontos" style={{ padding: '12px' }}>{product.engagementRewardPoints.toLocaleString('pt-BR')}</td>
                      <td data-label="Ações" style={{ padding: '12px', textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={() => handleOpenEditProduct(product)}
                          style={{
                            padding: '6px 16px',
                            borderRadius: '6px',
                            border: '1px solid #111827',
                            backgroundColor: '#111827',
                            color: 'white',
                            fontWeight: 500,
                            cursor: 'pointer'
                          }}
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan={9} style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>
                        Nenhum produto encontrado com os filtros atuais.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="table-wrapper responsive-table" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb', textAlign: 'left' }}>
                    {['Venda', 'Cliente', 'Produto', 'Canal', 'Qtd', 'Valor Total', 'Status', 'Pontos (+/-)'].map(header => (
                      <th key={header} style={{ padding: '12px', fontSize: '13px', color: '#6b7280', borderBottom: '1px solid #e5e7eb' }}>
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredSales.map(sale => (
                    <tr key={sale.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td data-label="Venda" style={{ padding: '12px', fontWeight: 600 }}>{sale.id}</td>
                      <td data-label="Cliente" style={{ padding: '12px' }}>
                        <div style={{ fontWeight: 600 }}>{sale.customer}</div>
                        <div style={{ color: '#6b7280', fontSize: '13px' }}>{new Date(sale.saleDate).toLocaleDateString('pt-BR')}</div>
                      </td>
                      <td data-label="Produto" style={{ padding: '12px' }}>{sale.productName}</td>
                      <td data-label="Canal" style={{ padding: '12px', textTransform: 'capitalize' }}>
                        {sale.channel === 'store' ? 'Loja' : sale.channel === 'online' ? 'Online' : 'Marketplace'}
                      </td>
                      <td data-label="Qtd" style={{ padding: '12px' }}>{sale.quantity}</td>
                      <td data-label="Valor Total" style={{ padding: '12px' }}>{currency.format(sale.totalValue)}</td>
                      <td data-label="Status" style={{ padding: '12px' }}>{renderStatusBadge(sale.status)}</td>
                      <td data-label="Pontos (+/-)" style={{ padding: '12px' }}>
                        <div style={{ color: '#10b981' }}>+{sale.pointsEarned.toLocaleString('pt-BR')}</div>
                        <div style={{ color: '#ef4444' }}>-{sale.pointsUsed.toLocaleString('pt-BR')}</div>
                      </td>
                    </tr>
                  ))}
                  {filteredSales.length === 0 && (
                    <tr>
                      <td colSpan={8} style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>
                        Nenhuma venda encontrada com os filtros atuais.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px'
        }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 2px rgba(0,0,0,0.08)', minHeight: '320px' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: '16px', color: '#111827' }}>Receita por canal</h3>
            {sales.length === 0 ? (
              <div style={{ color: '#6b7280', fontSize: '14px' }}>Sem dados suficientes.</div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={channelData}
                    dataKey="value"
                    nameKey="name"
                    labelLine={false}
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  >
                    {channelData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={['#3b82f6', '#10b981', '#f59e0b'][index]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => currency.format(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 2px rgba(0,0,0,0.08)', minHeight: '320px' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: '16px', color: '#111827' }}>Estoque por categoria</h3>
            {products.length === 0 ? (
              <div style={{ color: '#6b7280', fontSize: '14px' }}>Sem dados suficientes.</div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={productCategoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="produtos" fill="#60a5fa" name="Produtos ativos" />
                  <Bar dataKey="estoque" fill="#34d399" name="Estoque disponível" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
      {editingProduct && (
      <div
        className="modal-overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`edit-product-${editingProduct.id}`}
      >
        <div className="modal-card">
          <div className="modal-header">
            <div>
              <h3 id={`edit-product-${editingProduct.id}`} style={{ margin: 0, fontSize: '20px', color: '#111827' }}>
                Editar produto
              </h3>
              <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '14px' }}>
                {editingProduct.name} • SKU {editingProduct.sku}
              </p>
            </div>
            <button
              type="button"
              onClick={handleCloseEditProduct}
              aria-label="Fechar"
              style={{
                border: 'none',
                background: 'transparent',
                fontSize: '24px',
                lineHeight: 1,
                cursor: 'pointer',
                color: '#6b7280'
              }}
            >
              &times;
            </button>
          </div>

          <form onSubmit={handleSubmitProductEdit} className="modal-form" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {formError && (
              <div style={{ padding: '12px', borderRadius: '8px', border: '1px solid #fecaca', backgroundColor: '#fee2e2', color: '#991b1b' }}>
                {formError}
              </div>
            )}

            <div className="modal-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '14px', color: '#374151' }}>
                Preço (R$)
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={productForm.price}
                  onChange={e => handleProductFormChange('price', e.target.value)}
                  placeholder={editingProduct.price.toString()}
                  style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db' }}
                />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '14px', color: '#374151' }}>
                Estoque
                <input
                  type="number"
                  min="0"
                  value={productForm.stock}
                  onChange={e => handleProductFormChange('stock', e.target.value)}
                  placeholder={editingProduct.stock.toString()}
                  style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db' }}
                />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '14px', color: '#374151' }}>
                Status
                <select
                  value={productForm.status}
                  onChange={e => handleProductFormChange('status', e.target.value as Product['status'])}
                  style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db' }}
                >
                  <option value="available">Disponível</option>
                  <option value="out_of_stock">Sem estoque</option>
                  <option value="inactive">Inativo</option>
                </select>
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '14px', color: '#374151' }}>
                Pontos por venda
                <input
                  type="number"
                  min="0"
                  value={productForm.engagementRewardPoints}
                  onChange={e => handleProductFormChange('engagementRewardPoints', e.target.value)}
                  placeholder={editingProduct.engagementRewardPoints.toString()}
                  style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db' }}
                />
              </label>
            </div>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '14px', color: '#374151' }}>
              Descrição
              <textarea
                rows={3}
                value={productForm.description}
                onChange={e => handleProductFormChange('description', e.target.value)}
                placeholder={editingProduct.description || 'Detalhes exibidos para a equipe da loja.'}
                style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', resize: 'vertical' }}
              />
            </label>

            <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                type="button"
                onClick={handleCloseEditProduct}
                className="ghost-button"
                style={{
                  padding: '10px 18px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  backgroundColor: 'white',
                  color: '#111827',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSavingProduct}
                style={{
                  padding: '10px 18px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#111827',
                  color: 'white',
                  fontWeight: 600,
                  cursor: 'pointer',
                  minWidth: '160px',
                  opacity: isSavingProduct ? 0.7 : 1
                }}
              >
                {isSavingProduct ? 'Salvando...' : 'Salvar alterações'}
              </button>
            </div>
          </form>
        </div>
      </div>
      )}
    </div>
  )
}
