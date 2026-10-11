import React, { useState } from 'react';
import { 
  X, 
  Check, 
  Calendar, 
  DollarSign, 
  BookOpen, 
  Award, 
  Bell, 
  User, 
  Lock, 
  Save, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ShieldAlert,
  Hash
} from 'lucide-react';
import { StudentRecord, AttendanceStatus } from '../types/student';
import { updateStudent } from '../services/studentService';

interface MasterEditModalProps {
  student: StudentRecord;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const MasterEditModal: React.FC<MasterEditModalProps> = ({
  student,
  isOpen,
  onClose,
  onSuccess,
}) => {
  if (!isOpen) return null;

  // Form states initialized with student values
  const [studentName, setStudentName] = useState(student.studentName);
  const [studentClass, setStudentClass] = useState(student.class);
  const [rollNumber, setRollNumber] = useState(student.rollNumber || '');
  const [userId, setUserId] = useState(student.userId);
  const [userPassword, setUserPassword] = useState(student.userPassword);
  
  // The 4 core required master fields:
  const [todaysAttendance, setTodaysAttendance] = useState<AttendanceStatus>(student.todaysAttendance);
  const [pendingFeesAmount, setPendingFeesAmount] = useState<number>(student.pendingFeesAmount);
  const [todaysTopicCovered, setTodaysTopicCovered] = useState(student.todaysTopicCovered);
  const [examResult, setExamResult] = useState(student.examResult);
  
  // Extra alert message for parent notifications
  const [recentAlert, setRecentAlert] = useState(student.recentAlert || '');
  const [parentPhone, setParentPhone] = useState(student.parentPhone || '');

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Quick fee adjustment helper
  const handleFeeAdjust = (delta: number) => {
    setPendingFeesAmount((prev) => Math.max(0, prev + delta));
  };

  // Quick insert topic template helper
  const handleInsertTopic = (snippet: string) => {
    setTodaysTopicCovered((prev) => {
      if (!prev.trim()) return snippet;
      return `${prev}\n• ${snippet}`;
    });
  };

  // Save everything simultaneously to Firebase
  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      if (!studentName.trim()) {
        throw new Error('Student name cannot be empty.');
      }
      if (!userId.trim() || !userPassword.trim()) {
        throw new Error('Parent UserID and UserPassword are required.');
      }

      await updateStudent(student.id, {
        studentName: studentName.trim(),
        class: studentClass.trim(),
        rollNumber: rollNumber.trim(),
        userId: userId.trim(),
        userPassword: userPassword.trim(),
        todaysAttendance,
        pendingFeesAmount: Number(pendingFeesAmount) || 0,
        todaysTopicCovered: todaysTopicCovered.trim(),
        examResult: examResult.trim(),
        recentAlert: recentAlert.trim(),
        parentPhone: parentPhone.trim(),
        lastUpdated: new Date().toISOString()
      });

      setIsSaving(false);
      setSaveSuccess(true);

      setTimeout(() => {
        onSuccess();
        onClose();
      }, 700);
    } catch (err) {
      setIsSaving(false);
      setErrorMessage(err instanceof Error ? err.message : 'Failed to update student in Firebase.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-lg">
              {student.studentName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                  Master Edit Screen
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                  ID: {student.userId}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white mt-0.5">
                {student.studentName} — {student.class}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - Scrollable content */}
        <form onSubmit={handleSaveAll} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center space-x-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {saveSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center space-x-2.5 animate-bounce">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>All student records updated successfully in Firebase!</span>
            </div>
          )}

          {/* GRID OF THE 4 CORE REQUIREMENTS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* 1. UPDATE ATTENDANCE */}
            <div className="p-4 sm:p-5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">1. Today's Attendance</h3>
                    <p className="text-[11px] text-slate-400">Real-time status synced to parent</p>
                  </div>
                </div>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                  todaysAttendance === 'Present'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : todaysAttendance === 'Absent'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : todaysAttendance === 'Late'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                }`}>
                  {todaysAttendance}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                {(['Present', 'Absent', 'Late', 'Excused'] as AttendanceStatus[]).map((status) => {
                  const isSelected = todaysAttendance === status;
                  let activeClasses = '';
                  if (status === 'Present') {
                    activeClasses = isSelected
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/30'
                      : 'hover:border-emerald-500/40 text-slate-300';
                  } else if (status === 'Absent') {
                    activeClasses = isSelected
                      ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-600/30'
                      : 'hover:border-rose-500/40 text-slate-300';
                  } else if (status === 'Late') {
                    activeClasses = isSelected
                      ? 'bg-amber-600 text-white border-amber-500 shadow-md shadow-amber-600/30'
                      : 'hover:border-amber-500/40 text-slate-300';
                  } else {
                    activeClasses = isSelected
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                      : 'hover:border-indigo-500/40 text-slate-300';
                  }

                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setTodaysAttendance(status)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                        isSelected ? activeClasses : 'bg-slate-900 border-slate-700/80'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                      <span>{status}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. UPDATE PENDING FEES */}
            <div className="p-4 sm:p-5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">2. Pending Fees Amount</h3>
                    <p className="text-[11px] text-slate-400">Outstanding student balance</p>
                  </div>
                </div>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                  pendingFeesAmount === 0
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}>
                  {pendingFeesAmount === 0 ? 'All Cleared ($0)' : `$${pendingFeesAmount} Due`}
                </span>
              </div>

              <div className="flex items-center space-x-3 pt-1">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold">
                    $
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={pendingFeesAmount}
                    onChange={(e) => setPendingFeesAmount(Math.max(0, Number(e.target.value)))}
                    className="w-full pl-8 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setPendingFeesAmount(0)}
                  className="px-3 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Clear to $0
                </button>
              </div>

              {/* Quick Adjustment presets */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[11px] text-slate-400 self-center mr-1">Quick Add:</span>
                <button
                  type="button"
                  onClick={() => handleFeeAdjust(50)}
                  className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors"
                >
                  +$50
                </button>
                <button
                  type="button"
                  onClick={() => handleFeeAdjust(100)}
                  className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors"
                >
                  +$100
                </button>
                <button
                  type="button"
                  onClick={() => handleFeeAdjust(250)}
                  className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors"
                >
                  +$250
                </button>
                <button
                  type="button"
                  onClick={() => handleFeeAdjust(-50)}
                  className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors"
                >
                  -$50
                </button>
              </div>
            </div>

            {/* 3. TODAY'S TOPIC COVERED */}
            <div className="p-4 sm:p-5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3.5 lg:col-span-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">3. Today's Topic Covered in Class</h3>
                    <p className="text-[11px] text-slate-400">Curriculum progress, topics explained, and daily homework</p>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5">
                  <span className="text-[11px] text-slate-400 hidden sm:inline">Add snippet:</span>
                  <button
                    type="button"
                    onClick={() => handleInsertTopic('Mathematics: Chapter Review & Practice Problems')}
                    className="px-2 py-0.5 rounded text-[11px] bg-slate-800 hover:bg-slate-700 text-sky-300 transition-colors"
                  >
                    + Math
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertTopic('Science: Laboratory Experiment & Worksheet')}
                    className="px-2 py-0.5 rounded text-[11px] bg-slate-800 hover:bg-slate-700 text-emerald-300 transition-colors"
                  >
                    + Science
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertTopic('English: Essay Drafting & Vocabulary Quiz')}
                    className="px-2 py-0.5 rounded text-[11px] bg-slate-800 hover:bg-slate-700 text-amber-300 transition-colors"
                  >
                    + English
                  </button>
                </div>
              </div>

              <textarea
                rows={3}
                value={todaysTopicCovered}
                onChange={(e) => setTodaysTopicCovered(e.target.value)}
                placeholder="e.g. Mathematics: Introduction to Quadratic Equations (Ex 4.2). Science: Newton's Third Law demo. Homework: Complete exercises on page 94."
                className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 placeholder-slate-500 leading-relaxed"
              />
            </div>

            {/* 4. ADD / EDIT EXAM RESULTS */}
            <div className="p-4 sm:p-5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3.5 lg:col-span-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">4. Add / Edit Exam Result</h3>
                    <p className="text-[11px] text-slate-400">Academic scores, grades, subject percentages, and teacher remarks</p>
                  </div>
                </div>

                {/* Quick preset templates */}
                <div className="flex items-center space-x-1.5">
                  <button
                    type="button"
                    onClick={() => setExamResult('Mid-Term Exam: 95% (Grade A+) | Math: 98/100, Science: 94/100, English: 92/100. Teacher Remarks: Exemplary work!')}
                    className="px-2 py-0.5 rounded text-[11px] bg-slate-800 hover:bg-slate-700 text-purple-300 transition-colors"
                  >
                    Preset Grade A+
                  </button>
                  <button
                    type="button"
                    onClick={() => setExamResult('Term 1 Assessment: 85% (Grade A) | Math: 88/100, Science: 82/100, English: 85/100. Teacher Remarks: Steady performance.')}
                    className="px-2 py-0.5 rounded text-[11px] bg-slate-800 hover:bg-slate-700 text-purple-300 transition-colors"
                  >
                    Preset Grade A
                  </button>
                </div>
              </div>

              <textarea
                rows={3}
                value={examResult}
                onChange={(e) => setExamResult(e.target.value)}
                placeholder="e.g. Mid-Term Examination 2026: 91% (Grade A+) | Mathematics: 95/100, Physics: 92/100, Chemistry: 87/100, English: 90/100. Remarks: Excellent discipline and exam preparation."
                className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-slate-500 leading-relaxed font-mono text-xs sm:text-sm"
              />
            </div>

            {/* 5. PARENT INSTANT PUSH NOTIFICATION / NOTICE ALERT */}
            <div className="p-4 sm:p-5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3 lg:col-span-2">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Push Notification & Instant Parent Alert Banner</h3>
                  <p className="text-[11px] text-slate-400">Highlights prominently on the parent portal and triggers desktop alert</p>
                </div>
              </div>

              <input
                type="text"
                value={recentAlert}
                onChange={(e) => setRecentAlert(e.target.value)}
                placeholder="e.g. Reminder: Parent-teacher conference scheduled for this Friday at 3:00 PM."
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 placeholder-slate-500"
              />
            </div>

            {/* 6. STUDENT IDENTITY & PARENT CREDENTIALS */}
            <div className="p-4 sm:p-5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3.5 lg:col-span-2">
              <div className="flex items-center space-x-2 mb-1">
                <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Student Info & Parent Credentials</h3>
                  <p className="text-[11px] text-slate-400">Student enrollment details and login credentials</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Student Full Name
                  </label>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Class / Grade
                  </label>
                  <select
                    value={studentClass}
                    onChange={(e) => setStudentClass(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Class 6">Class 6</option>
                    <option value="Class 7">Class 7</option>
                    <option value="Class 8">Class 8</option>
                    <option value="Class 9">Class 9</option>
                    <option value="Class 10">Class 10</option>
                    <option value="Class 11">Class 11</option>
                    <option value="Class 12">Class 12</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Parent UserID
                  </label>
                  <input
                    type="text"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs font-mono uppercase focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Parent UserPassword
                  </label>
                  <input
                    type="text"
                    value={userPassword}
                    onChange={(e) => setUserPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs font-mono focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Modal Footer with Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400 hidden sm:inline">
              Changes will immediately reflect on the Parent Portal via Firebase onSnapshot
            </span>

            <div className="flex items-center space-x-3 ml-auto">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center space-x-2 disabled:opacity-60 cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Saving to Firebase...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save All Changes Simultaneously</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
