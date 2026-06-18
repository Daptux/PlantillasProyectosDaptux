import Modal from './Modal';

// Modal de confirmación reutilizable (reemplaza window.confirm)
export default function ConfirmModal({
  title = 'Confirmar acción',
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  danger = true,
  onConfirm,
  onClose
}) {
  return (
    <Modal title={title} onClose={onClose}>
      <p style={{ color: 'var(--muted)', lineHeight: 1.6 }}>{message}</p>
      <div className="modal-actions">
        <button className="btn btn-light" onClick={onClose}>{cancelText}</button>
        <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm}>{confirmText}</button>
      </div>
    </Modal>
  );
}
