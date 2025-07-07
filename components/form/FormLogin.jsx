"use client"

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Logo from '@/components/logo/Logo';

const FormLogin = ({ reactHookForm, onSubmit }) => {
    const { register, handleSubmit } = reactHookForm;
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const onBackToLanding = () => {
        window.location.href = '/';
    };

    const onSwitchToRegister = () => {
        window.location.href = '/auth/signup';
    };

    const onSwitchToForgot = () => {
        window.location.href = '/auth/forgot-password';
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl shadow-black/20">
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-6">
                            <Logo size="md" clickable onClick={onBackToLanding} showText={true} />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">Iniciar Sesión</h1>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div>
                            <input
                                type="email"
                                placeholder="Email"
                                {...register('email', {
                                    required: true,
                                    onChange: (e) => handleInputChange("email", e.target.value)
                                })}
                                className="w-full px-4 py-4 bg-slate-700/60 text-white placeholder-slate-400 rounded-xl border border-slate-600/30 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                                required
                            />
                        </div>

                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Contraseña"
                                {...register('password', {
                                    required: true,
                                    onChange: (e) => handleInputChange("password", e.target.value)
                                })}
                                className="w-full px-4 py-4 pr-12 bg-slate-700/60 text-white placeholder-slate-400 rounded-xl border border-slate-600/30 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/25 flex items-center justify-center"
                        >
                            Ingresar
                        </button>
                    </form>

                    <div className="text-center mt-6 space-y-3">
                        <button onClick={onSwitchToRegister} className="text-blue-400 hover:text-blue-300 transition-colors text-sm">
                            ¿No tienes una cuenta? Regístrate
                        </button>
                        <br />
                        <button onClick={onSwitchToForgot} className="text-slate-400 hover:text-slate-300 transition-colors text-sm">
                            ¿Olvidaste tu contraseña?
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FormLogin;