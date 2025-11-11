const express = require('express');
const cors = require('cors');
const fs = require('fs');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, HeadingLevel, BorderStyle } = require('docx');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/equipment-photos';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'equipment-' + req.params.id + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 25 * 1024 * 1024 // 25MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Configure multer for manual uploads
const manualStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/equipment-manuals';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, 'manual-' + req.params.id + '-' + uniqueSuffix + '-' + sanitizedName);
  }
});

// Configure multer for maintenance photo uploads
const maintenancePhotoStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/maintenance-photos';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, 'maintenance-' + req.params.id + '-' + uniqueSuffix + '-' + sanitizedName);
  }
});

const uploadManual = multer({ 
  storage: manualStorage,
  limits: {
    fileSize: 25 * 1024 * 1024 // 25MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept PDF and Word documents
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and Word documents are allowed'), false);
    }
  }
});

// Configure multer for document template uploads
const templateStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/document-templates';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, 'template-' + uniqueSuffix + '-' + sanitizedName);
  }
});

// Configure multer for SOP document uploads
const sopStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/sop-documents';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, 'sop-' + uniqueSuffix + '-' + sanitizedName);
  }
});

const uploadTemplate = multer({ 
  storage: templateStorage,
  limits: {
    fileSize: 25 * 1024 * 1024 // 25MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept only Word documents for templates
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only Word documents (.docx) are allowed for templates'), false);
    }
  }
});

const uploadSop = multer({ 
  storage: sopStorage,
  limits: {
    fileSize: 25 * 1024 * 1024 // 25MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept Word documents and PDFs for SOPs
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/pdf'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only Word documents (.docx) and PDFs are allowed for SOPs'), false);
    }
  }
});

const uploadMaintenancePhoto = multer({ 
  storage: maintenancePhotoStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Configure multer for icon uploads
const iconStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/safety-icons');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'icon-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const uploadIcon = multer({ 
  storage: iconStorage,
  fileFilter: (req, file, cb) => {
    // Allow only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Serve uploaded files statically
app.use('/uploads', express.static('uploads'));

// Safety Icons Management
app.post('/safety-icons/upload', uploadIcon.single('icon'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No icon file uploaded' });
    }

    const iconData = {
      id: Date.now().toString(),
      name: req.body.name || req.file.originalname,
      category: req.body.category || 'general',
      filename: req.file.filename,
      path: `/uploads/safety-icons/${req.file.filename}`,
      uploadDate: new Date().toISOString()
    };

    // Read existing data
    const data = JSON.parse(fs.readFileSync('data.json', 'utf8'));
    
    // Initialize safetyIcons array if it doesn't exist
    if (!data.safetyIcons) {
      data.safetyIcons = [];
    }
    
    // Add new icon
    data.safetyIcons.push(iconData);
    
    // Save back to file
    fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
    
    res.json({ success: true, icon: iconData });
  } catch (error) {
    console.error('Error uploading icon:', error);
    res.status(500).json({ error: 'Failed to upload icon' });
  }
});

app.get('/safety-icons', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync('data.json', 'utf8'));
    const icons = data.safetyIcons || [];
    res.json(icons);
  } catch (error) {
    console.error('Error fetching icons:', error);
    res.status(500).json({ error: 'Failed to fetch icons' });
  }
});

app.delete('/safety-icons/:iconId', (req, res) => {
  try {
    const iconId = req.params.iconId;
    const data = JSON.parse(fs.readFileSync('data.json', 'utf8'));
    
    const iconIndex = data.safetyIcons?.findIndex(icon => icon.id === iconId);
    if (iconIndex === -1) {
      return res.status(404).json({ error: 'Icon not found' });
    }
    
    const icon = data.safetyIcons[iconIndex];
    
    // Delete file from filesystem
    const filePath = path.join(__dirname, 'uploads', 'safety-icons', icon.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    // Remove from data
    data.safetyIcons.splice(iconIndex, 1);
    fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting icon:', error);
    res.status(500).json({ error: 'Failed to delete icon' });
  }
});

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

app.get('/staff/:userID', (req, res) => {
  const data = loadData();
  const { userID } = req.params;
  const staffMember = data.staff.find(member => member.userID === userID);
  if (!staffMember) {
    return res.status(404).json({ error: 'Staff member not found' });
  }
  res.json(staffMember);
});

app.put('/staff/:userID', (req, res) => {
  const { userID } = req.params;
  const { name, role, email } = req.body;
  const data = loadData();
  const staffIndex = data.staff.findIndex(s => s.userID === userID);

  if (staffIndex !== -1) {
    if (name) data.staff[staffIndex].name = name;
    if (role) data.staff[staffIndex].role = role;
    if (email !== undefined) data.staff[staffIndex].email = email;
    saveData(data);
    res.json({ success: true, message: 'Staff member updated successfully.' });
  } else {
    res.status(404).json({ success: false, message: 'Staff member not found.' });
  }
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

app.delete('/staff/:userID', (req, res) => {
  const data = loadData();
  const { userID } = req.params;
  // Find the staff member
  const staffMember = data.staff.find(member => member.userID === userID);
  if (!staffMember) {
    return res.status(404).json({ success: false, message: 'Staff member not found' });
  }
  // Check if assigned to any class
  const assignedClass = data.classes && data.classes.find(cls => Array.isArray(cls.teachers) && cls.teachers.includes(staffMember.userID));
  if (assignedClass) {
    return res.status(400).json({ success: false, message: 'Cannot delete staff member assigned to a class.' });
  }
  const initialLength = data.staff.length;
  data.staff = data.staff.filter(member => member.userID !== userID);
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
app.put('/equipment/:id', (req, res) => {
  const data = loadData();
  const { id } = req.params;
  const { name, type, code, location, purchasePrice } = req.body;

  if (!data.equipment) data.equipment = [];

  const equipmentIndex = data.equipment.findIndex(eq => String(eq.id) === String(id));

  if (equipmentIndex === -1) {
    return res.status(404).json({ success: false, message: 'Equipment not found' });
  }

  // Update the equipment item
  const updatedEquipment = {
    ...data.equipment[equipmentIndex],
    name,
    type,
    code,
    location,
  };

  // Only update purchasePrice if it's provided in the request
  if (purchasePrice !== undefined) {
    updatedEquipment.purchasePrice = purchasePrice;
  }

  data.equipment[equipmentIndex] = updatedEquipment;

  saveData(data);
  res.json({ success: true, equipment: data.equipment[equipmentIndex] });
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

// Equipment photo upload endpoint
app.post('/equipment/:id/photo', upload.single('photo'), (req, res) => {
  try {
    const data = loadData();
    const { id } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No photo file provided' });
    }
    
    // Find the equipment
    const equipment = data.equipment.find(eq => String(eq.id) === String(id));
    if (!equipment) {
      return res.status(404).json({ success: false, message: 'Equipment not found' });
    }
    
    // Remove old photo file if it exists
    if (equipment.photo) {
      const oldPhotoPath = path.join(__dirname, equipment.photo.replace('/uploads/', 'uploads/'));
      if (fs.existsSync(oldPhotoPath)) {
        fs.unlinkSync(oldPhotoPath);
      }
    }
    
    // Update equipment with new photo path
    equipment.photo = `/uploads/equipment-photos/${req.file.filename}`;
    
    saveData(data);
    res.json({ success: true, photo: equipment.photo });
  } catch (error) {
    console.error('Error uploading photo:', error);
    res.status(500).json({ success: false, message: 'Failed to upload photo' });
  }
});

// Equipment photo delete endpoint
app.delete('/equipment/:id/photo', (req, res) => {
  try {
    const data = loadData();
    const { id } = req.params;
    
    // Find the equipment
    const equipment = data.equipment.find(eq => String(eq.id) === String(id));
    if (!equipment) {
      return res.status(404).json({ success: false, message: 'Equipment not found' });
    }
    
    // Remove photo file if it exists
    if (equipment.photo) {
      const photoPath = path.join(__dirname, equipment.photo.replace('/uploads/', 'uploads/'));
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
    }
    
    // Remove photo reference from equipment
    delete equipment.photo;
    
    saveData(data);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting photo:', error);
    res.status(500).json({ success: false, message: 'Failed to delete photo' });
  }
});

// Equipment notes endpoints
app.get('/equipment/:id/notes', (req, res) => {
  const data = loadData();
  const { id } = req.params;
  
  if (!data.equipmentNotes) data.equipmentNotes = {};
  
  const notes = data.equipmentNotes[id] || [];
  res.json(notes);
});

app.post('/equipment/:id/notes', (req, res) => {
  const data = loadData();
  const { id } = req.params;
  const { title, content } = req.body;
  
  if (!title || !content) {
    return res.status(400).json({ success: false, message: 'Title and content are required' });
  }
  
  if (!data.equipmentNotes) data.equipmentNotes = {};
  if (!data.equipmentNotes[id]) data.equipmentNotes[id] = [];
  
  const newNote = {
    id: Date.now().toString(),
    title: title.trim(),
    content: content.trim(),
    createdAt: new Date().toISOString(),
  };
  
  data.equipmentNotes[id].push(newNote);
  saveData(data);
  
  res.json({ success: true, note: newNote });
});

app.put('/equipment/:id/notes/:noteId', (req, res) => {
  const data = loadData();
  const { id, noteId } = req.params;
  const { title, content } = req.body;
  
  if (!title || !content) {
    return res.status(400).json({ success: false, message: 'Title and content are required' });
  }
  
  if (!data.equipmentNotes || !data.equipmentNotes[id]) {
    return res.status(404).json({ success: false, message: 'Notes not found' });
  }
  
  const noteIndex = data.equipmentNotes[id].findIndex(note => note.id === noteId);
  if (noteIndex === -1) {
    return res.status(404).json({ success: false, message: 'Note not found' });
  }
  
  data.equipmentNotes[id][noteIndex] = {
    ...data.equipmentNotes[id][noteIndex],
    title: title.trim(),
    content: content.trim(),
  };
  
  saveData(data);
  res.json({ success: true, note: data.equipmentNotes[id][noteIndex] });
});

app.delete('/equipment/:id/notes/:noteId', (req, res) => {
  const data = loadData();
  const { id, noteId } = req.params;
  
  if (!data.equipmentNotes || !data.equipmentNotes[id]) {
    return res.status(404).json({ success: false, message: 'Notes not found' });
  }
  
  const initialLength = data.equipmentNotes[id].length;
  data.equipmentNotes[id] = data.equipmentNotes[id].filter(note => note.id !== noteId);
  
  if (data.equipmentNotes[id].length === initialLength) {
    return res.status(404).json({ success: false, message: 'Note not found' });
  }
  
  saveData(data);
  res.json({ success: true });
});

// Equipment tag out endpoints
app.get('/equipment/:id/tagout', (req, res) => {
  const data = loadData();
  const { id } = req.params;
  
  if (!data.equipmentTagOut) data.equipmentTagOut = {};
  
  const tagOut = data.equipmentTagOut[id] || null;
  res.json(tagOut);
});

app.post('/equipment/:id/tagout', (req, res) => {
  const data = loadData();
  const { id } = req.params;
  const { tagOutDate, completedBy, tagOutSteps, notes } = req.body;
  
  if (!tagOutDate || !completedBy || !tagOutSteps || tagOutSteps.length === 0) {
    return res.status(400).json({ success: false, message: 'Date, completed by, and at least one step are required' });
  }
  
  if (!data.equipmentTagOut) data.equipmentTagOut = {};
  
  const newTagOut = {
    id: Date.now().toString(),
    tagOutDate,
    completedBy: completedBy.trim(),
    tagOutSteps,
    notes: notes ? notes.trim() : '',
    createdAt: new Date().toISOString(),
  };
  
  data.equipmentTagOut[id] = newTagOut;
  saveData(data);
  
  res.json({ success: true, tagOut: newTagOut });
});

app.delete('/equipment/:id/tagout', (req, res) => {
  const data = loadData();
  const { id } = req.params;
  
  if (!data.equipmentTagOut) {
    return res.status(404).json({ success: false, message: 'Tag out data not found' });
  }
  
  if (!data.equipmentTagOut[id]) {
    return res.status(404).json({ success: false, message: 'Equipment not tagged out' });
  }
  
  delete data.equipmentTagOut[id];
  saveData(data);
  
  res.json({ success: true });
});

// Equipment loan endpoints
app.get('/equipment/:id/loan', (req, res) => {
  const data = loadData();
  const { id } = req.params;
  
  if (!data.equipmentLoans) data.equipmentLoans = {};
  
  const loan = data.equipmentLoans[id] || null;
  res.json(loan);
});

app.post('/equipment/:id/loan', (req, res) => {
  const data = loadData();
  const { id } = req.params;
  const { lendDate, lentTo, dueBackDate, notes } = req.body;
  
  if (!lendDate || !lentTo || !dueBackDate) {
    return res.status(400).json({ success: false, message: 'Lend date, lent to, and due back date are required' });
  }
  
  if (!data.equipmentLoans) data.equipmentLoans = {};
  
  const newLoan = {
    id: Date.now().toString(),
    lendDate,
    lentTo: lentTo.trim(),
    dueBackDate,
    notes: notes ? notes.trim() : '',
    createdAt: new Date().toISOString(),
  };
  
  data.equipmentLoans[id] = newLoan;
  saveData(data);
  
  res.json({ success: true, loan: newLoan });
});

app.delete('/equipment/:id/loan', (req, res) => {
  const data = loadData();
  const { id } = req.params;
  
  if (!data.equipmentLoans) {
    return res.status(404).json({ success: false, message: 'Loan data not found' });
  }
  
  if (!data.equipmentLoans[id]) {
    return res.status(404).json({ success: false, message: 'Equipment not loaned out' });
  }
  
  delete data.equipmentLoans[id];
  saveData(data);
  
  res.json({ success: true });
});

// Equipment manuals endpoints
app.get('/equipment/:id/manuals', (req, res) => {
  const data = loadData();
  const { id } = req.params;
  
  if (!data.equipmentManuals) data.equipmentManuals = {};
  
  const manuals = data.equipmentManuals[id] || [];
  res.json(manuals);
});

app.post('/equipment/:id/manuals', uploadManual.single('manual'), (req, res) => {
  const data = loadData();
  const { id } = req.params;
  const { title, url, type } = req.body;
  
  if (!title) {
    return res.status(400).json({ success: false, message: 'Title is required' });
  }
  
  if (!data.equipmentManuals) data.equipmentManuals = {};
  if (!data.equipmentManuals[id]) data.equipmentManuals[id] = [];
  
  let newManual;
  
  if (type === 'link' && url) {
    // Handle link type
    newManual = {
      id: Date.now().toString(),
      title: title.trim(),
      type: 'link',
      url: url.trim(),
      uploadedAt: new Date().toISOString(),
    };
  } else if (req.file) {
    // Handle file upload
    newManual = {
      id: Date.now().toString(),
      title: title.trim(),
      type: 'file',
      filename: req.file.originalname,
      url: `/uploads/equipment-manuals/${req.file.filename}`,
      uploadedAt: new Date().toISOString(),
    };
  } else {
    return res.status(400).json({ success: false, message: 'Either file or URL is required' });
  }
  
  data.equipmentManuals[id].push(newManual);
  saveData(data);
  
  res.json({ success: true, manual: newManual });
});

app.delete('/equipment/:id/manuals/:manualId', (req, res) => {
  const data = loadData();
  const { id, manualId } = req.params;
  
  if (!data.equipmentManuals || !data.equipmentManuals[id]) {
    return res.status(404).json({ success: false, message: 'Manuals not found' });
  }
  
  const manualIndex = data.equipmentManuals[id].findIndex(manual => manual.id === manualId);
  if (manualIndex === -1) {
    return res.status(404).json({ success: false, message: 'Manual not found' });
  }
  
  const manual = data.equipmentManuals[id][manualIndex];
  
  // If it's a file, delete the physical file
  if (manual.type === 'file' && manual.url) {
    const filePath = path.join(__dirname, manual.url);
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error('Error deleting manual file:', error);
    }
  }
  
  // Remove from data
  data.equipmentManuals[id].splice(manualIndex, 1);
  saveData(data);
  
  res.json({ success: true });
});

// Equipment lesson linking endpoints
app.get('/equipment/:id/lessons', (req, res) => {
  const data = loadData();
  const { id } = req.params;

  const equipment = data.equipment.find(eq => String(eq.id) === String(id));
  if (!equipment) {
    return res.status(404).json({ success: false, message: 'Equipment not found' });
  }

  let linkedLesson = null;
  if (equipment.linkedLessonId) {
    linkedLesson = data.lessons.find(lesson => String(lesson.id) === String(equipment.linkedLessonId)) || null;
  }

  res.json({ success: true, linkedLesson });
});

app.post('/equipment/:id/lessons', (req, res) => {
  const data = loadData();
  const { id } = req.params;
  const { lessonId } = req.body;

  const equipmentIndex = data.equipment.findIndex(eq => String(eq.id) === String(id));
  if (equipmentIndex === -1) {
    return res.status(404).json({ success: false, message: 'Equipment not found' });
  }

  const lesson = data.lessons.find(l => String(l.id) === String(lessonId));
  if (!lesson) {
    return res.status(404).json({ success: false, message: 'Lesson not found' });
  }
  
  // Link the lesson
  data.equipment[equipmentIndex].linkedLessonId = String(lessonId);

  if (!data.sopDocuments) {
    data.sopDocuments = [];
  }

  const hasExistingEquipmentSop = data.sopDocuments.some(
    (sop) => String(sop.equipmentId) === String(id)
  );

  let createdEquipmentSop = null;

  if (!hasExistingEquipmentSop) {
    const equipment = data.equipment[equipmentIndex];
    const lessonSops = data.sopDocuments.filter(
      (sop) =>
        String(sop.lessonId) === String(lessonId) &&
        sop.sopData &&
        typeof sop.sopData === 'object'
    );

    const selectMostRecentSop = () => {
      if (lessonSops.length === 0) return null;
      const cloned = [...lessonSops];
      cloned.sort((a, b) => {
        const getDateValue = (value) => {
          if (!value) return 0;
          const date = new Date(value);
          return Number.isNaN(date.getTime()) ? 0 : date.getTime();
        };
        const bDate =
          getDateValue(b.updatedAt) ||
          getDateValue(b.createdAt);
        const aDate =
          getDateValue(a.updatedAt) ||
          getDateValue(a.createdAt);
        return bDate - aDate;
      });
      return cloned[0];
    };

    const sourceSop = selectMostRecentSop();

    const defaultSopData = {
      schoolName: '',
      schoolLogo: '',
      title: `Safe Operating Procedures for ${equipment.name}`,
      room: equipment.location || '',
      dateOfReview: '',
      reviewedBy: '',
      nextReviewDue: '',
      equipmentName: equipment.name,
      caution: '',
      preOperationalChecks: [],
      operationalChecks: [],
      housekeeping: [],
      potentialHazards: [],
      notAllowed: [],
      selectedPpeIcons: []
    };

    const sourceSopData = sourceSop?.sopData && typeof sourceSop.sopData === 'object'
      ? sourceSop.sopData
      : null;

    const mergedSopData = {
      ...defaultSopData,
      ...(sourceSopData || {}),
      title: `Safe Operating Procedures for ${equipment.name}`,
      equipmentName: equipment.name,
      room: equipment.location || (sourceSopData?.room || ''),
      preOperationalChecks: Array.isArray(sourceSopData?.preOperationalChecks)
        ? [...sourceSopData.preOperationalChecks]
        : [],
      operationalChecks: Array.isArray(sourceSopData?.operationalChecks)
        ? [...sourceSopData.operationalChecks]
        : [],
      housekeeping: Array.isArray(sourceSopData?.housekeeping)
        ? [...sourceSopData.housekeeping]
        : [],
      potentialHazards: Array.isArray(sourceSopData?.potentialHazards)
        ? [...sourceSopData.potentialHazards]
        : [],
      notAllowed: Array.isArray(sourceSopData?.notAllowed)
        ? [...sourceSopData.notAllowed]
        : [],
      selectedPpeIcons: Array.isArray(sourceSopData?.selectedPpeIcons)
        ? [...sourceSopData.selectedPpeIcons]
        : []
    };

    const nowIso = new Date().toISOString();

    createdEquipmentSop = {
      id: `sop-${Date.now()}-${Math.round(Math.random() * 1e9)}`,
      name: mergedSopData.title || `Safe Operating Procedures for ${equipment.name}`,
      description: `SOP for ${equipment.name}`,
      lessonId: String(lessonId),
      equipmentId: String(id),
      sopData: mergedSopData,
      createdAt: nowIso,
      updatedAt: nowIso,
      type: 'builder-generated'
    };

    data.sopDocuments.push(createdEquipmentSop);
  }

  saveData(data);

  res.json({ success: true, linkedLesson: lesson, equipmentSop: createdEquipmentSop });
});

app.delete('/equipment/:id/lessons', (req, res) => {
  const data = loadData();
  const { id } = req.params;

  const equipmentIndex = data.equipment.findIndex(eq => String(eq.id) === String(id));
  if (equipmentIndex === -1) {
    return res.status(404).json({ success: false, message: 'Equipment not found' });
  }

  // Unlink the lesson
  delete data.equipment[equipmentIndex].linkedLessonId;
  saveData(data);

  res.json({ success: true, linkedLesson: null });
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

// Add endpoint for updating class due dates
app.post('/classes/:classId/due-dates', (req, res) => {
  try {
    const data = loadData();
    const { classId } = req.params;
    const { lessonDueDates } = req.body;
    
    console.log('Updating due dates for class:', classId);
    console.log('Lesson due dates:', lessonDueDates);
    
    // Find the class by either id or classCode
    const cls = data.classes.find(c => c.id === classId || c.classCode === classId);
    
    if (!cls) {
      console.log('Class not found:', classId);
      return res.status(404).json({ error: 'Class not found' });
    }
    
    // Update the lesson due dates
    cls.lessonDueDates = lessonDueDates;
    
    console.log('Updated class:', cls);
    
    // Save the data
    saveData(data);
    
    res.json({ success: true, class: cls });
  } catch (error) {
    console.error('Error updating class due dates:', error);
    res.status(500).json({ error: 'Failed to update class due dates' });
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

    // Update the student's progress with date tracking
    const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    // Process each lesson in the progress object
    Object.keys(progress).forEach(lessonName => {
      const newProgress = progress[lessonName];
      const oldProgress = student.progress?.[lessonName];
      
      // Convert to object format if it's a number
      const newProgressObj = typeof newProgress === 'number' 
        ? { progress: newProgress, competent: false }
        : newProgress;
      
      const oldProgressObj = typeof oldProgress === 'number'
        ? { progress: oldProgress, competent: false }
        : oldProgress;
      
      // Check if progress reached 100% for the first time
      if (newProgressObj.progress === 100 && 
          (!oldProgressObj || oldProgressObj.progress < 100) &&
          !newProgressObj.completionDate) {
        newProgressObj.completionDate = currentDate;
      }
      
      // Check if competency was marked for the first time
      if (newProgressObj.competent === true && 
          (!oldProgressObj || oldProgressObj.competent !== true) &&
          !newProgressObj.competencyDate) {
        newProgressObj.competencyDate = currentDate;
      }
      
      // Preserve existing dates if not being set
      if (oldProgressObj) {
        if (!newProgressObj.completionDate && oldProgressObj.completionDate) {
          newProgressObj.completionDate = oldProgressObj.completionDate;
        }
        if (!newProgressObj.competencyDate && oldProgressObj.competencyDate) {
          newProgressObj.competencyDate = oldProgressObj.competencyDate;
        }
      }
      
      progress[lessonName] = newProgressObj;
    });

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

// Add endpoint for updating staff progress
app.post('/staff/:userID/progress', (req, res) => {
  try {
    const data = loadData();
    const { userID } = req.params;
    const { progress } = req.body;

    // Find the staff member
    const staffMember = data.staff.find(s => s.userID === userID);
    if (!staffMember) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    // Update the staff member's progress with date tracking
    const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    // Process each lesson in the progress object
    Object.keys(progress).forEach(lessonName => {
      const newProgress = progress[lessonName];
      const oldProgress = staffMember.progress?.[lessonName];
      
      // Convert to object format if it's a number
      const newProgressObj = typeof newProgress === 'number' 
        ? { progress: newProgress, competent: false }
        : newProgress;
      
      const oldProgressObj = typeof oldProgress === 'number'
        ? { progress: oldProgress, competent: false }
        : oldProgress;
      
      // Check if progress reached 100% for the first time
      if (newProgressObj.progress === 100 && 
          (!oldProgressObj || oldProgressObj.progress < 100) &&
          !newProgressObj.completionDate) {
        newProgressObj.completionDate = currentDate;
      }
      
      // Check if competency was marked for the first time
      if (newProgressObj.competent === true && 
          (!oldProgressObj || oldProgressObj.competent !== true) &&
          !newProgressObj.competencyDate) {
        newProgressObj.competencyDate = currentDate;
      }
      
      // Preserve existing dates if not being set
      if (oldProgressObj) {
        if (!newProgressObj.completionDate && oldProgressObj.completionDate) {
          newProgressObj.completionDate = oldProgressObj.completionDate;
        }
        if (!newProgressObj.competencyDate && oldProgressObj.competencyDate) {
          newProgressObj.competencyDate = oldProgressObj.competencyDate;
        }
      }
      
      progress[lessonName] = newProgressObj;
    });

    // Update the staff member's progress
    staffMember.progress = progress;

    // Save the data
    saveData(data);

    res.json({ success: true, staff: staffMember });
  } catch (error) {
    console.error('Error updating staff progress:', error);
    res.status(500).json({ error: 'Failed to update staff progress' });
  }
});

// Equipment maintenance endpoints
app.get('/equipment/:id/maintenance', (req, res) => {
  const data = loadData();
  const { id } = req.params;

  const equipment = data.equipment.find(eq => String(eq.id) === String(id));
  if (!equipment) {
    return res.status(404).json({ success: false, message: 'Equipment not found' });
  }

  const maintenanceRecords = equipment.maintenanceRecords || [];
  res.json(maintenanceRecords);
});

app.post('/equipment/:id/maintenance', (req, res) => {
  const data = loadData();
  const { id } = req.params;
  const { serviceDate, workUndertaken, completedBy, nextServiceDue } = req.body;

  const equipmentIndex = data.equipment.findIndex(eq => String(eq.id) === String(id));
  if (equipmentIndex === -1) {
    return res.status(404).json({ success: false, message: 'Equipment not found' });
  }

  if (!data.equipment[equipmentIndex].maintenanceRecords) {
    data.equipment[equipmentIndex].maintenanceRecords = [];
  }

  const newMaintenanceRecord = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    serviceDate,
    workUndertaken,
    completedBy,
    nextServiceDue,
    photos: [],
    createdAt: new Date().toISOString()
  };

  data.equipment[equipmentIndex].maintenanceRecords.push(newMaintenanceRecord);
  saveData(data);

  res.json({ success: true, maintenanceRecord: newMaintenanceRecord });
});

// Add maintenance photo upload endpoint
app.post('/equipment/:id/maintenance/:recordId/photos', uploadMaintenancePhoto.array('photos', 10), (req, res) => {
  const data = loadData();
  const { id, recordId } = req.params;

  const equipmentIndex = data.equipment.findIndex(eq => String(eq.id) === String(id));
  if (equipmentIndex === -1) {
    return res.status(404).json({ success: false, message: 'Equipment not found' });
  }

  const recordIndex = data.equipment[equipmentIndex].maintenanceRecords?.findIndex(record => record.id === recordId);
  if (recordIndex === -1) {
    return res.status(404).json({ success: false, message: 'Maintenance record not found' });
  }

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, message: 'No photos uploaded' });
  }

  // Add photo paths to the maintenance record
  const photoPaths = req.files.map(file => `/uploads/maintenance-photos/${file.filename}`);
  
  if (!data.equipment[equipmentIndex].maintenanceRecords[recordIndex].photos) {
    data.equipment[equipmentIndex].maintenanceRecords[recordIndex].photos = [];
  }
  
  data.equipment[equipmentIndex].maintenanceRecords[recordIndex].photos.push(...photoPaths);
  saveData(data);

  res.json({ 
    success: true, 
    photos: photoPaths,
    maintenanceRecord: data.equipment[equipmentIndex].maintenanceRecords[recordIndex]
  });
});

app.put('/equipment/:id/maintenance/:recordId', (req, res) => {
  const data = loadData();
  const { id, recordId } = req.params;
  const { serviceDate, workUndertaken, completedBy, nextServiceDue } = req.body;

  const equipmentIndex = data.equipment.findIndex(eq => String(eq.id) === String(id));
  if (equipmentIndex === -1) {
    return res.status(404).json({ success: false, message: 'Equipment not found' });
  }

  const recordIndex = data.equipment[equipmentIndex].maintenanceRecords?.findIndex(record => record.id === recordId);
  if (recordIndex === -1) {
    return res.status(404).json({ success: false, message: 'Maintenance record not found' });
  }

  data.equipment[equipmentIndex].maintenanceRecords[recordIndex] = {
    ...data.equipment[equipmentIndex].maintenanceRecords[recordIndex],
    serviceDate,
    workUndertaken,
    completedBy,
    nextServiceDue
  };

  saveData(data);
  res.json({ success: true, maintenanceRecord: data.equipment[equipmentIndex].maintenanceRecords[recordIndex] });
});

app.delete('/equipment/:id/maintenance/:recordId', (req, res) => {
  const data = loadData();
  const { id, recordId } = req.params;

  const equipmentIndex = data.equipment.findIndex(eq => String(eq.id) === String(id));
  if (equipmentIndex === -1) {
    return res.status(404).json({ success: false, message: 'Equipment not found' });
  }

  const recordIndex = data.equipment[equipmentIndex].maintenanceRecords?.findIndex(record => record.id === recordId);
  if (recordIndex === -1) {
    return res.status(404).json({ success: false, message: 'Maintenance record not found' });
  }

  data.equipment[equipmentIndex].maintenanceRecords.splice(recordIndex, 1);
  saveData(data);

  res.json({ success: true });
});

// Equipment inspection endpoints
app.get('/equipment/:id/inspections', (req, res) => {
  const data = loadData();
  const { id } = req.params;

  const equipment = data.equipment.find(eq => String(eq.id) === String(id));
  if (!equipment) {
    return res.status(404).json({ success: false, message: 'Equipment not found' });
  }

  const inspectionRecords = equipment.inspectionRecords || [];
  res.json(inspectionRecords);
});

app.post('/equipment/:id/inspections', (req, res) => {
  const data = loadData();
  const { id } = req.params;
  const { inspectionDate, completedBy, nextInspectionDue, inspectionAreas } = req.body;

  const equipmentIndex = data.equipment.findIndex(eq => String(eq.id) === String(id));
  if (equipmentIndex === -1) {
    return res.status(404).json({ success: false, message: 'Equipment not found' });
  }

  if (!data.equipment[equipmentIndex].inspectionRecords) {
    data.equipment[equipmentIndex].inspectionRecords = [];
  }

  const newInspectionRecord = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    inspectionDate,
    completedBy,
    nextInspectionDue,
    inspectionAreas,
    createdAt: new Date().toISOString()
  };

  data.equipment[equipmentIndex].inspectionRecords.push(newInspectionRecord);
  saveData(data);

  res.json({ success: true, inspection: newInspectionRecord });
});

app.put('/equipment/:id/inspections/:recordId', (req, res) => {
  const data = loadData();
  const { id, recordId } = req.params;
  const { inspectionDate, completedBy, nextInspectionDue, inspectionAreas } = req.body;

  const equipmentIndex = data.equipment.findIndex(eq => String(eq.id) === String(id));
  if (equipmentIndex === -1) {
    return res.status(404).json({ success: false, message: 'Equipment not found' });
  }

  const recordIndex = data.equipment[equipmentIndex].inspectionRecords?.findIndex(record => record.id === recordId);
  if (recordIndex === -1) {
    return res.status(404).json({ success: false, message: 'Inspection record not found' });
  }

  data.equipment[equipmentIndex].inspectionRecords[recordIndex] = {
    ...data.equipment[equipmentIndex].inspectionRecords[recordIndex],
    inspectionDate,
    completedBy,
    nextInspectionDue,
    inspectionAreas
  };

  saveData(data);
  res.json({ success: true, inspection: data.equipment[equipmentIndex].inspectionRecords[recordIndex] });
});

app.delete('/equipment/:id/inspections/:recordId', (req, res) => {
  const data = loadData();
  const { id, recordId } = req.params;

  const equipmentIndex = data.equipment.findIndex(eq => String(eq.id) === String(id));
  if (equipmentIndex === -1) {
    return res.status(404).json({ success: false, message: 'Equipment not found' });
  }

  const recordIndex = data.equipment[equipmentIndex].inspectionRecords?.findIndex(record => record.id === recordId);
  if (recordIndex === -1) {
    return res.status(404).json({ success: false, message: 'Inspection record not found' });
  }

  data.equipment[equipmentIndex].inspectionRecords.splice(recordIndex, 1);
  saveData(data);

  res.json({ success: true });
});

// Update Student
app.put('/students/:userID', (req, res) => {
  const { userID } = req.params;
  const { name, yearLevel } = req.body;
  const data = loadData();
  const studentIndex = data.students.findIndex(s => s.userID === userID);

  if (studentIndex !== -1) {
    if (name) data.students[studentIndex].name = name;
    if (yearLevel) data.students[studentIndex].yearLevel = yearLevel;
    saveData(data);
    res.json({ success: true, message: 'Student updated successfully.' });
  } else {
    res.status(404).json({ success: false, message: 'Student not found.' });
  }
});

// Document Template Management Endpoints

// Upload document template
app.post('/document-templates/upload', uploadTemplate.single('template'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const { name, description, lessonId, templateFields } = req.body;
    const data = loadData();

    if (!data.documentTemplates) {
      data.documentTemplates = [];
    }

    const newTemplate = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: name || req.file.originalname,
      description: description || '',
      lessonId: lessonId || null,
      templateFields: templateFields ? JSON.parse(templateFields) : [],
      filePath: req.file.path,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      uploadedAt: new Date().toISOString(),
      fileSize: req.file.size
    };

    data.documentTemplates.push(newTemplate);
    saveData(data);

    res.json({ success: true, template: newTemplate });
  } catch (error) {
    console.error('Error uploading template:', error);
    res.status(500).json({ success: false, message: 'Failed to upload template' });
  }
});

// Get all document templates
app.get('/document-templates', (req, res) => {
  try {
    const data = loadData();
    const templates = data.documentTemplates || [];
    res.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch templates' });
  }
});

// Get document templates by lesson
app.get('/document-templates/lesson/:lessonId', (req, res) => {
  try {
    const { lessonId } = req.params;
    const data = loadData();
    const templates = (data.documentTemplates || []).filter(template => template.lessonId === lessonId);
    res.json(templates);
  } catch (error) {
    console.error('Error fetching lesson templates:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch lesson templates' });
  }
});

// Delete document template
app.delete('/document-templates/:templateId', (req, res) => {
  try {
    const { templateId } = req.params;
    const data = loadData();
    
    const templateIndex = data.documentTemplates.findIndex(t => t.id === templateId);
    if (templateIndex === -1) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    const template = data.documentTemplates[templateIndex];
    
    // Delete the file from disk
    if (fs.existsSync(template.filePath)) {
      fs.unlinkSync(template.filePath);
    }

    // Remove from data
    data.documentTemplates.splice(templateIndex, 1);
    saveData(data);

    res.json({ success: true, message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({ success: false, message: 'Failed to delete template' });
  }
});

// SOP Document Management Endpoints

// Upload SOP document
app.post('/sop-documents/upload', uploadSop.single('sop'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const { name, description, lessonId, sopFields } = req.body;
    const data = loadData();

    if (!data.sopDocuments) {
      data.sopDocuments = [];
    }

    const newSop = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: name || req.file.originalname,
      description: description || '',
      lessonId: lessonId || null,
      sopFields: sopFields ? JSON.parse(sopFields) : [],
      filePath: req.file.path,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      uploadedAt: new Date().toISOString(),
      fileSize: req.file.size,
      fileType: req.file.mimetype
    };

    data.sopDocuments.push(newSop);
    saveData(data);

    res.json({ success: true, sop: newSop });
  } catch (error) {
    console.error('Error uploading SOP:', error);
    res.status(500).json({ success: false, message: 'Failed to upload SOP' });
  }
});

// Get all SOP documents
app.get('/sop-documents', (req, res) => {
  try {
    const data = loadData();
    const sops = data.sopDocuments || [];
    res.json(sops);
  } catch (error) {
    console.error('Error fetching SOPs:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch SOPs' });
  }
});

// Get SOP documents by lesson
app.get('/sop-documents/lesson/:lessonId', (req, res) => {
  try {
    const { lessonId } = req.params;
    const data = loadData();
    const sops = (data.sopDocuments || []).filter(sop => sop.lessonId === lessonId);
    res.json(sops);
  } catch (error) {
    console.error('Error fetching lesson SOPs:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch lesson SOPs' });
  }
});

// Delete SOP document
app.delete('/sop-documents/:sopId', (req, res) => {
  try {
    const { sopId } = req.params;
    const data = loadData();
    
    const sopIndex = data.sopDocuments.findIndex(s => s.id === sopId);
    if (sopIndex === -1) {
      return res.status(404).json({ success: false, message: 'SOP not found' });
    }

    const sop = data.sopDocuments[sopIndex];
    
    // Delete the file from disk
    if (fs.existsSync(sop.filePath)) {
      fs.unlinkSync(sop.filePath);
    }

    // Remove from data
    data.sopDocuments.splice(sopIndex, 1);
    saveData(data);

    res.json({ success: true, message: 'SOP deleted successfully' });
  } catch (error) {
    console.error('Error deleting SOP:', error);
    res.status(500).json({ success: false, message: 'Failed to delete SOP' });
  }
});

// Download SOP document
app.get('/sop-documents/:sopId/download', (req, res) => {
  try {
    const { sopId } = req.params;
    const data = loadData();
    const sop = data.sopDocuments.find(s => s.id === sopId);
    
    if (!sop) {
      return res.status(404).json({ success: false, message: 'SOP not found' });
    }

    // Check if file exists
    if (!fs.existsSync(sop.filePath)) {
      return res.status(404).json({ success: false, message: 'SOP file not found' });
    }

    // Set response headers for file download
    res.setHeader('Content-Type', sop.fileType);
    res.setHeader('Content-Disposition', `attachment; filename="${sop.originalName}"`);
    
    // Send the file
    res.sendFile(sop.filePath);

  } catch (error) {
    console.error('Error downloading SOP:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to download SOP',
      error: error.message 
    });
  }
});

// Generate customized SOP from template
app.post('/sop-documents/:sopId/generate', async (req, res) => {
  try {
    const { sopId } = req.params;
    const { fieldValues, themeColors } = req.body;
    
    const data = loadData();
    const sop = data.sopDocuments.find(s => s.id === sopId);
    
    if (!sop) {
      return res.status(404).json({ success: false, message: 'SOP not found' });
    }

    // Check if SOP file exists
    if (!fs.existsSync(sop.filePath)) {
      return res.status(404).json({ success: false, message: 'SOP file not found' });
    }

    // If it's a PDF, just return the original file
    if (sop.fileType === 'application/pdf') {
      res.setHeader('Content-Type', sop.fileType);
      res.setHeader('Content-Disposition', `attachment; filename="${sop.originalName}"`);
      res.sendFile(sop.filePath);
      return;
    }

    // For Word documents, process with docxtemplater
    const content = fs.readFileSync(sop.filePath, 'binary');
    const zip = new PizZip(content);
    
    // Create docxtemplater instance
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    // Prepare data for template with theme colors
    const templateData = {
      ...fieldValues,
      generatedDate: new Date().toLocaleDateString(),
      generatedTime: new Date().toLocaleTimeString(),
      // Add theme color placeholders
      themePrimary: themeColors?.primary || '#4ECDC4',
      themeSecondary: themeColors?.secondary || '#45B7AA',
      themeAccent: themeColors?.accent || '#FF6B6B',
      themeBackground: themeColors?.background || '#F8F9FA',
      themeText: themeColors?.text || '#374151',
      themeBorder: themeColors?.border || '#E5E7EB',
    };

    // Render the template
    doc.render(templateData);

    // Generate the document
    const buffer = doc.getZip().generate({ type: 'nodebuffer' });

    // Set response headers for file download
    const filename = `${sop.name}_${new Date().toISOString().split('T')[0]}.docx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length);

    // Send the document
    res.send(buffer);

  } catch (error) {
    console.error('Error generating SOP from template:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate SOP from template',
      error: error.message 
    });
  }
});

// Save SOP created from SOP Builder
app.post('/sop-documents/save', (req, res) => {
  try {
    const { lessonId, sopData } = req.body;
    
    if (!lessonId || !sopData) {
      return res.status(400).json({ success: false, message: 'Lesson ID and SOP data are required' });
    }

    const data = loadData();
    
    if (!data.sopDocuments) {
      data.sopDocuments = [];
    }

    const newSop = {
      id: `sop-${Date.now()}-${Math.round(Math.random() * 1E9)}`,
      name: sopData.title || 'Safe Operating Procedures',
      description: `SOP for ${sopData.equipmentName || 'equipment'}`,
      lessonId: lessonId,
      sopData: sopData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      type: 'builder-generated'
    };

    data.sopDocuments.push(newSop);
    saveData(data);

    res.json({ success: true, sop: newSop });
  } catch (error) {
    console.error('Error saving SOP:', error);
    res.status(500).json({ success: false, message: 'Failed to save SOP' });
  }
});

// Update SOP created from SOP Builder
app.put('/sop-documents/:sopId/update', (req, res) => {
  try {
    const { sopId } = req.params;
    const { lessonId, equipmentId, sopData } = req.body;
    
    if (!sopData) {
      return res.status(400).json({ success: false, message: 'SOP data is required' });
    }

    const data = loadData();
    
    if (!data.sopDocuments) {
      return res.status(404).json({ success: false, message: 'SOP not found' });
    }

    const sopIndex = data.sopDocuments.findIndex(sop => sop.id === sopId);
    if (sopIndex === -1) {
      return res.status(404).json({ success: false, message: 'SOP not found' });
    }

    // Update the SOP data
    data.sopDocuments[sopIndex] = {
      ...data.sopDocuments[sopIndex],
      name: sopData.title || 'Safe Operating Procedures',
      description: `SOP for ${sopData.equipmentName || 'equipment'}`,
      lessonId: lessonId || data.sopDocuments[sopIndex].lessonId,
      equipmentId: equipmentId || data.sopDocuments[sopIndex].equipmentId,
      sopData: sopData,
      updatedAt: new Date().toISOString()
    };

    saveData(data);

    res.json({ success: true, sop: data.sopDocuments[sopIndex] });
  } catch (error) {
    console.error('Error updating SOP:', error);
    res.status(500).json({ success: false, message: 'Failed to update SOP' });
  }
});

// Equipment SOP Management Endpoints

// Get SOP documents for specific equipment
app.get('/equipment/:equipmentId/sops', (req, res) => {
  try {
    const { equipmentId } = req.params;
    const data = loadData();
    
    if (!data.sopDocuments) {
      return res.json([]);
    }

    // Find SOPs that are linked to this equipment
    const equipmentSops = data.sopDocuments.filter(sop => 
      sop.equipmentId === equipmentId || 
      (sop.sopData && sop.sopData.equipmentName && 
       data.equipment && data.equipment.find(eq => eq.id === equipmentId && eq.name === sop.sopData.equipmentName))
    );

    res.json(equipmentSops);
  } catch (error) {
    console.error('Error fetching equipment SOPs:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch equipment SOPs' });
  }
});

// Save SOP created from SOP Builder for equipment
app.post('/equipment/:equipmentId/sops', (req, res) => {
  try {
    const { equipmentId } = req.params;
    const { sopData, lessonId } = req.body;
    
    if (!sopData) {
      return res.status(400).json({ success: false, message: 'SOP data is required' });
    }

    const data = loadData();
    
    // Verify equipment exists
    const equipment = data.equipment.find(eq => eq.id === equipmentId);
    if (!equipment) {
      return res.status(404).json({ success: false, message: 'Equipment not found' });
    }

    if (!data.sopDocuments) {
      data.sopDocuments = [];
    }

    const newSop = {
      id: `sop-${Date.now()}-${Math.round(Math.random() * 1E9)}`,
      name: sopData.title || 'Safe Operating Procedures',
      description: `SOP for ${sopData.equipmentName || equipment.name}`,
      lessonId: lessonId || null,
      equipmentId: equipmentId,
      sopData: {
        ...sopData,
        room: equipment.location, // Automatically set room from equipment location
        equipmentName: equipment.name // Ensure equipment name is set
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      type: 'builder-generated'
    };

    data.sopDocuments.push(newSop);
    saveData(data);

    res.json({ success: true, sop: newSop });
  } catch (error) {
    console.error('Error saving equipment SOP:', error);
    res.status(500).json({ success: false, message: 'Failed to save equipment SOP' });
  }
});

// Update SOP for equipment
app.put('/equipment/:equipmentId/sops/:sopId', (req, res) => {
  try {
    const { equipmentId, sopId } = req.params;
    const { sopData, lessonId } = req.body;
    
    if (!sopData) {
      return res.status(400).json({ success: false, message: 'SOP data is required' });
    }

    const data = loadData();
    
    // Verify equipment exists
    const equipment = data.equipment.find(eq => eq.id === equipmentId);
    if (!equipment) {
      return res.status(404).json({ success: false, message: 'Equipment not found' });
    }

    if (!data.sopDocuments) {
      return res.status(404).json({ success: false, message: 'SOP not found' });
    }

    // Find SOP by ID, checking both equipmentId and lessonId cases
    let sopIndex = data.sopDocuments.findIndex(sop => sop.id === sopId && sop.equipmentId === equipmentId);
    
    // If not found with equipmentId, check if it's a lesson SOP that needs to be converted
    if (sopIndex === -1) {
      sopIndex = data.sopDocuments.findIndex(sop => sop.id === sopId);
      if (sopIndex === -1) {
        return res.status(404).json({ success: false, message: 'SOP not found' });
      }
      // Convert lesson SOP to equipment SOP by adding equipmentId
      data.sopDocuments[sopIndex].equipmentId = equipmentId;
    }

    // Update the SOP data
    data.sopDocuments[sopIndex] = {
      ...data.sopDocuments[sopIndex],
      name: sopData.title || 'Safe Operating Procedures',
      description: `SOP for ${sopData.equipmentName || equipment.name}`,
      sopData: {
        ...sopData,
        room: equipment.location, // Automatically set room from equipment location
        equipmentName: equipment.name // Ensure equipment name is set
      },
      updatedAt: new Date().toISOString()
    };

    saveData(data);

    res.json({ success: true, sop: data.sopDocuments[sopIndex] });
  } catch (error) {
    console.error('Error updating equipment SOP:', error);
    res.status(500).json({ success: false, message: 'Failed to update equipment SOP' });
  }
});

// Delete SOP for equipment
app.delete('/equipment/:equipmentId/sops/:sopId', (req, res) => {
  try {
    const { equipmentId, sopId } = req.params;
    const data = loadData();
    
    if (!data.sopDocuments) {
      return res.status(404).json({ success: false, message: 'SOP not found' });
    }

    // Find SOP by ID, checking both equipmentId and lessonId cases
    let sopIndex = data.sopDocuments.findIndex(sop => sop.id === sopId && sop.equipmentId === equipmentId);
    
    // If not found with equipmentId, check if it's a lesson SOP that needs to be converted
    if (sopIndex === -1) {
      sopIndex = data.sopDocuments.findIndex(sop => sop.id === sopId);
      if (sopIndex === -1) {
        return res.status(404).json({ success: false, message: 'SOP not found' });
      }
      // Convert lesson SOP to equipment SOP by adding equipmentId
      data.sopDocuments[sopIndex].equipmentId = equipmentId;
    }

    // Remove the SOP
    data.sopDocuments.splice(sopIndex, 1);
    saveData(data);

    res.json({ success: true, message: 'SOP deleted successfully' });
  } catch (error) {
    console.error('Error deleting equipment SOP:', error);
    res.status(500).json({ success: false, message: 'Failed to delete equipment SOP' });
  }
});

// Generate customized document from template
app.post('/document-templates/:templateId/generate', async (req, res) => {
  try {
    const { templateId } = req.params;
    const { fieldValues, equipmentIds, themeColors } = req.body;
    
    const data = loadData();
    const template = data.documentTemplates.find(t => t.id === templateId);
    
    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    // Check if template file exists
    if (!fs.existsSync(template.filePath)) {
      return res.status(404).json({ success: false, message: 'Template file not found' });
    }

    // Read the template file
    const content = fs.readFileSync(template.filePath, 'binary');
    const zip = new PizZip(content);
    
    // Create docxtemplater instance
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    // Prepare data for template with theme colors
    const templateData = {
      ...fieldValues,
      generatedDate: new Date().toLocaleDateString(),
      generatedTime: new Date().toLocaleTimeString(),
      // Add theme color placeholders
      themePrimary: themeColors?.primary || '#4ECDC4',
      themeSecondary: themeColors?.secondary || '#45B7AA',
      themeAccent: themeColors?.accent || '#FF6B6B',
      themeBackground: themeColors?.background || '#F8F9FA',
      themeText: themeColors?.text || '#374151',
      themeBorder: themeColors?.border || '#E5E7EB',
    };

    // Add equipment data if equipment IDs are provided
    if (equipmentIds && equipmentIds.length > 0) {
      const equipment = data.equipment.filter(eq => equipmentIds.includes(eq.id));
      templateData.equipment = equipment;
      templateData.equipmentCount = equipment.length;
    }

    // Render the template
    doc.render(templateData);

    // Generate the document
    const buffer = doc.getZip().generate({ type: 'nodebuffer' });

    // Set response headers for file download
    const filename = `${template.name}_${new Date().toISOString().split('T')[0]}.docx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length);

    // Send the document
    res.send(buffer);

  } catch (error) {
    console.error('Error generating document from template:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate document from template',
      error: error.message 
    });
  }
});

// Word Document Generation Endpoint
app.post('/equipment/generate-word-document', async (req, res) => {
  try {
    const { selectedRooms, documentType, customFields } = req.body;
    const data = loadData();
    
    // Filter equipment based on selected rooms
    const filteredEquipment = selectedRooms && selectedRooms.length > 0 
      ? data.equipment.filter(eq => selectedRooms.includes(eq.location))
      : data.equipment;

    // Create document content based on type
    let documentContent = [];
    
    if (documentType === 'inventory') {
      // Equipment Inventory Document
      documentContent = [
        new Paragraph({
          text: "Equipment Inventory Report",
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
          text: `Generated on: ${new Date().toLocaleDateString()}`,
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({ text: "" }), // Spacing
        
        // Custom fields section if provided
        ...(customFields && Object.keys(customFields).length > 0 ? [
          new Paragraph({
            text: "Additional Information",
            heading: HeadingLevel.HEADING_2,
          }),
          ...Object.entries(customFields).map(([key, value]) => 
            new Paragraph({
              children: [
                new TextRun({
                  text: `${key}: `,
                  bold: true,
                }),
                new TextRun({
                  text: value || 'N/A',
                }),
              ],
            })
          ),
          new Paragraph({ text: "" }), // Spacing
        ] : []),
        
        // Equipment table
        new Paragraph({
          text: "Equipment List",
          heading: HeadingLevel.HEADING_2,
        }),
        new Table({
          width: {
            size: 100,
            type: WidthType.PERCENTAGE,
          },
          rows: [
            // Header row
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ text: "Equipment ID", children: [new TextRun({ text: "Equipment ID", bold: true })] })],
                  width: { size: 20, type: WidthType.PERCENTAGE },
                }),
                new TableCell({
                  children: [new Paragraph({ text: "Name", children: [new TextRun({ text: "Name", bold: true })] })],
                  width: { size: 30, type: WidthType.PERCENTAGE },
                }),
                new TableCell({
                  children: [new Paragraph({ text: "Type", children: [new TextRun({ text: "Type", bold: true })] })],
                  width: { size: 20, type: WidthType.PERCENTAGE },
                }),
                new TableCell({
                  children: [new Paragraph({ text: "Location", children: [new TextRun({ text: "Location", bold: true })] })],
                  width: { size: 15, type: WidthType.PERCENTAGE },
                }),
                new TableCell({
                  children: [new Paragraph({ text: "Serial Number", children: [new TextRun({ text: "Serial Number", bold: true })] })],
                  width: { size: 15, type: WidthType.PERCENTAGE },
                }),
              ],
            }),
            // Data rows
            ...filteredEquipment.map(eq => 
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ text: eq.id || 'N/A' })],
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: eq.name || 'N/A' })],
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: eq.type || 'N/A' })],
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: eq.location || 'N/A' })],
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: eq.code || 'N/A' })],
                  }),
                ],
              })
            ),
          ],
        }),
      ];
    } else if (documentType === 'maintenance') {
      // Maintenance Schedule Document
      documentContent = [
        new Paragraph({
          text: "Equipment Maintenance Schedule",
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
          text: `Generated on: ${new Date().toLocaleDateString()}`,
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({ text: "" }), // Spacing
        
        // Custom fields section if provided
        ...(customFields && Object.keys(customFields).length > 0 ? [
          new Paragraph({
            text: "Maintenance Information",
            heading: HeadingLevel.HEADING_2,
          }),
          ...Object.entries(customFields).map(([key, value]) => 
            new Paragraph({
              children: [
                new TextRun({
                  text: `${key}: `,
                  bold: true,
                }),
                new TextRun({
                  text: value || 'N/A',
                }),
              ],
            })
          ),
          new Paragraph({ text: "" }), // Spacing
        ] : []),
        
        // Equipment maintenance table
        new Paragraph({
          text: "Equipment Requiring Maintenance",
          heading: HeadingLevel.HEADING_2,
        }),
        new Table({
          width: {
            size: 100,
            type: WidthType.PERCENTAGE,
          },
          rows: [
            // Header row
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ text: "Equipment Name", children: [new TextRun({ text: "Equipment Name", bold: true })] })],
                  width: { size: 40, type: WidthType.PERCENTAGE },
                }),
                new TableCell({
                  children: [new Paragraph({ text: "Type", children: [new TextRun({ text: "Type", bold: true })] })],
                  width: { size: 25, type: WidthType.PERCENTAGE },
                }),
                new TableCell({
                  children: [new Paragraph({ text: "Location", children: [new TextRun({ text: "Location", bold: true })] })],
                  width: { size: 20, type: WidthType.PERCENTAGE },
                }),
                new TableCell({
                  children: [new Paragraph({ text: "Last Maintenance", children: [new TextRun({ text: "Last Maintenance", bold: true })] })],
                  width: { size: 15, type: WidthType.PERCENTAGE },
                }),
              ],
            }),
            // Data rows
            ...filteredEquipment.map(eq => 
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ text: eq.name || 'N/A' })],
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: eq.type || 'N/A' })],
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: eq.location || 'N/A' })],
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: eq.lastMaintenanceDate || 'Not recorded' })],
                  }),
                ],
              })
            ),
          ],
        }),
      ];
    } else if (documentType === 'custom') {
      // Custom document with user-defined content
      documentContent = [
        new Paragraph({
          text: customFields.title || "Custom Equipment Report",
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
          text: `Generated on: ${new Date().toLocaleDateString()}`,
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({ text: "" }), // Spacing
        
        // Custom content
        ...(customFields.content ? [
          new Paragraph({
            text: customFields.content,
          }),
          new Paragraph({ text: "" }), // Spacing
        ] : []),
        
        // Equipment list
        new Paragraph({
          text: "Equipment Included",
          heading: HeadingLevel.HEADING_2,
        }),
        ...filteredEquipment.map(eq => 
          new Paragraph({
            children: [
              new TextRun({
                text: `${eq.name} (${eq.type}) - ${eq.location}`,
              }),
            ],
          })
        ),
      ];
    }

    // Create the document
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: documentContent,
        },
      ],
    });

    // Generate the document buffer
    const buffer = await Packer.toBuffer(doc);

    // Set response headers for file download
    const filename = `Equipment_${documentType}_${new Date().toISOString().split('T')[0]}.docx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length);

    // Send the document
    res.send(buffer);

  } catch (error) {
    console.error('Error generating Word document:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate Word document',
      error: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 