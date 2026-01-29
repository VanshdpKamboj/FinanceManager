import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../services/operations/authAPI";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";

function Register() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        role: "Normal_user"
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [focusedField, setFocusedField] = useState(null);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await register(
                formData.username,
                formData.email,
                formData.password,
                formData.role
            );

            // ;
            if (response) {
                toast.success("Registration successful! Please login.");
                navigate("/login");
            } else {
                setError(response.message || "Registration failed");
            }
        } catch (error) {
            setError(error.response?.data?.message || "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute top-40 left-40 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
            </div>

            <div className="max-w-md w-full space-y-8 relative z-10">
                {/* Card with glass morphism effect */}
                <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-8 sm:p-10 border border-white/20 transform transition-all duration-300 hover:shadow-2xl">
                    {/* Header */}
                    <div className="text-center space-y-3 mb-8 animate-fade-in-up">
                        <div className="flex justify-center mb-4">
                            <div className="relative">
                                <div className="w-20 h-20 bg-gradient-to-br from-emerald-700 to-emerald-900 rounded-3xl flex items-center justify-center shadow-2xl transform transition-transform hover:scale-110 hover:rotate-3 duration-300">
                                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-full border-2 border-white flex items-center justify-center">
                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-700 to-emerald-900 bg-clip-text text-transparent mb-1">
                                Personal Finance Manager
                            </h1>
                            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                                Create account
                            </h2>
                        </div>
                        <p className="text-sm text-gray-600">
                            Join us and start managing your finances
                        </p>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {/* Error message */}
                        {error && (
                            <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm animate-shake">
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                    {error}
                                </div>
                            </div>
                        )}

                        {/* Form inputs */}
                        <div className="space-y-5">
                            {/* Username input */}
                            <div className="relative group">
                                <label 
                                    htmlFor="username" 
                                    className={`absolute left-4 transition-all duration-300 pointer-events-none ${
                                        focusedField === 'username' || formData.username 
                                            ? '-top-2.5 text-xs bg-white px-2 text-emerald-700 font-medium' 
                                            : 'top-3.5 text-gray-500'
                                    }`}
                                >
                                    Username
                                </label>
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    required
                                    className="w-full px-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder-transparent focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all duration-300"
                                    placeholder="Username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    onFocus={() => setFocusedField('username')}
                                    onBlur={() => setFocusedField(null)}
                                />
                                <div className="absolute right-4 top-3.5 text-gray-400 transition-colors duration-300 group-focus-within:text-emerald-600">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                            </div>

                            {/* Email input */}
                            <div className="relative group">
                                <label 
                                    htmlFor="email" 
                                    className={`absolute left-4 transition-all duration-300 pointer-events-none ${
                                        focusedField === 'email' || formData.email 
                                            ? '-top-2.5 text-xs bg-white px-2 text-emerald-700 font-medium' 
                                            : 'top-3.5 text-gray-500'
                                    }`}
                                >
                                    Email address
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="w-full px-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder-transparent focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 transition-all duration-300"
                                    placeholder="Email address"
                                    value={formData.email}
                                    onChange={handleChange}
                                    onFocus={() => setFocusedField('email')}
                                    onBlur={() => setFocusedField(null)}
                                />
                                <div className="absolute right-4 top-3.5 text-gray-400 transition-colors duration-300 group-focus-within:text-emerald-600">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                    </svg>
                                </div>
                            </div>

                            {/* Password input */}
                            <div className="relative group">
                                <label 
                                    htmlFor="password" 
                                    className={`absolute left-4 transition-all duration-300 pointer-events-none ${
                                        focusedField === 'password' || formData.password 
                                            ? '-top-2.5 text-xs bg-white px-2 text-emerald-700 font-medium' 
                                            : 'top-3.5 text-gray-500'
                                    }`}
                                >
                                    Password
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    className="w-full px-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder-transparent focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 transition-all duration-300"
                                    placeholder="Password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    onFocus={() => setFocusedField('password')}
                                    onBlur={() => setFocusedField(null)}
                                />
                                <div className="absolute right-4 top-3.5 text-gray-400 transition-colors duration-300 group-focus-within:text-emerald-600">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                            </div>

                            {/* Role select */}
                            <div className="relative group">
                                <label 
                                    htmlFor="role" 
                                    className={`absolute left-4 transition-all duration-300 pointer-events-none ${
                                        focusedField === 'role' || formData.role 
                                            ? '-top-2.5 text-xs bg-white px-2 text-emerald-700 font-medium z-10' 
                                            : 'top-3.5 text-gray-500'
                                    }`}
                                >
                                    User Type
                                </label>
                                <select
                                    id="role"
                                    name="role"
                                    required
                                    className="w-full px-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 transition-all duration-300 appearance-none cursor-pointer"
                                    value={formData.role}
                                    onChange={handleChange}
                                    onFocus={() => setFocusedField('role')}
                                    onBlur={() => setFocusedField(null)}
                                >
                                    <option value="Normal_user">Normal User</option>
                                    <option value="Maker">Maker</option>
                                    <option value="Checker">Checker</option>
                                </select>
                                <div className="absolute right-4 top-3.5 text-gray-400 transition-colors duration-300 group-focus-within:text-emerald-600 pointer-events-none">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Submit button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-700 to-emerald-900 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-emerald-700/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300 transform"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Creating account...
                                </span>
                            ) : (
                                "Create account"
                            )}
                        </button>

                        {/* Sign in link */}
                        <div className="text-center pt-4">
                            <p className="text-sm text-gray-600">
                                Already have an account?{" "}
                                <button
                                    type="button"
                                    onClick={() => navigate("/login")}
                                    className="font-semibold text-emerald-700 hover:text-emerald-800 transition-colors duration-200 hover:underline"
                                >
                                    Sign in
                                </button>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Register;
