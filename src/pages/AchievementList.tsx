import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Plus, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  FileText, 
  Briefcase,
  Eye,
  Edit2,
  Trash2,
  Send,
  X,
  Calendar,
  User
} from 'lucide-react';
import { api } from '../api/client.js';
import { useAuthStore } from '../store/useAuthStore.js';
import { StatusBadge } from '../components/StatusBadge.js';
import { 
  formatDate, 
  getAchievementTypeLabel, 
  getMemberRoleLabel 
} from '../utils/format.js';
import type { 
  Achievement, 
  AchievementQuery, 
  User as UserType 
} from '../../shared/types.js';

export default function AchievementList() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<AchievementQuery>({
    type: undefined,
    status: undefined,
    userId: undefined,
    keyword: '',
    startDate: '',
    endDate: '',
    page: 1,
    pageSize: 10
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 0
  });
  const [showFilters, setShowFilters] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [submitConfirm, setSubmitConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    loadAchievements();
  }, [filters]);

  const loadUsers = async () => {
    try {
      const data = await api.users.getActive();
      setUsers(data);
    } catch (error) {
      console.error('Load users error:', error);
    }
  };

  const loadAchievements = async () => {
    setLoading(true);
    try {
      const response = await api.achievements.getAll(filters);
      setAchievements(response.data);
      setPagination({
        total: response.total,
        page: response.page,
        pageSize: response.pageSize,
        totalPages: response.totalPages
      });
    } catch (error) {
      console.error('Load achievements error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof AchievementQuery, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const resetFilters = () => {
    setFilters({
      type: undefined,
      status: undefined,
      userId: undefined,
      keyword: '',
      startDate: '',
      endDate: '',
      page: 1,
      pageSize: 10
    });
  };

  const handleDelete = async (id: string) => {
    try {
      await api.achievements.delete(id);
      setDeleteConfirm(null);
      loadAchievements();
    } catch (error: any) {
      alert(error.message || '删除失败');
    }
  };

  const handleSubmit = async (id: string) => {
    try {
      await api.achievements.submitForReview(id);
      setSubmitConfirm(null);
      loadAchievements();
    } catch (error: any) {
      alert(error.message || '提交失败');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'paper': return BookOpen;
      case 'patent': return FileText;
      case 'project': return Briefcase;
      default: return FileText;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'paper': return 'bg-blue-50 text-blue-600';
      case 'patent': return 'bg-sky-50 text-sky-600';
      case 'project': return 'bg-emerald-50 text-emerald-600';
      default: return 'bg-slate-50 text-slate-600';
    }
  };

  const canEdit = (achievement: Achievement) => {
    if (!user) return false;
    if (user.role === 'admin' || user.role === 'advisor') return true;
    return achievement.submitterId === user.id && achievement.status === 'draft';
  };

  const canDelete = (achievement: Achievement) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return achievement.submitterId === user.id && achievement.status === 'draft';
  };

  const canSubmit = (achievement: Achievement) => {
    if (!user) return false;
    return achievement.submitterId === user.id && achievement.status === 'draft';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">成果管理</h1>
          <p className="text-slate-500 mt-1">管理和检索实验室所有科研成果</p>
        </div>
        <button
          onClick={() => navigate('/achievements/new')}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-sky-500 text-white font-medium rounded-xl hover:from-blue-700 hover:to-sky-600 transition-all shadow-lg shadow-blue-500/30"
        >
          <Plus size={18} />
          录入成果
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="p-4 border-b border-slate-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="搜索成果标题、作者..."
                value={filters.keyword || ''}
                onChange={(e) => handleFilterChange('keyword', e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl transition-colors ${
                showFilters 
                  ? 'bg-blue-50 border-blue-200 text-blue-600' 
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Filter size={18} />
              筛选条件
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">成果类型</label>
                <select
                  value={filters.type || ''}
                  onChange={(e) => handleFilterChange('type', e.target.value || undefined)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">全部类型</option>
                  <option value="paper">论文</option>
                  <option value="patent">专利</option>
                  <option value="project">项目</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">状态</label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">全部状态</option>
                  <option value="draft">草稿</option>
                  <option value="pending">待审核</option>
                  <option value="approved">已归档</option>
                  <option value="rejected">已退回</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">参与成员</label>
                <select
                  value={filters.userId || ''}
                  onChange={(e) => handleFilterChange('userId', e.target.value || undefined)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">全部人员</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">开始日期</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="date"
                    value={filters.startDate || ''}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">结束日期</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="date"
                    value={filters.endDate || ''}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex items-end">
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X size={16} />
                  重置筛选
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            </div>
          ) : achievements.length === 0 ? (
            <div className="text-center py-16">
              <FileText size={64} className="mx-auto mb-4 text-slate-300" />
              <h3 className="text-lg font-medium text-slate-700 mb-2">暂无成果数据</h3>
              <p className="text-slate-500 mb-6">点击右上角按钮录入第一条成果</p>
              <button
                onClick={() => navigate('/achievements/new')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus size={16} />
                录入成果
              </button>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">成果信息</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">类型</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">参与成员</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">提交人</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">创建时间</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">状态</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {achievements.map((achievement) => {
                  const TypeIcon = getTypeIcon(achievement.type);
                  return (
                    <tr key={achievement.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${getTypeColor(achievement.type)}`}>
                            <TypeIcon size={18} />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-slate-800 truncate max-w-xs">{achievement.title}</p>
                            <p className="text-sm text-slate-500">{getAchievementTypeLabel(achievement.type)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${getTypeColor(achievement.type)}`}>
                          {getAchievementTypeLabel(achievement.type)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {achievement.members.slice(0, 3).map((member) => (
                            <span key={member.id} className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">
                              <User size={10} />
                              {member.userName}
                            </span>
                          ))}
                          {achievement.members.length > 3 && (
                            <span className="inline-flex items-center px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">
                              +{achievement.members.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {achievement.submitterName}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {formatDate(achievement.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={achievement.status} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/achievements/${achievement.id}`)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="查看详情"
                          >
                            <Eye size={16} />
                          </button>
                          {canEdit(achievement) && (
                            <button
                              onClick={() => navigate(`/achievements/${achievement.id}/edit`)}
                              className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                              title="编辑"
                            >
                              <Edit2 size={16} />
                            </button>
                          )}
                          {canSubmit(achievement) && (
                            <button
                              onClick={() => setSubmitConfirm(achievement.id)}
                              className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="提交审核"
                            >
                              <Send size={16} />
                            </button>
                          )}
                          {canDelete(achievement) && (
                            <button
                              onClick={() => setDeleteConfirm(achievement.id)}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="删除"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
            <p className="text-sm text-slate-600">
              共 {pagination.total} 条记录，第 {pagination.page} / {pagination.totalPages} 页
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.page <= 3) {
                  pageNum = i + 1;
                } else if (pagination.page >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = pagination.page - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-9 h-9 rounded-lg font-medium transition-colors ${
                      pagination.page === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'border border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">确认删除</h3>
            <p className="text-slate-600 mb-6">确定要删除这条成果记录吗？此操作无法撤销。</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
              >
                取消
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}

      {submitConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">提交审核</h3>
            <p className="text-slate-600 mb-6">确定要将这条成果提交审核吗？提交后将无法编辑，需等待导师审核。</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSubmitConfirm(null)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
              >
                取消
              </button>
              <button
                onClick={() => handleSubmit(submitConfirm)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                确认提交
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
