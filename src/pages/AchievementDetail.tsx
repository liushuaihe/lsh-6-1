import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit2, 
  Send, 
  BookOpen, 
  FileText, 
  Briefcase,
  User,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Download
} from 'lucide-react';
import { api } from '../api/client.js';
import { useAuthStore } from '../store/useAuthStore.js';
import { StatusBadge } from '../components/StatusBadge.js';
import { 
  formatDate, 
  formatDateTime,
  getAchievementTypeLabel, 
  getMemberRoleLabel,
  getPatentTypeLabel,
  getPatentStatusLabel,
  getProjectLevelLabel,
  getProjectStatusLabel
} from '../utils/format.js';
import type { Achievement, ReviewLog } from '../../shared/types.js';

export default function AchievementDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuthStore();
  const [achievement, setAchievement] = useState<Achievement | null>(null);
  const [reviewLogs, setReviewLogs] = useState<ReviewLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitConfirm, setSubmitConfirm] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [data, logs] = await Promise.all([
        api.achievements.getById(id),
        api.reviews.getHistory(id)
      ]);
      setAchievement(data);
      setReviewLogs(logs);
    } catch (error: any) {
      alert(error.message || '加载失败');
      navigate('/achievements');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!id) return;
    try {
      await api.achievements.submitForReview(id);
      setSubmitConfirm(false);
      loadData();
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

  const canEdit = () => {
    if (!achievement || !user) return false;
    if (user.role === 'admin' || user.role === 'advisor') return true;
    return achievement.submitterId === user.id && achievement.status === 'draft';
  };

  const canSubmit = () => {
    if (!achievement || !user) return false;
    return achievement.submitterId === user.id && achievement.status === 'draft';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!achievement) return null;

  const TypeIcon = getTypeIcon(achievement.type);

  const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex items-start gap-4 py-3 border-b border-slate-100 last:border-0">
      <span className="text-slate-500 w-32 flex-shrink-0">{label}</span>
      <span className="text-slate-800">{value || '-'}</span>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/achievements')}
          className="flex items-center gap-2 text-slate-600 hover:text-blue-600"
        >
          <ArrowLeft size={18} />
          返回列表
        </button>
        <div className="flex items-center gap-3">
          {canEdit() && (
            <button
              onClick={() => navigate(`/achievements/${id}/edit`)}
              className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50"
            >
              <Edit2 size={16} />
              编辑
            </button>
          )}
          {canSubmit() && (
            <button
              onClick={() => setSubmitConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700"
            >
              <Send size={16} />
              提交审核
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${getTypeColor(achievement.type)}`}>
              <TypeIcon size={28} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-slate-800 truncate">{achievement.title}</h1>
                <StatusBadge status={achievement.status} />
              </div>
              <div className="flex items-center gap-6 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <FileText size={14} />
                  {getAchievementTypeLabel(achievement.type)}
                </span>
                <span className="flex items-center gap-1">
                  <User size={14} />
                  提交人：{achievement.submitterName}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={14} />
                  创建于 {formatDate(achievement.createdAt)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 rounded-xl p-5">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">基本信息</h3>
              <div className="space-y-1">
                <InfoRow label="成果类型" value={getAchievementTypeLabel(achievement.type)} />
                <InfoRow label="提交人" value={achievement.submitterName} />
                <InfoRow label="创建时间" value={formatDateTime(achievement.createdAt)} />
                <InfoRow label="更新时间" value={formatDateTime(achievement.updatedAt)} />
                {achievement.submittedAt && (
                  <InfoRow label="提交时间" value={formatDateTime(achievement.submittedAt)} />
                )}
                {achievement.approvedAt && (
                  <InfoRow label="归档时间" value={formatDateTime(achievement.approvedAt)} />
                )}
                {achievement.reviewedByName && (
                  <InfoRow label="审核人" value={achievement.reviewedByName} />
                )}
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-5">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">参与成员</h3>
              <div className="flex flex-wrap gap-2">
                {achievement.members.map((member, index) => (
                  <div key={member.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-full">
                    <div className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">
                      {index + 1}
                    </div>
                    <span className="text-sm font-medium text-slate-800">{member.userName}</span>
                    <span className="text-xs text-slate-500">· {getMemberRoleLabel(member.role)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 bg-slate-50 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">详细信息</h3>
            <div className="space-y-1">
              {achievement.type === 'paper' && (
                <>
                  <InfoRow label="期刊名称" value={achievement.paperJournal} />
                  <InfoRow label="发表日期" value={formatDate(achievement.publicationDate)} />
                  <InfoRow label="卷号" value={achievement.paperVolume} />
                  <InfoRow label="期号" value={achievement.paperIssue} />
                  <InfoRow label="页码" value={achievement.paperPages} />
                  <InfoRow label="DOI" value={achievement.paperDoi} />
                  {achievement.paperCitation && (
                    <div className="flex items-start gap-4 py-3">
                      <span className="text-slate-500 w-32 flex-shrink-0">引用格式</span>
                      <span className="text-slate-800 font-mono text-sm bg-white p-3 rounded-lg flex-1">
                        {achievement.paperCitation}
                      </span>
                    </div>
                  )}
                </>
              )}

              {achievement.type === 'patent' && (
                <>
                  <InfoRow label="专利号" value={achievement.patentNumber} />
                  <InfoRow label="专利类型" value={getPatentTypeLabel(achievement.patentType)} />
                  <InfoRow label="申请日期" value={formatDate(achievement.patentApplicationDate)} />
                  <InfoRow label="授权日期" value={formatDate(achievement.patentGrantDate)} />
                  <InfoRow label="当前状态" value={getPatentStatusLabel(achievement.patentStatus)} />
                </>
              )}

              {achievement.type === 'project' && (
                <>
                  <InfoRow label="项目编号" value={achievement.projectNumber} />
                  <InfoRow label="项目来源" value={achievement.projectSource} />
                  <InfoRow label="项目级别" value={getProjectLevelLabel(achievement.projectLevel)} />
                  <InfoRow label="开始日期" value={formatDate(achievement.projectStartDate)} />
                  <InfoRow label="结束日期" value={formatDate(achievement.projectEndDate)} />
                  <InfoRow label="资助金额" value={achievement.projectFunding ? `${achievement.projectFunding} 万元` : '-'} />
                  <InfoRow label="项目状态" value={getProjectStatusLabel(achievement.projectStatus)} />
                </>
              )}
            </div>
          </div>

          {achievement.reviewComment && (
            <div className={`mt-6 rounded-xl p-5 ${
              achievement.status === 'rejected' ? 'bg-rose-50 border border-rose-200' : 'bg-emerald-50 border border-emerald-200'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {achievement.status === 'rejected' ? (
                  <XCircle size={20} className="text-rose-500" />
                ) : (
                  <CheckCircle2 size={20} className="text-emerald-500" />
                )}
                <h3 className={`font-semibold ${
                  achievement.status === 'rejected' ? 'text-rose-800' : 'text-emerald-800'
                }`}>
                  {achievement.status === 'rejected' ? '退回意见' : '审核意见'}
                </h3>
              </div>
              <p className={`text-sm ${
                achievement.status === 'rejected' ? 'text-rose-700' : 'text-emerald-700'
              }`}>
                {achievement.reviewComment}
              </p>
              <p className={`text-xs mt-2 ${
                achievement.status === 'rejected' ? 'text-rose-500' : 'text-emerald-500'
              }`}>
                审核人：{achievement.reviewedByName} · {formatDateTime(achievement.approvedAt)}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <MessageSquare size={20} className="text-blue-500" />
            审核历史
          </h3>
        </div>
        <div className="p-6">
          {reviewLogs.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Clock size={48} className="mx-auto mb-3 text-slate-300" />
              <p>暂无审核记录</p>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200" />
              <div className="space-y-6">
                {reviewLogs.map((log, index) => (
                  <div key={log.id} className="relative flex gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      log.action === 'submitted' ? 'bg-blue-100 text-blue-600' :
                      log.action === 'approved' ? 'bg-emerald-100 text-emerald-600' :
                      'bg-rose-100 text-rose-600'
                    }`}>
                      {log.action === 'submitted' ? <Send size={14} /> :
                       log.action === 'approved' ? <CheckCircle2 size={14} /> :
                       <XCircle size={14} />}
                    </div>
                    <div className="flex-1 pb-6">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-slate-800">{log.reviewerName}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          log.action === 'submitted' ? 'bg-blue-100 text-blue-700' :
                          log.action === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                          'bg-rose-100 text-rose-700'
                        }`}>
                          {log.action === 'submitted' ? '提交审核' :
                           log.action === 'approved' ? '审核通过' :
                           '审核退回'}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mb-1">{log.comment}</p>
                      <p className="text-xs text-slate-400">{formatDateTime(log.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {submitConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">提交审核</h3>
            <p className="text-slate-600 mb-6">确定要将这条成果提交审核吗？提交后将无法编辑，需等待导师审核。</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSubmitConfirm(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
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
