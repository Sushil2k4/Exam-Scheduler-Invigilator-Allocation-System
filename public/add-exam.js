document.addEventListener('DOMContentLoaded', () => {
    const examForm = document.getElementById('examForm');
    const cancelBtn = document.getElementById('cancelBtn');
  
    cancelBtn.addEventListener('click', () => {
      window.location.href = '/exams.html';
    });
  
    examForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const exam = {
        subject: document.getElementById('subject').value,
        date: document.getElementById('date').value,
        start_time: document.getElementById('startTime').value,
        end_time: document.getElementById('endTime').value,
        department: document.getElementById('department').value,
        semester: parseInt(document.getElementById('semester').value)
      };
  
      try {
        const response = await fetch('/api/exams', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(exam)
        });
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        alert('Exam created successfully!');
        window.location.href = '/exams.html';
      } catch (error) {
        console.error('Error:', error);
        alert('Failed to create exam. Please try again.');
      }
    });
  });