document.addEventListener('DOMContentLoaded', async () => {
    const tableBody = document.querySelector('#allocationsTable tbody');
    const facultyFilter = document.getElementById('facultyFilter');
    const examFilter = document.getElementById('examFilter');
    const applyFilters = document.getElementById('applyFilters');
  
    // Load initial data
    await loadAllocations();
    await loadFilters();
  
    // Event listeners
    applyFilters.addEventListener('click', loadAllocations);
  
    async function loadAllocations() {
      try {
        tableBody.className = 'loading';
        tableBody.innerHTML = '<tr><td colspan="5">Loading allocations...</td></tr>';
  
        const params = new URLSearchParams();
        if (facultyFilter.value) params.append('faculty', facultyFilter.value);
        if (examFilter.value) params.append('exam', examFilter.value);
  
        const response = await fetch(`/api/allocations?${params.toString()}`);
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const allocations = await response.json();
        
        if (allocations.length === 0) {
          tableBody.innerHTML = '<tr><td colspan="5">No allocations found</td></tr>';
          return;
        }
        
        tableBody.className = '';
        tableBody.innerHTML = allocations.map(allocation => `
          <tr>
            <td>${allocation.subject}</td>
            <td>${allocation.date}</td>
            <td>${allocation.faculty_name}</td>
            <td>${allocation.room_no || 'Not assigned'}</td>
            <td>
              <button class="edit-btn">Edit</button>
              <button class="delete-btn">Delete</button>
            </td>
          </tr>
        `).join('');
        
      } catch (error) {
        console.error('Error:', error);
        tableBody.className = 'error';
        tableBody.innerHTML = `
          <tr><td colspan="5">Failed to load allocations</td></tr>
          <tr><td colspan="5"><button onclick="window.location.reload()">Retry</button></td></tr>
        `;
      }
    }
  
    async function loadFilters() {
      try {
        // Load faculty options
        const facultyRes = await fetch('/api/faculty');
        const faculty = await facultyRes.json();
        facultyFilter.innerHTML = `
          <option value="">All Faculty</option>
          ${faculty.map(f => `<option value="${f.faculty_id}">${f.name}</option>`).join('')}
        `;
  
        // Load exam options
        const examRes = await fetch('/api/exams');
        const exams = await examRes.json();
        examFilter.innerHTML = `
          <option value="">All Exams</option>
          ${exams.map(e => `<option value="${e.exam_id}">${e.subject}</option>`).join('')}
        `;
      } catch (error) {
        console.error('Failed to load filters:', error);
      }
    }
  });