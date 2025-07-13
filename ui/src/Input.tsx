interface InputProps {
  placeholder: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

export function Input({ placeholder, type, value, onChange, className = "" }: InputProps) {
  return (
    <div className="p-2 m-2">
      <input
        className={`w-full p-2 border rounded bg-transparent text-white placeholder-white outline-none ${className}`}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}
