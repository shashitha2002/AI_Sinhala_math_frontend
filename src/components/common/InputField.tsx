import React from 'react';

type InputFieldProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export const InputField: React.FC<InputFieldProps> = ({
  value,
  onChange,
  placeholder,
  className,
}) => {
  return (
    <input
      className={className}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  );
};

export default InputField;
