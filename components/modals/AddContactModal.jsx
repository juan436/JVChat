import React, { useState, useRef, useEffect } from 'react';
import AvatarWrapper from '../AvatarWrapper';
import { asApi } from '@/apiAxios';
import { Search, X, Users } from 'lucide-react';

const AddContactModal = ({ isOpen, userId, Allusers, onClose, avatarMap, socketRef }) => {
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value) {
      const filteredUsers = Allusers
        .filter(user => user.username.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 5); // Limita a 5 sugerencias
      setSuggestions(filteredUsers);
    } else {
      setSuggestions([]);
    }
  };

  const sendFriendRequest = async (receiverId) => {
    try {
      const response = await asApi.post('/friends', {
        senderId: userId,
        receiverId: receiverId,
      });

      if (response.status === 201) {
        setSuccessMessage('Solicitud enviada');
        setTimeout(() => setSuccessMessage(''), 3000);
        if (socketRef.current) {
          socketRef.current.emit('friendRequestSent', { receiverId, senderId: userId });
        }
      } else {
        console.error('Error en la respuesta de la API:', response);
      }
    } catch (error) {
      console.error('Error al enviar solicitud de amistad:', error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedUser) {
      sendFriendRequest(selectedUser._id);
      setSelectedUser(null);
    } else {
      console.log('No hay usuario seleccionado');
    }
  };

  const handleRemoveUser = () => {
    setSelectedUser(null);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div 
        ref={modalRef} 
        className="bg-slate-800/90 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 max-w-md w-full shadow-2xl shadow-black/50"
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/25">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Agregar Usuario</h2>
          <p className="text-slate-400">Busca y conecta con usuarios</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300 mb-2">Buscar usuario</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={handleInputChange}
                className="w-full pl-12 pr-4 py-3 bg-slate-700/50 backdrop-blur-sm text-white placeholder-slate-400 rounded-2xl border border-slate-600/30 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                placeholder="Escribe el nombre del usuario..."
              />
            </div>

            {/* Lista de usuarios filtrados */}
            {searchTerm && suggestions.length > 0 && (
              <div className="absolute mt-2 bg-slate-700/90 backdrop-blur-xl border border-slate-600/30 rounded-2xl shadow-2xl max-h-48 overflow-y-auto z-10 w-[calc(100%-4rem)]">
                {suggestions.map((user) => (
                  <div
                    key={user._id}
                    onClick={() => {
                      setSelectedUser(user);
                      setSearchTerm('');
                      setSuggestions([]);
                    }}
                    className="flex items-center p-3 hover:bg-slate-600/50 cursor-pointer transition-all duration-300 first:rounded-t-2xl last:rounded-b-2xl"
                  >
                    <div className="w-8 h-8 rounded-xl overflow-hidden ring-2 ring-slate-600/50">
                      <AvatarWrapper
                        style={{ width: '100%', height: '100%' }}
                        avatarStyle='Transparent'
                        {...avatarMap[user.avatar]}
                      />
                    </div>
                    <span className="ml-3 text-white font-medium">{user.username}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Mensaje cuando no hay resultados */}
            {searchTerm && suggestions.length === 0 && (
              <div className="mt-2 bg-slate-700/90 backdrop-blur-xl border border-slate-600/30 rounded-2xl shadow-2xl p-4 text-center">
                <p className="text-slate-400 text-sm">No se encontraron usuarios</p>
              </div>
            )}
          </div>

          {/* Usuario seleccionado */}
          {selectedUser && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">Usuario seleccionado</label>
              <div className="flex items-center bg-slate-700/50 backdrop-blur-sm rounded-xl px-3 py-2 border border-slate-600/30">
                <div className="w-8 h-8 rounded-xl overflow-hidden ring-1 ring-slate-600/50">
                  <AvatarWrapper
                    style={{ width: '100%', height: '100%' }}
                    avatarStyle='Transparent'
                    {...avatarMap[selectedUser.avatar]}
                  />
                </div>
                <span className="ml-3 text-white text-sm font-medium">{selectedUser.username}</span>
                <button
                  type="button"
                  onClick={handleRemoveUser}
                  className="ml-auto p-1 text-slate-400 hover:text-white hover:bg-slate-600/50 rounded-lg transition-all duration-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Mensaje de éxito */}
          {successMessage && (
            <div className="mt-4 p-3 bg-green-500/20 border border-green-500/30 rounded-2xl text-green-400 text-center">
              {successMessage}
            </div>
          )}

          <div className="flex space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-slate-700/50 hover:bg-slate-600/50 text-white font-semibold rounded-2xl border border-slate-600/50 hover:border-slate-500/50 transition-all duration-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!selectedUser}
              className={`flex-1 px-6 py-3 font-semibold rounded-2xl transition-all duration-300 ${
                selectedUser
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/25"
                  : "bg-slate-600/50 text-slate-400 cursor-not-allowed"
              }`}
            >
              Enviar Solicitud
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddContactModal;