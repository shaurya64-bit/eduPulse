import React from 'react';
import { 
  GraduationCap, 
  ShieldCheck, 
  UserCheck, 
  LogOut, 
  Wifi, 
  Bell,
  Sparkles
} from 'lucide-react';
import { StudentRecord } from '../types/student';

interface NavbarProps {
  currentRole: 'none' | 'admin' | 'parent';
  parentStudent: StudentRecord | null;
  onLogout: () => void;
  onRoleSwitch: (role: 'admin' | 'parent') => void;
  unreadCount?: number;
  onOpenNotifications?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  parentStudent,
  onLogout,
  onRoleSwitch,
  unreadCount = 0,
  onOpenNotifications,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onLogout()}>
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 p-0.5 shadow-lg shadow-indigo-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                EduPulse
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                School Sync
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-none hidden sm:block">
              Real-time Academic & Student Management
            </p>
          </div>
        </div>

        {/* Live Status & Role Context */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Real-time Firestore Live Indicator */}
          <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Wifi className="w-3 h-3 ml-0.5" />
            <span>Firestore Live</span>
          </div>

          {currentRole === 'none' ? (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onRoleSwitch('parent')}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition-colors"
              >
                Parent Portal
              </button>
              <button
                onClick={() => onRoleSwitch('admin')}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-sm shadow-indigo-600/30 transition-all flex items-center space-x-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Login</span>
              </button>
            </div>
          ) : currentRole === 'admin' ? (
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-indigo-950/60 border border-indigo-500/30 text-indigo-200 text-xs">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                <span className="font-semibold">Administrator</span>
                <span className="text-[10px] text-indigo-400/80 uppercase tracking-wider font-mono">Master Mode</span>
              </div>
              <button
                onClick={onLogout}
                className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="Log out from Admin"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* Parent Role */
            <div className="flex items-center space-x-3">
              {onOpenNotifications && (
                <button
                  onClick={onOpenNotifications}
                  className="relative p-2 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors"
                  title="View Updates & Alerts"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-slate-900 animate-pulse" />
                  )}
                </button>
              )}
              <div className="flex items-center space-x-2.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700/80 text-xs">
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center text-white font-bold text-[11px]">
                  {parentStudent?.studentName ? parentStudent.studentName.charAt(0) : 'P'}
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-semibold text-slate-200 leading-tight">
                    {parentStudent?.studentName || 'Student'}
                  </span>
                  <span className="text-[10px] text-slate-400 leading-tight">
                    {parentStudent?.class || 'Class'} • {parentStudent?.userId}
                  </span>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="Log out of Parent Portal"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
