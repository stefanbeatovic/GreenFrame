import { useEffect, useMemo, useState } from 'react'
import './App.css'

type Task = { id: number; title: string; category: string; time?: string; dueDate?: string; priority?: 'high'; completed: boolean }
function getDateKey(date: Date) { return date.toISOString().slice(0, 10) }
function getTaskDate(task: Task, fallback: string) { return task.dueDate ?? fallback }
const initialTasks: Task[] = [
  { id: 1, title: 'Finish data literacy assignment', category: 'Studies', time: '10:00', priority: 'high', completed: false },
  { id: 2, title: 'Pick up groceries', category: 'Shopping', time: '17:00', completed: false },
  { id: 3, title: 'Clean the kitchen', category: 'Home', completed: true },
  { id: 4, title: 'Plan next week', category: 'Projects', time: '19:30', completed: false },
]
const categories = [{ name: 'Home', count: 4, tone: 'mint' }, { name: 'Studies', count: 7, tone: 'blue' }, { name: 'Shopping', count: 3, tone: 'amber' }, { name: 'Projects', count: 5, tone: 'coral' }]
function formatDate(date: Date) { return new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }).format(date) }
function getGreeting(hour: number) { return hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening' }

function CalendarView({ tasks, currentDate, onToggle }: { tasks: Task[]; currentDate: Date; onToggle: (id: number) => void }) {
  const [monthDate, setMonthDate] = useState(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1))
  const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
  const firstWeekday = (monthStart.getDay() + 6) % 7
  const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate()
  const cells = Array.from({ length: Math.ceil((firstWeekday + daysInMonth) / 7) * 7 }, (_, index) => {
    const day = index - firstWeekday + 1
    return day > 0 && day <= daysInMonth ? new Date(monthDate.getFullYear(), monthDate.getMonth(), day) : null
  })
  const monthName = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' }).format(monthDate)

  return <section className="calendar-section"><div className="calendar-heading"><div><p className="eyebrow">Planning</p><h2>{monthName}</h2></div><div className="calendar-actions"><button className="quiet-button" onClick={() => setMonthDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1))}>Today</button><button className="calendar-arrow" aria-label="Previous month" onClick={() => setMonthDate(new Date(monthDate.getFullYear(), monthDate.getMonth() - 1, 1))}>‹</button><button className="calendar-arrow" aria-label="Next month" onClick={() => setMonthDate(new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1))}>›</button></div></div><div className="calendar-grid calendar-weekdays">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => <span key={day}>{day}</span>)}</div><div className="calendar-grid calendar-days">{cells.map((date, index) => { const dateKey = date ? getDateKey(date) : `empty-${index}`; const dayTasks = date ? tasks.filter((task) => getTaskDate(task, getDateKey(currentDate)) === dateKey) : []; const isToday = dateKey === getDateKey(currentDate); return <div className={date ? `calendar-day${isToday ? ' today' : ''}` : 'calendar-day empty'} key={dateKey}><span className="day-number">{date?.getDate()}</span><div className="day-tasks">{dayTasks.map((task) => <button className={`calendar-task ${task.category.toLowerCase()}${task.completed ? ' done' : ''}`} key={task.id} onClick={() => onToggle(task.id)} title={task.title}><span className="calendar-task-dot"></span>{task.title}</button>)}</div></div>})}</div></section>
}

function App() {
  const [now, setNow] = useState(new Date())
  const [tasks, setTasks] = useState<Task[]>(() => { const saved = localStorage.getItem('frame-tasks'); return saved ? JSON.parse(saved) : initialTasks })
  const [newTask, setNewTask] = useState('')
  const [activeView, setActiveView] = useState('Today')
  const [showCompleted] = useState(true)
  useEffect(() => { const timer = window.setInterval(() => setNow(new Date()), 1000); return () => window.clearInterval(timer) }, [])
  useEffect(() => { localStorage.setItem('frame-tasks', JSON.stringify(tasks)) }, [tasks])
  const completedCount = tasks.filter((task) => task.completed).length
  const remainingCount = tasks.length - completedCount
  const progress = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0
  const filteredTasks = useMemo(() => {
    if (activeView === 'Completed') return tasks.filter((task) => task.completed)
    if (activeView === 'Inbox') return tasks.filter((task) => task.category === 'Inbox')
    if (categories.some((category) => category.name === activeView)) return tasks.filter((task) => task.category === activeView)
    return tasks
  }, [activeView, tasks])
  const visibleTasks = activeView === 'Completed' || showCompleted ? filteredTasks : filteredTasks.filter((task) => !task.completed)
  const todayKey = getDateKey(now)
  function addTask(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); const title = newTask.trim(); if (!title) return; setTasks((current) => [...current, { id: Date.now(), title, category: 'Inbox', dueDate: todayKey, completed: false }]); setNewTask('') }
  function toggleTask(id: number) { setTasks((current) => current.map((task) => task.id === id ? { ...task, completed: !task.completed } : task)) }
  function removeTask(id: number) { setTasks((current) => current.filter((task) => task.id !== id)) }

  if (activeView === 'Calendar') return <div className="calendar-page"><header className="calendar-page-header"><div className="brand"><span className="brand-mark">F</span><span>frame</span></div><button className="add-button" onClick={() => setActiveView('Today')}>Back to today</button></header><CalendarView tasks={tasks} currentDate={now} onToggle={toggleTask} /></div>

  return (
    <div className="app-shell">
      <aside className="sidebar"><div className="brand"><span className="brand-mark">F</span><span>frame</span></div><div className="sidebar-scroll"><p className="nav-label">Workspace</p><nav className="nav-list" aria-label="Main navigation">{['Dashboard', 'Today', 'Upcoming', 'Inbox', 'Completed'].map((item) => <button className={activeView === item ? 'nav-item active' : 'nav-item'} key={item} onClick={() => setActiveView(item)}><span className="nav-icon">{item === 'Dashboard' ? '◈' : item === 'Today' ? '○' : item === 'Upcoming' ? '↗' : item === 'Inbox' ? '⌁' : '✓'}</span>{item}{item === 'Today' && <span className="nav-count">{remainingCount}</span>}</button>)}</nav><p className="nav-label list-heading">Lists <button className="tiny-button" aria-label="Add a list">+</button></p><nav className="nav-list">{categories.map((category) => <button className="nav-item" key={category.name} onClick={() => setActiveView(category.name)}><span className={`list-dot ${category.tone}`}></span>{category.name}<span className="nav-count">{category.count}</span></button>)}</nav><p className="nav-label list-heading">Planning</p><nav className="nav-list"><button className="nav-item" onClick={() => setActiveView('Calendar')}><span className="nav-icon">□</span>Calendar</button><button className="nav-item" onClick={() => setActiveView('Weekly')}><span className="nav-icon">≡</span>Weekly review</button></nav></div><div className="sidebar-footer"><button className="nav-item"><span className="nav-icon">⚙</span>Settings</button><div className="profile"><span className="avatar">S</span><span><strong>Stefan</strong><small>Personal workspace</small></span><span className="more">•••</span></div></div></aside>
      <main className="main-content"><header className="topbar"><div className="mobile-brand"><span className="brand-mark">F</span>frame</div><div className="breadcrumbs">Workspace <span>/</span> {activeView}</div><div className="top-actions"><button className="icon-button" aria-label="Search">⌕</button><button className="icon-button" aria-label="Notifications">♢<span className="notification-dot"></span></button><button className="add-button" onClick={() => document.getElementById('quick-add')?.focus()}><span>+</span> Add task</button></div></header><div className="content-wrap"><section className="welcome-row"><div><p className="eyebrow">{formatDate(now)}</p><h1>{getGreeting(now.getHours())}, Stefan<span className="accent-dot">.</span></h1><p className="subheading">A clear space for everything on your mind.</p></div><div className="clock"><strong>{now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</strong><span>Week {getWeekNumber(now)} · {now.getFullYear()}</span></div></section><section className="overview-grid"><div className="focus-panel"><div className="panel-heading"><div><p className="eyebrow">Your focus</p><h2>{activeView === 'Completed' ? 'Completed tasks' : activeView}</h2></div><button className="quiet-button">{activeView === 'Today' ? 'View all ↗' : 'Clear view'}</button></div><div className="progress-row"><div className="progress-ring" style={{ '--progress': `${progress * 3.6}deg` } as React.CSSProperties}><span>{progress}<small>%</small></span></div><div><strong>{remainingCount} tasks remaining</strong><p>{completedCount} completed today. Keep the momentum going.</p></div></div><div className="progress-bar"><span style={{ width: `${progress}%` }}></span></div></div><div className="stats-panel"><p className="eyebrow">This week</p><div className="stat-number">12<span> tasks done</span></div><div className="mini-bars"><i style={{ height: '35%' }}></i><i style={{ height: '58%' }}></i><i style={{ height: '45%' }}></i><i className="today-bar" style={{ height: '78%' }}></i><i style={{ height: '28%' }}></i><i style={{ height: '52%' }}></i><i style={{ height: '18%' }}></i></div><div className="week-labels"><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span></div></div></section><section className="task-section"><div className="section-title"><div><p className="eyebrow">{activeView === 'Completed' ? 'History' : 'The day ahead'}</p><h2>{activeView === 'Completed' ? 'Completed' : activeView === 'Today' ? 'My tasks' : `${activeView} tasks`} <span className="task-count">{visibleTasks.length}</span></h2></div><div className="view-switcher"><button className="selected" aria-label="List view">≡</button><button aria-label="Grid view">⊞</button><button aria-label="Calendar view">□</button></div></div><form className="quick-add" onSubmit={addTask}><span className="plus-circle">+</span><input id="quick-add" value={newTask} onChange={(event) => setNewTask(event.target.value)} placeholder="Add a task to your day..." aria-label="New task title" /><button type="submit">Add task <span>↵</span></button></form><div className="task-list">{visibleTasks.map((task) => <article className={task.completed ? 'task-card completed' : 'task-card'} key={task.id}><button className="check-button" aria-label={task.completed ? `Mark ${task.title} incomplete` : `Complete ${task.title}`} onClick={() => toggleTask(task.id)}>{task.completed ? '✓' : ''}</button><div className="task-copy"><strong>{task.title}</strong><div className="task-meta"><span className={`category-pill ${task.category.toLowerCase()}`}>{task.category}</span>{task.time && <span className="task-time">◷ {task.time}</span>}{task.priority && <span className="priority">High priority</span>}</div></div><button className="task-menu" aria-label={`Delete ${task.title}`} onClick={() => removeTask(task.id)}>×</button></article>)}{visibleTasks.length === 0 && <div className="empty-state">Nothing here yet. Add a task above to get started.</div>}</div></section><section className="lists-section"><div className="section-title"><div><p className="eyebrow">Organise your life</p><h2>Your lists</h2></div><button className="quiet-button">Manage lists ↗</button></div><div className="category-grid">{categories.map((category) => <button className="category-card" key={category.name} onClick={() => setActiveView(category.name)}><span className={`category-icon ${category.tone}`}>{category.name === 'Home' ? '⌂' : category.name === 'Studies' ? '✦' : category.name === 'Shopping' ? '□' : '↗'}</span><span><strong>{category.name}</strong><small>{category.count} open tasks</small></span><span className="arrow">↗</span></button>)}</div></section></div></main>
    </div>
  )
}

function getWeekNumber(date: Date) { const firstDay = new Date(date.getFullYear(), 0, 1); return Math.ceil((((date.getTime() - firstDay.getTime()) / 86400000) + firstDay.getDay() + 1) / 7) }

export default App
