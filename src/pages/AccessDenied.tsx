import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const AccessDenied: React.FC = () => {
  const navigate = useNavigate()

  useEffect(() => {
    // Verifica se o usuário existe e se é admin
    const userData = localStorage.getItem('user')
    if (!userData) {
      // Se não há login, redireciona direto
      navigate('/login')
      return
    }

    const user = JSON.parse(userData)
    if (user.role !== 'admin') {
      // Se o usuário não for admin, força logout e redireciona
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      navigate('/login')
    }
  }, [navigate])

  return (
    <div
      className="access-wrapper"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0f172a',
        color: '#e2e8f0',
        padding: 24,
        textAlign: 'center'
      }}
    >
      <div className="access-card" style={{ maxWidth: 480 }}>
        <p
          style={{
            opacity: 0.7,
            letterSpacing: 2,
            textTransform: 'uppercase',
            fontSize: 12
          }}
        >
          Área restrita
        </p>
        <h1>Backoffice exclusivo para administradores</h1>
        <p style={{ lineHeight: 1.6 }}>
          Seu usuário está identificado como cliente. Para continuar usando a plataforma, acesse o portal do cliente
          ou entre em contato com o suporte para solicitar permissão de administrador.
        </p>
        <a
          href="/login"
          style={{
            display: 'inline-block',
            marginTop: 24,
            padding: '12px 24px',
            borderRadius: 999,
            background: '#2563eb',
            color: '#fff',
            textDecoration: 'none'
          }}
        >
          Voltar para o login
        </a>
      </div>
    </div>
  )
}

export default AccessDenied
