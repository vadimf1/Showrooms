import { CarStatus } from '../../features/cars/model/car.types';

const LABELS: Record<CarStatus, string> = {
  AVAILABLE: 'В наличии',
  SOLD: 'Продан',
  RESERVED: 'Зарезервирован',
};

type Props = { status: CarStatus };

const StatusBadge = ({ status }: Props) => (
  <span className={`badge badge-${status.toLowerCase()}`}>
    {LABELS[status]}
  </span>
);

export default StatusBadge;
