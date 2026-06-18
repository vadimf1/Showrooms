import { useState } from 'react';
import { deleteShowroom } from '../api/showrooms.api';
import { ShowroomFull } from '../model/showroom.types';

const ITrash = () => <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>;

type Props = { showroom: ShowroomFull; onClose: () => void; onDeleted: () => void };

export default function DeleteShowroomConfirmModal({ showroom, onClose, onDeleted }: Props) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError]       = useState('');

  const handleDelete = async () => {
    setDeleting(true);
    setError('');
    try {
      await deleteShowroom(showroom.id);
      onDeleted();
    } catch {
      setError('Не удалось удалить шоурум');
      setDeleting(false);
    }
  };

  return (
    <div className="modal-overlay" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 420 }}>

        <div className="delete-confirm-body">
          <div className="delete-icon-wrap">
            <ITrash />
          </div>
          <h3>Удалить шоурум?</h3>
          <p className="delete-desc">
            <b>{showroom.name}</b>
          </p>
          <p className="delete-vin">{showroom.address.city}, {showroom.address.street}</p>
          <p className="delete-warn">Это действие необратимо. Запись будет удалена из базы.</p>
        </div>

        {error && <div className="modal-error">{error}</div>}

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose} disabled={deleting}>Отмена</button>
          <button className="btn btn-danger-solid" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Удаление…' : 'Удалить'}
          </button>
        </div>

      </div>
    </div>
  );
}
