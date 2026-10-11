import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { StudentRecord } from '../types/student';
import { INITIAL_STUDENTS } from '../data/seedStudents';

const STUDENTS_COLLECTION = 'students';

/**
 * Seeds initial students if collection is empty
 */
export async function seedInitialStudentsIfEmpty(): Promise<boolean> {
  try {
    const snap = await getDocs(collection(db, STUDENTS_COLLECTION));
    if (snap.empty) {
      console.log('Students collection is empty. Seeding initial records...');
      for (const student of INITIAL_STUDENTS) {
        await addDoc(collection(db, STUDENTS_COLLECTION), {
          ...student,
          lastUpdated: new Date().toISOString()
        });
      }
      return true;
    }
    return false;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, STUDENTS_COLLECTION);
  }
}

/**
 * Re-seeds all sample students (admin utility)
 */
export async function resetAndSeedStudents(): Promise<void> {
  try {
    const snap = await getDocs(collection(db, STUDENTS_COLLECTION));
    for (const d of snap.docs) {
      await deleteDoc(doc(db, STUDENTS_COLLECTION, d.id));
    }
    for (const student of INITIAL_STUDENTS) {
      await addDoc(collection(db, STUDENTS_COLLECTION), {
        ...student,
        lastUpdated: new Date().toISOString()
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, STUDENTS_COLLECTION);
  }
}

/**
 * Real-time subscription to all students (Admin Dashboard)
 */
export function subscribeAllStudents(
  onData: (students: StudentRecord[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const colRef = collection(db, STUDENTS_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const records: StudentRecord[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          studentName: data.studentName || 'Unnamed Student',
          class: data.class || 'Class 6',
          userId: data.userId || '',
          userPassword: data.userPassword || '',
          todaysAttendance: data.todaysAttendance || 'Present',
          pendingFeesAmount: Number(data.pendingFeesAmount ?? 0),
          todaysTopicCovered: data.todaysTopicCovered || '',
          examResult: data.examResult || '',
          rollNumber: data.rollNumber || '',
          parentName: data.parentName || '',
          parentPhone: data.parentPhone || '',
          parentEmail: data.parentEmail || '',
          lastUpdated: data.lastUpdated || '',
          recentAlert: data.recentAlert || ''
        } as StudentRecord;
      });
      // Sort alphabetically by student name
      records.sort((a, b) => a.studentName.localeCompare(b.studentName));
      onData(records);
    },
    (error) => {
      console.error('Subscription error on students:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, STUDENTS_COLLECTION);
    }
  );
}

/**
 * Real-time subscription to single student (Parent Portal - Strict Isolation)
 */
export function subscribeStudentById(
  studentId: string,
  onData: (student: StudentRecord | null) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const docRef = doc(db, STUDENTS_COLLECTION, studentId);
  return onSnapshot(
    docRef,
    (docSnap) => {
      if (!docSnap.exists()) {
        onData(null);
        return;
      }
      const data = docSnap.data();
      const record: StudentRecord = {
        id: docSnap.id,
        studentName: data.studentName || 'Unnamed Student',
        class: data.class || 'Class 6',
        userId: data.userId || '',
        userPassword: data.userPassword || '',
        todaysAttendance: data.todaysAttendance || 'Present',
        pendingFeesAmount: Number(data.pendingFeesAmount ?? 0),
        todaysTopicCovered: data.todaysTopicCovered || '',
        examResult: data.examResult || '',
        rollNumber: data.rollNumber || '',
        parentName: data.parentName || '',
        parentPhone: data.parentPhone || '',
        parentEmail: data.parentEmail || '',
        lastUpdated: data.lastUpdated || '',
        recentAlert: data.recentAlert || ''
      };
      onData(record);
    },
    (error) => {
      console.error(`Subscription error on student ${studentId}:`, error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, `${STUDENTS_COLLECTION}/${studentId}`);
    }
  );
}

/**
 * Parent Authentication: queries Firestore for exact UserID and matches UserPassword
 */
export async function authenticateParent(
  userId: string,
  userPassword: string
): Promise<{ success: boolean; student?: StudentRecord; error?: string }> {
  try {
    const trimmedId = userId.trim();
    const trimmedPassword = userPassword.trim();

    if (!trimmedId || !trimmedPassword) {
      return { success: false, error: 'Please enter both User ID and Password.' };
    }

    const q = query(
      collection(db, STUDENTS_COLLECTION),
      where('userId', '==', trimmedId)
    );
    const snap = await getDocs(q);

    if (snap.empty) {
      return { success: false, error: 'No student found with this User ID. Please check and try again.' };
    }

    const matchedDoc = snap.docs[0];
    const data = matchedDoc.data();

    if (data.userPassword !== trimmedPassword) {
      return { success: false, error: 'Incorrect password for this student account. Please verify your credentials.' };
    }

    const student: StudentRecord = {
      id: matchedDoc.id,
      studentName: data.studentName || 'Unnamed Student',
      class: data.class || 'Class 6',
      userId: data.userId || trimmedId,
      userPassword: data.userPassword || '',
      todaysAttendance: data.todaysAttendance || 'Present',
      pendingFeesAmount: Number(data.pendingFeesAmount ?? 0),
      todaysTopicCovered: data.todaysTopicCovered || '',
      examResult: data.examResult || '',
      rollNumber: data.rollNumber || '',
      parentName: data.parentName || '',
      parentPhone: data.parentPhone || '',
      parentEmail: data.parentEmail || '',
      lastUpdated: data.lastUpdated || '',
      recentAlert: data.recentAlert || ''
    };

    return { success: true, student };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, STUDENTS_COLLECTION);
  }
}

/**
 * Updates a student in Firebase Firestore
 */
export async function updateStudent(
  studentId: string,
  data: Partial<Omit<StudentRecord, 'id'>>
): Promise<void> {
  const path = `${STUDENTS_COLLECTION}/${studentId}`;
  try {
    const docRef = doc(db, STUDENTS_COLLECTION, studentId);
    await updateDoc(docRef, {
      ...data,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Adds a new student to Firebase Firestore
 */
export async function createStudent(
  data: Omit<StudentRecord, 'id'>
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, STUDENTS_COLLECTION), {
      ...data,
      lastUpdated: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, STUDENTS_COLLECTION);
  }
}

/**
 * Deletes a student from Firebase Firestore
 */
export async function deleteStudent(studentId: string): Promise<void> {
  const path = `${STUDENTS_COLLECTION}/${studentId}`;
  try {
    await deleteDoc(doc(db, STUDENTS_COLLECTION, studentId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
