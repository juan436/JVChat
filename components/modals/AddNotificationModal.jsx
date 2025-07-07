import React, { useRef, useEffect, useState } from 'react';
import AvatarWrapper from '../AvatarWrapper';
import { asApi } from '@/apiAxios';
import { Bell, Check, X } from 'lucide-react';

const AddNotificationModal = ({ isOpen, onClose, requests, avatarMap, setFriendRequests, Allusers, userId, setConfirmedFriends, socketRef }) => {
  const modalRef = useRef(null);
  const [acceptedRequests, setAcceptedRequests] = useState([]);

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

  const formatRequests = (requests) => {
    return requests.map(request => {
      if (!request.receiver) {
        return {
          ...request,
          receiver: userId,
          sender: request.sender || Allusers.find(user => user._id === request.senderId) || {}
        };
      }
      return request;
    });
  };

  const formattedRequests = formatRequests(requests);

  const handleAcceptRequest = async (request) => {
    // Prevenir multiples clicks si la solicitud ya fue aceptada
    if (acceptedRequests.includes(request.sender._id)) {
      return;
    }

    try {
      const response = await asApi.patch('/friends', {
        senderId: request.sender._id,
        receiverId: request.receiver
      });

      if (response.status === 200) {
        setAcceptedRequests(prev => [...prev, request.sender._id]);

        // Eliminar la solicitud de la lista de notificaciones
        setFriendRequests(prevRequests => {
          const updatedRequests = prevRequests.filter(req => req.senderId !== request.sender._id);
          
          // Si no quedan solicitudes pendientes, cerrar el modal automáticamente
          if (updatedRequests.length === 0) {
            setTimeout(() => {
              onClose();
            }, 500); // Pequeño retraso para que el usuario vea que se aceptó
          }
          
          return updatedRequests;
        });

        // Notificar al servidor que la solicitud fue aceptada
        if (socketRef.current) {
          socketRef.current.emit('acceptFriendRequest', {
            senderId: request.sender._id,
            receiverId: userId
          });
        }
      } else {
        console.error('Error al aceptar la solicitud:', response.statusText);
      }
    } catch (error) {
      console.error('Error al aceptar la solicitud:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div 
        ref={modalRef} 
        className="bg-slate-800/90 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 max-w-md w-full shadow-2xl shadow-black/50"
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/25">
            <Bell className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Solicitudes de Amistad</h2>
          <p className="text-slate-400">Gestiona las solicitudes pendientes</p>
        </div>

        <div className="mt-4 space-y-2">
          {formattedRequests.length > 0 ? (
            <div className="bg-slate-700/50 backdrop-blur-sm rounded-2xl border border-slate-600/30 overflow-hidden">
              {formattedRequests.map((request, index) => (
                <div 
                  key={request.sender?._id || index} 
                  className={`flex items-center justify-between p-4 ${
                    index !== formattedRequests.length - 1 ? 'border-b border-slate-600/30' : ''
                  } ${acceptedRequests.includes(request.sender?._id) ? 'bg-green-500/10' : 'hover:bg-slate-600/30'} transition-colors duration-300`}
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-xl overflow-hidden ring-1 ring-slate-600/50">
                      <AvatarWrapper
                        style={{ width: '100%', height: '100%' }}
                        avatarStyle='Transparent'
                        {...(avatarMap[request.sender?.avatar] || {})}
                      />
                    </div>
                    <div className="ml-3">
                      <p className="text-white font-medium">{request.sender?.username || 'Usuario desconocido'}</p>
                      <p className="text-xs text-slate-400">Quiere conectar contigo</p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => handleAcceptRequest(request)}
                    disabled={acceptedRequests.includes(request.sender?._id)}
                    className={`p-2 rounded-xl transition-all duration-300 ${
                      acceptedRequests.includes(request.sender?._id)
                        ? 'bg-green-500/20 text-green-400 cursor-default'
                        : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white hover:shadow-md hover:shadow-green-500/25'
                    }`}
                  >
                    <Check className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-700/50 backdrop-blur-sm rounded-2xl border border-slate-600/30 p-8 text-center">
              <p className="text-slate-400">No hay solicitudes pendientes</p>
            </div>
          )}
        </div>

        <div className="mt-6">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-slate-700/50 hover:bg-slate-600/50 text-white font-semibold rounded-2xl border border-slate-600/50 hover:border-slate-500/50 transition-all duration-300"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddNotificationModal;