export const AdminView = () => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Panel de Administración</h2>
      <p className="text-gray-600 mb-6">
        Bienvenido a la vista de Administrador. Aquí puedes editar, quitar y agregar recursos.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border border-blue-200 bg-blue-50 rounded p-4">
          <h3 className="font-medium text-blue-800">Gestionar Usuarios</h3>
          <p className="text-sm text-blue-600 mt-2">Agregar, editar o eliminar usuarios del sistema.</p>
          <button className="mt-3 text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Ir a Usuarios</button>
        </div>
        
        <div className="border border-green-200 bg-green-50 rounded p-4">
          <h3 className="font-medium text-green-800">Reportes Financieros</h3>
          <p className="text-sm text-green-600 mt-2">Ver balances generales y reportes de estado.</p>
          <button className="mt-3 text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">Ver Reportes</button>
        </div>
      </div>
    </div>
  );
};
