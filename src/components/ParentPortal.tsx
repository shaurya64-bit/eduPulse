import React, { useState, useEffect, useRef } from 'react';
import { 
  UserCheck, 
  UserX, 
  DollarSign, 
  BookOpen, 
  Award, 
  Bell, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  CreditCard, 
  Download, 
  Sparkles, 
  GraduationCap, 
  ShieldCheck, 
  FileText, 
  Check, 
  Wifi, 
  Volume2, 
  ExternalLink,
  ChevronRight,
  Phone,
  Mail,
  HelpCircle
} from 'lucide-react';
import { StudentRecord } from '../types/student';
import { subscribeStudentById, updateStudent } from '../services/studentService';
import { requestPushNotificationPermission, sendBrowserNotification } from '../utils/notifications';

interface ParentPortalProps {
  initialStudent: StudentRecord;
  onLogout: () => void;
}

export const ParentPortal: React.FC<ParentPortalProps> = ({
  initialStudent,
  onLogout
}) => {
  // Real-time student record strictly isolated to logged-in student
  const [student, setStudent] = useState<StudentRecord>(initialStudent);
  const [lastSyncTime, setLastSyncTime] = useState<string>(new Date().toLocaleTimeString());
  const [justUpdatedHighlight, setJustUpdatedHighlight] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted'
  );
  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  // Homework check state (client-side interactive feature)
  const [homeworkDone, setHomeworkDone] = useState(false);

  // Simulated Payment Modal
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Keep track of previous state to detect real-time changes
  const prevStudentRef = useRef<StudentRecord>(initialStudent);

  // Strict Real-time Firestore Subscription for ONLY this student
  useEffect(() => {
    const unsubscribe = subscribeStudentById(initialStudent.id, (updated) => {
      if (updated) {
        const prev = prevStudentRef.current;
        let changeDetected = false;
        let changeMessage = '';

        if (prev.todaysAttendance !== updated.todaysAttendance) {
          changeDetected = true;
          changeMessage = `Attendance updated to: ${updated.todaysAttendance}`;
        } else if (prev.pendingFeesAmount !== updated.pendingFeesAmount) {
          changeDetected = true;
          changeMessage = `Pending fees updated to: $${updated.pendingFeesAmount}`;
        } else if (prev.todaysTopicCovered !== updated.todaysTopicCovered) {
          changeDetected = true;
          changeMessage = `New class topics posted for today!`;
        } else if (prev.examResult !== updated.examResult) {
          changeDetected = true;
          changeMessage = `New exam result posted by administration!`;
        } else if (prev.recentAlert !== updated.recentAlert && updated.recentAlert) {
          changeDetected = true;
          changeMessage = `New Alert: ${updated.recentAlert}`;
        }

        if (changeDetected) {
          setJustUpdatedHighlight(true);
          setNotificationToast(changeMessage);
          
          // Trigger browser desktop push notification
          sendBrowserNotification(`EduPulse Update: ${updated.studentName}`, {
            body: changeMessage,
          });

          setTimeout(() => setJustUpdatedHighlight(false), 3000);
          setTimeout(() => setNotificationToast(null), 5000);
        }

        prevStudentRef.current = updated;
        setStudent(updated);
        setLastSyncTime(new Date().toLocaleTimeString());
      }
    });

    return () => unsubscribe();
  }, [initialStudent.id]);

  // Request Push Notification permission
  const handleEnablePush = async () => {
    const perm = await requestPushNotificationPermission();
    if (perm === 'granted') {
      setNotificationsEnabled(true);
      sendBrowserNotification('EduPulse Push Notifications Active', {
        body: `You will receive instant alerts for ${student.studentName}'s attendance, fees, and academic grades.`,
      });
      setNotificationToast('Push notifications successfully enabled!');
      setTimeout(() => setNotificationToast(null), 4000);
    } else {
      alert('Notification permission was blocked or denied in your browser settings.');
    }
  };

  // Test push notification trigger
  const handleTestNotification = () => {
    const msg = `Notice for ${student.studentName}: Attendance is ${student.todaysAttendance}, Fee balance is $${student.pendingFeesAmount}.`;
    sendBrowserNotification('EduPulse School Alert', { body: msg });
    setNotificationToast('Test push alert triggered!');
    setTimeout(() => setNotificationToast(null), 3000);
  };

  // Process simulated fee payment
  const handleSimulatedPayment = async () => {
    setIsPaying(true);
    try {
      // Update fee directly in Firebase to $0
      await updateStudent(student.id, {
        pendingFeesAmount: 0,
        recentAlert: `Payment of $${student.pendingFeesAmount} received online by parent. Account fully cleared.`
      });
      setIsPaying(false);
      setPaymentSuccess(true);
      setTimeout(() => {
        setPaymentSuccess(false);
        setIsPaymentModalOpen(false);
      }, 1500);
    } catch (err) {
      setIsPaying(false);
      alert('Payment processing failed. Please check your connection.');
    }
  };

  // Print/Save report
  const handlePrintReport = () => {
    window.print();
  };

  const isPresent = student.todaysAttendance === 'Present';
  const isAbsent = student.todaysAttendance === 'Absent';
  const isLate = student.todaysAttendance === 'Late';
  const hasPendingFees = student.pendingFeesAmount > 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fade-in print:p-0 print:space-y-4">
      
      {/* REAL-TIME NOTIFICATION TOAST */}
      {notificationToast && (
        <div className="fixed top-20 right-4 z-50 p-4 rounded-2xl bg-indigo-600 text-white shadow-2xl shadow-indigo-600/40 border border-indigo-400/40 flex items-center space-x-3 animate-slide-in">
          <div className="p-2 rounded-xl bg-white/10">
            <Bell className="w-5 h-5 text-white animate-bounce" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-indigo-200">
              Live School Alert
            </div>
            <div className="text-sm font-bold text-white mt-0.5">
              {notificationToast}
            </div>
          </div>
        </div>
      )}

      {/* PUSH NOTIFICATION PROMPT / STATUS BAR */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 print:hidden">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-semibold text-white flex items-center space-x-2">
              <span>Parent Push Alerts & Fee Reminders</span>
              {notificationsEnabled ? (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
                  Active
                </span>
              ) : (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-semibold border border-amber-500/30">
                  Permission Needed
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Receive automatic real-time alerts whenever teachers update attendance, fee status, or exam grades.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          {!notificationsEnabled ? (
            <button
              onClick={handleEnablePush}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              Enable Browser Alerts
            </button>
          ) : (
            <button
              onClick={handleTestNotification}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors cursor-pointer flex items-center space-x-1"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Test Push Notification</span>
            </button>
          )}
        </div>
      </div>

      {/* ACTIVE NOTIFICATION BANNER (if there is an alert or fee alert) */}
      {(hasPendingFees || student.recentAlert) && (
        <div className="space-y-2">
          {hasPendingFees && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 flex items-start sm:items-center justify-between gap-3 shadow-lg shadow-amber-500/5">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-amber-300">
                    Fee Reminder Alert: ${student.pendingFeesAmount} Outstanding Balance
                  </h4>
                  <p className="text-xs text-amber-200/80 mt-0.5">
                    Please settle the pending balance to ensure uninterrupted school activities and access.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPaymentModalOpen(true)}
                className="shrink-0 px-3.5 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-colors shadow-md shadow-amber-500/20 cursor-pointer print:hidden"
              >
                Pay Now
              </button>
            </div>
          )}

          {student.recentAlert && (
            <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-200 flex items-center space-x-3 shadow-lg shadow-sky-500/5">
              <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 shrink-0">
                <Bell className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">
                  Official School Notice for {student.studentName}
                </span>
                <p className="text-xs sm:text-sm text-sky-100 font-medium mt-0.5">
                  {student.recentAlert}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STUDENT PROFILE HERO CARD */}
      <div className={`p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border transition-all duration-500 shadow-2xl relative overflow-hidden ${
        justUpdatedHighlight ? 'border-emerald-400 ring-2 ring-emerald-400/30' : 'border-slate-800'
      }`}>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          {/* Student Info */}
          <div className="flex items-start sm:items-center space-x-4 sm:space-x-5">
            <div className="relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-600 to-indigo-500 p-0.5 shadow-xl shadow-indigo-600/30">
                <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-white font-extrabold text-2xl sm:text-3xl">
                  {student.studentName.charAt(0)}
                </div>
              </div>
              <span className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-slate-900 flex items-center justify-center ${
                isPresent ? 'bg-emerald-500' : isAbsent ? 'bg-rose-500' : 'bg-amber-500'
              }`}>
                {isPresent ? <Check className="w-3 h-3 text-white" /> : <Clock className="w-3 h-3 text-white" />}
              </span>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {student.class}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-slate-800 text-slate-300 border border-slate-700">
                  Roll: {student.rollNumber || '01'}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-sky-500/15 text-sky-300 border border-sky-500/20">
                  UserID: {student.userId}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1.5">
                {student.studentName}
              </h1>

              <p className="text-xs sm:text-sm text-slate-400 mt-1 flex items-center space-x-2">
                <span>Guardian Portal</span>
                <span>•</span>
                <span className="text-emerald-400 font-medium flex items-center space-x-1">
                  <Wifi className="w-3 h-3" />
                  <span>Real-time Sync Active (Updated {lastSyncTime})</span>
                </span>
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center space-x-2.5 self-start md:self-auto print:hidden">
            <button
              onClick={handlePrintReport}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors flex items-center space-x-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Print Report Card</span>
            </button>

            <button
              onClick={onLogout}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* ================= THE 4 CORE PARENT SECTIONS (STRICT REQUIREMENT) ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* 1. TODAY'S ATTENDANCE STATUS */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Today's Attendance Status</h2>
                <p className="text-xs text-slate-400">Verified by class teacher in real time</p>
              </div>
            </div>

            <span className="text-xs text-slate-400 font-mono">
              {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
          </div>

          {/* Giant Status Hero */}
          <div className={`p-5 rounded-2xl border flex items-center justify-between ${
            isPresent
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
              : isAbsent
              ? 'bg-rose-950/40 border-rose-500/30 text-rose-300'
              : isLate
              ? 'bg-amber-950/40 border-amber-500/30 text-amber-300'
              : 'bg-indigo-950/40 border-indigo-500/30 text-indigo-300'
          }`}>
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xl ${
                isPresent
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30'
                  : isAbsent
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                  : 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30'
              }`}>
                {isPresent ? <UserCheck className="w-6 h-6" /> : <UserX className="w-6 h-6" />}
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider opacity-80">
                  Official Record
                </div>
                <div className="text-2xl font-extrabold tracking-tight">
                  {student.todaysAttendance}
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-white/10 border border-white/20">
                {isPresent ? 'Checked In' : isAbsent ? 'Action Required' : 'Late Arrival'}
              </span>
            </div>
          </div>

          {/* Attendance History Timeline / Week Snapshot */}
          <div className="space-y-2 pt-1">
            <span className="text-xs font-semibold text-slate-300">Weekly Attendance Snapshot:</span>
            <div className="grid grid-cols-5 gap-2 text-center text-xs">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Today'].map((day, idx) => {
                const isCurrent = idx === 4;
                const status = isCurrent ? student.todaysAttendance : 'Present';
                return (
                  <div
                    key={day}
                    className={`p-2.5 rounded-xl border ${
                      isCurrent
                        ? isPresent
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-bold'
                          : 'bg-rose-500/20 border-rose-500/40 text-rose-300 font-bold'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="text-[10px] text-slate-400 uppercase">{day}</div>
                    <div className="mt-1 font-semibold">{status}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 2. PENDING FEES */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Pending Fees Balance</h2>
                <p className="text-xs text-slate-400">School accounts and tuition ledger</p>
              </div>
            </div>

            <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
              hasPendingFees
                ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
            }`}>
              {hasPendingFees ? 'Balance Due' : 'All Cleared'}
            </span>
          </div>

          {/* Amount Balance Hero */}
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-medium">Total Balance Payable:</span>
              <div className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight mt-1 text-white">
                ${student.pendingFeesAmount.toLocaleString()}
                <span className="text-xs text-slate-400 font-sans font-normal ml-1.5">USD</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {hasPendingFees
                  ? 'Includes term tuition, laboratory facilities, and library dues.'
                  : 'All term fees paid in full. No outstanding dues.'}
              </p>
            </div>

            <div className="print:hidden">
              {hasPendingFees ? (
                <button
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center space-x-1.5 cursor-pointer"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Pay Balance</span>
                </button>
              ) : (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center space-x-1.5 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Paid in Full</span>
                </div>
              )}
            </div>
          </div>

          {/* Fee Itemization Table */}
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-800 text-slate-400">
              <span>Academic Tuition & Instruction</span>
              <span className="text-white font-mono font-medium">${Math.round(student.pendingFeesAmount * 0.7)}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800 text-slate-400">
              <span>Science Lab & Computer Facilities</span>
              <span className="text-white font-mono font-medium">${Math.round(student.pendingFeesAmount * 0.2)}</span>
            </div>
            <div className="flex justify-between py-1.5 text-slate-400">
              <span>Sports & Library Services</span>
              <span className="text-white font-mono font-medium">${student.pendingFeesAmount - Math.round(student.pendingFeesAmount * 0.7) - Math.round(student.pendingFeesAmount * 0.2)}</span>
            </div>
          </div>
        </div>

        {/* 3. TODAY'S TOPIC COVERED IN CLASS */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Today's Topic Covered in Class</h2>
                <p className="text-xs text-slate-400">Daily syllabus progress, lessons taught, and homework</p>
              </div>
            </div>

            <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-sky-500/15 text-sky-300 border border-sky-500/20">
              {student.class} Curriculum
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-4">
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300">
              <Sparkles className="w-4 h-4 text-sky-400" />
              <span>Teacher's Daily Class Log:</span>
            </div>

            <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line font-medium bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              {student.todaysTopicCovered || 'The class teacher has not yet posted today\'s lesson summary.'}
            </p>

            {/* Interactive Homework checklist for parents */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={homeworkDone}
                  onChange={(e) => setHomeworkDone(e.target.checked)}
                  className="w-4 h-4 rounded text-sky-500 focus:ring-sky-500 bg-slate-900 border-slate-700 cursor-pointer"
                />
                <span>Mark today's assigned homework as verified & completed at home</span>
              </label>

              {homeworkDone && (
                <span className="text-xs font-bold text-emerald-400 flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Homework Completed</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 4. ACADEMIC & EXAM RESULTS */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Academic Performance & Exam Results</h2>
                <p className="text-xs text-slate-400">Official grades, assessment evaluation, and teacher remarks</p>
              </div>
            </div>

            <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/20">
              Official Assessment
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div>
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                  Exam & Evaluation Transcript
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  Academic Achievement Record
                </h3>
              </div>
              <div className="px-3 py-1 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 font-mono text-xs font-bold self-start sm:self-auto">
                Verified by School Board
              </div>
            </div>

            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 text-sm font-mono text-slate-200 leading-relaxed whitespace-pre-line">
              {student.examResult || 'Exam evaluation in progress.'}
            </div>

            {/* School stamp / Verification Footer */}
            <div className="flex items-center justify-between pt-2 text-xs text-slate-400">
              <div className="flex items-center space-x-2">
                <GraduationCap className="w-4 h-4 text-purple-400" />
                <span>EduPulse Academic Board • {student.class}</span>
              </div>
              <span className="font-mono text-[11px] text-slate-500">
                StudentID: {student.userId}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* SIMULATED PAYMENT MODAL */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <CreditCard className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Online School Fee Payment</h3>
              </div>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {paymentSuccess ? (
              <div className="p-6 text-center space-y-3">
                <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-bold text-white">Payment Successful!</h4>
                <p className="text-xs text-slate-300">
                  Receipt generated. Firebase updated to $0 pending fees in real time.
                </p>
              </div>
            ) : (
              <>
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Student:</span>
                    <span className="text-white font-medium">{student.studentName} ({student.class})</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Account ID:</span>
                    <span className="font-mono text-white">{student.userId}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold pt-2 border-t border-slate-800 text-white">
                    <span>Total Amount Due:</span>
                    <span className="font-mono text-amber-400">${student.pendingFeesAmount}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-slate-300 font-medium mb-1">Card Number (Simulated)</label>
                    <input
                      type="text"
                      defaultValue="•••• •••• •••• 4242"
                      disabled
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-400 font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-slate-300 font-medium mb-1">Expiry</label>
                      <input
                        type="text"
                        defaultValue="12/28"
                        disabled
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-400 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-300 font-medium mb-1">CVC</label>
                      <input
                        type="text"
                        defaultValue="982"
                        disabled
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-400 font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsPaymentModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSimulatedPayment}
                    disabled={isPaying}
                    className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-amber-500/20 flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-60"
                  >
                    {isPaying ? 'Processing...' : `Pay $${student.pendingFeesAmount}`}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
