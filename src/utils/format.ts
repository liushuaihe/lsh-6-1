import { 
  ACHIEVEMENT_TYPE_LABELS, 
  ACHIEVEMENT_STATUS_LABELS,
  MEMBER_ROLE_LABELS,
  PATENT_TYPE_LABELS,
  PATENT_STATUS_LABELS,
  PROJECT_LEVEL_LABELS,
  PROJECT_STATUS_LABELS,
  USER_ROLE_LABELS
} from '../../shared/types.js';
import type { 
  AchievementType, 
  AchievementStatus,
  MemberRole,
  PatentType,
  PatentStatus,
  ProjectLevel,
  ProjectStatus,
  UserRole
} from '../../shared/types.js';

export function formatDate(dateStr?: string): string {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr?: string): string {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateStr;
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getAchievementTypeLabel(type: AchievementType): string {
  return ACHIEVEMENT_TYPE_LABELS[type] || type;
}

export function getAchievementStatusLabel(status: AchievementStatus): string {
  return ACHIEVEMENT_STATUS_LABELS[status] || status;
}

export function getMemberRoleLabel(role: MemberRole): string {
  return MEMBER_ROLE_LABELS[role] || role;
}

export function getPatentTypeLabel(type?: PatentType): string {
  return type ? PATENT_TYPE_LABELS[type] : '-';
}

export function getPatentStatusLabel(status?: PatentStatus): string {
  return status ? PATENT_STATUS_LABELS[status] : '-';
}

export function getProjectLevelLabel(level?: ProjectLevel): string {
  return level ? PROJECT_LEVEL_LABELS[level] : '-';
}

export function getProjectStatusLabel(status?: ProjectStatus): string {
  return status ? PROJECT_STATUS_LABELS[status] : '-';
}

export function getUserRoleLabel(role: UserRole): string {
  return USER_ROLE_LABELS[role] || role;
}

export function getStatusColor(status: AchievementStatus): string {
  const colors: Record<AchievementStatus, string> = {
    draft: 'bg-slate-100 text-slate-700',
    pending: 'bg-amber-100 text-amber-700',
    approved: 'bg-emerald-100 text-emerald-700',
    rejected: 'bg-rose-100 text-rose-700'
  };
  return colors[status] || 'bg-slate-100 text-slate-700';
}

export function getRoleColor(role: UserRole): string {
  const colors: Record<UserRole, string> = {
    admin: 'bg-purple-100 text-purple-700',
    advisor: 'bg-blue-100 text-blue-700',
    student: 'bg-green-100 text-green-700'
  };
  return colors[role] || 'bg-slate-100 text-slate-700';
}

export function downloadFile(buffer: ArrayBuffer, filename: string): void {
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
