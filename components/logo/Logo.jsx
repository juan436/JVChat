"use client"

import { MessageCircle, Zap } from "lucide-react"

/**
 * Componente Logo JVCHAT
 * @param {Object} props
 * @param {'sm' | 'md' | 'lg'} [props.size='md']
 * @param {boolean} [props.clickable=false]
 * @param {Function} [props.onClick]
 * @param {boolean} [props.showText=true]
 */
export default function Logo({ size = "md", clickable = false, onClick, showText = true }) {
  const sizeClasses = {
    sm: {
      container: "w-10 h-10",
      icon: "w-5 h-5",
      text: "text-lg",
      subtitle: "text-xs",
    },
    md: {
      container: "w-16 h-16",
      icon: "w-8 h-8",
      text: "text-3xl",
      subtitle: "text-sm",
    },
    lg: {
      container: "w-20 h-20",
      icon: "w-10 h-10",
      text: "text-4xl",
      subtitle: "text-base",
    },
  }

  const currentSize = sizeClasses[size]

  const logoContent = (
    <div className="flex items-center space-x-4">
      {/* Logo Icon */}
      <div
        className={`${currentSize.container} bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/30 relative overflow-hidden group ${
          clickable ? "hover:scale-110 cursor-pointer" : ""
        } transition-all duration-300`}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-transparent"></div>
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-300/20 rounded-full blur-sm"></div>
        <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-blue-800/30 rounded-full blur-sm"></div>

        {/* Main Icon */}
        <div className="relative z-10 flex items-center justify-center">
          <MessageCircle className={`${currentSize.icon} text-white drop-shadow-lg`} />
          {/* Small accent icon */}
          <Zap className="w-3 h-3 text-blue-200 absolute -top-1 -right-1 opacity-80" />
        </div>

        {/* Shine effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      </div>

      {/* Logo Text */}
      {showText && (
        <div className="flex flex-col">
          <h1 className={`${currentSize.text} font-bold text-white tracking-tight`}>
            <span className="bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">JV</span>
            <span className="bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">Chat</span>
          </h1>
          <p className={`${currentSize.subtitle} font-medium text-blue-400/80 -mt-1`}>Conecta sin límites</p>
        </div>
      )}
    </div>
  )

  if (clickable && onClick) {
    return (
      <button
        onClick={onClick}
        className="group transition-all duration-300 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-slate-900 rounded-3xl"
      >
        {logoContent}
      </button>
    )
  }

  return logoContent
}
