const apiUrl = "https://task-project-2.onrender.com"; // Backend URL
let allTasks = []; // Store all tasks for filtering

// Fetch Tasks
async function fetchTasks() {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Please log in first');
    window.location.href = 'signin.html';
    return;
  }

  try {
    const response = await fetch(`${apiUrl}/tasks`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const tasks = await response.json();
    if (response.ok) {
      allTasks = tasks; // Store tasks for filtering
      displayTasks(tasks);
    } else {
      alert(tasks.error || 'Failed to fetch tasks.');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Display Tasks
function displayTasks(tasks) {
  const tasksList = document.getElementById('tasks-list');
  tasksList.innerHTML = '';
  if (tasks.length === 0) {
    tasksList.innerHTML = '<p>No tasks found.</p>';
    return;
  }
  tasks.forEach(task => {
    const taskElement = document.createElement('div');
    taskElement.className = 'task-item';
    taskElement.innerHTML = `
      <h3>${task.title} (${task.priority})</h3>
      <p>${task.description || 'No description'}</p>
      <p>Deadline: ${new Date(task.deadline).toLocaleDateString()}</p>
      <button onclick="editTask('${task._id}')">Edit</button>
      <button onclick="deleteTask('${task._id}')">Delete</button>
    `;
    tasksList.appendChild(taskElement);
  });
}

// Add or Edit Task
document.querySelector('#add-task-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const taskId = e.target['task-id'].value; // Hidden field for task ID
  const title = e.target.title.value;
  const description = e.target.description.value;
  const priority = e.target.priority.value;
  const deadline = e.target.deadline.value;

  const token = localStorage.getItem('token');
  const method = taskId ? 'PUT' : 'POST';
  const url = taskId ? `${apiUrl}/tasks/${taskId}` : `${apiUrl}/tasks`;

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, description, priority, deadline }),
    });
    const task = await response.json();
    if (response.ok) {
      alert(`Task ${taskId ? 'updated' : 'added'} successfully`);
      e.target.reset(); // Clear form
      fetchTasks();
    } else {
      alert(task.error || `Failed to ${taskId ? 'update' : 'add'} task.`);
    }
  } catch (error) {
    console.error('Error:', error);
  }
});

// Edit Task
function editTask(taskId) {
  const task = allTasks.find(t => t._id === taskId);
  if (!task) return;

  document.getElementById('task-id').value = task._id;
  document.getElementById('title').value = task.title;
  document.getElementById('description').value = task.description;
  document.getElementById('priority').value = task.priority;
  document.getElementById('deadline').value = new Date(task.deadline).toISOString().split('T')[0];
}

// Filter Tasks
function filterTasks() {
  const filterValue = document.getElementById('filter-priority').value;
  const filteredTasks = filterValue ? allTasks.filter(t => t.priority === filterValue) : allTasks;
  displayTasks(filteredTasks);
}

// Delete Task
async function deleteTask(taskId) {
  const token = localStorage.getItem('token');
  try {
    const response = await fetch(`${apiUrl}/tasks/${taskId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.ok) {
      alert('Task deleted successfully');
      fetchTasks();
    } else {
      alert('Failed to delete task.');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Logout
function logout() {
  localStorage.removeItem('token');
  window.location.href = 'signin.html';
}

// Initialize
if (document.body.contains(document.getElementById('tasks-list'))) {
  fetchTasks();
}

// Sign In
document.querySelector('#signin-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = e.target.username.value;
  const password = e.target.password.value;

  try {
    const response = await fetch(`${apiUrl}/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json();
    if (response.ok) {
      alert('Login successful');
      localStorage.setItem('token', data.token);
      window.location.href = 'tasks.html';
    } else {
      alert(data.error || 'Login failed.');
    }
  } catch (error) {
    console.error('Error:', error);
  }
});

// Sign Up
document.querySelector('#signup-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = e.target.username.value;
  const password = e.target.password.value;

  try {
    const response = await fetch(`${apiUrl}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json();
    if (response.ok) {
      alert(data.message);
      window.location.href = 'signin.html';
    } else {
      alert(data.error || 'Failed to register.');
    }
  } catch (error) {
    console.error('Error:', error);
  }
});
