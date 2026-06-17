import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  FileCheck, 
  TrendingUp, 
  Clock, 
  BookOpen, 
  Award, 
  Briefcase,
  Plus,
  ArrowRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { api } from '../api/client.js';
import { useAuthStore } from '../store/useAuthStore.js';
import { formatDate } from '../utils/format.js';
import type { Achievement, YearlyStatistics, TypeStatistics } from '../../shared/types.js';

const COLORS = ['#3b82f6', '#0ea5e9', '#10b981'];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [yearlyStats, setYearlyStats] = useState<YearlyStatistics[]>([]);
  const [typeStats, setTypeStats] = useState<TypeStatistics[]>([]);
  const [recentAchievements, setRecentAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [dashboard, yearly, types, achievements] = await Promise.all([
        api.statistics.getDashboard(),
        api.statistics.getYearly({}),
        api.statistics.getTypes({}),
        api.achievements.getAll({ pageSize: 5, page: 1 })
      ]);
      setDashboardStats(dashboard);
      setYearlyStats(yearly);
      setTypeStats(types);
      setRecentAchievements(achievements.data);
    } catch (error) {
      console.error('Load dashboard data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { 
      label: '已归档成果', 
      value: dashboardStats?.totalApproved || 0, 
      icon: Award, 
      color: 'from-emerald-500 to-teal-600',
      bgColor: 'bg-emerald-50'
    },
    { 
      label: '待审核', 
      value: dashboardStats?.pendingReview || 0, 
      icon: Clock, 
      color: 'from-amber-500 to-orange-600',
      bgColor: 'bg-amber-50'
    },
    { 
      label: '今年新增', 
      value: dashboardStats?.currentYearCount || 0, 
      icon: TrendingUp, 
      color: 'from-blue-500 to-sky-600',
      bgColor: 'bg-blue-50'
    },
    { 
      label: '同比增长', 
      value: `${dashboardStats?.growthRate || 0}%`, 
      icon: TrendingUp, 
      color: (dashboardStats?.growthRate || 0) >= 0 ? 'from-green-500 to-emerald-600' : 'from-rose-500 to-red-600',
      bgColor: (dashboardStats?.growthRate || 0) >= 0 ? 'bg-green-50' : 'bg-rose-50'
    },
  ];

  const typeBreakdown = [
    { label: '论文', value: dashboardStats?.paperCount || 0, icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: '专利', value: dashboardStats?.patentCount || 0, icon: FileText, color: 'text-sky-600', bg: 'bg-sky-50' },
    { label: '项目', value: dashboardStats?.projectCount || 0, icon: Briefcase, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            欢迎回来，{user?.name}
          </h1>
          <p className="text-slate-500 mt-1">
            {formatDate(new Date().toISOString())} · 今天是个好日子
          </p>
        </div>
        {user?.role !== 'admin' && (
          <button
            onClick={() => navigate('/achievements/new')}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-sky-500 text-white font-medium rounded-xl hover:from-blue-700 hover:to-sky-600 transition-all shadow-lg shadow-blue-500/30"
          >
            <Plus size={18} />
            录入成果
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div 
            key={index}
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-500 text-sm">{stat.label}</p>
                <p className="text-3xl font-bold text-slate-800 mt-2">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon size={24} className={`bg-gradient-to-br ${stat.color} bg-clip-text text-transparent`} style={{ color: stat.color.includes('emerald') ? '#10b981' : stat.color.includes('amber') ? '#f59e0b' : '#3b82f6' }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-800">年度成果趋势</h3>
            <button 
              onClick={() => navigate('/statistics')}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
            >
              查看详情 <ArrowRight size={14} />
            </button>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={yearlyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="year" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                  }}
                />
                <Bar dataKey="paperCount" name="论文" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="patentCount" name="专利" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                <Bar dataKey="projectCount" name="项目" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">成果类型分布</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="label"
                >
                  {typeStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3 mt-4">
            {typeBreakdown.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 ${item.bg} rounded-lg flex items-center justify-center`}>
                    <item.icon size={16} className={item.color} />
                  </div>
                  <span className="text-slate-600">{item.label}</span>
                </div>
                <span className="font-semibold text-slate-800">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-800">最近成果</h3>
            <button 
              onClick={() => navigate('/achievements')}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
            >
              查看全部 <ArrowRight size={14} />
            </button>
          </div>
          <div className="space-y-4">
            {recentAchievements.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <FileText size={48} className="mx-auto mb-3 text-slate-300" />
                <p>暂无成果数据</p>
              </div>
            ) : (
              recentAchievements.map((achievement) => (
                <div 
                  key={achievement.id}
                  className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/achievements/${achievement.id}`)}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    achievement.type === 'paper' ? 'bg-blue-50 text-blue-600' :
                    achievement.type === 'patent' ? 'bg-sky-50 text-sky-600' :
                    'bg-emerald-50 text-emerald-600'
                  }`}>
                    {achievement.type === 'paper' ? <BookOpen size={18} /> :
                     achievement.type === 'patent' ? <FileText size={18} /> :
                     <Briefcase size={18} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-slate-800 truncate">{achievement.title}</h4>
                    <p className="text-sm text-slate-500 mt-1">
                      {achievement.members.map(m => m.userName).join('、')}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">{formatDate(achievement.createdAt)}</p>
                  </div>
                  <div className="flex-shrink-0">
                    {achievement.status === 'approved' ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                        已归档
                      </span>
                    ) : achievement.status === 'pending' ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                        待审核
                      </span>
                    ) : achievement.status === 'rejected' ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-700">
                        已退回
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        草稿
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">快捷操作</h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/achievements/new')}
              className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                <Plus size={24} className="text-blue-600 group-hover:text-white transition-colors" />
              </div>
              <span className="font-medium text-slate-700 group-hover:text-blue-600">录入成果</span>
            </button>
            <button
              onClick={() => navigate('/statistics')}
              className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-dashed border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-500 transition-colors">
                <TrendingUp size={24} className="text-emerald-600 group-hover:text-white transition-colors" />
              </div>
              <span className="font-medium text-slate-700 group-hover:text-emerald-600">统计分析</span>
            </button>
            {user?.role !== 'student' && (
              <button
                onClick={() => navigate('/review')}
                className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-dashed border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center group-hover:bg-amber-500 transition-colors">
                  <FileCheck size={24} className="text-amber-600 group-hover:text-white transition-colors" />
                </div>
                <span className="font-medium text-slate-700 group-hover:text-amber-600">审核管理</span>
              </button>
            )}
            {user?.role === 'admin' && (
              <button
                onClick={() => navigate('/users')}
                className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-dashed border-slate-200 hover:border-purple-400 hover:bg-purple-50/50 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center group-hover:bg-purple-500 transition-colors">
                  <FileText size={24} className="text-purple-600 group-hover:text-white transition-colors" />
                </div>
                <span className="font-medium text-slate-700 group-hover:text-purple-600">用户管理</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
