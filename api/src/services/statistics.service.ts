import { db } from '../data/database.js';
import { ACHIEVEMENT_TYPE_LABELS } from '../../../shared/types.js';
import type { 
  Achievement, 
  YearlyStatistics, 
  MemberStatistics, 
  TypeStatistics,
  StatisticsQuery 
} from '../../../shared/types.js';

export class StatisticsService {
  getYearlyStatistics(query: StatisticsQuery): YearlyStatistics[] {
    const achievements = this.filterAchievements(query);
    const yearMap = new Map<number, YearlyStatistics>();

    const currentYear = new Date().getFullYear();
    const startYear = query.startYear || currentYear - 5;
    const endYear = query.endYear || currentYear;

    for (let year = startYear; year <= endYear; year++) {
      yearMap.set(year, {
        year,
        paperCount: 0,
        patentCount: 0,
        projectCount: 0,
        totalCount: 0
      });
    }

    achievements.forEach(a => {
      const dateStr = a.publicationDate || a.patentApplicationDate || a.projectStartDate || a.createdAt;
      const year = new Date(dateStr).getFullYear();
      
      if (year >= startYear && year <= endYear) {
        const stats = yearMap.get(year) || {
          year,
          paperCount: 0,
          patentCount: 0,
          projectCount: 0,
          totalCount: 0
        };
        
        if (a.type === 'paper') stats.paperCount++;
        if (a.type === 'patent') stats.patentCount++;
        if (a.type === 'project') stats.projectCount++;
        stats.totalCount++;
        
        yearMap.set(year, stats);
      }
    });

    return Array.from(yearMap.values()).sort((a, b) => a.year - b.year);
  }

  getMemberStatistics(query: StatisticsQuery): MemberStatistics[] {
    const achievements = this.filterAchievements(query);
    const memberMap = new Map<string, MemberStatistics>();

    achievements.forEach(a => {
      a.members.forEach(member => {
        if (query.userId && member.userId !== query.userId) return;
        
        const stats = memberMap.get(member.userId) || {
          userId: member.userId,
          userName: member.userName,
          paperCount: 0,
          patentCount: 0,
          projectCount: 0,
          totalCount: 0
        };
        
        if (a.type === 'paper') stats.paperCount++;
        if (a.type === 'patent') stats.patentCount++;
        if (a.type === 'project') stats.projectCount++;
        stats.totalCount++;
        
        memberMap.set(member.userId, stats);
      });
    });

    return Array.from(memberMap.values()).sort((a, b) => b.totalCount - a.totalCount);
  }

  getTypeStatistics(query: StatisticsQuery): TypeStatistics[] {
    const achievements = this.filterAchievements(query);
    const typeMap = new Map<string, TypeStatistics>();

    achievements.forEach(a => {
      const stats = typeMap.get(a.type) || {
        type: a.type,
        count: 0,
        label: ACHIEVEMENT_TYPE_LABELS[a.type]
      };
      stats.count++;
      typeMap.set(a.type, stats);
    });

    return Array.from(typeMap.values());
  }

  getDashboardStats() {
    const all = db.achievements.findAll();
    const approved = all.filter(a => a.status === 'approved');
    
    const currentYear = new Date().getFullYear();
    const lastYear = currentYear - 1;

    const getYearCount = (year: number) => 
      approved.filter(a => {
        const dateStr = a.publicationDate || a.patentApplicationDate || a.projectStartDate || a.createdAt;
        return new Date(dateStr).getFullYear() === year;
      }).length;

    const currentYearCount = getYearCount(currentYear);
    const lastYearCount = getYearCount(lastYear);
    const growthRate = lastYearCount > 0 
      ? Math.round(((currentYearCount - lastYearCount) / lastYearCount) * 100) 
      : currentYearCount > 0 ? 100 : 0;

    return {
      totalApproved: approved.length,
      pendingReview: all.filter(a => a.status === 'pending').length,
      currentYearCount,
      growthRate,
      paperCount: approved.filter(a => a.type === 'paper').length,
      patentCount: approved.filter(a => a.type === 'patent').length,
      projectCount: approved.filter(a => a.type === 'project').length
    };
  }

  private filterAchievements(query: StatisticsQuery): Achievement[] {
    let achievements = db.achievements.findAll().filter(a => a.status === 'approved');

    if (query.type) {
      achievements = achievements.filter(a => a.type === query.type);
    }

    if (query.userId) {
      achievements = achievements.filter(a => 
        a.members.some(m => m.userId === query.userId)
      );
    }

    if (query.startYear) {
      achievements = achievements.filter(a => {
        const dateStr = a.publicationDate || a.patentApplicationDate || a.projectStartDate || a.createdAt;
        return new Date(dateStr).getFullYear() >= query.startYear!;
      });
    }

    if (query.endYear) {
      achievements = achievements.filter(a => {
        const dateStr = a.publicationDate || a.patentGrantDate || a.projectEndDate || a.createdAt;
        return new Date(dateStr).getFullYear() <= query.endYear!;
      });
    }

    return achievements;
  }
}

export const statisticsService = new StatisticsService();
