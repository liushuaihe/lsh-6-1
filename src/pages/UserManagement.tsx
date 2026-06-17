import { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  User as UserIcon,
  Mail,
  Shield,
  ToggleLeft,
  ToggleRight,
  Search,
  X
} from 'lucide-react';
import { api } from '../api/client.js';
import { getUserRoleLabel, getRoleColor } from '../utils/format.js';
import type { User, CreateUserRequest, UpdateUserRequest } from '../../shared/types.js';

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<CreateUserRequest>({
    username: '',
    password: '',
    name: '',
    role: 'student',
    email: '',
    studentId: '',
    title: '',
    department: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await api.users.getAll();
      setUsers(data);
    } catch (error) {
      console.error('Load users error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.includes(searchKeyword) || 
    user.username.includes(searchKeyword) ||
    user.email.includes(searchKeyword)
  );

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({
      username: '',
      password: '',
      name: '',
      role: 'student',
      email: '',
      studentId: '',
      title: '',
      department: ''
    });
    setErrors({});
    setShowModal(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: '',
      name: user.name,
      role: user.role,
      email: user.email,
      studentId: user.studentId || '',
      title: user.title || '',
      department: user.department
    });
    setErrors({});
    setShowModal(true);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.username.trim()) {
      newErrors.username = '请输入用户名';
    }
    if (!editingUser && !formData.password) {
      newErrors.password = '请输入密码';
    }
    if (!formData.name.trim()) {
      newErrors.name = '请输入姓名';
    }
    if (!formData.email.trim()) {
      newErrors.email = '请输入邮箱';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '请输入有效的邮箱地址';
    }
    if (!formData.department.trim()) {
      newErrors.department = '请输入所属院系';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const data: CreateUserRequest | UpdateUserRequest = { ...formData };
      if (!formData.password) {
        delete (data as any).password;
      }
      if (!formData.studentId) {
        delete (data as any).studentId;
      }
      if (!formData.title) {
        delete (data as any).title;
      }

      if (editingUser) {
        await api.users.update(editingUser.id, data as UpdateUserRequest);
      } else {
        await api.users.create(data as CreateUserRequest);
      }
      setShowModal(false);
      loadUsers();
      alert(editingUser ? '更新成功' : '创建成功');
    } catch (error: any) {
      alert(error.message || '操作失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.users.delete(id);
      setDeleteConfirm(null);
      loadUsers();
    } catch (error: any) {
      alert(error.message || '删除失败');
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      await api.users.toggleActive(id);
      loadUsers();
    } catch (error: any) {
      alert(error.message || '操作失败');
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">用户管理</h1>
          <p className="text-slate-500 mt-1">管理实验室用户账号和权限</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-sky-500 text-white font-medium rounded-xl hover:from-blue-700 hover:to-sky-600 transition-all shadow-lg shadow-blue-500/30"
        >
          <Plus size={18} />
          添加用户
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="搜索用户名、姓名、邮箱..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">用户信息</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">用户名</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">角色</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">院系/部门</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">状态</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-800 rounded-full flex items-center justify-center text-white font-semibold">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{user.name}</p>
                        <p className="text-sm text-slate-500 flex items-center gap-1">
                          <Mail size={12} />
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{user.username}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                      <Shield size={12} className="mr-1" />
                      {getUserRoleLabel(user.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{user.department}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 text-sm ${
                      user.isActive ? 'text-emerald-600' : 'text-slate-400'
                    }`}>
                      {user.isActive ? '正常' : '已禁用'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleToggleActive(user.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          user.isActive 
                            ? 'text-amber-500 hover:bg-amber-50' 
                            : 'text-emerald-500 hover:bg-emerald-50'
                        }`}
                        title={user.isActive ? '禁用' : '启用'}
                      >
                        {user.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                      </button>
                      <button
                        onClick={() => openEditModal(user)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="编辑"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(user.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="删除"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <div className="text-center py-16">
              <UserIcon size={64} className="mx-auto mb-4 text-slate-300" />
              <h3 className="text-lg font-medium text-slate-700 mb-2">暂无用户数据</h3>
              <p className="text-slate-500">点击右上角按钮添加第一个用户</p>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-800">
                {editingUser ? '编辑用户' : '添加用户'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    用户名 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.username ? 'border-rose-500' : 'border-slate-200'
                    }`}
                    disabled={!!editingUser}
                  />
                  {errors.username && <p className="mt-1 text-xs text-rose-500">{errors.username}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {editingUser ? '新密码（不修改留空）' : '密码'} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.password ? 'border-rose-500' : 'border-slate-200'
                    }`}
                  />
                  {errors.password && <p className="mt-1 text-xs text-rose-500">{errors.password}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    姓名 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.name ? 'border-rose-500' : 'border-slate-200'
                    }`}
                  />
                  {errors.name && <p className="mt-1 text-xs text-rose-500">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    角色 <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as any }))}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="student">学生</option>
                    <option value="advisor">导师</option>
                    <option value="admin">管理员</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  邮箱 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.email ? 'border-rose-500' : 'border-slate-200'
                  }`}
                />
                {errors.email && <p className="mt-1 text-xs text-rose-500">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  所属院系/部门 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.department ? 'border-rose-500' : 'border-slate-200'
                  }`}
                />
                {errors.department && <p className="mt-1 text-xs text-rose-500">{errors.department}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">学号（学生）</label>
                  <input
                    type="text"
                    value={formData.studentId}
                    onChange={(e) => setFormData(prev => ({ ...prev, studentId: e.target.value }))}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">职称（导师）</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
                disabled={submitting}
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? '处理中...' : (editingUser ? '保存修改' : '创建用户')}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">确认删除</h3>
            <p className="text-slate-600 mb-6">确定要删除该用户吗？此操作无法撤销。</p>
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
    </div>
  );
}
