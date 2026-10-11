import React, { useState, useMemo } from 'react';
import { 
  Users, 
  UserCheck, 
  UserX, 
  DollarSign, 
  BookOpen, 
  Award, 
  Search, 
  Filter, 
  Edit3, 
  Plus, 
  Trash2, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  Calendar,
  Layers
} from 'lucide-react';
import { StudentRecord, AttendanceStatus } from '../types/student';
import { MasterEditModal } from './MasterEditModal';
import { AddStudentModal } from './AddStudentModal';
import { deleteStudent, resetAndSeedStudents, updateStudent } from '../services/studentService';

interface AdminDashboardProps {
  students: StudentRecord[];
  isLoading: boolean;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  students,
  isLoading
}) => {
  // Class Filter state - default to 'All' or user can select 'Class 6', 'Class 7', 'Class 10'
  const [selectedClass, setSelectedClass] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [attendanceFilter, setAttendanceFilter] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Master Edit Modal state
  const [editingStudent, setEditingStudent] = useState<StudentRecord | null>(null);

  // Add Student Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  // Distinct classes dynamically gathered + standard defaults
  const availableClasses = useMemo(() => {
    const classSet = new Set<string>(['Class 6', 'Class 7', 'Class 10']);
    students.forEach((s) => {
      if (s.class) classSet.add(s.class);
    });
    return Array.from(classSet).sort();
  }, [students]);

  // Filtered students according to class filter, search query, and attendance filter
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      // 1. Class filter: STRICT REQUIREMENT
      if (selectedClass !== 'All' && student.class !== selectedClass) {
        return false;
      }

      // 2. Attendance quick filter
      if (attendanceFilter !== 'All') {
        if (attendanceFilter === 'FeesDue') {
          if (student.pendingFeesAmount <= 0) return false;
        } else if (attendanceFilter === 'FeesCleared') {
          if (student.pendingFeesAmount > 0) return false;
        } else if (student.todaysAttendance !== attendanceFilter) {
          return false;
        }
      }

      // 3. Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = student.studentName.toLowerCase().includes(query);
        const matchesId = student.userId.toLowerCase().includes(query);
        const matchesRoll = student.rollNumber?.toLowerCase().includes(query) || false;
        const matchesClass = student.class.toLowerCase().includes(query);
        return matchesName || matchesId || matchesRoll || matchesClass;
      }

      return true;
    });
  }, [students, selectedClass, attendanceFilter, searchQuery]);

  // Overall Statistics
  const stats = useMemo(() => {
    const total = students.length;
    const present = students.filter((s) => s.todaysAttendance === 'Present').length;
    const absent = students.filter((s) => s.todaysAttendance === 'Absent').length;
    const late = students.filter((s) => s.todaysAttendance === 'Late').length;
    const totalPendingFees = students.reduce((sum, s) => sum + (s.pendingFeesAmount || 0), 0);
    const unpaidCount = students.filter((s) => s.pendingFeesAmount > 0).length;
    const attendancePercentage = total > 0 ? Math.round((present / total) * 100) : 0;

    return { total, present, absent, late, totalPendingFees, unpaidCount, attendancePercentage };
  }, [students]);

  // Reset sample dataset
  const handleResetData = async () => {
    if (!window.confirm('Reset all student data to the fresh sample school records? Any custom edits will be re-seeded.')) {
      return;
    }
    setIsResetting(true);
    try {
      await resetAndSeedStudents();
      setFeedbackNotice('Sample database re-seeded successfully.');
      setTimeout(() => setFeedbackNotice(null), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsResetting(false);
    }
  };

  // Delete student
  const handleDeleteStudent = async (student: StudentRecord) => {
    if (window.confirm(`Are you sure you want to delete ${student.studentName} (${student.userId})?`)) {
      try {
        await deleteStudent(student.id);
        setFeedbackNotice(`Student ${student.studentName} removed.`);
        setTimeout(() => setFeedbackNotice(null), 3000);
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Bulk mark present for the selected class
  const handleBulkMarkPresent = async () => {
    if (selectedClass === 'All') {
      alert('Please select a specific class first from the class filter tabs.');
      return;
    }
    const classStudents = students.filter((s) => s.class === selectedClass);
    if (!classStudents.length) return;

    if (window.confirm(`Mark all ${classStudents.length} students in ${selectedClass} as "Present" for today?`)) {
      for (const st of classStudents) {
        await updateStudent(st.id, { todaysAttendance: 'Present' });
      }
      setFeedbackNotice(`All students in ${selectedClass} marked Present.`);
      setTimeout(() => setFeedbackNotice(null), 3000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fade-in">
      
      {/* Top Banner Notice */}
      {feedbackNotice && (
        <div className="p-3.5 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-200 text-xs sm:text-sm flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-indigo-400" />
            <span>{feedbackNotice}</span>
          </div>
          <button onClick={() => setFeedbackNotice(null)} className="text-slate-400 hover:text-white text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* DASHBOARD HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Master Administration Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            Student Management Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Filter classes, monitor attendance in real time, and click any student to launch the unified Master Edit screen.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleResetData}
            disabled={isResetting}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
            title="Re-seed initial demo students across Class 6, 7, and 10"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
            <span>{isResetting ? 'Syncing...' : 'Reset Demo Data'}</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Enroll New Student</span>
          </button>
        </div>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Students */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Total Students</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-bold text-white">{stats.total}</span>
            <span className="text-xs text-slate-400">enrolled</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Across {availableClasses.length} active classes
          </div>
        </div>

        {/* Today's Attendance */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Today's Attendance</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-bold text-emerald-400">{stats.attendancePercentage}%</span>
            <span className="text-xs text-emerald-500 font-semibold">{stats.present} Present</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center space-x-2">
            <span className="text-rose-400 font-medium">{stats.absent} Absent</span>
            <span>•</span>
            <span className="text-amber-400 font-medium">{stats.late} Late</span>
          </div>
        </div>

        {/* Pending Fees Total */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Outstanding Fees</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-bold text-amber-400 font-mono">
              ${stats.totalPendingFees.toLocaleString()}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            {stats.unpaidCount} students have dues
          </div>
        </div>

        {/* Selected Class Filter Quick Summary */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Active Class Filter</span>
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-bold text-sky-400">
              {selectedClass}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Showing {filteredStudents.length} of {students.length} students
          </div>
        </div>
      </div>

      {/* ================= CLASS-WISE FILTERING SECTION (STRICT REQUIREMENT) ================= */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-indigo-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Class-Wise Filtering
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Select any class tab below to instantly filter students. Selecting <strong className="text-slate-200">'Class 6'</strong> displays only students in Class 6.
            </p>
          </div>

          {/* Quick Bulk Action for current class */}
          {selectedClass !== 'All' && (
            <button
              onClick={handleBulkMarkPresent}
              className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-colors flex items-center space-x-1.5 cursor-pointer"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Mark All {selectedClass} as Present</span>
            </button>
          )}
        </div>

        {/* CLASS TABS */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedClass('All')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedClass === 'All'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 border border-indigo-500'
                : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            All Classes ({students.length})
          </button>

          {availableClasses.map((cls) => {
            const count = students.filter((s) => s.class === cls).length;
            const isSelected = selectedClass === cls;
            return (
              <button
                key={cls}
                type="button"
                onClick={() => setSelectedClass(cls)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-2 cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 border border-indigo-500 scale-[1.02]'
                    : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <span>{cls}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  isSelected ? 'bg-indigo-800 text-indigo-100' : 'bg-slate-800 text-slate-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* SEARCH & SECONDARY FILTERS BAR */}
        <div className="pt-2 flex flex-col md:flex-row md:items-center justify-between gap-3 border-t border-slate-800/80">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student name, UserID (e.g. STU601), roll..."
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
            />
          </div>

          {/* Quick Attendance / Fee status pill filters */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1">
            <span className="text-[11px] text-slate-400 hidden lg:inline">Status:</span>
            {[
              { id: 'All', label: 'All' },
              { id: 'Present', label: 'Present' },
              { id: 'Absent', label: 'Absent' },
              { id: 'FeesDue', label: 'Fees Due' },
              { id: 'FeesCleared', label: 'Fees Paid' }
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setAttendanceFilter(f.id)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  attendanceFilter === f.id
                    ? 'bg-slate-700 text-white border border-slate-600'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-slate-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ================= STUDENT LISTING & MASTER EDIT TRIGGERS ================= */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-500 mb-2" />
          <p className="text-sm">Connecting to Firebase Firestore...</p>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="p-12 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-slate-500 mx-auto" />
          <h3 className="text-base font-semibold text-white">No Students Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {selectedClass !== 'All'
              ? `There are no students matching your filter criteria in ${selectedClass}.`
              : 'No student records match the active search filter.'}
          </p>
          <button
            onClick={() => {
              setSelectedClass('All');
              setSearchQuery('');
              setAttendanceFilter('All');
            }}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs text-slate-400">
              Showing <strong className="text-white">{filteredStudents.length}</strong> student{filteredStudents.length !== 1 ? 's' : ''} in {selectedClass === 'All' ? 'all classes' : selectedClass}
            </span>
            <span className="text-[11px] text-indigo-400 font-medium">
              Click "Master Edit" or any student card to open the unified editor
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStudents.map((student) => {
              const isPresent = student.todaysAttendance === 'Present';
              const isAbsent = student.todaysAttendance === 'Absent';
              const isLate = student.todaysAttendance === 'Late';
              const hasDueFees = student.pendingFeesAmount > 0;

              return (
                <div
                  key={student.id}
                  onClick={() => setEditingStudent(student)}
                  className="group relative p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-200 flex flex-col justify-between cursor-pointer space-y-4"
                >
                  {/* Card Top: Avatar, Name, Class, UserID */}
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center text-white font-bold text-base shadow-md shadow-indigo-600/20">
                          {student.studentName.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                            {student.studentName}
                          </h3>
                          <div className="flex items-center space-x-2 mt-0.5">
                            <span className="text-[11px] px-2 py-0.5 rounded-md font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/20">
                              {student.class}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              ID: {student.userId}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Attendance Badge */}
                      <span className={`text-[11px] px-2.5 py-1 rounded-full font-bold flex items-center space-x-1 ${
                        isPresent
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : isAbsent
                          ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          : isLate
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          : 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          isPresent ? 'bg-emerald-400' : isAbsent ? 'bg-rose-400' : 'bg-amber-400'
                        }`} />
                        <span>{student.todaysAttendance}</span>
                      </span>
                    </div>

                    {/* Pending Fees Strip */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
                      <div className="flex items-center space-x-1.5 text-xs text-slate-400">
                        <DollarSign className="w-3.5 h-3.5 text-slate-500" />
                        <span>Pending Fees:</span>
                      </div>
                      <span className={`text-xs font-mono font-bold ${
                        hasDueFees ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {hasDueFees ? `$${student.pendingFeesAmount} Due` : 'All Paid ($0)'}
                      </span>
                    </div>

                    {/* Today's Topic Covered Excerpt */}
                    <div className="space-y-1">
                      <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 font-semibold">
                        <BookOpen className="w-3 h-3 text-sky-400" />
                        <span>Today's Topic:</span>
                      </div>
                      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed bg-slate-950/50 p-2 rounded-lg border border-slate-800/60">
                        {student.todaysTopicCovered || 'No topic logged yet for today.'}
                      </p>
                    </div>

                    {/* Exam Result Excerpt */}
                    <div className="space-y-1">
                      <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 font-semibold">
                        <Award className="w-3 h-3 text-purple-400" />
                        <span>Exam Result:</span>
                      </div>
                      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed bg-slate-950/50 p-2 rounded-lg border border-slate-800/60 font-mono text-[11px]">
                        {student.examResult || 'No exam result on record.'}
                      </p>
                    </div>
                  </div>

                  {/* Card Bottom: Master Edit Button & Delete */}
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteStudent(student);
                      }}
                      className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Remove student"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingStudent(student);
                      }}
                      className="px-4 py-2 rounded-xl bg-indigo-600/90 group-hover:bg-indigo-600 text-white text-xs font-bold shadow-md shadow-indigo-600/20 group-hover:shadow-indigo-600/40 transition-all flex items-center space-x-1.5 cursor-pointer ml-auto"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Master Edit</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SINGLE MASTER EDIT MODAL (Mandatory Single Screen) */}
      {editingStudent && (
        <MasterEditModal
          student={editingStudent}
          isOpen={!!editingStudent}
          onClose={() => setEditingStudent(null)}
          onSuccess={() => {
            setFeedbackNotice(`Changes saved directly to Firebase for ${editingStudent.studentName}!`);
            setTimeout(() => setFeedbackNotice(null), 3000);
          }}
        />
      )}

      {/* ADD STUDENT MODAL */}
      <AddStudentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        defaultClass={selectedClass !== 'All' ? selectedClass : 'Class 6'}
        onSuccess={() => {
          setFeedbackNotice('New student successfully enrolled into Firebase Firestore.');
          setTimeout(() => setFeedbackNotice(null), 3000);
        }}
      />
    </div>
  );
};
