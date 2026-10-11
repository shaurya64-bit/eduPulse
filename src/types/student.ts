export type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Excused';

export interface StudentRecord {
  id: string;
  studentName: string;
  class: string; // e.g. 'Class 6', 'Class 7', 'Class 10'
  userId: string; // Parent login UserID
  userPassword: string; // Parent login Password
  todaysAttendance: AttendanceStatus;
  pendingFeesAmount: number;
  todaysTopicCovered: string;
  examResult: string; // e.g., "Mid-Term: 92% (Grade A+) - Math: 95, Science: 90, English: 91. Excellent grasp of concepts."
  rollNumber?: string;
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
  lastUpdated?: string;
  recentAlert?: string;
}

export interface ExamBreakdown {
  examTitle: string;
  grade: string;
  percentage: number;
  totalMarks: number;
  marksObtained: number;
  remarks: string;
  subjects?: { subject: string; score: number; max: number }[];
}
