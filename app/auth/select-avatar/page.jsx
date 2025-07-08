"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Avatar from 'avataaars';
import asApi from '@/apiAxios/asApi';
import avatars from '@/public/data/avatars.json';
export const dynamic = "force-dynamic";

const SelectAvatar = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [selectedAvatar, setSelectedAvatar] = useState(null);
    const [userId, setUserId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const id = searchParams.get('userId');
        if (id) {
            setUserId(id);
        } else {
            console.error('User ID no encontrado');
        }
    }, [searchParams]);

    const handleSelect = async (avatar) => {
        if (!userId) {
            console.error('User ID no disponible');
            return;
        }

        setSelectedAvatar(avatar);
        setLoading(true);

        try {
            const response = await asApi.post('/auth/select-avatar', { userId, avatarId: avatar.id });
            setSuccess(true);
            setTimeout(() => {
                router.replace('/');
            }, 6000);
        } catch (error) {
            console.error('Error al actualizar el avatar:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col justify-center items-center p-4 relative overflow-hidden">
            {/* Efecto de partículas de fondo */}
            <div className="absolute inset-0 overflow-hidden opacity-20">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute rounded-full bg-blue-500/30"
                        style={{
                            width: Math.random() * 300 + 100 + 'px',
                            height: Math.random() * 300 + 100 + 'px',
                            top: Math.random() * 100 + '%',
                            left: Math.random() * 100 + '%',
                            transform: 'translate(-50%, -50%)',
                            filter: 'blur(40px)'
                        }}
                    />
                ))}
            </div>

            {/* Overlay de carga */}
            {loading && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-center z-50">
                    <div className="text-center p-8 bg-slate-800/90 rounded-2xl border border-slate-700/50 shadow-2xl">
                        <div className="relative w-20 h-20 mx-auto mb-6">
                            <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
                            <div className="absolute inset-2 rounded-full border-4 border-blue-400 border-b-transparent animate-spin-reverse"></div>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Personalizando tu experiencia</h3>
                        <p className="text-slate-300">Estamos configurando tu avatar...</p>
                    </div>
                </div>
            )}

            <div className="w-full max-w-4xl bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-slate-700/50 transform transition-all duration-500 hover:shadow-blue-500/20 hover:border-blue-500/30 max-h-[90vh] flex flex-col">
                {/* Header con efecto de gradiente */}
                <div className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-blue-500/10 to-blue-600/20"></div>
                    <div className="relative p-4 sm:p-6 text-center">
                        <div className="inline-flex items-center justify-center bg-gradient-to-r from-blue-500 to-cyan-400 text-transparent bg-clip-text">
                            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <h1 className="text-2xl sm:text-3xl font-extrabold">Elige tu identidad</h1>
                        </div>
                        <p className="mt-2 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto">
                            Selecciona un avatar que refleje tu personalidad
                        </p>
                    </div>
                </div>

                {/* Grid de avatares */}
                <div className="flex-1 overflow-y-auto p-2 sm:p-4">
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3">
                        {avatars.map((avatar, index) => (
                            <div
                                key={index}
                                onClick={() => handleSelect(avatar)}
                                className={`
                            group relative cursor-pointer transition-all duration-300
                            ${selectedAvatar?.id === avatar.id
                                        ? 'transform scale-105'
                                        : 'opacity-90 hover:opacity-100 hover:scale-105'
                                    }
                            flex justify-center
                        `}
                            >
                                <div className="relative w-16 h-16 sm:w-20 sm:h-20">
                                    {selectedAvatar?.id === avatar.id && (
                                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full opacity-70 blur-md group-hover:opacity-100 transition-opacity"></div>
                                    )}
                                    <div className="relative rounded-full p-0.5 bg-gradient-to-br from-slate-700 to-slate-800 group-hover:from-blue-500/30 group-hover:to-cyan-400/30 transition-all duration-300">
                                        <div className="relative rounded-full overflow-hidden border border-transparent group-hover:border-blue-500/50 transition-all duration-300">
                                            <Avatar
                                                style={{ width: '100%', height: '100%' }}
                                                avatarStyle='Circle'
                                                {...avatar}
                                                className="transition-transform duration-300 group-hover:scale-110"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Mensaje de éxito con animación */}
                {success && (
                    <div className="bg-gradient-to-r from-green-600/20 to-green-500/10 border-t border-green-500/30 p-4">
                        <div className="flex items-center justify-center space-x-3 animate-fade-in">
                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center">
                                <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-green-400">¡Perfecto! Tu avatar ha sido actualizado</p>
                                <p className="text-xs text-green-500/80">Los cambios se reflejarán en toda la plataforma, Por favor Inicia sesión</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer con efecto de vidrio */}
                <div className="bg-slate-800/50 border-t border-slate-700/30 p-4 backdrop-blur-sm">
                    <div className="max-w-2xl mx-auto text-center">
                        <p className="text-sm text-slate-400">
                            <span className="text-blue-400 font-medium">Consejo:</span> Puedes mantener el cursor sobre un avatar para verlo en grande
                        </p>
                    </div>
                </div>
            </div>

            {/* Efecto de esquinas decorativas */}
            <div className="absolute top-0 left-0 w-32 h-32 border-t-2 border-l-2 border-blue-500/30 rounded-tl-3xl"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 border-b-2 border-r-2 border-cyan-400/30 rounded-br-3xl"></div>
        </div>
    );
};

export default SelectAvatar;