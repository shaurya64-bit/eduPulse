import React, { useState } from 'react';
import { 
  ShieldCheck, 
  User, 
  Lock, 
  KeyRound, 
  AlertCircle, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  GraduationCap, 
  BookOpen, 
  Sparkles,
  ArrowRight,
  Info
} from 'lucide-react';
import { authenticateParent } from '../services/studentService';
import { StudentRecord } from '../types/student';

interface LoginScreenProps {
  initialRole?: 'admin' | 'parent';
  onAdminSuccess: () => void;
  onParentSuccess: (student: StudentRecord) => void;
  availableParentDemos?: StudentRecord[];
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  initialRole = 'admin',
  onAdminSuccess,
  onParentSuccess,
  availableParentDemos = []
}) => {
  const [activeTab, setActiveTab] = useState<'admin' | 'parent'>(initialRole);

  // Admin Login State
  const [adminPassword, setAdminPassword] = useState('');
  const [adminShowPassword, setAdminShowPassword] = useState(false);
  const [adminError, setAdminError] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);

  // Parent Login State
  const [parentUserId, setParentUserId] = useState('');
  const [parentPassword, setParentPassword] = useState('');
  const [parentShowPassword, setParentShowPassword] = useState(false);
  const [parentError, setParentError] = useState('');
  const [parentLoading, setParentLoading] = useState(false);

  // Handle Admin Login: STRICT check against 'rabit@12bmw'
  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');

    if (!adminPassword) {
      setAdminError('Please enter the administrative master password.');
      return;
    }

    setAdminLoading(true);

    // Simulate verification
    setTimeout(() => {
      // STRICT REQUIREMENT: Only unlocks if exact password 'rabit@12bmw' is typed
      if (adminPassword === 'rabit@12bmw') {
        setAdminLoading(false);
        onAdminSuccess();
      } else {
        setAdminLoading(false);
        setAdminError('Access Denied. Incorrect administrative password provided.');
      }
    }, 400);
  };

  // Handle Parent Login: verifies against Firestore
  const handleParentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setParentError('');

    if (!parentUserId.trim() || !parentPassword.trim()) {
      setParentError('Both User ID and Student Password are required.');
      return;
    }

    setParentLoading(true);
    try {
      const res = await authenticateParent(parentUserId, parentPassword);
      setParentLoading(false);

      if (res.success && res.student) {
        onParentSuccess(res.student);
      } else {
        setParentError(res.error || 'Authentication failed. Please check your credentials.');
      }
    } catch (err) {
      setParentLoading(false);
      setParentError('Unable to verify credentials with Firebase. Please try again.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="w-full max-w-xl">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-500 shadow-xl shadow-indigo-500/25 mb-4 p-0.5">
            <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
              <GraduationCap className="w-7 h-7 text-indigo-400" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            EduPulse School Management
          </h1>
          <p className="mt-2 text-sm text-slate-400 max-w-md mx-auto">
            Real-time academic records, attendance syncing, and transparent parent portal powered by Firebase Firestore.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden backdrop-blur-xl">
          <div className="grid grid-cols-2 p-1.5 bg-slate-950/70 border-b border-slate-800/80">
            <button
              type="button"
              onClick={() => {
                setActiveTab('admin');
                setAdminError('');
              }}
              className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeTab === 'admin'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Portal</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('parent');
                setParentError('');
              }}
              className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeTab === 'parent'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Parent Portal</span>
            </button>
          </div>

          <div className="p-6 sm:p-8">
            {/* ================= ADMIN TAB ================= */}
            {activeTab === 'admin' && (
              <div>
                <div className="mb-6">
                  <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Protected Gateway</span>
                  </div>
                  <h2 className="text-xl font-bold text-white">
                    Administrator Login
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    Enter the authorized master administrator password to access student records and the master editor.
                  </p>
                </div>

                {adminError && (
                  <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start space-x-3 text-rose-300 text-xs sm:text-sm animate-shake">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span>{adminError}</span>
                  </div>
                )}

                <form onSubmit={handleAdminSubmit} className="space-y-5">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Admin Master Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <KeyRound className="w-4 h-4" />
                      </div>
                      <input
                        type={adminShowPassword ? 'text' : 'password'}
                        value={adminPassword}
                        onChange={(e) => {
                          setAdminPassword(e.target.value);
                          if (adminError) setAdminError('');
                        }}
                        placeholder="Enter master password"
                        autoComplete="off"
                        className="w-full pl-10 pr-10 py-3 bg-slate-950/80 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setAdminShowPassword(!adminShowPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200"
                        title={adminShowPassword ? 'Hide password' : 'Show password'}
                      >
                        {adminShowPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={adminLoading}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer"
                  >
                    {adminLoading ? (
                      <span className="flex items-center space-x-2">
                        <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Verifying Authorization...</span>
                      </span>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Unlock Admin Dashboard</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
                  <p className="text-xs text-slate-500 flex items-center justify-center space-x-1.5">
                    <Lock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Single master password required. Session strictly authenticated.</span>
                  </p>
                </div>
              </div>
            )}

            {/* ================= PARENT TAB ================= */}
            {activeTab === 'parent' && (
              <div>
                <div className="mb-6">
                  <div className="flex items-center space-x-2 text-sky-400 text-xs font-semibold uppercase tracking-wider mb-1">
                    <User className="w-3.5 h-3.5" />
                    <span>Parent & Guardian Access</span>
                  </div>
                  <h2 className="text-xl font-bold text-white">
                    Sign In to Student Portal
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    Enter the unique User ID and Password assigned to your child to securely view attendance, fees, topic coverage, and exam grades.
                  </p>
                </div>

                {parentError && (
                  <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start space-x-3 text-rose-300 text-xs sm:text-sm animate-shake">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span>{parentError}</span>
                  </div>
                )}

                <form onSubmit={handleParentSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Student User ID
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={parentUserId}
                        onChange={(e) => {
                          setParentUserId(e.target.value);
                          if (parentError) setParentError('');
                        }}
                        placeholder="e.g. STU601 or STU1001"
                        className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 uppercase tracking-wide transition-colors font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      User Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={parentShowPassword ? 'text' : 'password'}
                        value={parentPassword}
                        onChange={(e) => {
                          setParentPassword(e.target.value);
                          if (parentError) setParentError('');
                        }}
                        placeholder="Enter parent password"
                        className="w-full pl-10 pr-10 py-3 bg-slate-950/80 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setParentShowPassword(!parentShowPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200"
                        title={parentShowPassword ? 'Hide password' : 'Show password'}
                      >
                        {parentShowPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={parentLoading}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-sky-600/30 hover:shadow-sky-600/50 transition-all flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer"
                  >
                    {parentLoading ? (
                      <span className="flex items-center space-x-2">
                        <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Loading Student Records...</span>
                      </span>
                    ) : (
                      <>
                        <BookOpen className="w-4 h-4" />
                        <span>Sign In to Parent Portal</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* Convenient Parent Credentials Quick Selector for Evaluators/Parents */}
                <div className="mt-6 pt-5 border-t border-slate-800">
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-300">
                      <Info className="w-3.5 h-3.5 text-sky-400" />
                      <span>Sample Parent Accounts for Testing</span>
                    </div>
                    <span className="text-[10px] text-slate-500">Click to fill parent fields</span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setParentUserId('STU601');
                        setParentPassword('parent@601');
                        setParentError('');
                      }}
                      className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-sky-500/50 text-left transition-colors group cursor-pointer"
                    >
                      <div className="text-xs font-semibold text-white group-hover:text-sky-300">
                        Aarav (Class 6)
                      </div>
                      <div className="text-[11px] font-mono text-slate-400">
                        ID: <span className="text-sky-400">STU601</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setParentUserId('STU701');
                        setParentPassword('parent@701');
                        setParentError('');
                      }}
                      className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-sky-500/50 text-left transition-colors group cursor-pointer"
                    >
                      <div className="text-xs font-semibold text-white group-hover:text-sky-300">
                        Ananya (Class 7)
                      </div>
                      <div className="text-[11px] font-mono text-slate-400">
                        ID: <span className="text-sky-400">STU701</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setParentUserId('STU1001');
                        setParentPassword('parent@1001');
                        setParentError('');
                      }}
                      className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-sky-500/50 text-left transition-colors group cursor-pointer"
                    >
                      <div className="text-xs font-semibold text-white group-hover:text-sky-300">
                        Rohan (Class 10)
                      </div>
                      <div className="text-[11px] font-mono text-slate-400">
                        ID: <span className="text-sky-400">STU1001</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
