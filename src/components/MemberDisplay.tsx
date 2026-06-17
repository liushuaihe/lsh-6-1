import { useState } from 'react';
import { getMemberRoleLabel } from '../utils/format.js';
import type { AchievementMember } from '../../shared/types.js';

interface MemberDisplayProps {
  members: AchievementMember[];
  variant?: 'compact' | 'detailed' | 'inline';
  maxVisible?: number;
}

function getAvatarColor(index: number): string {
  const colors = [
    'bg-blue-500',
    'bg-emerald-500',
    'bg-amber-500',
    'bg-rose-500',
    'bg-violet-500',
    'bg-cyan-500',
    'bg-orange-500',
    'bg-teal-500',
  ];
  return colors[index % colors.length];
}

function getInitial(name: string): string {
  return name.charAt(0);
}

export function MemberDisplay({ members, variant = 'compact', maxVisible = 4 }: MemberDisplayProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  if (variant === 'inline') {
    return (
      <span className="text-sm text-slate-500">
        {members.map(m => m.userName).join('、')}
      </span>
    );
  }

  if (variant === 'detailed') {
    const visibleMembers = members.slice(0, 8);
    const remainingCount = Math.max(0, members.length - 8);

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {visibleMembers.map((member, index) => (
          <div
            key={member.id}
            className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl hover:border-blue-200 hover:shadow-sm transition-all"
          >
            <div className={`w-9 h-9 ${getAvatarColor(index)} text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 shadow-sm`}>
              {getInitial(member.userName)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-800 text-sm truncate">{member.userName}</p>
              <p className="text-xs text-slate-500">{getMemberRoleLabel(member.role)}</p>
            </div>
            <div className="w-5 h-5 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">
              {index + 1}
            </div>
          </div>
        ))}
        {remainingCount > 0 && (
          <div className="flex items-center gap-3 p-3 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
            <div className="w-9 h-9 bg-slate-200 text-slate-500 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
              +{remainingCount}
            </div>
            <p className="text-sm text-slate-500">还有 {remainingCount} 位成员</p>
          </div>
        )}
      </div>
    );
  }

  const visibleMembers = members.slice(0, maxVisible);
  const remainingCount = Math.max(0, members.length - maxVisible);

  return (
    <div 
      className="relative inline-flex items-center"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="flex -space-x-2">
        {visibleMembers.map((member, index) => (
          <div
            key={member.id}
            className={`w-7 h-7 ${getAvatarColor(index)} text-white rounded-full flex items-center justify-center text-xs font-semibold ring-2 ring-white flex-shrink-0 hover:scale-110 hover:z-10 transition-transform cursor-pointer`}
            title={`${member.userName} · ${getMemberRoleLabel(member.role)}`}
          >
            {getInitial(member.userName)}
          </div>
        ))}
        {remainingCount > 0 && (
          <div className="w-7 h-7 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center text-xs font-semibold ring-2 ring-white flex-shrink-0">
            +{remainingCount}
          </div>
        )}
      </div>

      {members.length > 0 && (
        <span className="ml-2.5 text-sm text-slate-600 font-medium">
          {members.length} 位成员
        </span>
      )}

      {showTooltip && members.length > 0 && (
        <div className="absolute bottom-full left-0 mb-2 z-50">
          <div className="bg-slate-900 text-white rounded-xl shadow-xl p-3 min-w-[200px] max-w-[280px]">
            <p className="text-xs text-slate-400 mb-2 font-medium">全部成员</p>
            <div className="space-y-1.5">
              {members.map((member, index) => (
                <div key={member.id} className="flex items-center gap-2">
                  <div className={`w-5 h-5 ${getAvatarColor(index)} text-white rounded-full flex items-center justify-center text-[10px] font-semibold flex-shrink-0`}>
                    {getInitial(member.userName)}
                  </div>
                  <span className="text-sm text-white truncate flex-1">{member.userName}</span>
                  <span className="text-xs text-slate-400 flex-shrink-0">{getMemberRoleLabel(member.role)}</span>
                </div>
              ))}
            </div>
            <div className="absolute -bottom-1.5 left-6 w-3 h-3 bg-slate-900 rotate-45"></div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MemberDisplay;
