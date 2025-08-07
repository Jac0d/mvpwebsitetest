import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CustomThemeProvider } from './context/ThemeContext';
import { ClassesPage } from './pages/courses/ClassesPage';
import { ClassDetails } from './pages/courses/ClassDetails';
import StudentsPage from './pages/students/StudentsPage';
import { StudentDetails } from './pages/students/StudentDetails';
import StaffPage from './pages/staff/StaffPage';
import StaffDetails from './pages/staff/StaffDetails';
import EquipmentPage from './pages/equipment/EquipmentPage';
import { EquipmentDetails } from './pages/equipment/EquipmentDetails';
import LessonsPage from './pages/lessons/LessonsPage';
import ButtonPreview from './pages/ButtonStylesPreview';
import ThemeSelector from './pages/ThemeSelector';
import { Student } from './types/Student';

interface Staff {
  id: number;
  name: string;
  userID: string;
  role: string;
}

export interface Equipment {
  id: string;
  name: string;
  type: string;
  code: string;
  location: string;
  purchasePrice?: number;
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
  const [equipment, setEquipment] = useState<Equipment[]>([]);

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

  // Fetch equipment from backend on mount
  useEffect(() => {
    fetch('http://localhost:3001/equipment')
      .then(res => res.json())
      .then(data => setEquipment(data));
  }, []);

  return (
    <CustomThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<ClassesPage classes={classes} setClasses={setClasses} staff={staff} />} />
          <Route path="/classes" element={<ClassesPage classes={classes} setClasses={setClasses} staff={staff} />} />
          <Route path="/students" element={<StudentsPage />} />
          <Route path="/students/:id" element={<StudentDetails students={students} classes={classes} staff={staff} />} />
          <Route path="/staff" element={<StaffPage />} />
          <Route path="/staff/:userID" element={<StaffDetails />} />
          <Route path="/lessons" element={<LessonsPage />} />
          <Route path="/equipment" element={<EquipmentPage />} />
          <Route path="/equipment/:id" element={<EquipmentDetails equipment={equipment} />} />
          <Route path="/classes/:id" element={<ClassDetails classes={classes} setClasses={setClasses} students={students} setStudents={setStudents} />} />
          <Route path="/button-styles" element={<ButtonPreview />} />
          <Route path="/theme-settings" element={<ThemeSelector />} />
        </Routes>
      </Router>
    </CustomThemeProvider>
  );
}
