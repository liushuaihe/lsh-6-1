import { v4 as uuidv4 } from 'uuid';
import { db } from '../data/database.js';
import type { 
  Achievement, 
  CreateAchievementRequest, 
  UpdateAchievementRequest,
  AchievementQuery,
  PaginatedResponse,
  AchievementMember,
  User
} from '../../../shared/types.js';

export class AchievementService {
  getAchievements(
    query: AchievementQuery,
    currentUser: { id: string; role: string }
  ): PaginatedResponse<Achievement> {
    let allAchievements = db.achievements.findAll();

    if (currentUser.role === 'student') {
      allAchievements = allAchievements.filter(a => 
        a.submitterId === currentUser.id || 
        a.status === 'approved' ||
        a.members.some(m => m.userId === currentUser.id)
      );
    }

    if (query.type) {
      allAchievements = allAchievements.filter(a => a.type === query.type);
    }

    if (query.status) {
      allAchievements = allAchievements.filter(a => a.status === query.status);
    }

    if (query.userId) {
      allAchievements = allAchievements.filter(a => 
        a.submitterId === query.userId ||
        a.members.some(m => m.userId === query.userId)
      );
    }

    if (query.keyword) {
      const keyword = query.keyword.toLowerCase();
      allAchievements = allAchievements.filter(a => 
        a.title.toLowerCase().includes(keyword) ||
        a.paperJournal?.toLowerCase().includes(keyword) ||
        a.patentNumber?.toLowerCase().includes(keyword) ||
        a.projectNumber?.toLowerCase().includes(keyword) ||
        a.members.some(m => m.userName.toLowerCase().includes(keyword))
      );
    }

    if (query.startDate) {
      allAchievements = allAchievements.filter(a => {
        const date = a.publicationDate || a.patentApplicationDate || a.projectStartDate || a.createdAt;
        return date >= query.startDate!;
      });
    }

    if (query.endDate) {
      allAchievements = allAchievements.filter(a => {
        const date = a.publicationDate || a.patentGrantDate || a.projectEndDate || a.createdAt;
        return date <= query.endDate!;
      });
    }

    allAchievements.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    allAchievements = allAchievements.map(a => ({
      ...a,
      reviewLogs: db.reviewLogs.findByAchievementId(a.id),
      attachments: db.attachments.findByAchievementId(a.id)
    }));

    const page = query.page || 1;
    const pageSize = query.pageSize || 10;
    const total = allAchievements.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;
    const data = allAchievements.slice(startIndex, startIndex + pageSize);

    return { data, total, page, pageSize, totalPages };
  }

  getAchievementById(id: string, currentUser: { id: string; role: string }): Achievement | null {
    const achievement = db.achievements.findById(id);
    if (!achievement) return null;

    if (currentUser.role === 'student' && 
        achievement.submitterId !== currentUser.id && 
        achievement.status !== 'approved' &&
        !achievement.members.some(m => m.userId === currentUser.id)) {
      return null;
    }

    return {
      ...achievement,
      reviewLogs: db.reviewLogs.findByAchievementId(id),
      attachments: db.attachments.findByAchievementId(id)
    };
  }

  createAchievement(
    data: CreateAchievementRequest,
    submitter: User
  ): Achievement {
    const members: AchievementMember[] = data.members.map(m => ({
      ...m,
      id: uuidv4()
    }));

    return db.achievements.create({
      type: data.type,
      title: data.title,
      status: 'draft',
      submitterId: submitter.id,
      submitterName: submitter.name,
      members,
      paperJournal: data.paperJournal,
      paperVolume: data.paperVolume,
      paperIssue: data.paperIssue,
      paperPages: data.paperPages,
      paperDoi: data.paperDoi,
      paperCitation: data.paperCitation,
      publicationDate: data.publicationDate,
      patentNumber: data.patentNumber,
      patentType: data.patentType,
      patentApplicationDate: data.patentApplicationDate,
      patentGrantDate: data.patentGrantDate,
      patentStatus: data.patentStatus,
      projectNumber: data.projectNumber,
      projectSource: data.projectSource,
      projectLevel: data.projectLevel,
      projectStartDate: data.projectStartDate,
      projectEndDate: data.projectEndDate,
      projectFunding: data.projectFunding,
      projectStatus: data.projectStatus
    });
  }

  updateAchievement(
    id: string,
    data: UpdateAchievementRequest,
    currentUser: { id: string; role: string }
  ): Achievement | null {
    const achievement = db.achievements.findById(id);
    if (!achievement) return null;

    if (currentUser.role === 'student' && achievement.submitterId !== currentUser.id) {
      return null;
    }

    if (achievement.status === 'pending') {
      return null;
    }

    const members = data.members?.map(m => ({
      ...m,
      id: uuidv4()
    })) || achievement.members;

    return db.achievements.update(id, {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.members !== undefined && { members }),
      ...(data.paperJournal !== undefined && { paperJournal: data.paperJournal }),
      ...(data.paperVolume !== undefined && { paperVolume: data.paperVolume }),
      ...(data.paperIssue !== undefined && { paperIssue: data.paperIssue }),
      ...(data.paperPages !== undefined && { paperPages: data.paperPages }),
      ...(data.paperDoi !== undefined && { paperDoi: data.paperDoi }),
      ...(data.paperCitation !== undefined && { paperCitation: data.paperCitation }),
      ...(data.publicationDate !== undefined && { publicationDate: data.publicationDate }),
      ...(data.patentNumber !== undefined && { patentNumber: data.patentNumber }),
      ...(data.patentType !== undefined && { patentType: data.patentType }),
      ...(data.patentApplicationDate !== undefined && { patentApplicationDate: data.patentApplicationDate }),
      ...(data.patentGrantDate !== undefined && { patentGrantDate: data.patentGrantDate }),
      ...(data.patentStatus !== undefined && { patentStatus: data.patentStatus }),
      ...(data.projectNumber !== undefined && { projectNumber: data.projectNumber }),
      ...(data.projectSource !== undefined && { projectSource: data.projectSource }),
      ...(data.projectLevel !== undefined && { projectLevel: data.projectLevel }),
      ...(data.projectStartDate !== undefined && { projectStartDate: data.projectStartDate }),
      ...(data.projectEndDate !== undefined && { projectEndDate: data.projectEndDate }),
      ...(data.projectFunding !== undefined && { projectFunding: data.projectFunding }),
      ...(data.projectStatus !== undefined && { projectStatus: data.projectStatus }),
      ...(achievement.status === 'rejected' && { status: 'draft' })
    });
  }

  deleteAchievement(id: string, currentUser: { id: string; role: string }): boolean {
    const achievement = db.achievements.findById(id);
    if (!achievement) return false;

    if (currentUser.role === 'student' && achievement.submitterId !== currentUser.id) {
      return false;
    }

    if (achievement.status === 'pending') {
      return false;
    }

    return db.achievements.delete(id);
  }

  submitForReview(id: string, currentUser: { id: string; role: string }): Achievement | null {
    const achievement = db.achievements.findById(id);
    if (!achievement) return null;

    if (currentUser.role === 'student' && achievement.submitterId !== currentUser.id) {
      return null;
    }

    if (achievement.status !== 'draft' && achievement.status !== 'rejected') {
      return null;
    }

    const reviewer = db.users.findAll().find(u => u.role === 'advisor' || u.role === 'admin');

    db.reviewLogs.create({
      achievementId: id,
      reviewerId: currentUser.id,
      reviewerName: currentUser.role === 'student' ? 
        (db.users.findById(currentUser.id)?.name || '') : '',
      action: 'submitted',
      comment: '提交审核'
    });

    return db.achievements.update(id, {
      status: 'pending',
      submittedAt: new Date().toISOString(),
      reviewedBy: reviewer?.id
    });
  }

  getPendingCount(): number {
    return db.achievements.findAll().filter(a => a.status === 'pending').length;
  }

  getStats() {
    const all = db.achievements.findAll();
    return {
      total: all.length,
      pending: all.filter(a => a.status === 'pending').length,
      approved: all.filter(a => a.status === 'approved').length,
      rejected: all.filter(a => a.status === 'rejected').length,
      draft: all.filter(a => a.status === 'draft').length
    };
  }
}

export const achievementService = new AchievementService();
