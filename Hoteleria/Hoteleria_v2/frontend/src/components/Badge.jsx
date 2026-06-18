import { badgeClass } from '../utils/helpers';

// Badge de estado reutilizable (color según el estado)
export default function Badge({ estado }) {
  return <span className={badgeClass(estado)}>{estado}</span>;
}
