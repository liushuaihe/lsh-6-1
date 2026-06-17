import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Eye,
  BookOpen,
  FileText,
  Briefcase,
  User,
  Calendar,
  MessageSquare
} from 'lucide-react';
import { api } from '../api/client.js';
import { useAuthStore } from '../store/useAuthStore.js';
import { StatusBadge } from '../components/StatusBadge.js';
import { MemberDisplay } from '../components/MemberDisplay.js';
import { 
  formatDate, 
  getAchievementTypeLabel
} from '../utils/format.js';
import type { Achievement, ReviewRequest } from '../../shared/types.js';

export default function ReviewManagement() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [pendingAchievements, setPendingAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [reviewModal, setReviewModal] = useState<{
    show: boolean;
    achievement: Achievement | null;
    status: 'approved' | 'rejected' | null;
  }>({ show: false, achievement: null, status: null });
  const [reviewComment, setReviewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadPendingAchievements();
  }, []);

  const loadPendingAchievements = async () => {
    setLoading(true);
    try {
      const data = await api.reviews.getPending();
      setPendingAchievements(data);
    } catch (error) {
      console.error('Load pending achievements error:', error);
    } finally {
      setLoading(false);
    }
  };

  const openReviewModal = (achievement: Achievement, status: 'approved' | 'rejected') => {
    setReviewModal({ show: true, achievement, status });
    setReviewComment('');
  };

  const handleReview = async () => {
    if (!reviewModal.achievement || !reviewModal.status) return;
    if (reviewModal.status === 'rejected' && !reviewComment.trim()) {
      alert('请填写退回意见');
      return;
    }

    setSubmitting(true);
    try {
      await api.reviews.review(reviewModal.achievement.id, {
        status: reviewModal.status,
        comment: reviewComment.trim()
      });
      setReviewModal({ show: false, achievement: null, status: null });
      loadPendingAchievements();
      alert(reviewModal.status === 'approved' ? '审核通过成功' : '退回成功');
    } catch (error: any) {
      alert(error.message || '审核失败');
    } finally {
      setSubmitting(false);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">审核管理</h1>
          <p className="text-slate-500 mt-1">审核学生提交的科研成果</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 px-4 py-2 rounded-xl">
          <Clock size={16} />
          待审核：{pendingAchievements.length} 条
        </div>
      </div>

      {selectedAchievement ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex items-center justify-between">
            <button
              onClick={() => setSelectedAchievement(null)}
              className="flex items-center gap-2 text-slate-600 hover:text-blue-600"
            >
              <ArrowLeft size={18} />
              返回列表
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={() => openReviewModal(selectedAchievement, 'rejected')}
                className="flex items-center gap-2 px-5 py-2.5 border border-rose-200 text-rose-600 rounded-xl hover:bg-rose-50"
              >
                <XCircle size={18} />
                退回修改
              </button>
              <button
                onClick={() => openReviewModal(selectedAchievement, 'approved')}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/30"
              >
                <CheckCircle2 size={18} />
                审核通过
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${getTypeColor(selectedAchievement.type)}`}>
                {selectedAchievement.type === 'paper' ? <BookOpen size={24} /> :
                 selectedAchievement.type === 'patent' ? <FileText size={24} /> :
                 <Briefcase size={24} />}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-slate-800 mb-2">{selectedAchievement.title}</h2>
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <span className="flex items-center gap-1">
                    <User size={14} />
                    提交人：{selectedAchievement.submitterName}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    提交时间：{formatDate(selectedAchievement.submittedAt)}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-50 rounded-xl p-5">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">参与成员</h3>
                <MemberDisplay members={selectedAchievement.members} variant="detailed" />
              </div>

              <div className="bg-slate-50 rounded-xl p-5">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">基本信息</h3>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-slate-200">
                    <span className="text-slate-500">成果类型</span>
                    <span className="text-slate-800 font-medium">{getAchievementTypeLabel(selectedAchievement.type)}</span>
                  </div>
                  {selectedAchievement.type === 'paper' && (
                    <>
                      <div className="flex justify-between py-2 border-b border-slate-200">
                        <span className="text-slate-500">期刊</span>
                        <span className="text-slate-800">{selectedAchievement.paperJournal}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-200">
                        <span className="text-slate-500">发表日期</span>
                        <span className="text-slate-800">{formatDate(selectedAchievement.publicationDate)}</span>
                      </div>
                    </>
                  )}
                  {selectedAchievement.type === 'patent' && (
                    <>
                      <div className="flex justify-between py-2 border-b border-slate-200">
                        <span className="text-slate-500">专利号</span>
                        <span className="text-slate-800 font-mono">{selectedAchievement.patentNumber}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-200">
                        <span className="text-slate-500">申请日期</span>
                        <span className="text-slate-800">{formatDate(selectedAchievement.patentApplicationDate)}</span>
                      </div>
                    </>
                  )}
                  {selectedAchievement.type === 'project' && (
                    <>
                      <div className="flex justify-between py-2 border-b border-slate-200">
                        <span className="text-slate-500">项目编号</span>
                        <span className="text-slate-800 font-mono">{selectedAchievement.projectNumber}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-200">
                        <span className="text-slate-500">项目来源</span>
                        <span className="text-slate-800">{selectedAchievement.projectSource}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {pendingAchievements.length === 0 ? (
            <div className="text-center py-16">
              <CheckCircle2 size={64} className="mx-auto mb-4 text-emerald-300" />
              <h3 className="text-lg font-medium text-slate-700 mb-2">暂无待审核成果</h3>
              <p className="text-slate-500">所有成果都已审核完毕</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {pendingAchievements.map((achievement) => {
                const TypeIcon = getTypeIcon(achievement.type);
                return (
                  <div key={achievement.id} className="p-6 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${getTypeColor(achievement.type)}`}>
                        <TypeIcon size={24} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <h3 className="font-semibold text-slate-800 text-lg mb-1 truncate">
                              {achievement.title}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-slate-500 mb-3">
                              <span className="flex items-center gap-1">
                                <User size={14} />
                                {achievement.submitterName}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar size={14} />
                                {formatDate(achievement.submittedAt)}
                              </span>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium ${getTypeColor(achievement.type)}`}>
                                {getAchievementTypeLabel(achievement.type)}
                              </span>
                            </div>
                            <MemberDisplay members={achievement.members} variant="compact" maxVisible={3} />
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              onClick={() => navigate(`/achievements/${achievement.id}`)}
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="查看详情"
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              onClick={() => setSelectedAchievement(achievement)}
                              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                              <MessageSquare size={16} />
                              审核
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {reviewModal.show && reviewModal.achievement && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full mx-4 shadow-xl">
            <h3 className={`text-lg font-semibold mb-2 ${
              reviewModal.status === 'approved' ? 'text-emerald-800' : 'text-rose-800'
            }`}>
              {reviewModal.status === 'approved' ? '审核通过' : '退回修改'}
            </h3>
            <p className="text-slate-600 mb-4">
              {reviewModal.status === 'approved' 
                ? `确定要通过"${reviewModal.achievement.title}"的审核吗？`
                : `确定要退回"${reviewModal.achievement.title}"吗？请填写退回意见。`
              }
            </p>
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {reviewModal.status === 'approved' ? '审核意见（可选）' : '退回意见（必填）'}
              </label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={4}
                placeholder={reviewModal.status === 'approved' ? '请输入审核意见...' : '请详细说明需要修改的内容...'}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setReviewModal({ show: false, achievement: null, status: null })}
                className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
                disabled={submitting}
              >
                取消
              </button>
              <button
                onClick={handleReview}
                disabled={submitting}
                className={`px-4 py-2 rounded-lg text-white ${
                  reviewModal.status === 'approved' 
                    ? 'bg-emerald-600 hover:bg-emerald-700' 
                    : 'bg-rose-600 hover:bg-rose-700'
                } disabled:opacity-50`}
              >
                {submitting ? '处理中...' : (reviewModal.status === 'approved' ? '确认通过' : '确认退回')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
