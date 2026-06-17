import * as XLSX from 'xlsx';
import { db } from '../data/database.js';
import { 
  ACHIEVEMENT_TYPE_LABELS, 
  ACHIEVEMENT_STATUS_LABELS,
  MEMBER_ROLE_LABELS,
  PATENT_TYPE_LABELS,
  PATENT_STATUS_LABELS,
  PROJECT_LEVEL_LABELS,
  PROJECT_STATUS_LABELS
} from '../../../shared/types.js';
import type { Achievement, AchievementQuery } from '../../../shared/types.js';

export class ExportService {
  exportToExcel(query: AchievementQuery): Buffer {
    const achievements = this.getAchievementsForExport(query);
    
    const data = achievements.map(a => this.formatAchievementForExport(a));
    
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '科研成果清单');

    const colWidths = [
      { wch: 8 }, { wch: 30 }, { wch: 8 }, { wch: 20 },
      { wch: 30 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
      { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 40 }
    ];
    worksheet['!cols'] = colWidths;

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  private getAchievementsForExport(query: AchievementQuery): Achievement[] {
    let achievements = db.achievements.findAll().filter(a => a.status === 'approved');

    if (query.type) {
      achievements = achievements.filter(a => a.type === query.type);
    }

    if (query.userId) {
      achievements = achievements.filter(a => 
        a.submitterId === query.userId ||
        a.members.some(m => m.userId === query.userId)
      );
    }

    if (query.keyword) {
      const keyword = query.keyword.toLowerCase();
      achievements = achievements.filter(a => 
        a.title.toLowerCase().includes(keyword) ||
        a.members.some(m => m.userName.toLowerCase().includes(keyword))
      );
    }

    if (query.startDate) {
      achievements = achievements.filter(a => {
        const date = a.publicationDate || a.patentApplicationDate || a.projectStartDate || a.createdAt;
        return date >= query.startDate!;
      });
    }

    if (query.endDate) {
      achievements = achievements.filter(a => {
        const date = a.publicationDate || a.patentGrantDate || a.projectEndDate || a.createdAt;
        return date <= query.endDate!;
      });
    }

    return achievements.sort((a, b) => {
      const dateA = new Date(a.publicationDate || a.patentApplicationDate || a.projectStartDate || a.createdAt);
      const dateB = new Date(b.publicationDate || b.patentApplicationDate || b.projectStartDate || b.createdAt);
      return dateB.getTime() - dateA.getTime();
    });
  }

  private formatAchievementForExport(a: Achievement): Record<string, string | number> {
    const members = a.members
      .sort((m1, m2) => m1.order - m2.order)
      .map(m => `${m.userName}(${MEMBER_ROLE_LABELS[m.role]})`)
      .join('; ');

    const baseRecord: Record<string, string | number> = {
      '序号': 0,
      '成果名称': a.title,
      '成果类型': ACHIEVEMENT_TYPE_LABELS[a.type],
      '状态': ACHIEVEMENT_STATUS_LABELS[a.status],
      '参与成员': members,
      '提交人': a.submitterName,
      '提交时间': this.formatDate(a.submittedAt || a.createdAt),
      '审核时间': this.formatDate(a.approvedAt)
    };

    if (a.type === 'paper') {
      Object.assign(baseRecord, {
        '期刊/会议': a.paperJournal || '',
        '卷号': a.paperVolume || '',
        '期号': a.paperIssue || '',
        '页码': a.paperPages || '',
        'DOI': a.paperDoi || '',
        '发表日期': this.formatDate(a.publicationDate),
        '引用格式': a.paperCitation || ''
      });
    } else if (a.type === 'patent') {
      Object.assign(baseRecord, {
        '专利号': a.patentNumber || '',
        '专利类型': a.patentType ? PATENT_TYPE_LABELS[a.patentType] : '',
        '申请日期': this.formatDate(a.patentApplicationDate),
        '授权日期': this.formatDate(a.patentGrantDate),
        '法律状态': a.patentStatus ? PATENT_STATUS_LABELS[a.patentStatus] : ''
      });
    } else if (a.type === 'project') {
      Object.assign(baseRecord, {
        '项目编号': a.projectNumber || '',
        '项目来源': a.projectSource || '',
        '项目级别': a.projectLevel ? PROJECT_LEVEL_LABELS[a.projectLevel] : '',
        '开始日期': this.formatDate(a.projectStartDate),
        '结束日期': this.formatDate(a.projectEndDate),
        '经费(万元)': a.projectFunding || 0,
        '项目状态': a.projectStatus ? PROJECT_STATUS_LABELS[a.projectStatus] : ''
      });
    }

    return baseRecord;
  }

  private formatDate(dateStr?: string): string {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toISOString().split('T')[0];
    } catch {
      return dateStr;
    }
  }
}

export const exportService = new ExportService();
