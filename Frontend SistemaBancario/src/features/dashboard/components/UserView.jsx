export const UserView = () => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Mi Cuenta</h2>
      <p className="text-gray-600 mb-6">
        Bienvenido a la vista de Usuario. Aquí puedes hacer tus transacciones y ver tu saldo.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border border-gray-200 rounded p-4">
          <h3 className="font-medium text-gray-800">Saldo Actual</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">Q. 2,500.00</p>
        </div>
        
        <div className="border border-gray-200 rounded p-4">
          <h3 className="font-medium text-gray-800">Acciones Rápidas</h3>
          <div className="flex gap-2 mt-3">
            <button className="text-sm bg-gray-100 border border-gray-300 text-gray-700 px-3 py-1 rounded hover:bg-gray-200">Transferir</button>
            <button className="text-sm bg-gray-100 border border-gray-300 text-gray-700 px-3 py-1 rounded hover:bg-gray-200">Pagar Servicios</button>
          </div>
        </div>
      </div>
    </div>
  );
};
