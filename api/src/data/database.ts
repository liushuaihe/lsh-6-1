import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import type { User, Achievement, Attachment, ReviewLog } from '../../../shared/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '../../data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const ACHIEVEMENTS_FILE = path.join(DATA_DIR, 'achievements.json');
const ATTACHMENTS_FILE = path.join(DATA_DIR, 'attachments.json');
const REVIEW_LOGS_FILE = path.join(DATA_DIR, 'review_logs.json');

interface DataStore<T> {
  [key: string]: T;
}

let users: DataStore<User> = {};
let achievements: DataStore<Achievement> = {};
let attachments: DataStore<Attachment> = {};
let reviewLogs: DataStore<ReviewLog> = {};

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadData<T>(filePath: string): DataStore<T> {
  if (fs.existsSync(filePath)) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    } catch {
      return {};
    }
  }
  return {};
}

function saveData<T>(filePath: string, data: DataStore<T>) {
  ensureDataDir();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

export function loadAllData() {
  users = loadData<User>(USERS_FILE);
  achievements = loadData<Achievement>(ACHIEVEMENTS_FILE);
  attachments = loadData<Attachment>(ATTACHMENTS_FILE);
  reviewLogs = loadData<ReviewLog>(REVIEW_LOGS_FILE);

  (globalThis as unknown as { _passwordHashes: Record<string, string> })._passwordHashes = {};

  let createdUsers: User[] = [];
  if (Object.keys(users).length === 0) {
    createdUsers = initializeDefaultUsers();
  } else {
    initPasswordHashes(Object.values(users));
  }

  if (Object.keys(achievements).length === 0 && createdUsers.length > 0) {
    initializeSampleAchievements(createdUsers);
  }
}

function initPasswordHashes(userList: User[]) {
  const salt = bcrypt.genSaltSync(10);
  const hashes: Record<string, string> = {};
  
  userList.forEach(user => {
    let password = '123456';
    if (user.username === 'admin') password = 'admin123';
    else if (user.username === 'advisor') password = 'advisor123';
    else if (user.username === 'student' || user.username === 'student2') password = 'student123';
    
    hashes[user.username] = bcrypt.hashSync(password, salt);
  });
  
  (globalThis as unknown as { _passwordHashes: Record<string, string> })._passwordHashes = hashes;
}

function initializeDefaultUsers(): User[] {
  const salt = bcrypt.genSaltSync(10);
  
  const defaultUsers: User[] = [
    {
      id: uuidv4(),
      username: 'admin',
      name: '系统管理员',
      role: 'admin',
      email: 'admin@lab.edu.cn',
      department: '计算机学院',
      createdAt: new Date().toISOString(),
      isActive: true
    },
    {
      id: uuidv4(),
      username: 'advisor',
      name: '张教授',
      role: 'advisor',
      email: 'zhang@lab.edu.cn',
      title: '教授',
      department: '计算机学院',
      createdAt: new Date().toISOString(),
      isActive: true
    },
    {
      id: uuidv4(),
      username: 'student',
      name: '李同学',
      role: 'student',
      email: 'li@lab.edu.cn',
      studentId: '2024001',
      department: '计算机学院',
      createdAt: new Date().toISOString(),
      isActive: true
    },
    {
      id: uuidv4(),
      username: 'student2',
      name: '王同学',
      role: 'student',
      email: 'wang@lab.edu.cn',
      studentId: '2024002',
      department: '计算机学院',
      createdAt: new Date().toISOString(),
      isActive: true
    }
  ];

  const passwordHash = bcrypt.hashSync('admin123', salt);
  (globalThis as unknown as { _passwordHashes: Record<string, string> })._passwordHashes = {
    admin: passwordHash,
    advisor: bcrypt.hashSync('advisor123', salt),
    student: bcrypt.hashSync('student123', salt),
    student2: bcrypt.hashSync('student123', salt)
  };

  defaultUsers.forEach(user => {
    users[user.id] = user;
  });

  saveData(USERS_FILE, users);
  return defaultUsers;
}

function initializeSampleAchievements(userList: User[]) {
  const adminUser = userList.find(u => u.username === 'admin')!;
  const advisorUser = userList.find(u => u.username === 'advisor')!;
  const studentUser = userList.find(u => u.username === 'student')!;
  const student2User = userList.find(u => u.username === 'student2')!;

  const now = new Date();
  const sampleAchievements: Achievement[] = [
    {
      id: uuidv4(),
      type: 'paper',
      title: '基于深度学习的图像识别方法研究',
      status: 'approved',
      submitterId: studentUser.id,
      submitterName: studentUser.name,
      members: [
        { id: uuidv4(), userId: studentUser.id, userName: studentUser.name, role: 'first_author', order: 1 },
        { id: uuidv4(), userId: advisorUser.id, userName: advisorUser.name, role: 'corresponding_author', order: 2 },
        { id: uuidv4(), userId: student2User.id, userName: student2User.name, role: 'co_author', order: 3 }
      ],
      createdAt: new Date(now.getFullYear() - 1, 3, 15).toISOString(),
      updatedAt: new Date(now.getFullYear() - 1, 4, 20).toISOString(),
      submittedAt: new Date(now.getFullYear() - 1, 3, 20).toISOString(),
      approvedAt: new Date(now.getFullYear() - 1, 4, 20).toISOString(),
      reviewComment: '研究内容充实，实验结果充分，同意归档。',
      reviewedBy: advisorUser.id,
      reviewedByName: advisorUser.name,
      paperJournal: 'IEEE Transactions on Pattern Analysis and Machine Intelligence',
      paperVolume: '45',
      paperIssue: '6',
      paperPages: '1234-1250',
      paperDoi: '10.1109/TPAMI.2023.1234567',
      paperCitation: 'Li S, Zhang W, Wang H. Research on Image Recognition Method Based on Deep Learning[J]. IEEE TPAMI, 2023, 45(6): 1234-1250.',
      publicationDate: '2023-06-15'
    },
    {
      id: uuidv4(),
      type: 'paper',
      title: '自然语言处理中的Transformer模型优化',
      status: 'approved',
      submitterId: student2User.id,
      submitterName: student2User.name,
      members: [
        { id: uuidv4(), userId: student2User.id, userName: student2User.name, role: 'first_author', order: 1 },
        { id: uuidv4(), userId: advisorUser.id, userName: advisorUser.name, role: 'corresponding_author', order: 2 }
      ],
      createdAt: new Date(now.getFullYear(), 0, 10).toISOString(),
      updatedAt: new Date(now.getFullYear(), 1, 15).toISOString(),
      submittedAt: new Date(now.getFullYear(), 0, 15).toISOString(),
      approvedAt: new Date(now.getFullYear(), 1, 15).toISOString(),
      reviewComment: '论文质量较高，具有一定的创新性。',
      reviewedBy: advisorUser.id,
      reviewedByName: advisorUser.name,
      paperJournal: 'ACL 2024',
      paperVolume: '1',
      paperIssue: '1',
      paperPages: '456-468',
      paperDoi: '10.18653/v1/2024.acl-main.123',
      paperCitation: 'Wang H, Zhang W. Transformer Model Optimization in Natural Language Processing[C]//ACL 2024.',
      publicationDate: '2024-02-20'
    },
    {
      id: uuidv4(),
      type: 'patent',
      title: '一种智能图像分类装置及方法',
      status: 'approved',
      submitterId: advisorUser.id,
      submitterName: advisorUser.name,
      members: [
        { id: uuidv4(), userId: advisorUser.id, userName: advisorUser.name, role: 'principal', order: 1 },
        { id: uuidv4(), userId: studentUser.id, userName: studentUser.name, role: 'participant', order: 2 }
      ],
      createdAt: new Date(now.getFullYear() - 1, 5, 20).toISOString(),
      updatedAt: new Date(now.getFullYear(), 2, 10).toISOString(),
      submittedAt: new Date(now.getFullYear() - 1, 6, 1).toISOString(),
      approvedAt: new Date(now.getFullYear(), 2, 10).toISOString(),
      reviewComment: '专利内容完整，授权可能性大。',
      reviewedBy: adminUser.id,
      reviewedByName: adminUser.name,
      patentNumber: 'CN202310456789.1',
      patentType: 'invention',
      patentApplicationDate: '2023-06-15',
      patentGrantDate: '2024-03-10',
      patentStatus: 'granted'
    },
    {
      id: uuidv4(),
      type: 'patent',
      title: '基于大数据的实验室安全预警系统',
      status: 'pending',
      submitterId: studentUser.id,
      submitterName: studentUser.name,
      members: [
        { id: uuidv4(), userId: studentUser.id, userName: studentUser.name, role: 'first_author', order: 1 },
        { id: uuidv4(), userId: advisorUser.id, userName: advisorUser.name, role: 'principal', order: 2 }
      ],
      createdAt: new Date(now.getFullYear(), 2, 25).toISOString(),
      updatedAt: new Date(now.getFullYear(), 2, 28).toISOString(),
      submittedAt: new Date(now.getFullYear(), 3, 1).toISOString(),
      patentNumber: 'CN202410234567.8',
      patentType: 'invention',
      patentApplicationDate: '2024-03-05',
      patentStatus: 'applied'
    },
    {
      id: uuidv4(),
      type: 'project',
      title: '国家重点研发计划：智能医疗影像诊断关键技术研究',
      status: 'approved',
      submitterId: advisorUser.id,
      submitterName: advisorUser.name,
      members: [
        { id: uuidv4(), userId: advisorUser.id, userName: advisorUser.name, role: 'principal', order: 1 },
        { id: uuidv4(), userId: studentUser.id, userName: studentUser.name, role: 'participant', order: 2 },
        { id: uuidv4(), userId: student2User.id, userName: student2User.name, role: 'participant', order: 3 }
      ],
      createdAt: new Date(now.getFullYear() - 2, 8, 1).toISOString(),
      updatedAt: new Date(now.getFullYear() - 1, 10, 15).toISOString(),
      submittedAt: new Date(now.getFullYear() - 2, 8, 10).toISOString(),
      approvedAt: new Date(now.getFullYear() - 2, 8, 25).toISOString(),
      reviewComment: '国家级项目，研究意义重大，同意立项。',
      reviewedBy: adminUser.id,
      reviewedByName: adminUser.name,
      projectNumber: '2022YFB1234500',
      projectSource: '国家重点研发计划',
      projectLevel: 'national',
      projectStartDate: '2022-09-01',
      projectEndDate: '2025-08-31',
      projectFunding: 500,
      projectStatus: 'ongoing'
    },
    {
      id: uuidv4(),
      type: 'project',
      title: '省部级自然科学基金：多模态数据融合理论与方法',
      status: 'approved',
      submitterId: advisorUser.id,
      submitterName: advisorUser.name,
      members: [
        { id: uuidv4(), userId: advisorUser.id, userName: advisorUser.name, role: 'principal', order: 1 },
        { id: uuidv4(), userId: studentUser.id, userName: studentUser.name, role: 'participant', order: 2 }
      ],
      createdAt: new Date(now.getFullYear() - 1, 0, 10).toISOString(),
      updatedAt: new Date(now.getFullYear() - 1, 2, 20).toISOString(),
      submittedAt: new Date(now.getFullYear() - 1, 0, 20).toISOString(),
      approvedAt: new Date(now.getFullYear() - 1, 2, 20).toISOString(),
      reviewComment: '研究方案合理，经费预算合适。',
      reviewedBy: adminUser.id,
      reviewedByName: adminUser.name,
      projectNumber: '2023JJ12345',
      projectSource: '省自然科学基金',
      projectLevel: 'provincial',
      projectStartDate: '2023-03-01',
      projectEndDate: '2026-02-28',
      projectFunding: 50,
      projectStatus: 'ongoing'
    },
    {
      id: uuidv4(),
      type: 'paper',
      title: '图神经网络在推荐系统中的应用研究',
      status: 'draft',
      submitterId: student2User.id,
      submitterName: student2User.name,
      members: [
        { id: uuidv4(), userId: student2User.id, userName: student2User.name, role: 'first_author', order: 1 },
        { id: uuidv4(), userId: advisorUser.id, userName: advisorUser.name, role: 'corresponding_author', order: 2 }
      ],
      createdAt: new Date(now.getFullYear(), 2, 15).toISOString(),
      updatedAt: new Date(now.getFullYear(), 3, 5).toISOString(),
      paperJournal: '',
      publicationDate: ''
    },
    {
      id: uuidv4(),
      type: 'paper',
      title: '联邦学习隐私保护机制研究',
      status: 'rejected',
      submitterId: studentUser.id,
      submitterName: studentUser.name,
      members: [
        { id: uuidv4(), userId: studentUser.id, userName: studentUser.name, role: 'first_author', order: 1 },
        { id: uuidv4(), userId: advisorUser.id, userName: advisorUser.name, role: 'corresponding_author', order: 2 }
      ],
      createdAt: new Date(now.getFullYear(), 1, 20).toISOString(),
      updatedAt: new Date(now.getFullYear(), 2, 10).toISOString(),
      submittedAt: new Date(now.getFullYear(), 1, 25).toISOString(),
      approvedAt: new Date(now.getFullYear(), 2, 10).toISOString(),
      reviewComment: '实验部分不够充分，需要补充对比实验和消融实验。建议修改后重新提交。',
      reviewedBy: advisorUser.id,
      reviewedByName: advisorUser.name,
      paperJournal: 'NeurIPS 2024',
      publicationDate: ''
    }
  ];

  sampleAchievements.forEach(achievement => {
    achievements[achievement.id] = achievement;
  });

  saveData(ACHIEVEMENTS_FILE, achievements);

  const reviewLogsData: ReviewLog[] = [];
  sampleAchievements.forEach(achievement => {
    if (achievement.submittedAt) {
      reviewLogsData.push({
        id: uuidv4(),
        achievementId: achievement.id,
        reviewerId: achievement.submitterId,
        reviewerName: achievement.submitterName,
        action: 'submitted',
        comment: '提交审核',
        createdAt: achievement.submittedAt
      });
    }
    if (achievement.approvedAt && achievement.reviewedBy && achievement.reviewedByName) {
      reviewLogsData.push({
        id: uuidv4(),
        achievementId: achievement.id,
        reviewerId: achievement.reviewedBy,
        reviewerName: achievement.reviewedByName,
        action: achievement.status === 'approved' ? 'approved' : 'rejected',
        comment: achievement.reviewComment || '',
        createdAt: achievement.approvedAt
      });
    }
  });

  reviewLogsData.forEach(log => {
    reviewLogs[log.id] = log;
  });

  saveData(REVIEW_LOGS_FILE, reviewLogs);
}

export function getPasswordHash(username: string): string | undefined {
  const hashes = (globalThis as unknown as { _passwordHashes?: Record<string, string> })._passwordHashes;
  return hashes?.[username];
}

export function setPasswordHash(username: string, hash: string) {
  const hashes = (globalThis as unknown as { _passwordHashes: Record<string, string> })._passwordHashes || {};
  hashes[username] = hash;
  (globalThis as unknown as { _passwordHashes: Record<string, string> })._passwordHashes = hashes;
}

export const db = {
  users: {
    findAll: (): User[] => Object.values(users),
    findById: (id: string): User | undefined => users[id],
    findByUsername: (username: string): User | undefined => 
      Object.values(users).find(u => u.username === username),
    create: (user: Omit<User, 'id' | 'createdAt'>): User => {
      const id = uuidv4();
      const newUser: User = {
        ...user,
        id,
        createdAt: new Date().toISOString()
      };
      users[id] = newUser;
      saveData(USERS_FILE, users);
      return newUser;
    },
    update: (id: string, updates: Partial<User>): User | undefined => {
      if (users[id]) {
        users[id] = { ...users[id], ...updates };
        saveData(USERS_FILE, users);
        return users[id];
      }
      return undefined;
    },
    delete: (id: string): boolean => {
      if (users[id]) {
        delete users[id];
        saveData(USERS_FILE, users);
        return true;
      }
      return false;
    }
  },

  achievements: {
    findAll: (): Achievement[] => Object.values(achievements),
    findById: (id: string): Achievement | undefined => achievements[id],
    create: (achievement: Omit<Achievement, 'id' | 'createdAt' | 'updatedAt'>): Achievement => {
      const id = uuidv4();
      const now = new Date().toISOString();
      const newAchievement: Achievement = {
        ...achievement,
        id,
        createdAt: now,
        updatedAt: now
      };
      achievements[id] = newAchievement;
      saveData(ACHIEVEMENTS_FILE, achievements);
      return newAchievement;
    },
    update: (id: string, updates: Partial<Achievement>): Achievement | undefined => {
      if (achievements[id]) {
        achievements[id] = { 
          ...achievements[id], 
          ...updates, 
          updatedAt: new Date().toISOString() 
        };
        saveData(ACHIEVEMENTS_FILE, achievements);
        return achievements[id];
      }
      return undefined;
    },
    delete: (id: string): boolean => {
      if (achievements[id]) {
        delete achievements[id];
        saveData(ACHIEVEMENTS_FILE, achievements);
        return true;
      }
      return false;
    }
  },

  attachments: {
    findAll: (): Attachment[] => Object.values(attachments),
    findByAchievementId: (achievementId: string): Attachment[] => 
      Object.values(attachments).filter(a => a.achievementId === achievementId),
    create: (attachment: Omit<Attachment, 'id' | 'createdAt'>): Attachment => {
      const id = uuidv4();
      const newAttachment: Attachment = {
        ...attachment,
        id,
        createdAt: new Date().toISOString()
      };
      attachments[id] = newAttachment;
      saveData(ATTACHMENTS_FILE, attachments);
      return newAttachment;
    },
    delete: (id: string): boolean => {
      if (attachments[id]) {
        delete attachments[id];
        saveData(ATTACHMENTS_FILE, attachments);
        return true;
      }
      return false;
    }
  },

  reviewLogs: {
    findByAchievementId: (achievementId: string): ReviewLog[] => 
      Object.values(reviewLogs)
        .filter(r => r.achievementId === achievementId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    create: (log: Omit<ReviewLog, 'id' | 'createdAt'>): ReviewLog => {
      const id = uuidv4();
      const newLog: ReviewLog = {
        ...log,
        id,
        createdAt: new Date().toISOString()
      };
      reviewLogs[id] = newLog;
      saveData(REVIEW_LOGS_FILE, reviewLogs);
      return newLog;
    }
  }
};

(globalThis as unknown as { _passwordHashes: Record<string, string> })._passwordHashes = {};
