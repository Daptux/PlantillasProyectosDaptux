// Botón reutilizable con variantes
export default function Button({ variant = 'primary', as = 'button', className = '', children, ...props }) {
  const variants = {
    primary: 'btn-primary',
    accent: 'btn-accent',
    outline: 'btn-outline',
    ghost: 'btn-ghost',
    danger: 'btn bg-red-600 text-white hover:bg-red-700',
  };
  const cls = `${variants[variant] || variants.primary} ${className}`;
  const Tag = as;
  return (
    <Tag className={cls} {...props}>
      {children}
    </Tag>
  );
}
