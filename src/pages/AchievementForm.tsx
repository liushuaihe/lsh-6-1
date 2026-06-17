import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Send, 
  Plus, 
  Trash2, 
  ChevronRight,
  BookOpen,
  FileText,
  Briefcase,
  User,
  AlertCircle
} from 'lucide-react';
import { api } from '../api/client.js';
import { useAuthStore } from '../store/useAuthStore.js';
import { 
  getMemberRoleLabel,
  getPatentTypeLabel,
  getPatentStatusLabel,
  getProjectLevelLabel,
  getProjectStatusLabel
} from '../utils/format.js';
import type { 
  Achievement, 
  AchievementType,
  MemberRole,
  User as UserType,
  CreateAchievementRequest,
  UpdateAchievementRequest,
  PatentType,
  PatentStatus,
  ProjectLevel,
  ProjectStatus
} from '../../shared/types.js';

interface FormMember {
  userId: string;
  userName: string;
  role: MemberRole;
  order: number;
}

const memberRoleOptions: { value: MemberRole; label: string }[] = [
  { value: 'first_author', label: '第一作者' },
  { value: 'corresponding_author', label: '通讯作者' },
  { value: 'co_author', label: '合作作者' },
  { value: 'principal', label: '负责人' },
  { value: 'participant', label: '参与人' },
];

const patentTypeOptions: { value: PatentType; label: string }[] = [
  { value: 'invention', label: '发明专利' },
  { value: 'utility', label: '实用新型' },
  { value: 'design', label: '外观设计' },
];

const patentStatusOptions: { value: PatentStatus; label: string }[] = [
  { value: 'applied', label: '申请中' },
  { value: 'granted', label: '已授权' },
];

const projectLevelOptions: { value: ProjectLevel; label: string }[] = [
  { value: 'national', label: '国家级' },
  { value: 'provincial', label: '省部级' },
  { value: 'city', label: '市厅级' },
  { value: 'school', label: '校级' },
  { value: 'enterprise', label: '横向项目' },
];

const projectStatusOptions: { value: ProjectStatus; label: string }[] = [
  { value: 'ongoing', label: '进行中' },
  { value: 'completed', label: '已完成' },
];

export default function AchievementForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuthStore();
  const isEdit = !!id;
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [users, setUsers] = useState<UserType[]>([]);
  const [achievement, setAchievement] = useState<Achievement | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    type: 'paper' as AchievementType,
    title: '',
    members: [] as FormMember[],
    paperJournal: '',
    paperVolume: '',
    paperIssue: '',
    paperPages: '',
    paperDoi: '',
    paperCitation: '',
    publicationDate: '',
    patentNumber: '',
    patentType: 'invention' as PatentType,
    patentApplicationDate: '',
    patentGrantDate: '',
    patentStatus: 'applied' as PatentStatus,
    projectNumber: '',
    projectSource: '',
    projectLevel: 'school' as ProjectLevel,
    projectStartDate: '',
    projectEndDate: '',
    projectFunding: '',
    projectStatus: 'ongoing' as ProjectStatus,
  });

  useEffect(() => {
    loadUsers();
    if (isEdit) {
      loadAchievement();
    }
  }, [id]);

  const loadUsers = async () => {
    try {
      const data = await api.users.getActive();
      setUsers(data);
    } catch (error) {
      console.error('Load users error:', error);
    }
  };

  const loadAchievement = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await api.achievements.getById(id);
      setAchievement(data);
      setFormData({
        type: data.type,
        title: data.title,
        members: data.members.map(m => ({
          userId: m.userId,
          userName: m.userName,
          role: m.role,
          order: m.order
        })),
        paperJournal: data.paperJournal || '',
        paperVolume: data.paperVolume || '',
        paperIssue: data.paperIssue || '',
        paperPages: data.paperPages || '',
        paperDoi: data.paperDoi || '',
        paperCitation: data.paperCitation || '',
        publicationDate: data.publicationDate || '',
        patentNumber: data.patentNumber || '',
        patentType: data.patentType || 'invention',
        patentApplicationDate: data.patentApplicationDate || '',
        patentGrantDate: data.patentGrantDate || '',
        patentStatus: data.patentStatus || 'applied',
        projectNumber: data.projectNumber || '',
        projectSource: data.projectSource || '',
        projectLevel: data.projectLevel || 'school',
        projectStartDate: data.projectStartDate || '',
        projectEndDate: data.projectEndDate || '',
        projectFunding: data.projectFunding?.toString() || '',
        projectStatus: data.projectStatus || 'ongoing',
      });
    } catch (error: any) {
      alert(error.message || '加载失败');
      navigate('/achievements');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const addMember = () => {
    const newMember: FormMember = {
      userId: '',
      userName: '',
      role: 'co_author',
      order: formData.members.length + 1
    };
    setFormData(prev => ({
      ...prev,
      members: [...prev.members, newMember]
    }));
  };

  const updateMember = (index: number, field: string, value: any) => {
    setFormData(prev => {
      const newMembers = [...prev.members];
      if (field === 'userId') {
        const selectedUser = users.find(u => u.id === value);
        newMembers[index] = {
          ...newMembers[index],
          userId: value,
          userName: selectedUser?.name || ''
        };
      } else {
        newMembers[index] = { ...newMembers[index], [field]: value };
      }
      return { ...prev, members: newMembers };
    });
  };

  const removeMember = (index: number) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.filter((_, i) => i !== index).map((m, i) => ({ ...m, order: i + 1 }))
    }));
  };

  const moveMember = (index: number, direction: 'up' | 'down') => {
    setFormData(prev => {
      const newMembers = [...prev.members];
      const swapIndex = direction === 'up' ? index - 1 : index + 1;
      [newMembers[index], newMembers[swapIndex]] = [newMembers[swapIndex], newMembers[index]];
      return {
        ...prev,
        members: newMembers.map((m, i) => ({ ...m, order: i + 1 }))
      };
    });
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) {
      newErrors.title = '请输入成果标题';
    }
    if (formData.members.length === 0) {
      newErrors.members = '请至少添加一位参与成员';
    } else if (formData.members.some(m => !m.userId)) {
      newErrors.members = '请完善所有成员信息';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    if (formData.type === 'paper') {
      if (!formData.paperJournal.trim()) {
        newErrors.paperJournal = '请输入期刊名称';
      }
      if (!formData.publicationDate) {
        newErrors.publicationDate = '请选择发表日期';
      }
    } else if (formData.type === 'patent') {
      if (!formData.patentNumber.trim()) {
        newErrors.patentNumber = '请输入专利号';
      }
      if (!formData.patentApplicationDate) {
        newErrors.patentApplicationDate = '请选择申请日期';
      }
    } else if (formData.type === 'project') {
      if (!formData.projectNumber.trim()) {
        newErrors.projectNumber = '请输入项目编号';
      }
      if (!formData.projectSource.trim()) {
        newErrors.projectSource = '请输入项目来源';
      }
      if (!formData.projectStartDate) {
        newErrors.projectStartDate = '请选择开始日期';
      }
      if (!formData.projectEndDate) {
        newErrors.projectEndDate = '请选择结束日期';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const getSubmitData = (): CreateAchievementRequest | UpdateAchievementRequest => {
    const data: any = {
      type: formData.type,
      title: formData.title.trim(),
      members: formData.members.map(m => ({
        userId: m.userId,
        userName: m.userName,
        role: m.role,
        order: m.order
      })),
    };

    if (formData.type === 'paper') {
      data.paperJournal = formData.paperJournal.trim();
      data.paperVolume = formData.paperVolume.trim() || undefined;
      data.paperIssue = formData.paperIssue.trim() || undefined;
      data.paperPages = formData.paperPages.trim() || undefined;
      data.paperDoi = formData.paperDoi.trim() || undefined;
      data.paperCitation = formData.paperCitation.trim() || undefined;
      data.publicationDate = formData.publicationDate || undefined;
    } else if (formData.type === 'patent') {
      data.patentNumber = formData.patentNumber.trim();
      data.patentType = formData.patentType;
      data.patentApplicationDate = formData.patentApplicationDate || undefined;
      data.patentGrantDate = formData.patentGrantDate || undefined;
      data.patentStatus = formData.patentStatus;
    } else if (formData.type === 'project') {
      data.projectNumber = formData.projectNumber.trim();
      data.projectSource = formData.projectSource.trim();
      data.projectLevel = formData.projectLevel;
      data.projectStartDate = formData.projectStartDate || undefined;
      data.projectEndDate = formData.projectEndDate || undefined;
      data.projectFunding = formData.projectFunding ? parseFloat(formData.projectFunding) : undefined;
      data.projectStatus = formData.projectStatus;
    }

    return data;
  };

  const handleSave = async () => {
    if (!validateStep1() || !validateStep2()) return;
    
    setSubmitting(true);
    try {
      const data = getSubmitData();
      if (isEdit) {
        await api.achievements.update(id!, data as UpdateAchievementRequest);
      } else {
        await api.achievements.create(data as CreateAchievementRequest);
      }
      alert(isEdit ? '保存成功' : '保存成功');
      navigate('/achievements');
    } catch (error: any) {
      alert(error.message || '保存失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep1() || !validateStep2()) return;

    if (!confirm('确定要提交审核吗？提交后将无法编辑，需等待导师审核。')) return;
    
    setSubmitting(true);
    try {
      const data = getSubmitData();
      let achievementId = id;
      
      if (!isEdit) {
        const newAchievement = await api.achievements.create(data as CreateAchievementRequest);
        achievementId = newAchievement.id;
      } else {
        await api.achievements.update(id!, data as UpdateAchievementRequest);
      }
      
      await api.achievements.submitForReview(achievementId!);
      alert('提交审核成功');
      navigate('/achievements');
    } catch (error: any) {
      alert(error.message || '提交失败');
    } finally {
      setSubmitting(false);
    }
  };

  const isEditable = !isEdit || (achievement && achievement.status === 'draft');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (isEdit && achievement && achievement.status !== 'draft') {
    return (
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate('/achievements')}
          className="flex items-center gap-2 text-slate-600 hover:text-blue-600 mb-6"
        >
          <ArrowLeft size={18} />
          返回列表
        </button>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
          <AlertCircle size={48} className="mx-auto mb-4 text-amber-500" />
          <h3 className="text-lg font-semibold text-amber-800 mb-2">无法编辑</h3>
          <p className="text-amber-700">该成果当前状态为"已提交审核"或"已归档"，无法进行编辑。</p>
          <button
            onClick={() => navigate(`/achievements/${id}`)}
            className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
          >
            查看详情
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => navigate('/achievements')}
        className="flex items-center gap-2 text-slate-600 hover:text-blue-600 mb-6"
      >
        <ArrowLeft size={18} />
        返回列表
      </button>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h1 className="text-2xl font-bold text-slate-800">
            {isEdit ? '编辑成果' : '录入新成果'}
          </h1>
          <p className="text-slate-500 mt-1">
            {isEdit ? '修改成果信息，保存后可提交审核' : '填写成果信息，支持保存草稿或直接提交审核'}
          </p>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                    currentStep === step 
                      ? 'bg-blue-600 text-white' 
                      : currentStep > step 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-slate-200 text-slate-600'
                  }`}>
                    {currentStep > step ? '✓' : step}
                  </div>
                  <span className={`text-sm font-medium ${
                    currentStep >= step ? 'text-slate-800' : 'text-slate-400'
                  }`}>
                    {step === 1 ? '基本信息' : step === 2 ? '详细信息' : '确认提交'}
                  </span>
                </div>
                {step < 3 && (
                  <div className={`flex-1 h-0.5 mx-4 ${
                    currentStep > step ? 'bg-emerald-500' : 'bg-slate-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="p-6">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  成果类型 <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { value: 'paper', label: '论文', icon: BookOpen, color: 'blue' },
                    { value: 'patent', label: '专利', icon: FileText, color: 'sky' },
                    { value: 'project', label: '项目', icon: Briefcase, color: 'emerald' },
                  ].map((type) => {
                    const Icon = type.icon;
                    const isSelected = formData.type === type.value;
                    const colorClasses = isSelected 
                      ? type.color === 'blue' ? 'border-blue-500 bg-blue-50' 
                        : type.color === 'sky' ? 'border-sky-500 bg-sky-50'
                        : 'border-emerald-500 bg-emerald-50'
                      : 'border-slate-200 hover:border-slate-300';
                    const textColor = isSelected
                      ? type.color === 'blue' ? 'text-blue-600'
                        : type.color === 'sky' ? 'text-sky-600'
                        : 'text-emerald-600'
                      : 'text-slate-600';
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => handleInputChange('type', type.value)}
                        disabled={isEdit}
                        className={`flex flex-col items-center gap-2 p-6 border-2 rounded-2xl transition-all ${colorClasses} ${isEdit ? 'opacity-60 cursor-not-allowed' : ''}`}
                      >
                        <Icon size={32} className={textColor} />
                        <span className={`font-semibold ${textColor}`}>{type.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  成果标题 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="请输入成果标题"
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.title ? 'border-rose-500' : 'border-slate-200'
                  }`}
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-rose-500">{errors.title}</p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-slate-700">
                    参与成员 <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={addMember}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                  >
                    <Plus size={16} />
                    添加成员
                  </button>
                </div>
                {errors.members && (
                  <p className="mb-2 text-sm text-rose-500">{errors.members}</p>
                )}
                <div className="space-y-3">
                  {formData.members.map((member, index) => (
                    <div 
                      key={index} 
                      className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl"
                    >
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                        {member.order}
                      </div>
                      <div className="flex-1 grid grid-cols-2 gap-3">
                        <select
                          value={member.userId}
                          onChange={(e) => updateMember(index, 'userId', e.target.value)}
                          className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">选择成员</option>
                          {users.map(u => (
                            <option key={u.id} value={u.id}>{u.name}</option>
                          ))}
                        </select>
                        <select
                          value={member.role}
                          onChange={(e) => updateMember(index, 'role', e.target.value)}
                          className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {memberRoleOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => moveMember(index, 'up')}
                          disabled={index === 0}
                          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => moveMember(index, 'down')}
                          disabled={index === formData.members.length - 1}
                          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          onClick={() => removeMember(index)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {formData.members.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl">
                      <User size={32} className="mx-auto mb-2 text-slate-300" />
                      <p className="text-slate-500">点击上方"添加成员"按钮添加参与成员</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              {formData.type === 'paper' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        期刊名称 <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.paperJournal}
                        onChange={(e) => handleInputChange('paperJournal', e.target.value)}
                        placeholder="例如：IEEE Transactions on Pattern Analysis and Machine Intelligence"
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.paperJournal ? 'border-rose-500' : 'border-slate-200'
                        }`}
                      />
                      {errors.paperJournal && (
                        <p className="mt-1 text-sm text-rose-500">{errors.paperJournal}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        发表日期 <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={formData.publicationDate}
                        onChange={(e) => handleInputChange('publicationDate', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.publicationDate ? 'border-rose-500' : 'border-slate-200'
                        }`}
                      />
                      {errors.publicationDate && (
                        <p className="mt-1 text-sm text-rose-500">{errors.publicationDate}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        卷号
                      </label>
                      <input
                        type="text"
                        value={formData.paperVolume}
                        onChange={(e) => handleInputChange('paperVolume', e.target.value)}
                        placeholder="例如：45"
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        期号
                      </label>
                      <input
                        type="text"
                        value={formData.paperIssue}
                        onChange={(e) => handleInputChange('paperIssue', e.target.value)}
                        placeholder="例如：6"
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        页码
                      </label>
                      <input
                        type="text"
                        value={formData.paperPages}
                        onChange={(e) => handleInputChange('paperPages', e.target.value)}
                        placeholder="例如：1234-1250"
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        DOI
                      </label>
                      <input
                        type="text"
                        value={formData.paperDoi}
                        onChange={(e) => handleInputChange('paperDoi', e.target.value)}
                        placeholder="例如：10.1109/TPAMI.2023.1234567"
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        引用格式
                      </label>
                      <textarea
                        value={formData.paperCitation}
                        onChange={(e) => handleInputChange('paperCitation', e.target.value)}
                        rows={3}
                        placeholder="例如：Author A, Author B. Title[J]. Journal Name, 2023, 45(6): 1234-1250."
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                    </div>
                  </div>
                </>
              )}

              {formData.type === 'patent' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        专利号 <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.patentNumber}
                        onChange={(e) => handleInputChange('patentNumber', e.target.value)}
                        placeholder="例如：CN202310123456.7"
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.patentNumber ? 'border-rose-500' : 'border-slate-200'
                        }`}
                      />
                      {errors.patentNumber && (
                        <p className="mt-1 text-sm text-rose-500">{errors.patentNumber}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        专利类型
                      </label>
                      <select
                        value={formData.patentType}
                        onChange={(e) => handleInputChange('patentType', e.target.value)}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {patentTypeOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        申请日期 <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={formData.patentApplicationDate}
                        onChange={(e) => handleInputChange('patentApplicationDate', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.patentApplicationDate ? 'border-rose-500' : 'border-slate-200'
                        }`}
                      />
                      {errors.patentApplicationDate && (
                        <p className="mt-1 text-sm text-rose-500">{errors.patentApplicationDate}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        授权日期
                      </label>
                      <input
                        type="date"
                        value={formData.patentGrantDate}
                        onChange={(e) => handleInputChange('patentGrantDate', e.target.value)}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        当前状态
                      </label>
                      <select
                        value={formData.patentStatus}
                        onChange={(e) => handleInputChange('patentStatus', e.target.value)}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {patentStatusOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}

              {formData.type === 'project' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        项目编号 <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.projectNumber}
                        onChange={(e) => handleInputChange('projectNumber', e.target.value)}
                        placeholder="例如：2023YFB1234500"
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.projectNumber ? 'border-rose-500' : 'border-slate-200'
                        }`}
                      />
                      {errors.projectNumber && (
                        <p className="mt-1 text-sm text-rose-500">{errors.projectNumber}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        项目级别
                      </label>
                      <select
                        value={formData.projectLevel}
                        onChange={(e) => handleInputChange('projectLevel', e.target.value)}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {projectLevelOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        项目来源 <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.projectSource}
                        onChange={(e) => handleInputChange('projectSource', e.target.value)}
                        placeholder="例如：国家重点研发计划"
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.projectSource ? 'border-rose-500' : 'border-slate-200'
                        }`}
                      />
                      {errors.projectSource && (
                        <p className="mt-1 text-sm text-rose-500">{errors.projectSource}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        开始日期 <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={formData.projectStartDate}
                        onChange={(e) => handleInputChange('projectStartDate', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.projectStartDate ? 'border-rose-500' : 'border-slate-200'
                        }`}
                      />
                      {errors.projectStartDate && (
                        <p className="mt-1 text-sm text-rose-500">{errors.projectStartDate}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        结束日期 <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={formData.projectEndDate}
                        onChange={(e) => handleInputChange('projectEndDate', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.projectEndDate ? 'border-rose-500' : 'border-slate-200'
                        }`}
                      />
                      {errors.projectEndDate && (
                        <p className="mt-1 text-sm text-rose-500">{errors.projectEndDate}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        资助金额（万元）
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.projectFunding}
                        onChange={(e) => handleInputChange('projectFunding', e.target.value)}
                        placeholder="例如：50"
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        项目状态
                      </label>
                      <select
                        value={formData.projectStatus}
                        onChange={(e) => handleInputChange('projectStatus', e.target.value)}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {projectStatusOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-blue-800 mb-4">请确认以下信息</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-4 py-3 border-b border-blue-100">
                    <span className="text-blue-600 font-medium w-24 flex-shrink-0">成果类型</span>
                    <span className="text-blue-800">
                      {formData.type === 'paper' ? '论文' : formData.type === 'patent' ? '专利' : '项目'}
                    </span>
                  </div>
                  <div className="flex items-start gap-4 py-3 border-b border-blue-100">
                    <span className="text-blue-600 font-medium w-24 flex-shrink-0">成果标题</span>
                    <span className="text-blue-800">{formData.title}</span>
                  </div>
                  <div className="flex items-start gap-4 py-3 border-b border-blue-100">
                    <span className="text-blue-600 font-medium w-24 flex-shrink-0">参与成员</span>
                    <div className="space-y-2">
                      {formData.members.map((member, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <span className="text-blue-400">{index + 1}.</span>
                          <span className="text-blue-800">{member.userName}</span>
                          <span className="text-blue-500 text-sm">({getMemberRoleLabel(member.role)})</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {formData.type === 'paper' && (
                    <>
                      <div className="flex items-start gap-4 py-3 border-b border-blue-100">
                        <span className="text-blue-600 font-medium w-24 flex-shrink-0">期刊名称</span>
                        <span className="text-blue-800">{formData.paperJournal}</span>
                      </div>
                      {formData.publicationDate && (
                        <div className="flex items-start gap-4 py-3 border-b border-blue-100">
                          <span className="text-blue-600 font-medium w-24 flex-shrink-0">发表日期</span>
                          <span className="text-blue-800">{formData.publicationDate}</span>
                        </div>
                      )}
                    </>
                  )}

                  {formData.type === 'patent' && (
                    <>
                      <div className="flex items-start gap-4 py-3 border-b border-blue-100">
                        <span className="text-blue-600 font-medium w-24 flex-shrink-0">专利号</span>
                        <span className="text-blue-800">{formData.patentNumber}</span>
                      </div>
                      <div className="flex items-start gap-4 py-3 border-b border-blue-100">
                        <span className="text-blue-600 font-medium w-24 flex-shrink-0">专利类型</span>
                        <span className="text-blue-800">{getPatentTypeLabel(formData.patentType)}</span>
                      </div>
                    </>
                  )}

                  {formData.type === 'project' && (
                    <>
                      <div className="flex items-start gap-4 py-3 border-b border-blue-100">
                        <span className="text-blue-600 font-medium w-24 flex-shrink-0">项目编号</span>
                        <span className="text-blue-800">{formData.projectNumber}</span>
                      </div>
                      <div className="flex items-start gap-4 py-3 border-b border-blue-100">
                        <span className="text-blue-600 font-medium w-24 flex-shrink-0">项目来源</span>
                        <span className="text-blue-800">{formData.projectSource}</span>
                      </div>
                      <div className="flex items-start gap-4 py-3">
                        <span className="text-blue-600 font-medium w-24 flex-shrink-0">项目级别</span>
                        <span className="text-blue-800">{getProjectLevelLabel(formData.projectLevel)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-800">提交审核说明</h4>
                    <p className="text-sm text-amber-700 mt-1">
                      提交审核后，成果将进入"待审核"状态，此时您将无法再编辑内容。
                      导师审核通过后成果将正式归档展示，如有问题导师会退回修改。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div>
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100"
              >
                上一步
              </button>
            ) : (
              <div />
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 disabled:opacity-50"
            >
              <Save size={16} />
              保存草稿
            </button>
            {currentStep < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
              >
                下一步
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 shadow-lg shadow-emerald-500/30"
              >
                <Send size={16} />
                提交审核
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
