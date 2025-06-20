const handleStudentSelection = async (classId, studentIds) => {
  try {
    const response = await fetch(`/classes/${classId}/students`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ studentIds }),
    });

    if (!response.ok) {
      throw new Error('Failed to save student selections');
    }

    const result = await response.json();
    
    // Update the local state with the saved data
    setClasses(prevClasses => 
      prevClasses.map(cls => 
        cls.id === classId
          ? { ...cls, studentIds: result.class.studentIds }
          : cls
      )
    );
  } catch (error) {
    console.error('Error saving student selections:', error);
    alert('Failed to save student selections. Please try again.');
  }
}; 