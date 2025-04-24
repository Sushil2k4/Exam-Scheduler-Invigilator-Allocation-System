document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.tab');
    const loginForm = document.getElementById('loginForm');
    let currentRole = 'student';
  
    // Tab switching
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentRole = tab.dataset.tab;
      });
    });
  
    // Login form submission
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const userId = document.getElementById('userId').value;
      const password = document.getElementById('password').value;
      
      if (!userId || !password) {
        showError('Please enter both ID and password');
        return;
      }

      try {
        let endpoint = '';
        let requestBody = {};

        switch (currentRole) {
          case 'student':
            endpoint = '/api/auth/student/login';
            requestBody = { studentId: userId, password };
            break;
          case 'teacher':
            endpoint = '/api/auth/teacher/login';
            requestBody = { facultyId: userId, password };
            break;
          case 'admin':
            endpoint = '/api/auth/admin/login';
            requestBody = { username: userId, password };
            break;
          default:
            throw new Error('Invalid role selected');
        }

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody)
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Login failed');
        }

        // Store token and user info
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userRole', data.user.role);
        localStorage.setItem('userName', data.user.name);

        // Redirect to dashboard
        window.location.href = '/dashboard.html';
      } catch (error) {
        showError(error.message);
      }
    });
});

function showError(message) {
    // Create error message element if it doesn't exist
    let errorElement = document.querySelector('.error-message');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        document.querySelector('.auth-form').prepend(errorElement);
    }

    // Set error message and show it
    errorElement.textContent = message;
    errorElement.style.display = 'block';

    // Hide error message after 3 seconds
    setTimeout(() => {
        errorElement.style.display = 'none';
    }, 3000);
}