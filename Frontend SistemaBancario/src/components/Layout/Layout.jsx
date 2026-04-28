import Header from './Header';
import './Layout.css';

const Layout = ({ children }) => {
    return (
        <div className="layout">
            <Header />
            <main className="layout-content">
                <div className="content-wrapper">
                    {children}
                </div>
            </main>
            <footer className="layout-footer">
                <div className="footer-content">
                    <p>&copy; 2026 Sistema Bancario. Todos los derechos reservados.</p>
                </div>
            </footer>
        </div>
    );
};

export default Layout;