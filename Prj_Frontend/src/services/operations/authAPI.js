import { apiConnector } from "../apiConnector"
import axios from "axios";
const BACKEND_API = import.meta.env.VITE_BACKEND_API || "http://localhost:8080/api";


export const register = async (username, email, password, role) => {
    try{
        const response = await axios.post(`${BACKEND_API}/auth/register`, {
            username: username,
            email: email,
            password: password,
            role: role
        });

        // ;
        return response;
    }catch(error){
        throw error;
    }
}

export const login = async (usernameOrEmail, password) => {
    try{
        const response = await apiConnector("POST", `${BACKEND_API}/auth/login`, {
            usernameOrEmail: usernameOrEmail,
            password: password
        });
        // ;
        return response;
    }catch(error){
        throw error;
    }
}