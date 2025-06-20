const express = require('express');
const cors = require('cors');
const fs = require('fs');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

function loadData() {
  let data = { students: [], staff: [], classes: [], equipment: [], rooms: [], lessons: [] };
  
  // If data.json exists, load it
  if (fs.existsSync('data.json')) {
    data = JSON.parse(fs.readFileSync('data.json', 'utf8'));
  }

  // Ensure all collections exist
  data.students = data.students || [];
  data.staff = data.staff || [];
  data.classes = data.classes || [];
  data.equipment = data.equipment || [];
  data.rooms = data.rooms || [];
  
  // Only initialize lessons if they don't exist
  if (!data.lessons || data.lessons.length === 0) {
    data.lessons = [
      {
        id: 1,
        name: 'Air Compressor',
        icon: 'Power',
        description: '',
        category: 'Machines',
        area: 'Industrial',
        subArea: 'Multiuse Workshop Equipment'
      },
      {
        id: 2,
        name: 'Buffing Machine',
        icon: 'Power',
        description: '',
        category: 'Machines',
        area: 'Industrial',
        subArea: 'Multiuse Workshop Equipment'
      },
      {
        id: 3,
        name: 'Drill Press',
        icon: 'Power',
        description: '',
        category: 'Machines',
        area: 'Industrial',
        subArea: 'Multiuse Workshop Equipment'
      },
      {
        id: 4,
        name: 'Soldering Iron',
        icon: 'ElectricBolt',
        description: '',
        category: 'Tools',
        area: 'Industrial',
        subArea: 'Multiuse Workshop Equipment'
      },
      {
        id: 5,
        name: 'Reciprocating Saw',
        icon: 'Construction',
        description: '',
        category: 'Tools',
        area: 'Industrial',
        subArea: 'Multiuse Workshop Equipment'
      },
      {
        id: 6,
        name: 'Wet Stone Grinder',
        icon: 'Power',
        description: '',
        category: 'Machines',
        area: 'Industrial',
        subArea: 'Multiuse Workshop Equipment'
      },
      {
        id: 7,
        name: 'Multitool',
        icon: 'Handyman',
        description: '',
        category: 'Tools',
        area: 'Industrial',
        subArea: 'Multiuse Workshop Equipment'
      },
      {
        id: 8,
        name: 'Drills and Impact Drivers',
        icon: 'Construction',
        description: '',
        category: 'Tools',
        area: 'Industrial',
        subArea: 'Multiuse Workshop Equipment'
      },
      {
        id: 9,
        name: 'Rotary Tool (Dremel)',
        icon: 'Build',
        description: '',
        category: 'Tools',
        area: 'Industrial',
        subArea: 'Multiuse Workshop Equipment'
      },
      {
        id: 10,
        name: 'Metalworking Hand Tools',
        icon: 'Handyman',
        description: '',
        category: 'Tools',
        area: 'Industrial',
        subArea: 'Metalworking'
      },
      {
        id: 11,
        name: 'Sheet Metal Bending Equipment',
        icon: 'Construction',
        description: '',
        category: 'Machines',
        area: 'Industrial',
        subArea: 'Metalworking'
      },
      {
        id: 12,
        name: 'Bench Grinders and Linishers',
        icon: 'Power',
        description: '',
        category: 'Machines',
        area: 'Industrial',
        subArea: 'Metalworking'
      },
      {
        id: 13,
        name: 'Sheet Metal Guillotine',
        icon: 'Construction',
        description: '',
        category: 'Machines',
        area: 'Industrial',
        subArea: 'Metalworking'
      },
      {
        id: 14,
        name: 'Hydraulic Press',
        icon: 'Power',
        description: '',
        category: 'Machines',
        area: 'Industrial',
        subArea: 'Metalworking'
      },
      {
        id: 15,
        name: 'Metal Lathe',
        icon: 'Power',
        description: '',
        category: 'Machines',
        area: 'Industrial',
        subArea: 'Metalworking'
      },
      {
        id: 16,
        name: 'Milling Machine',
        icon: 'Power',
        description: '',
        category: 'Machines',
        area: 'Industrial',
        subArea: 'Metalworking'
      },
      {
        id: 17,
        name: 'Cold Saw',
        icon: 'Construction',
        description: '',
        category: 'Machines',
        area: 'Industrial',
        subArea: 'Metalworking'
      },
      {
        id: 18,
        name: 'Bench Shears',
        icon: 'Construction',
        description: '',
        category: 'Tools',
        area: 'Industrial',
        subArea: 'Metalworking'
      },
      {
        id: 19,
        name: 'Angle Grinder',
        icon: 'Power',
        description: '',
        category: 'Tools',
        area: 'Industrial',
        subArea: 'Metalworking'
      },
      {
        id: 20,
        name: 'Arc Welder',
        icon: 'ElectricBolt',
        description: '',
        category: 'Machines',
        area: 'Industrial',
        subArea: 'Metalworking'
      },
      {
        id: 21,
        name: 'Portable Bandsaw',
        icon: 'Construction',
        description: '',
        category: 'Tools',
        area: 'Industrial',
        subArea: 'Metalworking'
      },
      {
        id: 22,
        name: 'Die Grinder',
        icon: 'Power',
        description: '',
        category: 'Tools',
        area: 'Industrial',
        subArea: 'Metalworking'
      },
      {
        id: 23,
        name: 'Metal Abrasive Cut Off Saw',
        icon: 'Construction',
        description: '',
        category: 'Machines',
        area: 'Industrial',
        subArea: 'Metalworking'
      },
      {
        id: 24,
        name: 'Metal Bandsaws and Power Hacksaw',
        icon: 'Construction',
        description: '',
        category: 'Machines',
        area: 'Industrial',
        subArea: 'Metalworking'
      },
      {
        id: 25,
        name: 'Power Shears / Nibbler',
        icon: 'Construction',
        description: '',
        category: 'Tools',
        area: 'Industrial',
        subArea: 'Metalworking'
      },
      {
        id: 26,
        name: 'Pipe and Tube Benders',
        icon: 'Construction',
        description: '',
        category: 'Machines',
        area: 'Industrial',
        subArea: 'Metalworking'
      },
      {
        id: 27,
        name: 'Plasma Cutter',
        icon: 'ElectricBolt',
        description: '',
        category: 'Machines',
        area: 'Industrial',
        subArea: 'Metalworking'
      },
      {
        id: 28,
        name: 'Electric Welding Equipment (Arc, MIG,TIG, Spot)',
        icon: 'ElectricBolt',
        description: '',
        category: 'Machines',
        area: 'Industrial',
        subArea: 'Metalworking'
      },
      {
        id: 29,
        name: 'Gas Welding/Heating Equipment (Oxy Acetylene Equipment Oxy, Propane Equipment LPG)',
        icon: 'Science',
        description: '',
        category: 'Machines',
        area: 'Industrial',
        subArea: 'Metalworking'
      },
      {
        id: 30,
        name: 'Woodworking Hand Tools',
        icon: 'Handyman',
        description: '',
        category: 'Tools',
        area: 'Industrial',
        subArea: 'Woodworking'
      },
      {
        id: 31,
        name: 'Wood Lathe',
        icon: 'Power',
        description: '',
        category: 'Machines',
        area: 'Industrial',
        subArea: 'Woodworking'
      },
      {
        id: 32,
        name: 'Brad and Nail Guns',
        icon: 'Construction',
        description: '',
        category: 'Tools',
        area: 'Industrial',
        subArea: 'Woodworking'
      },
      {
        id: 33,
        name: 'Staple Gun',
        icon: 'Construction',
        description: '',
        category: 'Tools',
        area: 'Industrial',
        subArea: 'Woodworking'
      },
      {
        id: 34,
        name: 'Mortiser Machine',
        icon: 'Power',
        description: '',
        category: 'Machines',
        area: 'Industrial',
        subArea: 'Woodworking'
      },
      {
        id: 35,
        name: 'Wood Bandsaw',
        icon: 'Power',
        description: '',
        category: 'Machines',
        area: 'Industrial',
        subArea: 'Woodworking'
      },
      {
        id: 36,
        name: 'Panel Saws',
        icon: 'Construction',
        description: '',
        category: 'Machines',
        area: 'Industrial',
        subArea: 'Woodworking'
      },
      {
        id: 37,
        name: 'Radial Arm Saw',
        icon: 'Power',
        description: '',
        category: 'Machines',
        area: 'Industrial',
        subArea: 'Woodworking'
      },
      {
        id: 38,
        name: 'Surface Planer / Jointer',
        icon: 'Power',
        description: '',
        category: 'Machines',
        area: 'Industrial',
        subArea: 'Woodworking'
      },
      {
        id: 39,
        name: 'Thicknesser',
        icon: 'Power',
        description: '',
        category: 'Machines',
        area: 'Industrial',
        subArea: 'Woodworking'
      },
      {
        id: 40,
        name: 'Dowelling Machines, Biscuit and Domino Jointers',
        icon: 'Power',
        description: '',
        category: 'Machines',
        area: 'Industrial',
        subArea: 'Woodworking'
      },
      {
        id: 41,
        name: 'Belt Sander (Handheld)',
        icon: 'Power',
        description: '',
        category: 'Tools',
        area: 'Industrial',
        subArea: 'Woodworking'
      },
      {
        id: 42,
        name: 'Plunge and Palm routers / Laminate Trimmers',
        icon: 'Power',
        description: '',
        category: 'Tools',
        area: 'Industrial',
        subArea: 'Woodworking'
      },
      {
        id: 43,
        name: 'Portable Sanders (Sheet, Orbital, and Random Orbital)',
        icon: 'Power',
        description: '',
        category: 'Tools',
        area: 'Industrial',
        subArea: 'Woodworking'
      },
      {
        id: 44,
        name: 'Circular Saw',
        icon: 'Construction',
        description: '',
        category: 'Tools',
        area: 'Industrial',
        subArea: 'Woodworking'
      },
      {
        id: 45,
        name: 'Compound Mitre Saw',
        icon: 'Power',
        description: '',
        category: 'Machines',
        area: 'Industrial',
        subArea: 'Woodworking'
      },
      {
        id: 46,
        name: 'Jigsaw',
        icon: 'Construction',
        description: '',
        category: 'Tools',
        area: 'Industrial',
        subArea: 'Woodworking'
      },
      {
        id: 47,
        name: 'Scroll Saw',
        icon: 'Power',
        description: '',
        category: 'Machines',
        area: 'Industrial',
        subArea: 'Woodworking'
      },
      {
        id: 48,
        name: 'Planer',
        icon: 'Power',
        description: '',
        category: 'Tools',
        area: 'Industrial',
        subArea: 'Woodworking'
      },
      {
        id: 63,
        name: 'Basic Workshop Safety',
        icon: 'Warning',
        description: '',
        category: 'Safety',
        area: 'Industrial',
        subArea: 'Workshop Safety'
      },
      {
        id: 64,
        name: 'Basic Machine Safety',
        icon: 'Warning',
        description: '',
        category: 'Safety',
        area: 'Industrial',
        subArea: 'Workshop Safety'
      },
      {
        id: 65,
        name: 'Dust Hazards',
        icon: 'Warning',
        description: '',
        category: 'Safety',
        area: 'Industrial',
        subArea: 'Workshop Safety'
      },
      {
        id: 66,
        name: 'Safety Signage',
        icon: 'Warning',
        description: '',
        category: 'Safety',
        area: 'Industrial',
        subArea: 'Workshop Safety'
      }
    ];
    // Save the updated data
    saveData(data);
  }
  
  return data;
}

function saveData(data) {
  try {
    // Create a backup of the current data
    if (fs.existsSync('data.json')) {
      fs.copyFileSync('data.json', 'data.json.backup');
    }
    
    // Write the new data
    const jsonData = JSON.stringify(data, null, 2);
    fs.writeFileSync('data.json', jsonData);
    
    // Verify the save
    const savedData = JSON.parse(fs.readFileSync('data.json', 'utf8'));
    if (!savedData.classes) {
      throw new Error('Classes data not found in saved file');
    }
    
    console.log('Data successfully saved to data.json');
    console.log('Classes in saved data:', savedData.classes);
  } catch (error) {
    console.error('Error saving data:', error);
    // Restore from backup if save failed
    if (fs.existsSync('data.json.backup')) {
      fs.copyFileSync('data.json.backup', 'data.json');
    }
    throw error;
  }
}

function ensureClasses(data) {
  if (!data.classes) data.classes = [];
}

app.get('/students', (req, res) => {
  const data = loadData();
  res.json(data.students);
});
app.post('/students', (req, res) => {
  const data = loadData();
  const students = req.body.students;
  students.forEach(student => {
    // Use userID as the unique identifier
    student.id = student.userID;
    student.tenant_id = 1;
    data.students.push(student);
  });
  saveData(data);
  res.json({ success: true, added: students.length });
});

app.get('/staff', (req, res) => {
  const data = loadData();
  res.json(data.staff);
});
app.post('/staff', (req, res) => {
  const data = loadData();
  const staff = req.body.staff;
  staff.forEach(member => {
    member.id = Date.now() + Math.floor(Math.random() * 10000);
    member.tenant_id = 1;
    data.staff.push(member);
  });
  saveData(data);
  res.json({ success: true, added: staff.length });
});

app.get('/classes', (req, res) => {
  const data = loadData();
  console.log('Loading classes from data.json:', data.classes);
  ensureClasses(data);
  res.json(data.classes);
});

app.post('/classes', (req, res) => {
  const data = loadData();
  ensureClasses(data);
  const classes = req.body.classes;
  
  // Ensure each class has a proper ID based on its class code
  data.classes = classes.map(cls => {
    // Use classCode as the ID, or generate one if not provided
    const classId = cls.classCode || `class_${Date.now()}`;
    
    return {
      ...cls,
      id: classId, // Use classCode as the ID
      tenant_id: 1,
      studentIds: cls.studentIds || []
    };
  });
  
  saveData(data);
  res.json({ success: true, classes: data.classes });
});

app.post('/classes/:classId/students', (req, res) => {
  try {
    const data = loadData();
    const { classId } = req.params;
    const { studentIds } = req.body;
    
    console.log('Updating students for class:', classId);
    console.log('Received student IDs:', studentIds);
    
    // Find the class by either id or classCode
    const cls = data.classes.find(c => c.id === classId || c.classCode === classId);
    
    if (!cls) {
      console.log('Class not found:', classId);
      return res.status(404).json({ error: 'Class not found' });
    }
    
    // Store studentIds as strings (userIDs)
    const stringStudentIds = Array.isArray(studentIds) 
      ? studentIds.map(id => String(id))
      : [];
    
    // Update the student IDs
    cls.studentIds = stringStudentIds;
    
    console.log('Updated class:', cls);
    
    // Save the data
    saveData(data);
    
    res.json({ success: true, class: cls });
  } catch (error) {
    console.error('Error updating class students:', error);
    res.status(500).json({ error: 'Failed to update class students' });
  }
});

// Add a test endpoint to verify data saving
app.post('/test-class', (req, res) => {
  const data = loadData();
  const testClass = {
    id: 'test-class',
    className: 'Test Class',
    classCode: 'TEST',
    yearLevels: [7],
    teachers: [],
    selectedLessons: [],
    studentIds: [1, 2, 3],
    tenant_id: 1
  };
  
  data.classes.push(testClass);
  saveData(data);
  res.json({ success: true, class: testClass });
});

app.delete('/students/:userID', (req, res) => {
  const data = loadData();
  const { userID } = req.params;
  const initialLength = data.students.length;
  data.students = data.students.filter(student => student.userID !== userID);
  if (data.students.length === initialLength) {
    return res.status(404).json({ success: false, message: 'Student not found' });
  }
  // Remove student from all classes
  data.classes.forEach(cls => {
    if (Array.isArray(cls.studentIds)) {
      cls.studentIds = cls.studentIds.filter(id => id !== userID);
    }
  });
  saveData(data);
  res.json({ success: true });
});

app.delete('/staff/:id', (req, res) => {
  const data = loadData();
  const { id } = req.params;
  // Find the staff member
  const staffMember = data.staff.find(member => String(member.id) === String(id));
  if (!staffMember) {
    return res.status(404).json({ success: false, message: 'Staff member not found' });
  }
  // Check if assigned to any class
  const assignedClass = data.classes && data.classes.find(cls => Array.isArray(cls.teachers) && cls.teachers.includes(staffMember.userID));
  if (assignedClass) {
    return res.status(400).json({ success: false, message: 'Cannot delete staff member assigned to a class.' });
  }
  const initialLength = data.staff.length;
  data.staff = data.staff.filter(member => String(member.id) !== String(id));
  if (data.staff.length === initialLength) {
    return res.status(404).json({ success: false, message: 'Staff member not found' });
  }
  saveData(data);
  res.json({ success: true });
});

// Equipment endpoints
app.get('/equipment', (req, res) => {
  const data = loadData();
  if (!data.equipment) data.equipment = [];
  res.json(data.equipment);
});
app.post('/equipment', (req, res) => {
  const data = loadData();
  data.equipment = req.body.equipment || [];
  saveData(data);
  res.json({ success: true, equipment: data.equipment });
});
app.delete('/equipment/:id', (req, res) => {
  const data = loadData();
  if (!data.equipment) data.equipment = [];
  const { id } = req.params;
  const initialLength = data.equipment.length;
  data.equipment = data.equipment.filter(eq => String(eq.id) !== String(id));
  saveData(data);
  res.json({ success: true, deleted: initialLength - data.equipment.length });
});
// Rooms endpoints
app.get('/rooms', (req, res) => {
  const data = loadData();
  if (!data.rooms) data.rooms = [];
  res.json(data.rooms);
});
app.post('/rooms', (req, res) => {
  const data = loadData();
  data.rooms = req.body.rooms || [];
  saveData(data);
  res.json({ success: true, rooms: data.rooms });
});

// Add lessons endpoints
app.get('/lessons', (req, res) => {
  const data = loadData();
  console.log('Sending lessons:', data.lessons.length); // Debug log
  if (!data.lessons) data.lessons = [];
  res.json(data.lessons);
});

app.post('/lessons', (req, res) => {
  const data = loadData();
  if (!data.lessons) data.lessons = [];
  
  const lessons = req.body.lessons;
  if (!Array.isArray(lessons)) {
    return res.status(400).json({ error: 'Expected lessons array' });
  }
  
  // Update lessons
  data.lessons = lessons.map(lesson => ({
    ...lesson,
    id: lesson.id || Date.now() + Math.floor(Math.random() * 10000)
  }));
  
  saveData(data);
  res.json({ success: true, lessons: data.lessons });
});

// Add endpoint for updating class lessons
app.post('/classes/:classId/lessons', (req, res) => {
  try {
    const data = loadData();
    const { classId } = req.params;
    const { selectedLessons } = req.body;
    
    console.log('Updating lessons for class:', classId);
    console.log('Selected lessons:', selectedLessons);
    
    // Find the class by either id or classCode
    const cls = data.classes.find(c => c.id === classId || c.classCode === classId);
    
    if (!cls) {
      console.log('Class not found:', classId);
      return res.status(404).json({ error: 'Class not found' });
    }
    
    // Update the selected lessons
    cls.selectedLessons = selectedLessons || [];
    
    console.log('Updated class:', cls);
    
    // Save the data
    saveData(data);
    
    res.json({ success: true, class: cls });
  } catch (error) {
    console.error('Error updating class lessons:', error);
    res.status(500).json({ error: 'Failed to update class lessons' });
  }
});

// Add PUT endpoint for editing lessons
app.put('/lessons/:id', (req, res) => {
  const data = loadData();
  const lessonId = parseInt(req.params.id);
  const updatedLesson = req.body;

  const lessonIndex = data.lessons.findIndex(lesson => lesson.id === lessonId);
  if (lessonIndex === -1) {
    res.status(404).json({ error: 'Lesson not found' });
    return;
  }

  // Update the lesson
  data.lessons[lessonIndex] = {
    ...data.lessons[lessonIndex],
    ...updatedLesson,
    id: lessonId // Ensure ID doesn't change
  };

  saveData(data);
  res.json(data.lessons[lessonIndex]);
});

// Add endpoint for updating student progress
app.post('/students/:userID/progress', (req, res) => {
  try {
    const data = loadData();
    const { userID } = req.params;
    const { progress } = req.body;

    // Find the student
    const student = data.students.find(s => s.userID === userID);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Update the student's progress
    student.progress = progress;

    // Save the data
    saveData(data);

    res.json({ success: true, student });
  } catch (error) {
    console.error('Error updating student progress:', error);
    res.status(500).json({ error: 'Failed to update student progress' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 