import Header from './Header';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#f5f5f5] text-slate-900">
      <Header />
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="min-h-[calc(100vh-156px)]">{children}</div>
      </main>
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 text-sm text-slate-500 sm:px-6 lg:px-8">
          <p>&copy; 2026 Sistema Bancario. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
