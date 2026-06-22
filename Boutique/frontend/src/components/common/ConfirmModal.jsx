import Modal from './Modal.jsx';
import Button from './Button.jsx';

export default function ConfirmModal({ open, onClose, onConfirm, title = '¿Estás seguro?', message, confirmText = 'Confirmar', danger = true }) {
  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth="max-w-md">
      <p className="text-sm text-neutral-600">{message}</p>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>{confirmText}</Button>
      </div>
    </Modal>
  );
}
