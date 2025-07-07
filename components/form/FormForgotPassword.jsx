"use client"

import React, { useState } from 'react';
import Logo from '@/components/logo/Logo';

export const FormForgotPassword = ({ reactHookForm, onSubmit }) => {
    const { register, handleSubmit } = reactHookForm;
    const [emailSent, setEmailSent] = useState(false);
    const [email, setEmail] = useState('');

    const handleFormSubmit = (data) => {
        setEmail(data.email);
        onSubmit(data);
        setEmailSent(true);
    };

    const onBackToLogin = () => {
        window.location.href = '/auth/login';
    };

    const onBackToLanding = () => {
        window.location.href = '/';
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl shadow-black/20">
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-6">
                            <Logo size="md" clickable onClick={onBackToLanding} showText={true} />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">
                            {emailSent ? 'Email Enviado' : 'Recuperar Contraseña'}
                        </h1>
                    </div>

                    {!emailSent ? (
                        <>
                            <p className="text-slate-400 text-center mb-6">
                                Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
                            </p>
                            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
                                <div>
                                    <input
                                        type="email"
                                        placeholder="Email"
                                        {...register('email', { required: true })}
                                        className="w-full px-4 py-4 bg-slate-700/60 text-white placeholder-slate-400 rounded-xl border border-slate-600/30 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/25 flex items-center justify-center"
                                >
                                    Enviar Email
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="text-center">
                            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-6">
                                <p className="text-green-400">
                                    Hemos enviado un correo a <span className="font-semibold">{email}</span> con instrucciones para restablecer tu contraseña.
                                </p>
                            </div>
                            <button
                                onClick={() => setEmailSent(false)}
                                className="w-full py-4 mb-4 bg-slate-700/60 hover:bg-slate-700/80 text-white font-semibold rounded-xl transition-all duration-300"
                            >
                                Enviar a otro email
                            </button>
                        </div>
                    )}

                    <div className="text-center mt-6">
                        <button 
                            onClick={onBackToLogin} 
                            className="text-slate-400 hover:text-slate-300 transition-colors text-sm"
                        >
                            Volver al inicio de sesión
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
