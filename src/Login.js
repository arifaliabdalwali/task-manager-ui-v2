import { useState, useEffect } from "react";
import API from "./api";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (token) {
            navigate("/tasks");
        }
    }, [navigate]);

    const login = async () => {
        try {
            const res = await API.post("/auth/login", {
                email: email,
                password: password
            });

            console.log("LOGIN SUCCESS:", res.data);

            localStorage.setItem("token", res.data.token);

            navigate("/tasks");
        } catch (error) {
            console.log("LOGIN ERROR:", error);
            alert("Login failed");
        }
    };

    return (
        <div>
            <h2>Login</h2>

            <input
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />

            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            <button onClick={login}>Login</button>

            <p style={{ marginTop: "15px" }}>
                Don't have account?
                <button onClick={() => navigate("/register")}>
                    Register
                </button>
            </p>
        </div>
    );
}