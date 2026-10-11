import React, { useState } from 'react';
import { 
  X, 
  UserPlus, 
  User, 
  Lock, 
  Calendar, 
  DollarSign, 
  BookOpen, 
  Award,
  Check
} from 'lucide-react';
import { AttendanceStatus, StudentRecord } from '../types/student';
import { createStudent } from '../services/studentService';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultClass?: string;
}

export const AddStudentModal: React.FC<AddStudentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultClass = 'Class 6'
}) => {
  if (!isOpen) return null;

  const [studentName, setStudentName] = useState('');
  const [studentClass, setStudentClass] = useState(defaultClass);
  const [rollNumber, setRollNumber] = useState('');
  const [userId, setUserId] = useState(`STU${Math.floor(1000 + Math.random() * 9000)}`);
  const [userPassword, setUserPassword] = useState('parent@123');
  const [todaysAttendance, setTodaysAttendance] = useState<AttendanceStatus>('Present');
  const [pendingFeesAmount, setPendingFeesAmount] = useState<number>(0);
  const [todaysTopicCovered, setTodaysTopicCovered] = useState('Introduction and Orientation lesson completed.');
  const [examResult, setExamResult] = useState('Assessment pending for newly enrolled student.');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [parentEmail, setParentEmail] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!studentName.trim()) {
      setErrorMessage('Please enter the student\'s full name.');
      return;
    }
    if (!userId.trim() || !userPassword.trim()) {
      setErrorMessage('Please enter parent login UserID and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createStudent({
        studentName: studentName.trim(),
        class: studentClass.trim(),
        rollNumber: rollNumber.trim() || `${studentClass.replace(/\D/g, '')}-0${Math.floor(Math.random() * 90) + 10}`,
        userId: userId.trim(),
        userPassword: userPassword.trim(),
        todaysAttendance,
        pendingFeesAmount: Number(pendingFeesAmount) || 0,
        todaysTopicCovered: todaysTopicCovered.trim(),
        examResult: examResult.trim(),
        parentName: parentName.trim(),
        parentPhone: parentPhone.trim(),
        parentEmail: parentEmail.trim(),
        recentAlert: 'Welcome to EduPulse Academy! New student enrollment confirmed.',
        lastUpdated: new Date().toISOString()
      });

      setIsSubmitting(false);
      onSuccess();
      onClose();
    } catch (err) {
      setIsSubmitting(false);
      setErrorMessage(err instanceof Error ? err.message : 'Failed to create student in Firebase.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Enroll New Student</h2>
              <p className="text-xs text-slate-400">Add student profile, credentials, and academic status</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {errorMessage}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Student Full Name *
              </label>
              <input
                type="text"
                required
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="e.g. Leo Henderson"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Class / Grade *
              </label>
              <select
                value={studentClass}
                onChange={(e) => setStudentClass(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-indigo-500"
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
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Parent Login UserID *
              </label>
              <input
                type="text"
                required
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-mono uppercase focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Parent Login Password *
              </label>
              <input
                type="text"
                required
                value={userPassword}
                onChange={(e) => setUserPassword(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-mono focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Today's Attendance
              </label>
              <select
                value={todaysAttendance}
                onChange={(e) => setTodaysAttendance(e.target.value as AttendanceStatus)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Late">Late</option>
                <option value="Excused">Excused</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Pending Fees Amount ($)
              </label>
              <input
                type="number"
                min="0"
                value={pendingFeesAmount}
                onChange={(e) => setPendingFeesAmount(Math.max(0, Number(e.target.value)))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Today's Topic Covered in Class
            </label>
            <input
              type="text"
              value={todaysTopicCovered}
              onChange={(e) => setTodaysTopicCovered(e.target.value)}
              placeholder="e.g. Science: Chapter 3 Lab demo"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Exam Result
            </label>
            <input
              type="text"
              value={examResult}
              onChange={(e) => setExamResult(e.target.value)}
              placeholder="e.g. Term 1 Exam: 88% (Grade A)"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Parent / Guardian Name
              </label>
              <input
                type="text"
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                placeholder="e.g. Robert Henderson"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Parent Phone Number
              </label>
              <input
                type="text"
                value={parentPhone}
                onChange={(e) => setParentPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'Enrolling...' : 'Enroll Student'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
