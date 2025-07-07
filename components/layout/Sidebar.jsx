import React, { useState, useEffect, useRef } from 'react';
import AvatarWrapper from '../AvatarWrapper';
import { MessageCircle, Users, Bell, LogOut } from 'lucide-react';
import AddContactModal from '../modals/AddContactModal';
import AddNotificationModal from '../modals/AddNotificationModal';

const Sidebar = ({ userInfo, handleLogout, avatarMap }) => {

  const { avatar, userId, username, socketRef, friendRequests, setFriendRequests, Allusers, setConfirmedFriends } = userInfo;

  const [selected, setSelected] = useState('chats');
  const [showUsername, setShowUsername] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const menuRef = useRef(null);
  const usernameTimeoutRef = useRef(null);

  const handleAvatarClick = () => {
    // Limpiar cualquier timeout existente
    if (usernameTimeoutRef.current) {
      clearTimeout(usernameTimeoutRef.current);
    }

    // Mostrar el nombre
    setShowUsername(true);

    // Configurar un timeout para ocultar el nombre después de 2 segundos
    usernameTimeoutRef.current = setTimeout(() => {
      setShowUsername(false);
    }, 2000);
  };

  useEffect(() => {
    // Limpiar el timeout cuando el componente se desmonte
    return () => {
      if (usernameTimeoutRef.current) {
        clearTimeout(usernameTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="w-16 bg-gradient-to-b from-slate-800 to-slate-900 border-r border-slate-700/50 flex flex-col items-center py-6 space-y-4">
      {/* Botón de chat */}
      <div
        className={`w-10 h-10 ${selected === 'chats' ? 'bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg hover:shadow-blue-500/25' : 'bg-slate-700/50 backdrop-blur-sm'} rounded-xl flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-105 group`}
        onClick={() => setSelected('chats')}
      >
        <MessageCircle className={`w-5 h-5 ${selected === 'chats' ? 'text-white' : 'text-slate-400 group-hover:text-white transition-colors'}`} />
      </div>

      {/* Botón de agregar contactos */}
      <div
        className="w-10 h-10 bg-slate-700/50 backdrop-blur-sm rounded-xl flex items-center justify-center cursor-pointer hover:bg-slate-600/50 transition-all duration-300 hover:scale-105 group"
        onClick={() => setShowAddModal(true)}
      >
        <Users className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
      </div>

      {/* Botón de notificaciones */}
      <div
        className="w-10 h-10 bg-slate-700/50 backdrop-blur-sm rounded-xl flex items-center justify-center cursor-pointer hover:bg-slate-600/50 transition-all duration-300 hover:scale-105 group relative"
        onClick={() => setShowNotificationsModal(true)}
      >
        <Bell className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
        {friendRequests.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center">
            {friendRequests.length}
          </span>
        )}
      </div>

      <div className="flex-1"></div>

      {/* Avatar del usuario con tooltip del nombre */}
      <div className="relative">
        {avatar && (
          <div
            className="w-10 h-10 rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-300 ring-2 ring-slate-600 hover:ring-blue-500"
            onClick={handleAvatarClick}
            ref={menuRef}
          >
            <AvatarWrapper
              style={{ width: '100%', height: '100%' }}
              avatarStyle='Transparent'
              {...avatarMap[avatar]}
            />
          </div>
        )}

        {/* Tooltip del nombre separado del avatar para mejor posicionamiento */}
        {showUsername && (
          <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white px-3 py-2 rounded-lg shadow-lg z-50 whitespace-nowrap">
            <span className="text-sm font-medium">{username}</span>
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
          </div>
        )}
      </div>

      {/* Botón de cerrar sesión */}
      <div
        className="w-10 h-10 bg-slate-700/50 backdrop-blur-sm rounded-xl flex items-center justify-center cursor-pointer hover:bg-red-500/20 transition-all duration-300 hover:scale-105 group"
        onClick={handleLogout}
      >
        <LogOut className="w-5 h-5 text-slate-400 group-hover:text-red-400 transition-colors" />
      </div>
      {/* Modales */}
      <AddContactModal
        isOpen={showAddModal}
        userId={userId}
        Allusers={Allusers}
        onClose={() => setShowAddModal(false)}
        avatarMap={avatarMap}
        socketRef={socketRef}
      />

      <AddNotificationModal
        isOpen={showNotificationsModal}
        onClose={() => setShowNotificationsModal(false)}
        requests={friendRequests}
        avatarMap={avatarMap}
        setFriendRequests={setFriendRequests}
        Allusers={Allusers}
        userId={userId}
        setConfirmedFriends={setConfirmedFriends}
        socketRef={socketRef}
      />
    </div>
  );
};

export default Sidebar;