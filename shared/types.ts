export type UserRole = 'student' | 'advisor' | 'admin';
export type AchievementType = 'paper' | 'patent' | 'project';
export type AchievementStatus = 'draft' | 'pending' | 'approved' | 'rejected';
export type MemberRole = 'first_author' | 'corresponding_author' | 'co_author' | 'principal' | 'participant';
export type PatentType = 'invention' | 'utility' | 'design';
export type PatentStatus = 'applied' | 'granted';
export type ProjectLevel = 'national' | 'provincial' | 'city' | 'school' | 'enterprise';
export type ProjectStatus = 'ongoing' | 'completed';
export type ReviewAction = 'submitted' | 'approved' | 'rejected';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  email: string;
  studentId?: string;
  title?: string;
  department: string;
  createdAt: string;
  isActive: boolean;
}

export interface AchievementMember {
  id: string;
  userId: string;
  userName: string;
  role: MemberRole;
  order: number;
}

export interface Attachment {
  id: string;
  achievementId: string;
  fileName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  createdAt: string;
}

export interface ReviewLog {
  id: string;
  achievementId: string;
  reviewerId: string;
  reviewerName: string;
  action: ReviewAction;
  comment: string;
  createdAt: string;
}

export interface Achievement {
  id: string;
  type: AchievementType;
  title: string;
  status: AchievementStatus;
  submitterId: string;
  submitterName: string;
  members: AchievementMember[];
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  approvedAt?: string;
  reviewComment?: string;
  reviewedBy?: string;
  reviewedByName?: string;
  paperJournal?: string;
  paperVolume?: string;
  paperIssue?: string;
  paperPages?: string;
  paperDoi?: string;
  paperCitation?: string;
  publicationDate?: string;
  patentNumber?: string;
  patentType?: PatentType;
  patentApplicationDate?: string;
  patentGrantDate?: string;
  patentStatus?: PatentStatus;
  projectNumber?: string;
  projectSource?: string;
  projectLevel?: ProjectLevel;
  projectStartDate?: string;
  projectEndDate?: string;
  projectFunding?: number;
  projectStatus?: ProjectStatus;
  attachments?: Attachment[];
  reviewLogs?: ReviewLog[];
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  name: string;
  role: UserRole;
  email: string;
  studentId?: string;
  title?: string;
  department: string;
}

export interface UpdateUserRequest {
  name?: string;
  role?: UserRole;
  email?: string;
  studentId?: string;
  title?: string;
  department?: string;
  isActive?: boolean;
}

export interface CreateAchievementRequest {
  type: AchievementType;
  title: string;
  members: Omit<AchievementMember, 'id'>[];
  paperJournal?: string;
  paperVolume?: string;
  paperIssue?: string;
  paperPages?: string;
  paperDoi?: string;
  paperCitation?: string;
  publicationDate?: string;
  patentNumber?: string;
  patentType?: PatentType;
  patentApplicationDate?: string;
  patentGrantDate?: string;
  patentStatus?: PatentStatus;
  projectNumber?: string;
  projectSource?: string;
  projectLevel?: ProjectLevel;
  projectStartDate?: string;
  projectEndDate?: string;
  projectFunding?: number;
  projectStatus?: ProjectStatus;
}

export interface UpdateAchievementRequest {
  title?: string;
  members?: Omit<AchievementMember, 'id'>[];
  paperJournal?: string;
  paperVolume?: string;
  paperIssue?: string;
  paperPages?: string;
  paperDoi?: string;
  paperCitation?: string;
  publicationDate?: string;
  patentNumber?: string;
  patentType?: PatentType;
  patentApplicationDate?: string;
  patentGrantDate?: string;
  patentStatus?: PatentStatus;
  projectNumber?: string;
  projectSource?: string;
  projectLevel?: ProjectLevel;
  projectStartDate?: string;
  projectEndDate?: string;
  projectFunding?: number;
  projectStatus?: ProjectStatus;
}

export interface ReviewRequest {
  status: 'approved' | 'rejected';
  comment: string;
}

export interface AchievementQuery {
  type?: AchievementType;
  status?: AchievementStatus;
  userId?: string;
  keyword?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface YearlyStatistics {
  year: number;
  paperCount: number;
  patentCount: number;
  projectCount: number;
  totalCount: number;
}

export interface MemberStatistics {
  userId: string;
  userName: string;
  paperCount: number;
  patentCount: number;
  projectCount: number;
  totalCount: number;
}

export interface TypeStatistics {
  type: AchievementType;
  count: number;
  label: string;
}

export interface StatisticsQuery {
  startYear?: number;
  endYear?: number;
  userId?: string;
  type?: AchievementType;
}

export const MEMBER_ROLE_LABELS: Record<MemberRole, string> = {
  first_author: '第一作者',
  corresponding_author: '通讯作者',
  co_author: '合作作者',
  principal: '负责人',
  participant: '参与人'
};

export const ACHIEVEMENT_TYPE_LABELS: Record<AchievementType, string> = {
  paper: '论文',
  patent: '专利',
  project: '项目'
};

export const ACHIEVEMENT_STATUS_LABELS: Record<AchievementStatus, string> = {
  draft: '草稿',
  pending: '待审核',
  approved: '已归档',
  rejected: '已退回'
};

export const PATENT_TYPE_LABELS: Record<PatentType, string> = {
  invention: '发明专利',
  utility: '实用新型',
  design: '外观设计'
};

export const PATENT_STATUS_LABELS: Record<PatentStatus, string> = {
  applied: '申请中',
  granted: '已授权'
};

export const PROJECT_LEVEL_LABELS: Record<ProjectLevel, string> = {
  national: '国家级',
  provincial: '省部级',
  city: '市厅级',
  school: '校级',
  enterprise: '横向项目'
};

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  ongoing: '进行中',
  completed: '已完成'
};

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  student: '学生',
  advisor: '导师',
  admin: '管理员'
};
