'use client'
import React, { useState, useEffect } from 'react';
import jwt from 'jsonwebtoken';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, Globe, Zap, Sparkles, ArrowRight, Users, Star } from 'lucide-react';
import Logo from '@/components/logo/Logo';

function HomePage() {
  const [avatarId, setAvatarId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const router = useRouter();

  useEffect(() => {
    document.title = "JVChat";
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const decoded = jwt.decode(token);
        setAvatarId(decoded.avatarId);
        router.replace('/dashboard');
      } catch (error) {
        console.error('Error al decodificar el token:', error);
      }
    }
    setLoading(false);
  }, [router]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const features = [
    { icon: Shield, label: "Seguro", color: "text-green-400" },
    { icon: Globe, label: "Global", color: "text-blue-400" },
    { icon: Sparkles, label: "Entretenido", color: "text-purple-400" },
    { icon: Zap, label: "Instantáneo", color: "text-yellow-400" },
  ];

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen bg-slate-900">
      <div className="flex space-x-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.2}s` }}
          ></div>
        ))}
      </div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div
          className="absolute w-96 h-96 bg-blue-500/5 rounded-full blur-3xl transition-all duration-1000 ease-out"
          style={{
            left: mousePosition.x * 0.02,
            top: mousePosition.y * 0.02,
          }}
        />
        <div
          className="absolute w-80 h-80 bg-purple-500/5 rounded-full blur-3xl transition-all duration-1000 ease-out delay-100"
          style={{
            right: mousePosition.x * 0.01,
            bottom: mousePosition.y * 0.01,
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-8">
        <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Section - Hero */}
          <div className="text-center lg:text-left space-y-8">
            {/* Logo */}
            <div className="flex justify-center lg:justify-start mb-8">
              <Logo size="lg" showText={true} />
            </div>

            {/* Main Heading */}
            <div className="space-y-6">
              <h2 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
                Bienvenidos a
                <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  JVChat
                </span>
              </h2>
              <p className="text-xl text-slate-300 leading-relaxed max-w-2xl">
                Tu plataforma web confiable para chatear con tus amigos y familiares en tiempo real desde cualquier
                parte del mundo.
              </p>
            </div>

            {/* Features */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-6 pt-8">
              {features.map((feature, index) => (
                <div
                  key={feature.label}
                  className="flex items-center space-x-2 bg-slate-800/50 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-700/50 hover:border-slate-600 hover:bg-slate-700/50 transition-all duration-300 hover:scale-105 group cursor-pointer"
                >
                  <feature.icon className={`w-4 h-4 ${feature.color} group-hover:scale-110 transition-transform`} />
                  <span className="text-slate-300 text-sm font-medium">{feature.label}</span>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-8">
              {[
                { number: "10M+", label: "Usuarios" },
                { number: "50+", label: "Países" },
                { number: "99.9%", label: "Uptime" },
                { number: "24/7", label: "Soporte" },
              ].map((stat, index) => (
                <div key={index} className="text-center group hover:scale-105 transition-transform duration-300">
                  <div className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">
                    {stat.number}
                  </div>
                  <div className="text-slate-400 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Section - Auth Options */}
          <div className="flex justify-center">
            <div className="w-full max-w-md">
              <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl shadow-black/20 hover:shadow-black/40 transition-all duration-500">
                {/* Form Header */}
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-800 to-blue-900 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-800/25 hover:scale-110 transition-transform duration-300">
                    <Users className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Únete a JVChat hoy</h3>
                  <p className="text-slate-400">Comienza a chatear con tus amigos ahora</p>
                </div>

                {/* Auth Buttons */}
                <div className="space-y-4">
                  {/* Crear Cuenta Button */}
                  <Link
                    href="/auth/signup"
                    className="w-full group relative px-6 py-4 bg-gradient-to-r from-blue-800 to-blue-900 hover:from-blue-900 hover:to-slate-800 text-white font-bold rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-800/25 flex items-center justify-center"
                  >
                    Crear cuenta nueva
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  {/* Divider */}
                  <div className="flex items-center my-6">
                    <div className="flex-1 border-t border-slate-600/50"></div>
                    <span className="px-4 text-slate-400 text-sm">o</span>
                    <div className="flex-1 border-t border-slate-600/50"></div>
                  </div>

                  {/* Iniciar Sesión Button */}
                  <Link
                    href="/auth/login"
                    className="w-full px-6 py-4 bg-slate-700/60 hover:bg-slate-600/70 text-white font-semibold rounded-xl border border-slate-600/40 hover:border-slate-500/60 transition-all duration-300 hover:scale-[1.02] group flex items-center justify-center"
                  >
                    ¿Ya tienes cuenta? Iniciar Sesión
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>

                {/* Trust Indicators */}
                <div className="flex items-center justify-center mt-8 space-x-6 text-slate-400 text-xs">
                  <div className="flex items-center group hover:text-green-400 transition-colors cursor-pointer">
                    <Shield className="w-3 h-3 mr-1 group-hover:scale-110 transition-transform" />
                    Seguro
                  </div>
                  <div className="flex items-center group hover:text-yellow-400 transition-colors cursor-pointer">
                    <Star className="w-3 h-3 mr-1 group-hover:scale-110 transition-transform" />
                    Confiable
                  </div>
                  <div className="flex items-center group hover:text-blue-400 transition-colors cursor-pointer">
                    <Zap className="w-3 h-3 mr-1 group-hover:scale-110 transition-transform" />
                    Rápido
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-20 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
      <div className="absolute top-40 right-32 w-1 h-1 bg-purple-400 rounded-full animate-pulse delay-1000"></div>
      <div className="absolute bottom-32 left-32 w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse delay-2000"></div>
      <div className="absolute bottom-20 right-20 w-1 h-1 bg-yellow-400 rounded-full animate-pulse delay-500"></div>
    </div>
  );
}

export default HomePage;