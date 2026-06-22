import { IoCheckmarkCircle, IoWarning, IoInformationCircle, IoCloseCircle } from 'react-icons/io5';

const styles = {
  success: { cls: 'bg-emerald-50 text-emerald-800 border-emerald-200', Icon: IoCheckmarkCircle },
  error:   { cls: 'bg-red-50 text-red-800 border-red-200', Icon: IoCloseCircle },
  warning: { cls: 'bg-amber-50 text-amber-800 border-amber-200', Icon: IoWarning },
  info:    { cls: 'bg-blue-50 text-blue-800 border-blue-200', Icon: IoInformationCircle },
};

export default function Alert({ type = 'info', children, className = '' }) {
  if (!children) return null;
  const { cls, Icon } = styles[type] || styles.info;
  return (
    <div className={`flex items-start gap-2 rounded-lg border px-4 py-3 text-sm ${cls} ${className}`}>
      <Icon className="mt-0.5 shrink-0" size={18} />
      <div>{children}</div>
    </div>
  );
}
