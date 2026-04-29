import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        setIsMenuOpen(false);
    };

    const handleNavigation = (path) => {
        navigate(path);
        setIsMenuOpen(false);
    };

    return (
        <header className="header">
            <div className="header-container">
                {/* Logo */}
                <Link to="/dashboard" className="header-logo">
                    <span className="logo-icon">🏦</span>
                    <span className="logo-text">SistemaBancario</span>
                </Link>

                {/* Navigation - Desktop */}
                <nav className="header-nav desktop-nav">
                    <Link to="/dashboard" className="nav-link">Dashboard</Link>
                    <Link to="/accounts" className="nav-link">Cuentas</Link>
                    <Link to="/transactions" className="nav-link">Transacciones</Link>
                    <Link to="/cards" className="nav-link">Tarjetas</Link>
                    <Link to="/loans" className="nav-link">Préstamos</Link>
                </nav>

                {/* User Menu */}
                <div className="header-user">
                    {user ? (
                        <div className="user-menu">
                            <span className="user-avatar">{user.username?.charAt(0).toUpperCase() || 'U'}</span>
                            <div className="user-info">
                                <p className="user-name">{user.username || 'Usuario'}</p>
                                <p className="user-email">{user.email}</p>
                            </div>
                            <button
                                className="user-menu-btn"
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                aria-label="Menú de usuario"
                            >
                                ▼
                            </button>

                            {/* Dropdown Menu */}
                            {isMenuOpen && (
                                <div className="dropdown-menu">
                                    <Link to="/profile" className="dropdown-item" onClick={() => setIsMenuOpen(false)}>
                                        👤 Perfil
                                    </Link>
                                    <Link to="/statements" className="dropdown-item" onClick={() => setIsMenuOpen(false)}>
                                        📄 Extractos
                                    </Link>
                                    <hr className="dropdown-divider" />
                                    <button className="dropdown-item logout-btn" onClick={handleLogout}>
                                        🚪 Cerrar Sesión
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link to="/login" className="btn-login">Iniciar Sesión</Link>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <button className="mobile-menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    ☰
                </button>
            </div>

            {/* Mobile Navigation */}
            {isMenuOpen && (
                <nav className="mobile-nav">
                    <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="mobile-nav-link">Dashboard</Link>
                    <Link to="/accounts" onClick={() => setIsMenuOpen(false)} className="mobile-nav-link">Cuentas</Link>
                    <Link to="/transactions" onClick={() => setIsMenuOpen(false)} className="mobile-nav-link">Transacciones</Link>
                    <Link to="/cards" onClick={() => setIsMenuOpen(false)} className="mobile-nav-link">Tarjetas</Link>
                    <Link to="/loans" onClick={() => setIsMenuOpen(false)} className="mobile-nav-link">Préstamos</Link>
                    <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="mobile-nav-link">Perfil</Link>
                    <button className="mobile-nav-link logout-btn" onClick={handleLogout}>🚪 Cerrar Sesión</button>
                </nav>
            )}
        </header>
    );
};

export default Header;