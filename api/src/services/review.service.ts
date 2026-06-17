import { db } from '../data/database.js';
import type { Achievement, ReviewRequest, ReviewLog } from '../../../shared/types.js';

export class ReviewService {
  getPendingAchievements(): Achievement[] {
    return db.achievements.findAll()
      .filter(a => a.status === 'pending')
      .sort((a, b) => new Date(b.submittedAt || b.createdAt).getTime() - new Date(a.submittedAt || a.createdAt).getTime())
      .map(a => ({
        ...a,
        reviewLogs: db.reviewLogs.findByAchievementId(a.id)
      }));
  }

  getReviewHistory(achievementId: string): ReviewLog[] {
    return db.reviewLogs.findByAchievementId(achievementId);
  }

  reviewAchievement(
    achievementId: string,
    reviewData: ReviewRequest,
    reviewer: { id: string; name: string }
  ): Achievement | null {
    const achievement = db.achievements.findById(achievementId);
    if (!achievement || achievement.status !== 'pending') {
      return null;
    }

    db.reviewLogs.create({
      achievementId,
      reviewerId: reviewer.id,
      reviewerName: reviewer.name,
      action: reviewData.status,
      comment: reviewData.comment
    });

    const now = new Date().toISOString();
    return db.achievements.update(achievementId, {
      status: reviewData.status,
      reviewComment: reviewData.comment,
      reviewedBy: reviewer.id,
      reviewedByName: reviewer.name,
      ...(reviewData.status === 'approved' && { approvedAt: now })
    });
  }
}

export const reviewService = new ReviewService();
