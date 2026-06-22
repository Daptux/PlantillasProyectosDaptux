export default function Loader({ fullScreen = false, label = 'Cargando...' }) {
  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-neutral-200 border-t-ink" />
      <span className="text-sm text-neutral-500">{label}</span>
    </div>
  );
  if (fullScreen) {
    return <div className="flex min-h-screen items-center justify-center">{spinner}</div>;
  }
  return <div className="flex w-full justify-center py-16">{spinner}</div>;
}
