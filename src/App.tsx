import { useEffect, useMemo, useState } from "react";
import "./App.css";

type Task = {
  id: number;
  title: string;
  category: string;
  time?: string;
  dueDate?: string;
  priority?: "high";
  completed: boolean;
};
type List = { name: string; tone: string; color: string; description?: string };
type Profile = { name: string; email: string };
function getDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}
function getTaskDate(task: Task, fallback: string) {
  return task.dueDate ?? fallback;
}
function loadTasks() {
  try {
    const saved = localStorage.getItem("frame-tasks");
    return saved ? (JSON.parse(saved) as Task[]) : initialTasks;
  } catch {
    localStorage.removeItem("frame-tasks");
    return initialTasks;
  }
}
const initialTasks: Task[] = [
  {
    id: 1,
    title: "Finish data literacy assignment",
    category: "Studies",
    time: "10:00",
    priority: "high",
    completed: false,
  },
  {
    id: 2,
    title: "Pick up groceries",
    category: "Shopping",
    time: "17:00",
    completed: false,
  },
  { id: 3, title: "Clean the kitchen", category: "Home", completed: true },
  {
    id: 4,
    title: "Plan next week",
    category: "Projects",
    time: "19:30",
    completed: false,
  },
];
const defaultLists: List[] = [
  {
    name: "Home",
    tone: "mint",
    color: "#9bf3b0",
    description: "Home, chores, and everyday life.",
  },
  {
    name: "Studies",
    tone: "blue",
    color: "#87c7f2",
    description: "Learning and study work.",
  },
  {
    name: "Shopping",
    tone: "amber",
    color: "#f6c879",
    description: "Things to buy and errands.",
  },
  {
    name: "Projects",
    tone: "coral",
    color: "#f19b8b",
    description: "Longer-term projects and ideas.",
  },
];
function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
}
function getGreeting(hour: number) {
  return hour < 12
    ? "Good morning"
    : hour < 18
      ? "Good afternoon"
      : "Good evening";
}

function CalendarView({
  tasks,
  currentDate,
  onToggle,
}: {
  tasks: Task[];
  currentDate: Date;
  onToggle: (id: number) => void;
}) {
  const [monthDate, setMonthDate] = useState(
    new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
  );
  const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const firstWeekday = (monthStart.getDay() + 6) % 7;
  const daysInMonth = new Date(
    monthDate.getFullYear(),
    monthDate.getMonth() + 1,
    0,
  ).getDate();
  const cells = Array.from(
    { length: Math.ceil((firstWeekday + daysInMonth) / 7) * 7 },
    (_, index) => {
      const day = index - firstWeekday + 1;
      return day > 0 && day <= daysInMonth
        ? new Date(monthDate.getFullYear(), monthDate.getMonth(), day)
        : null;
    },
  );
  const monthName = new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
  }).format(monthDate);

  return (
    <section className="calendar-section">
      <div className="calendar-heading">
        <div>
          <p className="eyebrow">Planning</p>
          <h2>{monthName}</h2>
        </div>
        <div className="calendar-actions">
          <button
            className="quiet-button"
            onClick={() =>
              setMonthDate(
                new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
              )
            }
          >
            Today
          </button>
          <button
            className="calendar-arrow"
            aria-label="Previous month"
            onClick={() =>
              setMonthDate(
                new Date(monthDate.getFullYear(), monthDate.getMonth() - 1, 1),
              )
            }
          >
            ‹
          </button>
          <button
            className="calendar-arrow"
            aria-label="Next month"
            onClick={() =>
              setMonthDate(
                new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1),
              )
            }
          >
            ›
          </button>
        </div>
      </div>
      <div className="calendar-grid calendar-weekdays">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <div className="calendar-grid calendar-days">
        {cells.map((date, index) => {
          const dateKey = date ? getDateKey(date) : `empty-${index}`;
          const dayTasks = date
            ? tasks.filter(
                (task) =>
                  getTaskDate(task, getDateKey(currentDate)) === dateKey,
              )
            : [];
          const isToday = dateKey === getDateKey(currentDate);
          return (
            <div
              className={
                date
                  ? `calendar-day${isToday ? " today" : ""}`
                  : "calendar-day empty"
              }
              key={dateKey}
            >
              <span className="day-number">{date?.getDate()}</span>
              <div className="day-tasks">
                {dayTasks.map((task) => (
                  <button
                    className={`calendar-task ${task.category.toLowerCase()}${task.completed ? " done" : ""}`}
                    key={task.id}
                    onClick={() => onToggle(task.id)}
                    title={task.title}
                  >
                    <span className="calendar-task-dot"></span>
                    {task.title}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function MiniCalendar({
  tasks,
  currentDate,
  onOpenCalendar,
}: {
  tasks: Task[];
  currentDate: Date;
  onOpenCalendar: () => void;
}) {
  const firstDay = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1,
  );
  const firstWeekday = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0,
  ).getDate();
  const cells = Array.from({ length: 42 }, (_, index) => {
    const day = index - firstWeekday + 1;
    return day > 0 && day <= daysInMonth
      ? new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      : null;
  });
  const monthName = new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
  }).format(currentDate);
  const taskTones = new Set(tasks.map((task) => task.category.toLowerCase()));

  return (
    <section className="mini-calendar">
      <div className="mini-calendar-heading">
        <div>
          <p className="eyebrow">Planning</p>
          <h2>{monthName}</h2>
        </div>
        <button className="quiet-button" onClick={onOpenCalendar}>
          Open calendar ↗
        </button>
      </div>
      <div className="mini-calendar-weekdays">
        {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
          <span key={`${day}-${index}`}>{day}</span>
        ))}
      </div>
      <div className="mini-calendar-days">
        {cells.map((date, index) => {
          const dateKey = date ? getDateKey(date) : `empty-${index}`;
          const dayTasks = date
            ? tasks.filter(
                (task) =>
                  getTaskDate(task, getDateKey(currentDate)) === dateKey,
              )
            : [];
          const isToday = dateKey === getDateKey(currentDate);
          return (
            <button
              className={
                date
                  ? `mini-calendar-day${isToday ? " today" : ""}`
                  : "mini-calendar-day empty"
              }
              key={dateKey}
              onClick={date ? onOpenCalendar : undefined}
              aria-label={
                date ? `${dateKey}, ${dayTasks.length} tasks` : undefined
              }
            >
              <span>{date?.getDate()}</span>
              {dayTasks.length > 0 && (
                <div className="mini-calendar-dots">
                  {[
                    ...new Set(
                      dayTasks.map((task) => task.category.toLowerCase()),
                    ),
                  ]
                    .filter((tone) => taskTones.has(tone))
                    .slice(0, 3)
                    .map((tone) => (
                      <i className={tone} key={tone}></i>
                    ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function ListManager({
  lists,
  onSave,
  onDelete,
  onClose,
}: {
  lists: List[];
  onSave: (originalName: string | null, list: List) => void;
  onDelete: (name: string) => void;
  onClose: () => void;
}) {
  const [editingName, setEditingName] = useState<string | null>(null);
  const [draft, setDraft] = useState<List>({
    name: "",
    tone: "mint",
    color: "#9bf3b0",
    description: "",
  });
  const colorOptions = [
    "#9bf3b0",
    "#87c7f2",
    "#f6c879",
    "#f19b8b",
    "#d8a7ff",
    "#f5a6c8",
    "#8de0d1",
    "#d6df78",
    "#ffffff",
    "#82908a",
  ];
  function startNew() {
    setEditingName(null);
    setDraft({ name: "", tone: "custom", color: "#9bf3b0", description: "" });
  }
  function startEdit(list: List) {
    setEditingName(list.name);
    setDraft({ ...list });
  }
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.name.trim()) return;
    onSave(editingName, { ...draft, name: draft.name.trim() });
    startNew();
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section
        className="modal list-manager-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="popover-heading">
          <strong>Manage lists</strong>
          <button onClick={onClose}>×</button>
        </div>
        <div className="list-manager-layout">
          <div className="managed-list">
            {lists.map((list) => (
              <div className="managed-list-row" key={list.name}>
                <span
                  className="list-dot"
                  style={{ background: list.color }}
                ></span>
                <span>
                  <strong>{list.name}</strong>
                  <small>{list.description || "No description"}</small>
                </span>
                <button
                  aria-label={`Edit ${list.name}`}
                  onClick={() => startEdit(list)}
                >
                  Edit
                </button>
                <button
                  aria-label={`Delete ${list.name}`}
                  onClick={() => onDelete(list.name)}
                >
                  ×
                </button>
              </div>
            ))}
            <button className="new-list-button" onClick={startNew}>
              + New list
            </button>
          </div>
          <form className="list-editor" onSubmit={submit}>
            <h3>{editingName ? "Edit list" : "New list"}</h3>
            <label>
              Name
              <input
                className="modal-input"
                value={draft.name}
                onChange={(event) =>
                  setDraft({ ...draft, name: event.target.value })
                }
                placeholder="e.g. Family"
              />
            </label>
            <label>
              Description <span className="optional">optional</span>
              <textarea
                className="modal-input"
                value={draft.description}
                onChange={(event) =>
                  setDraft({ ...draft, description: event.target.value })
                }
                placeholder="What belongs in this list?"
                rows={3}
              />
            </label>
            <label>Color</label>
            <div className="color-picker">
              {colorOptions.map((color) => (
                <button
                  type="button"
                  className={
                    draft.color === color
                      ? "color-swatch selected"
                      : "color-swatch"
                  }
                  style={{ background: color }}
                  aria-label={`Choose ${color}`}
                  key={color}
                  onClick={() => setDraft({ ...draft, color })}
                ></button>
              ))}
              <label className="custom-color">
                <input
                  type="color"
                  value={draft.color}
                  onChange={(event) =>
                    setDraft({ ...draft, color: event.target.value })
                  }
                />
                Custom
              </label>
            </div>
            <button className="add-button" type="submit">
              {editingName ? "Save list" : "Create list"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

function App() {
  const [now, setNow] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>(loadTasks);
  const [newTask, setNewTask] = useState("");
  const [activeView, setActiveView] = useState("Today");
  const [showCompleted] = useState(true);
  const [lists, setLists] = useState<List[]>(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("greenframe-lists") ?? "null",
      ) as Partial<List>[] | null;
      return (
        saved?.map(
          (list) =>
            ({
              ...list,
              color: list.color ?? "#9bf3b0",
              description: list.description ?? "",
            }) as List,
        ) ?? defaultLists
      );
    } catch {
      return defaultLists;
    }
  });
  const [profile, setProfile] = useState<Profile>(() => {
    try {
      return (
        JSON.parse(localStorage.getItem("greenframe-profile") ?? "null") ?? {
          name: "Stefan",
          email: "",
        }
      );
    } catch {
      return { name: "Stefan", email: "" };
    }
  });
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [listManagerOpen, setListManagerOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => {
    localStorage.setItem("frame-tasks", JSON.stringify(tasks));
  }, [tasks]);
  useEffect(() => {
    localStorage.setItem("greenframe-lists", JSON.stringify(lists));
  }, [lists]);
  useEffect(() => {
    localStorage.setItem("greenframe-profile", JSON.stringify(profile));
  }, [profile]);
  const completedCount = tasks.filter((task) => task.completed).length;
  const remainingCount = tasks.length - completedCount;
  const progress = tasks.length
    ? Math.round((completedCount / tasks.length) * 100)
    : 0;
  const todayKey = getDateKey(now);
  const listByName = (name: string) => lists.find((list) => list.name === name);
  const filteredTasks = useMemo(() => {
    if (activeView === "Today")
      return tasks.filter((task) => getTaskDate(task, todayKey) === todayKey);
    if (activeView === "Upcoming")
      return tasks.filter((task) => getTaskDate(task, todayKey) > todayKey);
    if (activeView === "Completed")
      return tasks.filter((task) => task.completed);
    if (activeView === "Inbox")
      return tasks.filter((task) => task.category === "Inbox");
    if (lists.some((list) => list.name === activeView))
      return tasks.filter((task) => task.category === activeView);
    return tasks;
  }, [activeView, lists, tasks, todayKey]);
  const visibleTasks =
    activeView === "Completed" || showCompleted
      ? filteredTasks
      : filteredTasks.filter((task) => !task.completed);
  function addTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = newTask.trim();
    if (!title) return;
    setTasks((current) => [
      ...current,
      {
        id: Date.now(),
        title,
        category: "Inbox",
        dueDate: todayKey,
        completed: false,
      },
    ]);
    setNewTask("");
  }
  function toggleTask(id: number) {
    setTasks((current) =>
      current.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task,
      ),
    );
  }
  function removeTask(id: number) {
    setTasks((current) => current.filter((task) => task.id !== id));
  }
  function saveTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingTask?.title.trim()) return;
    setTasks((current) =>
      current.map((task) =>
        task.id === editingTask.id
          ? { ...editingTask, title: editingTask.title.trim() }
          : task,
      ),
    );
    setEditingTask(null);
  }
  function saveList(originalName: string | null, list: List) {
    if (
      lists.some(
        (existing) =>
          existing.name.toLowerCase() === list.name.toLowerCase() &&
          existing.name !== originalName,
      )
    )
      return;
    setLists((current) =>
      originalName
        ? current.map((existing) =>
            existing.name === originalName ? list : existing,
          )
        : [...current, list],
    );
    if (originalName && originalName !== list.name)
      setTasks((current) =>
        current.map((task) =>
          task.category === originalName
            ? { ...task, category: list.name }
            : task,
        ),
      );
    if (activeView === originalName) setActiveView(list.name);
  }
  function deleteList(name: string) {
    setLists((current) => current.filter((list) => list.name !== name));
    setTasks((current) =>
      current.map((task) =>
        task.category === name ? { ...task, category: "Inbox" } : task,
      ),
    );
    if (activeView === name) setActiveView("Today");
  }
  const searchResults = searchQuery.trim()
    ? tasks.filter((task) =>
        `${task.title} ${task.category}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase()),
      )
    : [];
  const notifications = [
    `${remainingCount} tasks still need attention today`,
    completedCount
      ? `${completedCount} task${completedCount === 1 ? "" : "s"} completed`
      : "No tasks completed yet",
  ];

  if (activeView === "Calendar")
    return (
      <div className="calendar-page">
        <header className="calendar-page-header">
          <div className="brand">
            <span className="brand-mark">F</span>
            <span>GreenFrame</span>
          </div>
          <button className="add-button" onClick={() => setActiveView("Today")}>
            Back to today
          </button>
        </header>
        <CalendarView tasks={tasks} currentDate={now} onToggle={toggleTask} />
      </div>
    );

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">F</span>
          <span>GreenFrame</span>
        </div>
        <div className="sidebar-scroll">
          <p className="nav-label">Workspace</p>
          <nav className="nav-list" aria-label="Main navigation">
            {["Dashboard", "Today", "Upcoming", "Inbox", "Completed"].map(
              (item) => (
                <button
                  className={
                    activeView === item ? "nav-item active" : "nav-item"
                  }
                  key={item}
                  onClick={() => setActiveView(item)}
                >
                  <span className="nav-icon">
                    {item === "Dashboard"
                      ? "◈"
                      : item === "Today"
                        ? "○"
                        : item === "Upcoming"
                          ? "↗"
                          : item === "Inbox"
                            ? "⌁"
                            : "✓"}
                  </span>
                  {item}
                  {item === "Today" && (
                    <span className="nav-count">{remainingCount}</span>
                  )}
                </button>
              ),
            )}
          </nav>
          <p className="nav-label list-heading">
            Lists{" "}
            <button
              className="tiny-button"
              aria-label="Manage lists"
              onClick={() => setListManagerOpen(true)}
            >
              +
            </button>
          </p>
          <nav className="nav-list">
            {lists.map((category) => (
              <button
                className="nav-item"
                key={category.name}
                onClick={() => setActiveView(category.name)}
              >
                <span
                  className={`list-dot ${category.tone}`}
                  style={{ background: category.color }}
                ></span>
                {category.name}
                <span className="nav-count">
                  {
                    tasks.filter((task) => task.category === category.name)
                      .length
                  }
                </span>
              </button>
            ))}
          </nav>
          <p className="nav-label list-heading">Planning</p>
          <nav className="nav-list">
            <button
              className="nav-item"
              onClick={() => setActiveView("Calendar")}
            >
              <span className="nav-icon">□</span>Calendar
            </button>
            <button
              className="nav-item"
              onClick={() => setActiveView("Weekly")}
            >
              <span className="nav-icon">≡</span>Weekly review
            </button>
          </nav>
        </div>
        <div className="sidebar-footer">
          <button className="nav-item" onClick={() => setProfileOpen(true)}>
            <span className="nav-icon">⚙</span>Settings
          </button>
          <div className="profile">
            <span className="avatar">S</span>
            <span>
              <strong>{profile.name}</strong>
              <small>Personal workspace</small>
            </span>
            <span className="more">•••</span>
          </div>
        </div>
      </aside>
      <main className="main-content">
        <header className="topbar">
          <div className="mobile-brand">
            <span className="brand-mark">F</span>frame
          </div>
          <div className="breadcrumbs">
            Workspace <span>/</span> {activeView}
          </div>
          <div className="top-actions">
            <button
              className="icon-button"
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
            >
              ⌕
            </button>
            <button
              className="icon-button"
              aria-label="Notifications"
              onClick={() => setNotificationsOpen((open) => !open)}
            >
              ♢<span className="notification-dot"></span>
            </button>
            <button
              className="add-button"
              onClick={() => document.getElementById("quick-add")?.focus()}
            >
              <span>+</span> Add task
            </button>
          </div>
        </header>
        {notificationsOpen && (
          <div className="popover notification-popover">
            <div className="popover-heading">
              <strong>Notifications</strong>
              <button onClick={() => setNotificationsOpen(false)}>×</button>
            </div>
            {notifications.map((notification) => (
              <p className="notification-item" key={notification}>
                <span className="notification-dot solid"></span>
                {notification}
              </p>
            ))}
          </div>
        )}
        <div className="content-wrap">
          <section className="welcome-row">
            <div>
              <p className="eyebrow">{formatDate(now)}</p>
              <h1>
                {getGreeting(now.getHours())}, Stefan
                <span className="accent-dot">.</span>
              </h1>
              <p className="subheading">
                A clear space for everything on your mind.
              </p>
            </div>
            <div className="clock">
              <strong>
                {now.toLocaleTimeString("en-GB", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </strong>
              <span>
                {formatDate(now)} · Week {getWeekNumber(now)} · {now.getFullYear()}
              </span>
            </div>
          </section>
          <section className="overview-grid">
            <div className="focus-panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Your focus</p>
                  <h2>
                    {activeView === "Completed"
                      ? "Completed tasks"
                      : activeView}
                  </h2>
                </div>
                <button className="quiet-button">
                  {activeView === "Today" ? "View all ↗" : "Clear view"}
                </button>
              </div>
              <div className="progress-row">
                <div
                  className="progress-ring"
                  style={
                    {
                      "--progress": `${progress * 3.6}deg`,
                    } as React.CSSProperties
                  }
                >
                  <span>
                    {progress}
                    <small>%</small>
                  </span>
                </div>
                <div>
                  <strong>{remainingCount} tasks remaining</strong>
                  <p>
                    {completedCount} completed today. Keep the momentum going.
                  </p>
                </div>
              </div>
              <div className="progress-bar">
                <span style={{ width: `${progress}%` }}></span>
              </div>
            </div>
            <div className="stats-panel">
              <p className="eyebrow">This week</p>
              <div className="stat-number">
                12<span> tasks done</span>
              </div>
              <div className="mini-bars">
                <i style={{ height: "35%" }}></i>
                <i style={{ height: "58%" }}></i>
                <i style={{ height: "45%" }}></i>
                <i className="today-bar" style={{ height: "78%" }}></i>
                <i style={{ height: "28%" }}></i>
                <i style={{ height: "52%" }}></i>
                <i style={{ height: "18%" }}></i>
              </div>
              <div className="week-labels">
                <span>M</span>
                <span>T</span>
                <span>W</span>
                <span>T</span>
                <span>F</span>
                <span>S</span>
                <span>S</span>
              </div>
            </div>
          </section>
          <MiniCalendar
            tasks={tasks}
            currentDate={now}
            onOpenCalendar={() => setActiveView("Calendar")}
          />
          <section className="task-section">
            <div className="section-title">
              <div>
                <p className="eyebrow">
                  {activeView === "Completed" ? "History" : "The day ahead"}
                </p>
                <h2>
                  {activeView === "Completed"
                    ? "Completed"
                    : activeView === "Today"
                      ? "My tasks"
                      : `${activeView} tasks`}{" "}
                  <span className="task-count">{visibleTasks.length}</span>
                </h2>
              </div>
              <div className="view-switcher">
                <button className="selected" aria-label="List view">
                  ≡
                </button>
                <button aria-label="Grid view">⊞</button>
                <button aria-label="Calendar view">□</button>
              </div>
            </div>
            <form className="quick-add" onSubmit={addTask}>
              <span className="plus-circle">+</span>
              <input
                id="quick-add"
                value={newTask}
                onChange={(event) => setNewTask(event.target.value)}
                placeholder="Add a task to your day..."
                aria-label="New task title"
              />
              <button type="submit">
                Add task <span>↵</span>
              </button>
            </form>
            <div className="task-list">
              {visibleTasks.map((task) => (
                <article
                  className={
                    task.completed ? "task-card completed" : "task-card"
                  }
                  key={task.id}
                >
                  <button
                    className="check-button"
                    aria-label={
                      task.completed
                        ? `Mark ${task.title} incomplete`
                        : `Complete ${task.title}`
                    }
                    onClick={() => toggleTask(task.id)}
                  >
                    {task.completed ? "✓" : ""}
                  </button>
                  <div className="task-copy">
                    <strong>{task.title}</strong>
                    <div className="task-meta">
                      <span
                        className={`category-pill ${task.category.toLowerCase()}`}
                        style={{
                          color: listByName(task.category)?.color,
                          borderColor: listByName(task.category)?.color,
                        }}
                      >
                        {task.category}
                      </span>
                      {task.time && (
                        <span className="task-time">◷ {task.time}</span>
                      )}
                      {task.priority && (
                        <span className="priority">High priority</span>
                      )}
                    </div>
                  </div>
                  <button
                    className="task-menu"
                    aria-label={`Edit ${task.title}`}
                    onClick={() => setEditingTask(task)}
                  >
                    ⋯
                  </button>
                </article>
              ))}
              {visibleTasks.length === 0 && (
                <div className="empty-state">
                  Nothing here yet. Add a task above to get started.
                </div>
              )}
            </div>
          </section>
          <section className="lists-section">
            <div className="section-title">
              <div>
                <p className="eyebrow">Organise your life</p>
                <h2>Your lists</h2>
              </div>
              <button
                className="quiet-button"
                onClick={() => setListManagerOpen(true)}
              >
                Manage lists ↗
              </button>
            </div>
            <div className="category-grid">
              {lists.map((category) => (
                <button
                  className="category-card"
                  key={category.name}
                  onClick={() => setActiveView(category.name)}
                >
                  <span
                    className={`category-icon ${category.tone}`}
                    style={{
                      color: category.color,
                      borderColor: category.color,
                    }}
                  >
                    {category.name === "Home"
                      ? "⌂"
                      : category.name === "Studies"
                        ? "✦"
                        : category.name === "Shopping"
                          ? "□"
                          : "↗"}
                  </span>
                  <span>
                    <strong>{category.name}</strong>
                    <small>
                      {
                        tasks.filter((task) => task.category === category.name)
                          .length
                      }{" "}
                      tasks
                    </small>
                  </span>
                  <span className="arrow">↗</span>
                </button>
              ))}
            </div>
          </section>
        </div>
      </main>
      {searchOpen && (
        <div className="modal-backdrop" onClick={() => setSearchOpen(false)}>
          <section
            className="modal search-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="popover-heading">
              <strong>Search GreenFrame</strong>
              <button onClick={() => setSearchOpen(false)}>×</button>
            </div>
            <input
              autoFocus
              className="modal-input"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search tasks and lists..."
            />
            {searchResults.map((task) => (
              <button
                className="search-result"
                key={task.id}
                onClick={() => {
                  setSearchOpen(false);
                  setActiveView(task.category);
                }}
              >
                <strong>{task.title}</strong>
                <small>
                  {task.category} · {task.completed ? "Completed" : "Open"}
                </small>
              </button>
            ))}
            {searchQuery && !searchResults.length && (
              <p className="empty-state">No matching tasks.</p>
            )}
          </section>
        </div>
      )}
      {editingTask && (
        <div className="modal-backdrop" onClick={() => setEditingTask(null)}>
          <form
            className="modal task-modal"
            onSubmit={saveTask}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="popover-heading">
              <strong>Edit task</strong>
              <button type="button" onClick={() => setEditingTask(null)}>
                ×
              </button>
            </div>
            <label>
              Task name
              <input
                className="modal-input"
                value={editingTask.title}
                onChange={(event) =>
                  setEditingTask({ ...editingTask, title: event.target.value })
                }
              />
            </label>
            <label>
              List
              <select
                className="modal-input"
                value={editingTask.category}
                onChange={(event) =>
                  setEditingTask({
                    ...editingTask,
                    category: event.target.value,
                  })
                }
              >
                {lists.map((list) => (
                  <option key={list.name}>{list.name}</option>
                ))}
                <option>Inbox</option>
              </select>
            </label>
            <label>
              Due date
              <input
                className="modal-input"
                type="date"
                value={editingTask.dueDate ?? todayKey}
                onChange={(event) =>
                  setEditingTask({
                    ...editingTask,
                    dueDate: event.target.value,
                  })
                }
              />
            </label>
            <label>
              Time
              <input
                className="modal-input"
                value={editingTask.time ?? ""}
                onChange={(event) =>
                  setEditingTask({ ...editingTask, time: event.target.value })
                }
                placeholder="Optional"
              />
            </label>
            <div className="modal-actions">
              <button
                type="button"
                className="danger-button"
                onClick={() => {
                  removeTask(editingTask.id);
                  setEditingTask(null);
                }}
              >
                Delete
              </button>
              <button className="add-button" type="submit">
                Save task
              </button>
            </div>
          </form>
        </div>
      )}
      {listManagerOpen && (
        <ListManager
          lists={lists}
          onSave={saveList}
          onDelete={deleteList}
          onClose={() => setListManagerOpen(false)}
        />
      )}
      {profileOpen && (
        <div className="modal-backdrop" onClick={() => setProfileOpen(false)}>
          <form
            className="modal task-modal"
            onSubmit={(event) => {
              event.preventDefault();
              setProfileOpen(false);
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="popover-heading">
              <strong>Profile & account</strong>
              <button type="button" onClick={() => setProfileOpen(false)}>
                ×
              </button>
            </div>
            <div className="profile-large">
              <span className="avatar">
                {profile.name.charAt(0).toUpperCase()}
              </span>
              <div>
                <strong>{profile.name}</strong>
                <small>Local profile · account sync ready</small>
              </div>
            </div>
            <label>
              Your name
              <input
                className="modal-input"
                value={profile.name}
                onChange={(event) =>
                  setProfile({ ...profile, name: event.target.value })
                }
              />
            </label>
            <label>
              Email address
              <input
                className="modal-input"
                type="email"
                value={profile.email}
                onChange={(event) =>
                  setProfile({ ...profile, email: event.target.value })
                }
                placeholder="Add an email when accounts are enabled"
              />
            </label>
            <p className="account-note">
              Account registration and cross-device sync need a backend service.
              This profile is saved locally for now.
            </p>
            <button className="add-button" type="submit">
              Save profile
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function getWeekNumber(date: Date) {
  const firstDay = new Date(date.getFullYear(), 0, 1);
  return Math.ceil(
    ((date.getTime() - firstDay.getTime()) / 86400000 + firstDay.getDay() + 1) /
      7,
  );
}

export default App;
