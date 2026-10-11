/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LoginScreen } from './components/LoginScreen';
import { AdminDashboard } from './components/AdminDashboard';
import { ParentPortal } from './components/ParentPortal';
import { StudentRecord } from './types/student';
import { 
  seedInitialStudentsIfEmpty, 
  subscribeAllStudents 
} from './services/studentService';
import { testConnection } from './firebase';
import { ShieldAlert, RefreshCw } from 'lucide-react';

export default function App() {
  const [role, setRole] = useState<'none' | 'admin' | 'parent'>('none');
  const [parentStudent, setParentStudent] = useState<StudentRecord | null>(null);
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionTested, setConnectionTested] = useState(false);

  // Initialize and test connection on boot
  useEffect(() => {
    async function boot() {
      try {
        await testConnection();
        setConnectionTested(true);
        // Seed initial sample students if collection is empty
        await seedInitialStudentsIfEmpty();
      } catch (e) {
        console.error('Initialization error:', e);
      }
    }
    boot();
  }, []);

  // Real-time student subscription
  useEffect(() => {
    const unsubscribe = subscribeAllStudents(
      (data) => {
        setStudents(data);
        setIsLoading(false);

        // Keep logged-in parent student in sync if they are active
        if (parentStudent) {
          const fresh = data.find((s) => s.id === parentStudent.id);
          if (fresh) {
            setParentStudent(fresh);
          }
        }
      },
      (error) => {
        console.error('Students subscription error:', error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [parentStudent?.id]);

  // Handle Admin Login Success (strict validation was performed in LoginScreen)
  const handleAdminSuccess = () => {
    setRole('admin');
    setParentStudent(null);
  };

  // Handle Parent Login Success (strict validation against Firestore was performed)
  const handleParentSuccess = (student: StudentRecord) => {
    setRole('parent');
    setParentStudent(student);
  };

  // Handle Logout
  const handleLogout = () => {
    setRole('none');
    setParentStudent(null);
  };

  // Handle switching requested role from Navbar
  const handleRoleSwitch = (target: 'admin' | 'parent') => {
    setRole('none');
    setParentStudent(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        currentRole={role}
        parentStudent={parentStudent}
        onLogout={handleLogout}
        onRoleSwitch={handleRoleSwitch}
      />

      {/* Main Body */}
      <main className="flex-1">
        {role === 'none' && (
          <LoginScreen
            initialRole="admin"
            onAdminSuccess={handleAdminSuccess}
            onParentSuccess={handleParentSuccess}
            availableParentDemos={students}
          />
        )}

        {role === 'admin' && (
          <AdminDashboard
            students={students}
            isLoading={isLoading}
          />
        )}

        {role === 'parent' && parentStudent && (
          <ParentPortal
            initialStudent={parentStudent}
            onLogout={handleLogout}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="py-4 border-t border-slate-900 text-center text-xs text-slate-600 print:hidden">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>EduPulse Real-time School Management • Enterprise Edition</span>
          <span className="text-[11px] text-slate-500">
            Powered by Firebase Cloud Firestore Real-time Synchronization
          </span>
        </div>
      </footer>
    </div>
  );
}
