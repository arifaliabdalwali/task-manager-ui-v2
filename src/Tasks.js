import { useEffect, useMemo, useState } from "react";
import API from "./api";

export default function Tasks() {
    const [tasks, setTasks] = useState([]);

    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("");
    const [dueDate, setDueDate] = useState("");

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [categoryFilter, setCategoryFilter] = useState("all");

    const [darkMode, setDarkMode] = useState(
        localStorage.getItem("darkMode") === "true"
    );

    const [showEditModal, setShowEditModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [editTitle, setEditTitle] = useState("");
    const [editCategory, setEditCategory] = useState("");
    const [editDueDate, setEditDueDate] = useState("");
    const [editCompleted, setEditCompleted] = useState(false);

    useEffect(() => {
        localStorage.setItem("darkMode", darkMode);
    }, [darkMode]);

    const loadTasks = async () => {
        try {
            const res = await API.get("/tasks");
            setTasks(res.data);
        } catch (error) {
            console.log("LOAD TASKS ERROR:", error);
            alert("Failed to load tasks");
        }
    };

    useEffect(() => {
        loadTasks();
    }, []);

    const addTask = async () => {
        if (!title.trim()) {
            alert("Task title is required");
            return;
        }

        try {
            await API.post("/tasks", {
                title: title.trim(),
                category: category.trim(),
                dueDate: dueDate || null,
                isCompleted: false
            });

            setTitle("");
            setCategory("");
            setDueDate("");
            loadTasks();
        } catch (error) {
            console.log("ADD TASK ERROR:", error);
            alert("Failed to add task");
        }
    };

    const deleteTask = async (id) => {
        const confirmed = window.confirm("Are you sure you want to delete this task?");
        if (!confirmed) return;

        try {
            await API.delete(`/tasks/${id}`);
            loadTasks();
        } catch (error) {
            console.log("DELETE TASK ERROR:", error);
            alert("Failed to delete task");
        }
    };

    const toggleComplete = async (task) => {
        try {
            await API.put(`/tasks/${task.id}`, {
                title: task.title,
                category: task.category || "",
                dueDate: task.dueDate,
                isCompleted: !task.isCompleted
            });

            loadTasks();
        } catch (error) {
            console.log("TOGGLE COMPLETE ERROR:", error);
            alert("Failed to update task status");
        }
    };

    const openEditModal = (task) => {
        setEditId(task.id);
        setEditTitle(task.title || "");
        setEditCategory(task.category || "");
        setEditDueDate(task.dueDate ? task.dueDate.split("T")[0] : "");
        setEditCompleted(task.isCompleted || false);
        setShowEditModal(true);
    };

    const closeEditModal = () => {
        setShowEditModal(false);
        setEditId(null);
        setEditTitle("");
        setEditCategory("");
        setEditDueDate("");
        setEditCompleted(false);
    };

    const updateTask = async () => {
        if (!editTitle.trim()) {
            alert("Task title is required");
            return;
        }

        try {
            await API.put(`/tasks/${editId}`, {
                title: editTitle.trim(),
                category: editCategory.trim(),
                dueDate: editDueDate || null,
                isCompleted: editCompleted
            });

            closeEditModal();
            loadTasks();
        } catch (error) {
            console.log("UPDATE TASK ERROR:", error);
            alert("Failed to update task");
        }
    };

    const categories = useMemo(() => {
        const unique = [...new Set(tasks.map((t) => t.category).filter(Boolean))];
        return unique;
    }, [tasks]);

    const filteredTasks = useMemo(() => {
        return tasks.filter((task) => {
            const matchSearch = task.title
                .toLowerCase()
                .includes(search.toLowerCase());

            const matchStatus =
                statusFilter === "all" ||
                (statusFilter === "completed" && task.isCompleted) ||
                (statusFilter === "pending" && !task.isCompleted);

            const matchCategory =
                categoryFilter === "all" || task.category === categoryFilter;

            return matchSearch && matchStatus && matchCategory;
        });
    }, [tasks, search, statusFilter, categoryFilter]);

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.isCompleted).length;
    const pendingTasks = totalTasks - completedTasks;

    const formatDate = (dateString) => {
        if (!dateString) return "No due date";
        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) return "Invalid date";
        return date.toLocaleDateString();
    };

    const styles = {
        page: {
            minHeight: "100vh",
            backgroundColor: darkMode ? "#0f172a" : "#f1f5f9",
            color: darkMode ? "#f8fafc" : "#0f172a",
            transition: "all 0.3s ease"
        },
        navbar: {
            background: darkMode
                ? "linear-gradient(90deg, #020617, #0f172a)"
                : "linear-gradient(90deg, #0f172a, #111827)",
            color: "#fff",
            padding: "20px 30px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 4px 14px rgba(0,0,0,0.12)"
        },
        brand: {
            fontSize: "20px",
            fontWeight: "700",
            display: "flex",
            alignItems: "center",
            gap: "10px"
        },
        navButtons: {
            display: "flex",
            gap: "12px",
            alignItems: "center"
        },
        toggleBtn: {
            background: darkMode ? "#e5e7eb" : "#f8fafc",
            color: "#111827",
            border: "none",
            padding: "10px 16px",
            borderRadius: "12px",
            cursor: "pointer",
            fontWeight: "600"
        },
        logoutBtn: {
            background: "#ef4444",
            color: "#fff",
            border: "none",
            padding: "10px 16px",
            borderRadius: "12px",
            cursor: "pointer",
            fontWeight: "600"
        },
        container: {
            maxWidth: "940px",
            margin: "20px auto",
            padding: "0 20px 40px"
        },
        statsGrid: {
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "14px",
            marginBottom: "20px"
        },
        statCard: {
            background: darkMode ? "#1e293b" : "#ffffff",
            border: darkMode ? "1px solid #334155" : "1px solid #e5e7eb",
            borderRadius: "16px",
            padding: "24px",
            textAlign: "center",
            boxShadow: darkMode
                ? "0 8px 20px rgba(0,0,0,0.25)"
                : "0 8px 20px rgba(15,23,42,0.05)"
        },
        statLabel: {
            fontSize: "15px",
            fontWeight: "700",
            marginBottom: "10px"
        },
        statValue: {
            fontSize: "22px",
            fontWeight: "800"
        },
        card: {
            background: darkMode ? "#1e293b" : "#ffffff",
            border: darkMode ? "1px solid #334155" : "1px solid #e5e7eb",
            borderRadius: "16px",
            padding: "18px",
            marginBottom: "18px",
            boxShadow: darkMode
                ? "0 8px 20px rgba(0,0,0,0.25)"
                : "0 8px 20px rgba(15,23,42,0.05)"
        },
        sectionTitle: {
            fontSize: "16px",
            fontWeight: "800",
            marginBottom: "16px"
        },
        input: {
            width: "100%",
            padding: "12px 14px",
            borderRadius: "12px",
            border: darkMode ? "1px solid #475569" : "1px solid #d1d5db",
            backgroundColor: darkMode ? "#0f172a" : "#ffffff",
            color: darkMode ? "#f8fafc" : "#111827",
            outline: "none",
            marginBottom: "10px",
            boxSizing: "border-box"
        },
        row: {
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "10px"
        },
        addBtn: {
            background: "#2563eb",
            color: "#fff",
            border: "none",
            padding: "10px 16px",
            borderRadius: "12px",
            cursor: "pointer",
            fontWeight: "700",
            marginTop: "4px"
        },
        filtersRow: {
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "10px"
        },
        taskCount: {
            marginBottom: "10px",
            color: darkMode ? "#cbd5e1" : "#475569"
        },
        taskCard: {
            background: darkMode ? "#1e293b" : "#ffffff",
            border: darkMode ? "1px solid #334155" : "1px solid #e5e7eb",
            borderRadius: "14px",
            padding: "14px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "14px",
            marginBottom: "12px"
        },
        taskLeft: {
            display: "flex",
            alignItems: "flex-start",
            gap: "12px",
            flex: 1
        },
        checkbox: {
            marginTop: "4px",
            width: "18px",
            height: "18px",
            cursor: "pointer"
        },
        taskTitle: (completed) => ({
            fontWeight: "700",
            textDecoration: completed ? "line-through" : "none",
            opacity: completed ? 0.65 : 1,
            marginBottom: "6px"
        }),
        taskMeta: {
            fontSize: "14px",
            color: darkMode ? "#cbd5e1" : "#64748b"
        },
        actions: {
            display: "flex",
            gap: "8px"
        },
        editBtn: {
            background: "#e5e7eb",
            color: "#111827",
            border: "none",
            padding: "8px 14px",
            borderRadius: "10px",
            cursor: "pointer",
            fontWeight: "600"
        },
        deleteBtn: {
            background: "#ef4444",
            color: "#fff",
            border: "none",
            padding: "8px 14px",
            borderRadius: "10px",
            cursor: "pointer",
            fontWeight: "600"
        },
        emptyText: {
            textAlign: "center",
            color: darkMode ? "#cbd5e1" : "#64748b",
            padding: "20px 0"
        },
        modalOverlay: {
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px"
        },
        modal: {
            width: "100%",
            maxWidth: "480px",
            background: darkMode ? "#1e293b" : "#ffffff",
            color: darkMode ? "#f8fafc" : "#111827",
            borderRadius: "18px",
            padding: "22px",
            boxShadow: "0 20px 50px rgba(0,0,0,0.25)"
        },
        modalTitle: {
            fontSize: "20px",
            fontWeight: "800",
            marginBottom: "16px"
        },
        modalButtons: {
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
            marginTop: "8px"
        },
        saveBtn: {
            background: "#2563eb",
            color: "#fff",
            border: "none",
            padding: "10px 16px",
            borderRadius: "12px",
            cursor: "pointer",
            fontWeight: "700"
        },
        cancelBtn: {
            background: "#e5e7eb",
            color: "#111827",
            border: "none",
            padding: "10px 16px",
            borderRadius: "12px",
            cursor: "pointer",
            fontWeight: "700"
        },
        modalCheck: {
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "12px",
            fontSize: "14px"
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        window.location.href = "/";
    };

    return (
        <div style={styles.page}>
            <nav style={styles.navbar}>
                <div style={styles.brand}>🚀 Task Manager</div>

                <div style={styles.navButtons}>
                    <button
                        style={styles.toggleBtn}
                        onClick={() => setDarkMode(!darkMode)}
                    >
                        {darkMode ? "🌙 Dark" : "☀️ Light"}
                    </button>

                    <button style={styles.logoutBtn} onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </nav>

            <div style={styles.container}>
                <div style={styles.statsGrid}>
                    <div style={styles.statCard}>
                        <div style={styles.statLabel}>Total</div>
                        <div style={styles.statValue}>{totalTasks}</div>
                    </div>

                    <div style={styles.statCard}>
                        <div style={styles.statLabel}>Done</div>
                        <div style={styles.statValue}>{completedTasks}</div>
                    </div>

                    <div style={styles.statCard}>
                        <div style={styles.statLabel}>Pending</div>
                        <div style={styles.statValue}>{pendingTasks}</div>
                    </div>
                </div>

                <div style={styles.card}>
                    <div style={styles.sectionTitle}>Add Task</div>

                    <input
                        type="text"
                        placeholder="Task title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        style={styles.input}
                    />

                    <input
                        type="text"
                        placeholder="Category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        style={styles.input}
                    />

                    <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        style={styles.input}
                    />

                    <button style={styles.addBtn} onClick={addTask}>
                        Add Task
                    </button>
                </div>

                <div style={styles.card}>
                    <div style={styles.sectionTitle}>Search & Filter</div>

                    <input
                        type="text"
                        placeholder="Search by title..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={styles.input}
                    />

                    <div style={styles.filtersRow}>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            style={styles.input}
                        >
                            <option value="all">All Tasks</option>
                            <option value="completed">Completed</option>
                            <option value="pending">Pending</option>
                        </select>

                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            style={styles.input}
                        >
                            <option value="all">All Categories</option>
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div style={styles.taskCount}>
                    Showing {filteredTasks.length} of {tasks.length} tasks
                </div>

                {filteredTasks.length === 0 ? (
                    <div style={styles.card}>
                        <div style={styles.emptyText}>No tasks found</div>
                    </div>
                ) : (
                    filteredTasks.map((task) => (
                        <div key={task.id} style={styles.taskCard}>
                            <div style={styles.taskLeft}>
                                <input
                                    type="checkbox"
                                    checked={task.isCompleted}
                                    onChange={() => toggleComplete(task)}
                                    style={styles.checkbox}
                                />

                                <div>
                                    <div style={styles.taskTitle(task.isCompleted)}>
                                        {task.title}
                                    </div>
                                    <div style={styles.taskMeta}>
                                        Category: {task.category || "None"} | Due:{" "}
                                        {formatDate(task.dueDate)}
                                    </div>
                                </div>
                            </div>

                            <div style={styles.actions}>
                                <button
                                    style={styles.editBtn}
                                    onClick={() => openEditModal(task)}
                                >
                                    Edit
                                </button>

                                <button
                                    style={styles.deleteBtn}
                                    onClick={() => deleteTask(task.id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {showEditModal && (
                <div style={styles.modalOverlay} onClick={closeEditModal}>
                    <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div style={styles.modalTitle}>Edit Task</div>

                        <input
                            type="text"
                            placeholder="Task title"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            style={styles.input}
                        />

                        <input
                            type="text"
                            placeholder="Category"
                            value={editCategory}
                            onChange={(e) => setEditCategory(e.target.value)}
                            style={styles.input}
                        />

                        <input
                            type="date"
                            value={editDueDate}
                            onChange={(e) => setEditDueDate(e.target.value)}
                            style={styles.input}
                        />

                        <label style={styles.modalCheck}>
                            <input
                                type="checkbox"
                                checked={editCompleted}
                                onChange={(e) => setEditCompleted(e.target.checked)}
                            />
                            Mark as completed
                        </label>

                        <div style={styles.modalButtons}>
                            <button style={styles.cancelBtn} onClick={closeEditModal}>
                                Cancel
                            </button>
                            <button style={styles.saveBtn} onClick={updateTask}>
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}