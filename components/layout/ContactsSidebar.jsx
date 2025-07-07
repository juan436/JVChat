import React, { useState } from 'react';
import { Search } from 'lucide-react';
import AvatarWrapper from '../AvatarWrapper';

const ContactsSidebar = ({ contacts, handleUserSelect, avatarMap, lastMessages, unreadMessages, isChatOpen }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredContacts = contacts.filter(contact =>
    contact.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Eliminar duplicados antes de renderizar para evitar errores de keys
  const uniqueContacts = filteredContacts.filter((contact, index, self) =>
    index === self.findIndex(c => c._id === contact._id)
  );

  const truncateText = (text, maxLength) => {
    return text?.length > maxLength ? text.substring(0, maxLength) + '...' : text || '';
  };

  // Función para formatear la hora del último mensaje
  const formatMessageTime = (dateString) => {
    if (!dateString) return '';

    const date = new Date(dateString);
    const now = new Date();

    // Si es hoy, mostrar solo la hora
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    // Si es ayer
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Ayer';
    }

    // Si es esta semana, mostrar el día
    const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    if (now - date < 7 * 24 * 60 * 60 * 1000) {
      return daysOfWeek[date.getDay()];
    }

    // Si es más antiguo, mostrar la fecha
    return date.toLocaleDateString();
  };

  return (
    <div className="w-80 bg-slate-800/80 backdrop-blur-xl border-r border-slate-700/30 flex flex-col">
      {/* Header del sidebar */}
      <div className="p-6 border-b border-slate-700/30 bg-gradient-to-r from-slate-800/50 to-slate-700/30">
        <h1 className="text-2xl font-bold text-white mb-4 tracking-tight">Mensajes</h1>

        {/* Barra de búsqueda */}
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
          <input
            type="text"
            placeholder="Buscar..."
            className="w-full pl-12 pr-4 py-3 bg-slate-700/50 backdrop-blur-sm text-white placeholder-slate-400 rounded-2xl border border-slate-600/30 outline-none focus:bg-slate-600/50 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
            onChange={(e) => setSearchTerm(e.target.value)}
            value={searchTerm}
          />
        </div>
      </div>

      {/* Lista de conversaciones */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent">
        {uniqueContacts.map(contact => {
          const avatarData = avatarMap[contact.avatar];
          const lastMessage = lastMessages.find(msg => msg.users?.includes(contact._id));
          const lastMessageText = lastMessage ? truncateText(lastMessage.message?.text, 30) : 'No hay mensajes';
          const lastMessageTime = lastMessage ? formatMessageTime(lastMessage.createdAt) : '';
          const unreadCount = unreadMessages[contact._id] || 0;
          const isActive = isChatOpen && contact._id === contact._id; // Esto debe ser reemplazado por la lógica correcta para determinar si el contacto está activo

          return (
            <div
              key={contact._id}
              className={`flex items-center p-4 mx-2 my-1 rounded-2xl cursor-pointer transition-all duration-300 ${isActive
                  ? "bg-gradient-to-r from-blue-600/20 to-blue-500/10 border border-blue-500/30 shadow-lg shadow-blue-500/10"
                  : "hover:bg-slate-700/30 hover:backdrop-blur-sm"
                }`}
              onClick={() => handleUserSelect(contact)}
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl overflow-hidden ring-2 ring-slate-600/50 hover:ring-blue-500/50 transition-all duration-300">
                  <AvatarWrapper
                    style={{ width: '100%', height: '100%' }}
                    avatarStyle='Transparent'
                    {...avatarData}
                  />
                </div>
                {contact.isConnected && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-800 shadow-lg"></div>
                )}
              </div>

              <div className="ml-4 flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className={`font-semibold truncate ${isActive ? "text-white" : "text-slate-200"}`}>
                    {contact.username}
                  </h3>
                  <div className="relative">
                    <span className="text-xs text-slate-400 font-medium">{lastMessageTime}</span>
                    {unreadCount > 0 && (
                      <div className="absolute -bottom-4 right-0 bg-blue-500 text-white text-xs rounded-full px-2 py-0.5 flex items-center justify-center min-w-[20px] transform translate-y-1">
                        {unreadCount}
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-sm text-slate-400 truncate leading-relaxed">{lastMessageText}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ContactsSidebar;