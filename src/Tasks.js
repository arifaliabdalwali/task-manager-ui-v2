import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "./api";

export default function Tasks() {
    const [tasks, setTasks] = useState([]);
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("");
    const [dueDate, setDueDate] = useState("");

    const [editId, setEditId] = useState(null);
    const [editTitle, setEditTitle] = useState("");
    const [editCategory, setEditCategory] = useState("");
    const [editDueDate, setEditDueDate] = useState("");

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [categoryFilter, setCategoryFilter] = useState("all");

    const [darkMode, setDarkMode] = useState(
        localStorage.getItem("darkMode") === "true"
    );

    const navigate = useNavigate();

    const loadTasks = async () => {
        try {
            const res = await API.get("/tasks");
            setTasks(res.data);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/");
            return;
        }

        loadTasks();
    }, [navigate]);

    useEffect(() => {
        localStorage.setItem("darkMode", darkMode);
    }, [darkMode]);

    const addTask = async () => {
        if (!title.trim()) return;

        try {
            await API.post("/tasks", {
                title,
                isCompleted: false,
                category,
                dueDate: dueDate || null
            });

            setTitle("");
            setCategory("");
            setDueDate("");
            loadTasks();
        } catch (error) {
            console.log(error);
        }
    };

    const deleteTask = async (id) => {
        try {
            await API.delete(`/tasks/${id}`);
            loadTasks();
        } catch (error) {
            console.log(error);
        }
    };

    const startEdit = (task) => {
        setEditId(task.id);
        setEditTitle(task.title || "");
        setEditCategory(task.category || "");
        setEditDueDate(formatDateForInput(task.dueDate));
    };

    const updateTask = async () => {
        try {
            const oldTask = tasks.find((t) => t.id === editId);
            if (!oldTask) return;

            await API.put(`/tasks/${editId}`, {
                title: editTitle,
                isCompleted: oldTask.isCompleted,
                category: editCategory,
                dueDate: editDueDate || null
            });

            setEditId(null);
            setEditTitle("");
            setEditCategory("");
            setEditDueDate("");
            loadTasks();
        } catch (error) {
            console.log(error);
        }
    };

    const toggleComplete = async (task) => {
        try {
            await API.put(`/tasks/${task.id}`, {
                title: task.title,
                isCompleted: !task.isCompleted,
                category: task.category || "",
                dueDate: task.dueDate || null
            });

            loadTasks();
        } catch (error) {
            console.log(error);
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        navigate("/");
    };

    const completed = tasks.filter((t) => t.isCompleted).length;
    const pending = tasks.length - completed;

    const uniqueCategories = useMemo(() => {
        const cats = tasks
            .map((t) => (t.category || "").trim())
            .filter((c) => c !== "");
        return [...new Set(cats)];
    }, [tasks]);

    const filteredTasks = useMemo(() => {
        return tasks.filter((task) => {
            const matchesSearch = (task.title || "")
                .toLowerCase()
                .includes(search.toLowerCase());

            const matchesStatus =
                statusFilter === "all"
                    ? true
                    : statusFilter === "completed"
                    ? task.isCompleted
                    : !task.isCompleted;

            const matchesCategory =
                categoryFilter === "all"
                    ? true
                    : (task.category || "") === categoryFilter;

            return matchesSearch && matchesStatus && matchesCategory;
        });
    }, [tasks, search, statusFilter, categoryFilter]);

    const bg = darkMode ? "#0f172a" : "#f5f7fb";
    const card = darkMode ? "#1e293b" : "#ffffff";
    const text = darkMode ? "#ffffff" : "#111827";
    const border = darkMode ? "#334155" : "#e5e7eb";
    const inputBg = darkMode ? "#0f172a" : "#ffffff";
    const muted = darkMode ? "#94a3b8" : "#6b7280";

    return (
        <div
            style={{
                minHeight: "100vh",
                background: bg,
                color: text,
                fontFamily: "Arial, sans-serif"
            }}
        >
            <div
                style={{
                    background: darkMode ? "#020617" : "#111827",
                    color: "white",
                    padding: "15px 25px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}
            >
                <h2 style={{ margin: 0 }}>🚀 Task Manager</h2>

                <div>
                    <button
                        onClick={() => setDarkMode(!darkMode)}
                        style={{
                            marginRight: "10px",
                            padding: "10px 14px",
                            borderRadius: "8px",
                            border: "none",
                            cursor: "pointer"
                        }}
                    >
                        {darkMode ? "☀ Light" : "🌙 Dark"}
                    </button>

                    <button
                        onClick={logout}
                        style={{
                            background: "red",
                            color: "white",
                            padding: "10px 14px",
                            borderRadius: "8px",
                            border: "none",
                            cursor: "pointer"
                        }}
                    >
                        Logout
                    </button>
                </div>
            </div>

            <div style={{ maxWidth: "1000px", margin: "auto", padding: "20px" }}>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                        gap: "12px",
                        marginBottom: "20px"
                    }}
                >
                    <StatBox title="Total" value={tasks.length} darkMode={darkMode} />
                    <StatBox title="Done" value={completed} darkMode={darkMode} />
                    <StatBox title="Pending" value={pending} darkMode={darkMode} />
                </div>

                <div
                    style={{
                        background: card,
                        padding: "15px",
                        borderRadius: "10px",
                        marginBottom: "20px",
                        border: `1px solid ${border}`
                    }}
                >
                    <h3>Add Task</h3>

                    <input
                        placeholder="Task title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        style={inputStyle(inputBg, text, border)}
                    />

                    <input
                        placeholder="Category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        style={inputStyle(inputBg, text, border)}
                    />

                    <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        style={inputStyle(inputBg, text, border)}
                    />

                    <button onClick={addTask} style={primaryButtonStyle()}>
                        Add Task
                    </button>
                </div>

                <div
                    style={{
                        background: card,
                        padding: "15px",
                        borderRadius: "10px",
                        marginBottom: "20px",
                        border: `1px solid ${border}`
                    }}
                >
                    <h3>Search & Filter</h3>

                    <input
                        placeholder="Search by title..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={inputStyle(inputBg, text, border)}
                    />

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                            gap: "10px"
                        }}
                    >
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            style={inputStyle(inputBg, text, border)}
                        >
                            <option value="all">All Tasks</option>
                            <option value="completed">Completed</option>
                            <option value="pending">Pending</option>
                        </select>

                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            style={inputStyle(inputBg, text, border)}
                        >
                            <option value="all">All Categories</option>
                            {uniqueCategories.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {editId && (
                    <div
                        style={{
                            background: card,
                            padding: "15px",
                            borderRadius: "10px",
                            marginBottom: "20px",
                            border: `1px solid ${border}`
                        }}
                    >
                        <h3>Edit Task</h3>

                        <input
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            placeholder="Task title"
                            style={inputStyle(inputBg, text, border)}
                        />

                        <input
                            value={editCategory}
                            onChange={(e) => setEditCategory(e.target.value)}
                            placeholder="Category"
                            style={inputStyle(inputBg, text, border)}
                        />

                        <input
                            type="date"
                            value={editDueDate}
                            onChange={(e) => setEditDueDate(e.target.value)}
                            style={inputStyle(inputBg, text, border)}
                        />

                        <div style={{ display: "flex", gap: "10px" }}>
                            <button onClick={updateTask} style={successButtonStyle()}>
                                Save
                            </button>

                            <button
                                onClick={() => {
                                    setEditId(null);
                                    setEditTitle("");
                                    setEditCategory("");
                                    setEditDueDate("");
                                }}
                                style={secondaryButtonStyle()}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                <div style={{ marginBottom: "10px", color: muted }}>
                    Showing {filteredTasks.length} of {tasks.length} tasks
                </div>

                {filteredTasks.length === 0 ? (
                    <div
                        style={{
                            background: card,
                            padding: "20px",
                            borderRadius: "10px",
                            border: `1px solid ${border}`,
                            color: muted
                        }}
                    >
                        No tasks found
                    </div>
                ) : (
                    filteredTasks.map((task) => (
                        <div
                            key={task.id}
                            style={{
                                background: card,
                                padding: "15px",
                                marginBottom: "10px",
                                borderRadius: "10px",
                                border: `1px solid ${border}`,
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                                gap: "10px"
                            }}
                        >
                            <div style={{ flex: 1 }}>
                                <div style={{ display: "flex", alignItems: "center" }}>
                                    <input
                                        type="checkbox"
                                        checked={task.isCompleted}
                                        onChange={() => toggleComplete(task)}
                                    />

                                    <span
                                        style={{
                                            marginLeft: "10px",
                                            fontWeight: "bold",
                                            textDecoration: task.isCompleted
                                                ? "line-through"
                                                : "none",
                                            color: task.isCompleted ? muted : text
                                        }}
                                    >
                                        {task.title}
                                    </span>
                                </div>

                                <div
                                    style={{
                                        marginTop: "6px",
                                        fontSize: "13px",
                                        color: muted
                                    }}
                                >
                                    Category: {task.category || "No category"} | Due:{" "}
                                    {formatDateForDisplay(task.dueDate)}
                                </div>
                            </div>

                            <div style={{ display: "flex", gap: "8px" }}>
                                <button
                                    onClick={() => startEdit(task)}
                                    style={secondaryButtonStyle()}
                                >
                                    Edit
                                </button>

                                <button
                                    onClick={() => deleteTask(task.id)}
                                    style={dangerButtonStyle()}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

function StatBox({ title, value, darkMode }) {
    return (
        <div
            style={{
                background: darkMode ? "#1e293b" : "#ffffff",
                color: darkMode ? "white" : "#111827",
                padding: "16px",
                borderRadius: "10px",
                textAlign: "center",
                border: darkMode ? "1px solid #334155" : "1px solid #e5e7eb"
            }}
        >
            <h4 style={{ margin: "0 0 10px 0" }}>{title}</h4>
            <h2 style={{ margin: 0 }}>{value}</h2>
        </div>
    );
}

function inputStyle(bg, color, border) {
    return {
        width: "100%",
        marginBottom: "10px",
        padding: "10px",
        borderRadius: "8px",
        border: `1px solid ${border}`,
        background: bg,
        color: color,
        boxSizing: "border-box"
    };
}

function primaryButtonStyle() {
    return {
        background: "#2563eb",
        color: "white",
        padding: "10px 14px",
        borderRadius: "8px",
        border: "none",
        cursor: "pointer"
    };
}

function successButtonStyle() {
    return {
        background: "#16a34a",
        color: "white",
        padding: "10px 14px",
        borderRadius: "8px",
        border: "none",
        cursor: "pointer"
    };
}

function secondaryButtonStyle() {
    return {
        background: "#e5e7eb",
        color: "#111827",
        padding: "10px 14px",
        borderRadius: "8px",
        border: "none",
        cursor: "pointer"
    };
}

function dangerButtonStyle() {
    return {
        background: "#dc2626",
        color: "white",
        padding: "10px 14px",
        borderRadius: "8px",
        border: "none",
        cursor: "pointer"
    };
}

function formatDateForInput(dateValue) {
    if (!dateValue) return "";

    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return "";

    return date.toISOString().split("T")[0];
}

function formatDateForDisplay(dateValue) {
    if (!dateValue) return "No date";

    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return "No date";

    return date.toLocaleDateString();
}