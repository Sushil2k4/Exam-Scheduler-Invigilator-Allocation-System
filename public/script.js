document.addEventListener('DOMContentLoaded', async () => {
  const studentList = document.getElementById('studentList');
  
  try {
    const response = await fetch('/api/students');
    
    if (!response.ok) {
      throw new Error(`Server returned ${response.status} status`);
    }
    
    const students = await response.json();
    
    if (students.length === 0) {
      studentList.innerHTML = '<li class="empty">No student records found</li>';
      return;
    }
    
    studentList.className = '';
    studentList.innerHTML = students.map(student => `
      <li class="student-card">
        <div class="student-id">${student.student_id}</div>
        <div class="student-name">${student.name}</div>
        <div class="student-details">
          <span>${student.department} (Year ${student.year}, Sem ${student.semester})</span>
          <span>${student.email}</span>
          <span>${student.phone}</span>
        </div>
      </li>
    `).join('');
    
  } catch (error) {
    console.error('Fetch error:', error);
    studentList.className = 'error';
    studentList.innerHTML = `
      <li class="error-message">
        <div>⚠️ Failed to load student data</div>
        <div class="error-detail">${error.message}</div>
        <button onclick="window.location.reload()">Retry</button>
      </li>
    `;
  }
});