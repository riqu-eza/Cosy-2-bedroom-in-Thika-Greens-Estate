/* eslint-disable react/prop-types */

const Input = ({ 
  placeholder = '', 
  type = 'text', 
  value = '', 
  onChange, 
  name = '', 
  required = false, 
  disabled = false, 
  className = '', 
  ...rest 
}) => {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      name={name}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      className={`input-field ${className}`}  // you can style `input-field` globally
      {...rest}  // any other props passed to the component
    />
  );
};

export default Input;
