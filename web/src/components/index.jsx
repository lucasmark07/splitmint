export function Button({ children, variant = 'primary', size = 'md', ...props }) {
  const baseStyles = 'font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-primary-500 text-black hover:bg-primary-600 active:bg-primary-700',
    secondary: 'bg-gray-700 text-white hover:bg-gray-600 active:bg-gray-800',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
    outline: 'border-2 border-primary-500 text-primary-400 hover:bg-primary-500 hover:text-black',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${sizes[size]}`} {...props}>
      {children}
    </button>
  );
}

export function Card({ children, className = '' }) {
  return (
    <div className={`bg-card border border-border rounded-lg p-6 ${className}`}>
      {children}
    </div>
  );
}

export function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl leading-none"
          >
            ×
          </button>
        </div>
        {children}
      </Card>
    </div>
  );
}

export function Input({ label, ...props }) {
  return (
    <div className="mb-4">
      {label && <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>}
      <input
        className="w-full bg-gray-800 border border-border rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
        {...props}
      />
    </div>
  );
}

export function Chip({ label, onRemove, variant = 'primary' }) {
  const variants = {
    primary: 'bg-primary-500 text-black',
    secondary: 'bg-gray-700 text-white',
  };

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${variants[variant]}`}>
      {label}
      {onRemove && (
        <button
          onClick={onRemove}
          className="hover:opacity-70 transition-opacity"
        >
          ×
        </button>
      )}
    </div>
  );
}

export function Badge({ children, variant = 'primary' }) {
  const variants = {
    primary: 'bg-primary-600 text-black',
    secondary: 'bg-gray-700 text-gray-100',
    danger: 'bg-red-600 text-white',
    success: 'bg-green-600 text-white',
  };

  return (
    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${variants[variant]}`}>
      {children}
    </span>
  );
}

export function TabButton({ isActive, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 font-medium border-b-2 transition-colors ${
        isActive
          ? 'border-primary-500 text-primary-400'
          : 'border-transparent text-gray-400 hover:text-gray-200'
      }`}
    >
      {children}
    </button>
  );
}
