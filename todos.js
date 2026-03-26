// ============ TODO LIST ============

let todos = JSON.parse(localStorage.getItem('todos') || '[]');
let filter = 'all';
let activeTagFilter = null;
let draggedItemId = null;
let expandedSubtasks = new Set();

function saveTodos() {
  localStorage.setItem('todos', JSON.stringify(todos));
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ---- Tags ----
function getAllTags() {
  const tags = new Set();
  todos.forEach(t => { if (t.tag) tags.add(t.tag); });
  return [...tags].sort();
}

function setTagFilter(tag) {
  activeTagFilter = activeTagFilter === tag ? null : tag;
  renderTagFilters();
  renderTodos();
}

function renderTagFilters() {
  const bar = document.getElementById('tagFilterBar');
  const tags = getAllTags();
  if (tags.length === 0) { bar.innerHTML = ''; return; }
  bar.innerHTML = tags.map(tag =>
    `<button class="tag-filter-pill ${activeTagFilter === tag ? 'active' : ''}" onclick="setTagFilter('${escapeHtml(tag)}')">${escapeHtml(tag)}</button>`
  ).join('');
}

// ---- Add Todo ----
function addTodo() {
  const input = document.getElementById('todoInput');
  const text = input.value.trim();
  if (!text) return;

  const priority = document.getElementById('todoPriority').value;
  const dueDate = document.getElementById('todoDueDate').value;
  const tag = document.getElementById('todoTag').value.trim();

  todos.push({
    id: Date.now(),
    text,
    completed: false,
    priority: priority || 'none',
    dueDate: dueDate || null,
    tag: tag || null,
    subtasks: [],
    pomodoros: 0
  });

  input.value = '';
  document.getElementById('todoPriority').value = 'none';
  document.getElementById('todoDueDate').value = '';
  document.getElementById('todoTag').value = '';

  saveTodos();
  renderTagFilters();
  renderTodos();
}

// ---- Toggle / Delete ----
function toggleTodo(id) {
  const todo = todos.find(t => t.id === id);
  if (todo) todo.completed = !todo.completed;
  saveTodos();
  renderTodos();
}

function deleteTodo(id) {
  todos = todos.filter(t => t.id !== id);
  if (linkedTaskId === id) linkedTaskId = null;
  saveTodos();
  renderTagFilters();
  renderTodos();
}

function clearCompleted() {
  const completedIds = todos.filter(t => t.completed).map(t => t.id);
  if (completedIds.includes(linkedTaskId)) linkedTaskId = null;
  todos = todos.filter(t => !t.completed);
  saveTodos();
  renderTagFilters();
  renderTodos();
}

// ---- Filters ----
function setFilter(f, btn) {
  filter = f;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderTodos();
}

// ---- Subtasks ----
function toggleSubtaskSection(todoId) {
  if (expandedSubtasks.has(todoId)) expandedSubtasks.delete(todoId);
  else expandedSubtasks.add(todoId);
  renderTodos();
}

function addSubtask(todoId) {
  const input = document.getElementById(`subtask-input-${todoId}`);
  const text = input.value.trim();
  if (!text) return;

  const todo = todos.find(t => t.id === todoId);
  if (!todo) return;
  if (!todo.subtasks) todo.subtasks = [];
  todo.subtasks.push({ id: Date.now(), text, completed: false });
  input.value = '';
  saveTodos();
  renderTodos();
}

function toggleSubtask(todoId, subtaskId) {
  const todo = todos.find(t => t.id === todoId);
  if (!todo) return;
  const sub = todo.subtasks.find(s => s.id === subtaskId);
  if (sub) sub.completed = !sub.completed;
  saveTodos();
  renderTodos();
}

function deleteSubtask(todoId, subtaskId) {
  const todo = todos.find(t => t.id === todoId);
  if (!todo) return;
  todo.subtasks = todo.subtasks.filter(s => s.id !== subtaskId);
  saveTodos();
  renderTodos();
}

// ---- Drag and Drop ----
function handleDragStart(e, id) {
  draggedItemId = id;
  e.target.closest('.todo-item').classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
}

function handleDragEnd(e) {
  draggedItemId = null;
  document.querySelectorAll('.todo-item').forEach(el => {
    el.classList.remove('dragging', 'drag-over');
  });
}

function handleDragOver(e, id) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  if (draggedItemId === id) return;
  const item = e.target.closest('.todo-item');
  if (item) {
    document.querySelectorAll('.todo-item').forEach(el => el.classList.remove('drag-over'));
    item.classList.add('drag-over');
  }
}

function handleDrop(e, targetId) {
  e.preventDefault();
  if (!draggedItemId || draggedItemId === targetId) return;

  const fromIdx = todos.findIndex(t => t.id === draggedItemId);
  const toIdx = todos.findIndex(t => t.id === targetId);
  if (fromIdx === -1 || toIdx === -1) return;

  const [moved] = todos.splice(fromIdx, 1);
  todos.splice(toIdx, 0, moved);

  draggedItemId = null;
  saveTodos();
  renderTodos();
}

// ---- Due Date Helpers ----
function getDueClass(dateStr) {
  if (!dateStr) return '';
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const due = new Date(dateStr + 'T00:00:00');
  const diffDays = Math.floor((due - now) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'overdue';
  if (diffDays <= 1) return 'due-soon';
  return '';
}

function formatDueDate(dateStr) {
  if (!dateStr) return '';
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const due = new Date(dateStr + 'T00:00:00');
  const diffDays = Math.floor((due - now) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`;
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays <= 7) return `${diffDays}d left`;
  return due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ---- Render ----
function renderTodos() {
  const list = document.getElementById('todoList');
  const stats = document.getElementById('todoStats');
  const count = document.getElementById('todoCount');

  let filtered = todos;
  if (filter === 'active') filtered = todos.filter(t => !t.completed);
  if (filter === 'completed') filtered = todos.filter(t => t.completed);
  if (activeTagFilter) filtered = filtered.filter(t => t.tag === activeTagFilter);

  if (filtered.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M9 11l3 3L22 4"/>
          <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
        </svg>
        <p>${filter === 'completed' ? 'No completed tasks yet' : filter === 'active' ? 'All tasks done!' : activeTagFilter ? 'No tasks with this tag' : 'Add your first task'}</p>
      </div>`;
  } else {
    list.innerHTML = filtered.map(todo => renderTodoItem(todo)).join('');
  }

  const active = todos.filter(t => !t.completed).length;
  const completed = todos.filter(t => t.completed).length;
  const totalPomos = todos.reduce((sum, t) => sum + (t.pomodoros || 0), 0);

  if (todos.length > 0) {
    stats.style.display = 'flex';
    count.textContent = `${active} remaining · ${completed} done` + (totalPomos > 0 ? ` · ${totalPomos} pomo` : '');
  } else {
    stats.style.display = 'none';
  }
}

function renderTodoItem(todo) {
  const priorityClass = todo.priority && todo.priority !== 'none' ? `priority-${todo.priority}` : '';
  const isLinked = linkedTaskId === todo.id;
  const subtasks = todo.subtasks || [];
  const isExpanded = expandedSubtasks.has(todo.id);
  const completedSubs = subtasks.filter(s => s.completed).length;
  const hasMeta = todo.tag || todo.dueDate || (todo.pomodoros > 0);

  let priorityBadge = '';
  if (todo.priority && todo.priority !== 'none') {
    priorityBadge = `<span class="priority-badge ${todo.priority}">${todo.priority}</span>`;
  }

  let pomoBadge = '';
  if (todo.pomodoros > 0) {
    pomoBadge = `<span class="pomo-count"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>${todo.pomodoros}</span>`;
  }

  let metaHtml = '';
  if (hasMeta || subtasks.length > 0) {
    let parts = [];
    if (todo.tag) parts.push(`<span class="todo-tag">${escapeHtml(todo.tag)}</span>`);
    if (todo.dueDate) {
      const cls = getDueClass(todo.dueDate);
      parts.push(`<span class="todo-due ${cls}">&#x1F4C5; ${formatDueDate(todo.dueDate)}</span>`);
    }
    if (pomoBadge) parts.push(pomoBadge);
    if (parts.length > 0) metaHtml = `<div class="todo-meta">${parts.join('')}</div>`;
  }

  let subtaskHtml = '';
  if (subtasks.length > 0 || isExpanded) {
    const toggleLabel = subtasks.length > 0
      ? `${completedSubs}/${subtasks.length} subtasks`
      : 'Add subtasks';
    const progressPct = subtasks.length > 0 ? (completedSubs / subtasks.length * 100) : 0;

    subtaskHtml = `<div class="subtask-section">
      <button class="subtask-toggle" onclick="event.stopPropagation(); toggleSubtaskSection(${todo.id})">
        <span class="arrow ${isExpanded ? 'open' : ''}">&#x25B6;</span> ${toggleLabel}
      </button>`;

    if (subtasks.length > 0) {
      subtaskHtml += `<div class="subtask-progress"><div class="subtask-progress-fill" style="width:${progressPct}%"></div></div>`;
    }

    if (isExpanded) {
      subtaskHtml += `<ul class="subtask-list">`;
      subtaskHtml += subtasks.map(sub => `
        <li class="subtask-item ${sub.completed ? 'completed' : ''}">
          <input type="checkbox" class="subtask-checkbox" ${sub.completed ? 'checked' : ''} onchange="event.stopPropagation(); toggleSubtask(${todo.id}, ${sub.id})">
          <span class="subtask-text">${escapeHtml(sub.text)}</span>
          <button class="subtask-delete" onclick="event.stopPropagation(); deleteSubtask(${todo.id}, ${sub.id})">&#x2715;</button>
        </li>
      `).join('');
      subtaskHtml += `</ul>
        <div class="subtask-add-row">
          <input type="text" class="subtask-input" id="subtask-input-${todo.id}" placeholder="Add subtask..." onkeydown="if(event.key==='Enter'){event.stopPropagation(); addSubtask(${todo.id})}">
          <button class="subtask-add-btn" onclick="event.stopPropagation(); addSubtask(${todo.id})">+</button>
        </div>`;
    }
    subtaskHtml += `</div>`;
  }

  return `<li class="todo-item ${todo.completed ? 'completed' : ''} ${priorityClass}"
      draggable="true"
      ondragstart="handleDragStart(event, ${todo.id})"
      ondragend="handleDragEnd(event)"
      ondragover="handleDragOver(event, ${todo.id})"
      ondrop="handleDrop(event, ${todo.id})">
    <span class="todo-drag-handle">&#x2801;&#x2801;</span>
    <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''} onchange="toggleTodo(${todo.id})">
    <div class="todo-content">
      <div class="todo-main-row">
        <span class="todo-text">${escapeHtml(todo.text)}</span>
        ${priorityBadge}
      </div>
      ${metaHtml}
      ${subtaskHtml}
    </div>
    <div class="todo-actions">
      <button class="todo-action-btn ${isLinked ? 'link-active' : ''}" onclick="linkTaskToTimer(${todo.id})" title="${isLinked ? 'Unlink from timer' : 'Link to timer'}">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
      </button>
      <button class="todo-action-btn" onclick="toggleSubtaskSection(${todo.id})" title="Subtasks">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
      </button>
      <button class="todo-action-btn delete-btn" onclick="deleteTodo(${todo.id})" title="Delete">&#x2715;</button>
    </div>
  </li>`;
}
