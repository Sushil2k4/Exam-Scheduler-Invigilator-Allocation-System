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
      
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            role: currentRole,
            userId,
            password
          })
        });
  
        const data = await response.json();
  
        if (!response.ok) {
          throw new Error(data.message || 'Login failed');
        }
  
        // Store token and redirect
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userRole', currentRole);
        window.location.href = '/dashboard.html';
        
      } catch (error) {
        alert(error.message);
        console.error('Login error:', error);
      }
    });
  });