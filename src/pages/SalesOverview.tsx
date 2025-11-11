import { useEffect, useState } from 'react'
import { productAPI, saleAPI, Product, Sale } from '../services/api' 

function SuccessMessage({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div
      style={{
        position: 'fixed',
        top: '24px',
        right: '24px',
        backgroundColor: '#10b981',
        color: 'white',
        padding: '12px 20px',
        borderRadius: '8px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        zIndex: 9999,
        transition: 'opacity 0.3s ease',
      }}
    >
      <span style={{ fontWeight: 600 }}>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'white',
          fontSize: '18px',
          cursor: 'pointer',
          lineHeight: 1,
        }}
      >
        &times;
      </button>
    </div>
  )
}

export default function SalesOverview() {
  const [products, setProducts] = useState<any[]>([])
  const [sales, setSales] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingProduct, setEditingProduct] = useState<any | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const [p, s] = await Promise.all([productAPI.list(), saleAPI.list()])
        setProducts(p)
        setSales(s)
      } catch (err) {
        console.error('Erro ao carregar dados:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleEditProduct = (product: any) => {
    setEditingProduct(product)
  }

  const handleCloseEditProduct = () => {
    setEditingProduct(null)
  }

  const handleSubmitProductEdit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!editingProduct) return

    const formData = new FormData(event.currentTarget)
    const payload = {
      name: formData.get('name') as string,
      price: Number(formData.get('price')),
      stock: Number(formData.get('stock')),
      vendor: formData.get('vendor') as string,
    }

    try {
      const updatedProduct = await productAPI.update(editingProduct.id, payload)
      setProducts(prev =>
        prev.map(item => (item.id === updatedProduct.id ? updatedProduct : item))
      )
      handleCloseEditProduct()
      setSuccessMessage('Produto atualizado com sucesso!')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      console.error('Erro ao atualizar produto:', err)
    }
  }

  if (loading) {
    return <p>Carregando dados...</p>
  }

  return (
    <div style={{ padding: '24px' }}>
      <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Produtos</h2>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f3f4f6', textAlign: 'left' }}>
            <th style={{ padding: '8px' }}>Nome</th>
            <th style={{ padding: '8px' }}>Categoria</th>
            <th style={{ padding: '8px' }}>Preço</th>
            <th style={{ padding: '8px' }}>Estoque</th>
            <th style={{ padding: '8px' }}>Fornecedor</th>
            <th style={{ padding: '8px' }}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {products.map(prod => (
            <tr key={prod.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={{ padding: '8px' }}>{prod.name}</td>
              <td style={{ padding: '8px' }}>{prod.category}</td>
              <td style={{ padding: '8px' }}>
                {prod.price.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </td>
              <td style={{ padding: '8px' }}>{prod.stock}</td>
              <td style={{ padding: '8px' }}>{prod.vendor}</td>
              <td style={{ padding: '8px' }}>
                <button
                  onClick={() => handleEditProduct(prod)}
                  style={{
                    backgroundColor: '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    cursor: 'pointer',
                  }}
                >
                  Editar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editingProduct && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.3)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <form
            onSubmit={handleSubmitProductEdit}
            style={{
              background: 'white',
              padding: '24px',
              borderRadius: '12px',
              width: '400px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            }}
          >
            <h3 style={{ marginBottom: '16px' }}>Editar Produto</h3>
            <div style={{ marginBottom: '12px' }}>
              <label>Nome:</label>
              <input
                name="name"
                defaultValue={editingProduct.name}
                style={{ width: '100%', padding: '8px' }}
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label>Preço:</label>
              <input
                name="price"
                type="number"
                step="0.01"
                defaultValue={editingProduct.price}
                style={{ width: '100%', padding: '8px' }}
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label>Estoque:</label>
              <input
                name="stock"
                type="number"
                defaultValue={editingProduct.stock}
                style={{ width: '100%', padding: '8px' }}
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label>Fornecedor:</label>
              <input
                name="vendor"
                defaultValue={editingProduct.vendor}
                style={{ width: '100%', padding: '8px' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                onClick={handleCloseEditProduct}
                style={{
                  backgroundColor: '#9ca3af',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                style={{
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  cursor: 'pointer',
                }}
              >
                Salvar
              </button>
            </div>
          </form>
        </div>
      )}

      {successMessage && (
        <SuccessMessage message={successMessage} onClose={() => setSuccessMessage(null)} />
      )}
    </div>
  )
}
