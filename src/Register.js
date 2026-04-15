import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "./api";

export default function Register() {

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    const register = async () => {
        try {
            await API.post("/auth/register", {
                name,
                email,
                password
            });

            alert("Account created successfully");

            navigate("/");

        } catch (error) {
            console.log(error);
            alert("Register failed");
        }
    };

    return (
        <div style={{
            maxWidth: "400px",
            margin: "auto",
            padding: "30px"
        }}>

            <h2>Create Account</h2>

            <input
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ width: "100%", marginBottom: "10px" }}
            />

            <input
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: "100%", marginBottom: "10px" }}
            />

            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: "100%", marginBottom: "10px" }}
            />

            <button
                onClick={register}
                style={{ width: "100%" }}
            >
                Register
            </button>

        </div>
    );
}