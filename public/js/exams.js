    document.addEventListener('DOMContentLoaded', async () => {
        const examTable = document.getElementById('examTable').querySelector('tbody');
        const departmentFilter = document.getElementById('departmentFilter');
        const dateFilter = document.getElementById('dateFilter');
        const applyFilters = document.getElementById('applyFilters');
        const addExamBtn = document.getElementById('addExamBtn');
    
        // Load exams on page load
        await loadExams();
    
        // Event listeners
        applyFilters.addEventListener('click', loadExams);
        addExamBtn.addEventListener('click', () => {
        window.location.href = '/add-exam.html';
        });
    
        async function loadExams() {
        try {
            examTable.className = 'loading';
            examTable.innerHTML = '<tr><td colspan="6">Loading exams...</td></tr>';
    
            const params = new URLSearchParams();
            if (departmentFilter.value) params.append('department', departmentFilter.value);
            if (dateFilter.value) params.append('date', dateFilter.value);
    
            const response = await fetch(`/api/exams?${params.toString()}`);
            
            if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch exams');
            }
            
            const exams = await response.json();
            
            if (exams.length === 0) {
            examTable.innerHTML = '<tr><td colspan="6">No exams found</td></tr>';
            return;
            }
            
            examTable.className = '';
            examTable.innerHTML = exams.map(exam => `
            <tr>
                <td>${exam.subject}</td>
                <td>${exam.date}</td>
                <td>${exam.time}</td>
                <td>${exam.location}</td>
                <td>${exam.department}</td>
                <td>${exam.semester}</td>
            </tr>
            `).join('');
            
        } catch (error) {
            console.error('Exam load error:', error);
            examTable.className = 'error';
            examTable.innerHTML = `
            <tr>
                <td colspan="6">
                <div class="error-message">⚠️ ${error.message}</div>
                <button class="retry-btn" onclick="window.location.reload()">Retry</button>
                </td>
            </tr>
            `;
        }
        }
    });