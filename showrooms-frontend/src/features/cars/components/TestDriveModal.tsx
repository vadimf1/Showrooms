import { useState } from "react";
import { postTestDriveRequest } from "../api/cars.api";
import { useAuth } from "../../auth/context/AuthContext";

type Props = {
  showroomId: string;
  showroomName: string;
  showroomCity: string;
  showroomAddress: string;
  carModelId?: string;
  carModelInfo: string;
  colorName: string;
  colorHex: string;
  bodyStyle?: string;
  engineHp?: number | null;
  fuelType?: string;
  transmissionType?: string;
  driveType?: string;
  onClose: () => void;
  onSuccess: () => void;
};

const IClose = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="m6 6 12 12M18 6 6 18"/>
  </svg>
);

const TestDriveModal = ({
  showroomId, showroomName, showroomCity, showroomAddress,
  carModelId, carModelInfo, colorName, colorHex,
  bodyStyle, engineHp, fuelType, transmissionType, driveType,
  onClose, onSuccess,
}: Props) => {
  const { user } = useAuth();

  const defaultName = user
    ? [user.first_name, user.last_name].filter(Boolean).join(' ')
    : '';

  const [name, setName] = useState(defaultName);
  const rawPhone = user?.phone ?? '';
  const [phone, setPhone] = useState(rawPhone && !rawPhone.startsWith('+') ? `+${rawPhone}` : rawPhone);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Укажите имя";
    if (!/^\+?[\d\s()\-]{10,}$/.test(phone)) e.phone = "Неверный формат телефона";
    return e;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    try {
      await postTestDriveRequest(
        {
          showroom_id: showroomId,
          car_model_id: carModelId,
          car_model_info: carModelInfo,
          color_name: colorName,
          color_hex: colorHex,
          body_style: bodyStyle,
          engine_hp: engineHp ?? undefined,
          fuel_type: fuelType,
          transmission_type: transmissionType,
          drive_type: driveType,
          name,
          phone,
        },
      );
      onSuccess();
    } catch {
      setErrors({ submit: "Ошибка отправки. Попробуйте ещё раз." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-bd" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <div className="modal-head">
          <h3>Записаться на тест-драйв</h3>
          <button className="modal-close" onClick={onClose}><IClose /></button>
        </div>

        <div className="modal-subtitle">
          <div className="ph" style={{
            background: colorHex !== "#cccccc"
              ? `linear-gradient(160deg, ${colorHex}55 0%, ${colorHex}99 100%)`
              : "linear-gradient(160deg, #e3e6ea 0%, #b6bcc6 100%)",
            position: "relative", overflow: "hidden"
          }}>
            <div className="ph-stripes" />
          </div>
          <div className="info">
            <div className="t">{carModelInfo}</div>
            <div className="p">{colorName}</div>
          </div>
        </div>

        <form className="modal-form" onSubmit={submit} noValidate>
          <div className="field">
            <label>Имя</label>
            <input
              value={name}
              onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: "" })); }}
              placeholder="Иван Петров"
            />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>
          <div className="field">
            <label>Телефон</label>
            <input
              type="tel"
              value={phone}
              onChange={e => { setPhone(e.target.value); setErrors(p => ({ ...p, phone: "" })); }}
              placeholder="+7 (999) 123-45-67"
            />
            {errors.phone && <span className="field-error">{errors.phone}</span>}
          </div>
          <div className="form-note">
            <strong>{showroomName}</strong>
            {showroomCity && ` · ${showroomCity}`}
            {showroomAddress && <><br />{showroomAddress}</>}
            <br />Менеджер свяжется для подтверждения времени.
          </div>
          {!user && (
            <div className="field-error" style={{ textAlign: "center" }}>
              Для записи на тест-драйв необходимо войти в аккаунт
            </div>
          )}
          {errors.submit && <div className="field-error" style={{ textAlign: "center" }}>{errors.submit}</div>}
        </form>

        <div className="modal-actions">
          <button className="btn btn-outline btn-lg btn-block" onClick={onClose}>Отмена</button>
          <button className="btn btn-dark btn-lg btn-block" onClick={submit} disabled={submitting || !user}>
            {submitting ? "Отправляем…" : "Записаться"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestDriveModal;
