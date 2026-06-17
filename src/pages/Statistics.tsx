import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  PieChart, 
  Users, 
  Calendar,
  Download,
  Filter,
  TrendingUp,
  BookOpen,
  FileText,
  Briefcase
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
  PieChart as RePieChart,
  Pie,
  Cell
} from 'recharts';
import { api } from '../api/client.js';
import { downloadFile, formatDate } from '../utils/format.js';
import type { 
  YearlyStatistics, 
  MemberStatistics, 
  TypeStatistics,
  AchievementQuery,
  User,
  AchievementType
} from '../../shared/types.js';

const COLORS = ['#3b82f6', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Statistics() {
  const [yearlyStats, setYearlyStats] = useState<YearlyStatistics[]>([]);
  const [memberStats, setMemberStats] = useState<MemberStatistics[]>([]);
  const [typeStats, setTypeStats] = useState<TypeStatistics[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<AchievementQuery>({
    type: undefined,
    userId: undefined,
    startDate: '',
    endDate: '',
  });
  const [statsFilters, setStatsFilters] = useState({
    startYear: new Date().getFullYear() - 4,
    endYear: new Date().getFullYear(),
    userId: undefined as string | undefined,
    type: undefined as AchievementType | undefined,
  });

  useEffect(() => {
    loadData();
  }, [statsFilters]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [yearly, members, types, userList] = await Promise.all([
        api.statistics.getYearly(statsFilters),
        api.statistics.getMembers(statsFilters),
        api.statistics.getTypes(statsFilters),
        api.users.getActive()
      ]);
      setYearlyStats(yearly);
      setMemberStats(members);
      setTypeStats(types);
      setUsers(userList);
    } catch (error) {
      console.error('Load statistics error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const data = await api.statistics.exportExcel(filters);
      const filename = `科研成果清单_${formatDate(new Date().toISOString()).replace(/\//g, '-')}.xlsx`;
      downloadFile(data, filename);
    } catch (error: any) {
      alert(error.message || '导出失败');
    } finally {
      setExporting(false);
    }
  };

  const totalCount = yearlyStats.reduce((sum, y) => sum + y.totalCount, 0);
  const totalPaper = yearlyStats.reduce((sum, y) => sum + y.paperCount, 0);
  const totalPatent = yearlyStats.reduce((sum, y) => sum + y.patentCount, 0);
  const totalProject = yearlyStats.reduce((sum, y) => sum + y.projectCount, 0);

  const topMembers = [...memberStats].sort((a, b) => b.totalCount - a.totalCount).slice(0, 10);

  const chartData = yearlyStats.map(y => ({
    year: y.year,
    论文: y.paperCount,
    专利: y.patentCount,
    项目: y.projectCount,
    总计: y.totalCount
  }));

  const typeChartData = typeStats.map(t => ({
    name: t.label,
    value: t.count
  }));

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
          <h1 className="text-2xl font-bold text-slate-800">统计分析</h1>
          <p className="text-slate-500 mt-1">多维度统计分析实验室科研产出</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-xl transition-colors ${
              showFilters 
                ? 'bg-blue-50 border-blue-200 text-blue-600' 
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Filter size={16} />
            筛选条件
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/30 disabled:opacity-50"
          >
            <Download size={16} />
            {exporting ? '导出中...' : '导出Excel'}
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-semibold text-slate-800 mb-4">统计筛选条件</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">开始年份</label>
              <select
                value={statsFilters.startYear}
                onChange={(e) => setStatsFilters(prev => ({ ...prev, startYear: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 9 + i).map(year => (
                  <option key={year} value={year}>{year}年</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">结束年份</label>
              <select
                value={statsFilters.endYear}
                onChange={(e) => setStatsFilters(prev => ({ ...prev, endYear: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 9 + i).map(year => (
                  <option key={year} value={year}>{year}年</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">成果类型</label>
              <select
                value={statsFilters.type || ''}
                onChange={(e) => setStatsFilters(prev => ({ ...prev, type: e.target.value as AchievementType || undefined }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">全部类型</option>
                <option value="paper">论文</option>
                <option value="patent">专利</option>
                <option value="project">项目</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">成员</label>
              <select
                value={statsFilters.userId || ''}
                onChange={(e) => setStatsFilters(prev => ({ ...prev, userId: e.target.value || undefined }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">全部成员</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-200">
            <h4 className="text-sm font-medium text-slate-700 mb-2">导出筛选条件</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1">成果类型</label>
                <select
                  value={filters.type || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value as AchievementType || undefined }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">全部</option>
                  <option value="paper">论文</option>
                  <option value="patent">专利</option>
                  <option value="project">项目</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">成员</label>
                <select
                  value={filters.userId || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, userId: e.target.value || undefined }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">全部</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">开始日期</label>
                <input
                  type="date"
                  value={filters.startDate || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">结束日期</label>
                <input
                  type="date"
                  value={filters.endDate || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
              <BarChart3 size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-slate-500 text-sm">成果总数</p>
              <p className="text-2xl font-bold text-slate-800">{totalCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
              <BookOpen size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-slate-500 text-sm">论文总数</p>
              <p className="text-2xl font-bold text-slate-800">{totalPaper}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center">
              <FileText size={24} className="text-sky-600" />
            </div>
            <div>
              <p className="text-slate-500 text-sm">专利总数</p>
              <p className="text-2xl font-bold text-slate-800">{totalPatent}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Briefcase size={24} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-slate-500 text-sm">项目总数</p>
              <p className="text-2xl font-bold text-slate-800">{totalProject}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <TrendingUp size={20} className="text-blue-500" />
              年度成果趋势
            </h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
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
                <Legend />
                <Bar dataKey="论文" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="专利" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                <Bar dataKey="项目" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <PieChart size={20} className="text-purple-500" />
              成果类型分布
            </h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={typeChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {typeChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Users size={20} className="text-amber-500" />
            成员产出排名
          </h3>
        </div>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={topMembers.map(m => ({ ...m, name: m.userName }))} 
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" stroke="#64748b" fontSize={12} />
              <YAxis 
                dataKey="name" 
                type="category" 
                stroke="#64748b" 
                fontSize={12} 
                width={80}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                }}
              />
              <Legend />
              <Bar dataKey="paperCount" name="论文" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              <Bar dataKey="patentCount" name="专利" fill="#0ea5e9" radius={[0, 4, 4, 0]} />
              <Bar dataKey="projectCount" name="项目" fill="#10b981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
            <Calendar size={20} className="text-blue-500" />
            年度统计表
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">年份</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600">论文</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600">专利</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600">项目</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600">总计</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {yearlyStats.map((stat) => (
                  <tr key={stat.year} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800">{stat.year}年</td>
                    <td className="px-4 py-3 text-center text-slate-600">{stat.paperCount}</td>
                    <td className="px-4 py-3 text-center text-slate-600">{stat.patentCount}</td>
                    <td className="px-4 py-3 text-center text-slate-600">{stat.projectCount}</td>
                    <td className="px-4 py-3 text-center font-semibold text-blue-600">{stat.totalCount}</td>
                  </tr>
                ))}
                {yearlyStats.length > 1 && (
                  <tr className="bg-blue-50 font-medium">
                    <td className="px-4 py-3 text-slate-800">合计</td>
                    <td className="px-4 py-3 text-center text-slate-700">{totalPaper}</td>
                    <td className="px-4 py-3 text-center text-slate-700">{totalPatent}</td>
                    <td className="px-4 py-3 text-center text-slate-700">{totalProject}</td>
                    <td className="px-4 py-3 text-center text-blue-600">{totalCount}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
            <Users size={20} className="text-emerald-500" />
            成员产出详情
          </h3>
          <div className="overflow-x-auto max-h-96">
            <table className="w-full">
              <thead className="bg-slate-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">排名</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">姓名</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600">论文</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600">专利</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600">项目</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600">总计</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[...memberStats].sort((a, b) => b.totalCount - a.totalCount).map((stat, index) => (
                  <tr key={stat.userId} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold ${
                        index === 0 ? 'bg-amber-100 text-amber-700' :
                        index === 1 ? 'bg-slate-100 text-slate-700' :
                        index === 2 ? 'bg-orange-100 text-orange-700' :
                        'bg-slate-50 text-slate-500'
                      }`}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">{stat.userName}</td>
                    <td className="px-4 py-3 text-center text-slate-600">{stat.paperCount}</td>
                    <td className="px-4 py-3 text-center text-slate-600">{stat.patentCount}</td>
                    <td className="px-4 py-3 text-center text-slate-600">{stat.projectCount}</td>
                    <td className="px-4 py-3 text-center font-semibold text-emerald-600">{stat.totalCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
