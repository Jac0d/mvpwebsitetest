import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from './theme';
import { ClassesPage } from './pages/courses/ClassesPage';
import { ClassDetails } from './pages/courses/ClassDetails';
import StudentsPage from './pages/students/StudentsPage';
import StaffPage from './pages/staff/StaffPage';
import EquipmentPage from './pages/equipment/EquipmentPage';
import LessonsPage from './pages/lessons/LessonsPage';
import ButtonPreview from './pages/ButtonStylesPreview';
import { Student } from './types/Student';

interface Staff {
  id: number;
  name: string;
  userID: string;
  role: string;
}

export default function App() {
  const [classes, setClasses] = useState<{
    yearLevels: number[];
    courseName: string;
    courseCode: string;
    room: string;
    selectedLessons?: string[];
    teachers: string[];
    studentIds?: string[];
  }[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);

  // Fetch staff on mount
  useEffect(() => {
    fetch('http://localhost:3001/staff')
      .then(res => res.json())
      .then(data => setStaff(data));
  }, []);

  // Fetch students from backend on mount
  useEffect(() => {
    fetch('http://localhost:3001/students')
      .then(res => res.json())
      .then(data => {
        // Ensure every student has a progress property
        setStudents(data.map((s: any) => ({ ...s, progress: s.progress || {} })));
      });
  }, []);

  // Fetch classes from backend on mount
  useEffect(() => {
    fetch('http://localhost:3001/classes')
      .then(res => res.json())
      .then(data => setClasses(data));
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Routes>
          <Route path="/" element={<ClassesPage classes={classes} setClasses={setClasses} staff={staff} />} />
          <Route path="/classes" element={<ClassesPage classes={classes} setClasses={setClasses} staff={staff} />} />
          <Route path="/students" element={<StudentsPage />} />
          <Route path="/staff" element={<StaffPage />} />
          <Route path="/lessons" element={<LessonsPage />} />
          <Route path="/equipment" element={<EquipmentPage />} />
          <Route path="/classes/:id" element={<ClassDetails classes={classes} setClasses={setClasses} students={students} setStudents={setStudents} />} />
          <Route path="/button-styles" element={<ButtonPreview />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}
