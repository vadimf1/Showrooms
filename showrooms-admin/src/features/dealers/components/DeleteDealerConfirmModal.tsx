import { useState } from 'react';
import { deleteDealer } from '../api/dealers.api';
import { DealerFull } from '../model/dealer.types';

const ITrash = () => <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>;

type Props = { dealer: DealerFull; onClose: () => void; onDeleted: () => void };

export default function DeleteDealerConfirmModal({ dealer, onClose, onDeleted }: Props) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError]       = useState('');

  const handleDelete = async () => {
    setDeleting(true);
    setError('');
    try {
      await deleteDealer(dealer.id);
      onDeleted();
    } catch {
      setError('Не удалось удалить дилера');
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
          <h3>Удалить дилера?</h3>
          <p className="delete-desc"><b>{dealer.name}</b></p>
          {dealer.city && <p className="delete-vin">{dealer.city}</p>}
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
