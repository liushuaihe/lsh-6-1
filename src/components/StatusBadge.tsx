import { getAchievementStatusLabel, getStatusColor } from '../utils/format.js';
import type { AchievementStatus } from '../../shared/types.js';

interface StatusBadgeProps {
  status: AchievementStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
      {getAchievementStatusLabel(status)}
    </span>
  );
}
