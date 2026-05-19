const Header = () => {
  return (
    <header className="bg-white px-6 w-full h-16 shadow flex items-center justify-between text-gray-800">
      <div className="flex items-center">
        {/* Placeholder for left items if any */}
      </div>
      <div className="flex items-center space-x-4">
        <p className="font-medium">Bienvenido, <span className="text-blue-600">Usuario</span></p>
      </div>
    </header>
  );
};

export default Header;