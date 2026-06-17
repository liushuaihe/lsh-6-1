import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  FileCheck, 
  BarChart3, 
  Users, 
  LogOut,
  Menu,
  X,
  ChevronDown,
  User
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore.js';
import { getUserRoleLabel, getRoleColor } from '../utils/format.js';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: '首页概览', roles: ['student', 'advisor', 'admin'] },
    { path: '/achievements', icon: FileText, label: '成果管理', roles: ['student', 'advisor', 'admin'] },
    { path: '/review', icon: FileCheck, label: '审核管理', roles: ['advisor', 'admin'] },
    { path: '/statistics', icon: BarChart3, label: '统计分析', roles: ['student', 'advisor', 'admin'] },
    { path: '/users', icon: Users, label: '用户管理', roles: ['admin'] },
  ];

  const filteredNavItems = navItems.filter(item => 
    user && item.roles.includes(user.role)
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside 
        className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-slate-200 transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-sky-500 rounded-xl flex items-center justify-center text-white font-bold">
              实
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="font-bold text-slate-800">成果管理平台</h1>
                <p className="text-xs text-slate-500">实验室科研管理</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            {sidebarOpen ? <X size={20} className="text-slate-600" /> : <Menu size={20} className="text-slate-600" />}
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {filteredNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                ${isActive 
                  ? 'bg-blue-50 text-blue-600 shadow-sm' 
                  : 'text-slate-600 hover:bg-slate-100'
                }
              `}
            >
              <item.icon size={20} />
              {sidebarOpen && <span className="font-medium">{item.label}</span>}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-slate-800">
              {filteredNavItems.find(item => window.location.pathname === item.path)?.label || '实验室师生成果管理平台'}
            </h2>
          </div>

          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <div className="w-9 h-9 bg-gradient-to-br from-slate-700 to-slate-900 rounded-full flex items-center justify-center text-white">
                <User size={18} />
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-medium text-slate-800">{user?.name}</p>
                <p className={`text-xs px-2 py-0.5 rounded-full inline-block ${getRoleColor(user?.role || 'student')}`}>
                  {getUserRoleLabel(user?.role || 'student')}
                </p>
              </div>
              <ChevronDown size={16} className="text-slate-400" />
            </button>

            {userMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setUserMenuOpen(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="font-medium text-slate-800">{user?.name}</p>
                    <p className="text-sm text-slate-500">{user?.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <LogOut size={18} />
                    <span>退出登录</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
