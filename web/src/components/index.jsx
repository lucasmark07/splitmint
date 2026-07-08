// Button Component with glassmorphism
export function Button({ children, variant = 'primary', size = 'md', ...props }) {
  const baseStyles = 'font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-md border border-opacity-20';
  
  const variants = {
    primary: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 shadow-lg hover:shadow-xl border-emerald-300 active:scale-95',
    secondary: 'bg-white bg-opacity-10 text-white hover:bg-opacity-20 shadow-lg border-white active:scale-95',
    danger: 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600 shadow-lg border-red-300 active:scale-95',
    outline: 'border-2 border-emerald-500 text-emerald-400 hover:bg-emerald-500 hover:bg-opacity-10 active:scale-95',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${sizes[size]}`} {...props}>
      {children}
    </button>
  );
}

// Card Component with glassmorphism
export function Card({ children, className = '' }) {
  return (
    <div className={`bg-white bg-opacity-10 backdrop-blur-xl rounded-2xl p-6 border border-white border-opacity-20 shadow-xl hover:shadow-2xl transition-shadow ${className}`}>
      {children}
    </div>
  );
}

// Modal Component
export function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-3xl leading-none transition-colors"
          >
            ×
          </button>
        </div>
        {children}
      </Card>
    </div>
  );
}

// Input Component with glassmorphism
export function Input({ label, ...props }) {
  return (
    <div className="mb-4">
      {label && <label className="block text-sm font-semibold text-gray-200 mb-2.5">{label}</label>}
      <input
        className="w-full bg-white bg-opacity-10 backdrop-blur-md border border-white border-opacity-20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-emerald-400 focus:border-opacity-50 focus:ring-2 focus:ring-emerald-400 focus:ring-opacity-20 transition-all"
        {...props}
      />
    </div>
  );
}

// Badge Component
export function Badge({ children, variant = 'primary' }) {
  const variants = {
    primary: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white',
    secondary: 'bg-white bg-opacity-10 text-gray-100 border border-white border-opacity-20',
    danger: 'bg-gradient-to-r from-red-500 to-pink-500 text-white',
    success: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white',
  };

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${variants[variant]}`}>
      {children}
    </span>
  );
}

// Tab Button Component
export function TabButton({ isActive, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-3 font-semibold border-b-2 transition-all duration-300 ${
        isActive
          ? 'border-emerald-500 text-emerald-400'
          : 'border-transparent text-gray-400 hover:text-gray-200'
      }`}
    >
      {children}
    </button>
  );
}

// Chip Component
export function Chip({ label, onRemove, variant = 'primary' }) {
  const variants = {
    primary: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white',
    secondary: 'bg-white bg-opacity-10 text-white border border-white border-opacity-20',
  };

  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${variants[variant]} backdrop-blur-md`}>
      {label}
      {onRemove && (
        <button
          onClick={onRemove}
          className="hover:opacity-70 transition-opacity ml-1"
        >
          ×
        </button>
      )}
    </div>
  );
}
