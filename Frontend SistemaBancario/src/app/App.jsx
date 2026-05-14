import { Toaster } from 'react-hot-toast';
import { AppRouter } from './router/AppRouter';

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4200,
          style: {
            background: 'rgba(8, 10, 20, 0.96)',
            border: '1px solid rgba(240, 205, 97, 0.28)',
            borderRadius: '14px',
            boxShadow: '0 18px 54px rgba(0, 0, 0, 0.34)',
            color: '#fff8e7',
            fontWeight: 700,
          },
          success: {
            iconTheme: {
              primary: '#5ee4a8',
              secondary: '#07140f',
            },
          },
          error: {
            iconTheme: {
              primary: '#fb7185',
              secondary: '#1f0a10',
            },
          },
        }}
      />
      <AppRouter />
    </>
  );
}

export default App;
