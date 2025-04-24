document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const studentIdInput = document.getElementById('studentIdInput');
    const searchBtn = document.getElementById('searchBtn');
    const resultsContainer = document.getElementById('resultsContainer');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const errorContainer = document.getElementById('errorContainer');
    const errorMessage = document.getElementById('errorMessage');
    const examTableBody = document.querySelector('#examTable tbody');
    const displayStudentId = document.getElementById('displayStudentId');
    const displayDepartment = document.getElementById('displayDepartment');
    const examCount = document.getElementById('examCount');
  
    // Check authentication
    const token = localStorage.getItem('authToken');
    if (!token) {
      window.location.href = '/';
      return;
    }
  
    // Logout handler
    document.getElementById('logoutBtn').addEventListener('click', () => {
      localStorage.removeItem('authToken');
      window.location.href = '/';
    });
  
    // Search handler
    searchBtn.addEventListener('click', handleSearch);
    studentIdInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleSearch();
    });
  
    async function handleSearch() {
      const studentId = studentIdInput.value.trim().toUpperCase();
      
      // Validate input
      if (!studentId) {
        showError('Please enter your registration number');
        return;
      }
      
      if (!/^RA\d{12}$/.test(studentId)) {
        showError('Invalid registration number format. Example: RA2311003010383');
        return;
      }
  
      try {
        // Show loading state
        resultsContainer.classList.add('hidden');
        errorContainer.classList.add('hidden');
        loadingIndicator.classList.remove('hidden');
        
        // Fetch exam data
        const response = await fetch(`/api/students/${studentId}/exams`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
  
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch exam schedule');
        }
  
        if (data.exams.length === 0) {
          throw new Error('No exams found for this registration number');
        }
  
        // Display results
        displayResults(data);
      } catch (error) {
        showError(error.message);
        console.error('Error:', error);
      } finally {
        loadingIndicator.classList.add('hidden');
      }
    }
  
    function displayResults(data) {
      // Update student info
      displayStudentId.textContent = data.student_id;
      displayDepartment.textContent = data.department || 'Not specified';
      examCount.textContent = data.exams.length;
      
      // Populate exam table
      examTableBody.innerHTML = data.exams.map(exam => `
        <tr>
          <td>${exam.subject}</td>
          <td>${exam.formatted_date}</td>
          <td>${exam.time_slot}</td>
          <td>${exam.location}</td>
          <td>${exam.invigilator || 'Not assigned'}</td>
        </tr>
      `).join('');
      
      // Show results
      resultsContainer.classList.remove('hidden');
    }
  
    function showError(message) {
      errorMessage.textContent = message;
      errorContainer.classList.remove('hidden');
    }
  });