import React, { useRef, useEffect, useState } from 'react';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import asApi from '@/apiAxios/asApi';
import { X, Smile } from 'lucide-react';
import AvatarWrapper from '../AvatarWrapper';

const Chat = ({ selectedUser, setSelectedUser, messages, setMessages, userId, socketRef, getUserNameById, handleCloseChat, setUnreadMessages, avatarMap }) => {
    const [newMessage, setNewMessage] = useState('');
    const [showEmojis, setShowEmojis] = useState(false);
    const emojiRef = useRef(null);
    const messagesEndRef = useRef(null);
    const [isUserConnected, setIsUserConnected] = useState(selectedUser?.isConnected || false);
    const [lastInteractionTime, setLastInteractionTime] = useState(Date.now());

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (emojiRef.current && !emojiRef.current.contains(event.target) &&
                !event.target.closest('button[data-emoji-button="true"]')) {
                setShowEmojis(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Actualizar el estado de conexión cuando cambia el usuario seleccionado
    useEffect(() => {
        setIsUserConnected(selectedUser?.isConnected || false);
        setLastInteractionTime(Date.now());
    }, [selectedUser]);

    // Escuchar el evento updateUsers para actualizar el estado de conexión en tiempo real
    useEffect(() => {
        if (!socketRef.current || !selectedUser) return;

        const handleUpdateUsers = (users) => {
            const currentConnected = users.some(user => user.userId === selectedUser._id && user.isConnected);
            if (!currentConnected && Date.now() - lastInteractionTime < 3000) { return; }
            setIsUserConnected(currentConnected);
            setSelectedUser(prev => {
                if (prev && prev._id === selectedUser._id && prev.isConnected !== currentConnected) {
                    return { ...prev, isConnected: currentConnected };
                }
                return prev;
            });
        };

        // Registrar el manejador de eventos
        socketRef.current.on('updateUsers', handleUpdateUsers);

        // Limpiar el manejador al desmontar
        return () => {
            if (socketRef.current) {
                socketRef.current.off('updateUsers', handleUpdateUsers);
            }
        };
    }, [socketRef, selectedUser, setSelectedUser, lastInteractionTime]);

    useEffect(() => {
        if (socketRef.current) {
            // Limpiar cualquier listener previo para evitar duplicados
            socketRef.current.off('receiveMessage');

            const handleReceiveMessage = (message) => {

                // Verifica si el mensaje pertenece a la conversación actual
                if (message.users.includes(selectedUser._id)) {
                    // Verificar que el mensaje no esté ya en la lista para evitar duplicados
                    setMessages((prevMessages) => {
                        // Verificar si el mensaje ya existe en la lista
                        const isDuplicate = prevMessages.some(
                            msg =>
                                msg.sender === message.senderId &&
                                msg.message.text === message.text &&
                                msg.createdAt === message.createdAt
                        );

                        if (isDuplicate) {
                            return prevMessages;
                        }

                        return [
                            ...prevMessages,
                            {
                                sender: message.senderId,
                                message: { text: message.text },
                                createdAt: message.createdAt,
                                users: message.users,
                            },
                        ];
                    });
                } else {
                    // Incrementa el contador de mensajes no leídos si el chat no está abierto con el remitente
                    setUnreadMessages((prevUnread) => ({
                        ...prevUnread,
                        [message.senderId]: (prevUnread[message.senderId] || 0) + 1,
                    }));
                }
            };

            socketRef.current.on('receiveMessage', handleReceiveMessage);

            return () => {
                socketRef.current.off('receiveMessage', handleReceiveMessage);
            };
        }
    }, [socketRef, selectedUser, setMessages, setUnreadMessages]);

    // Desplaza el scroll al final cuando cambian los mensajes
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const handleEmojiClick = (emoji) => {
        setNewMessage(newMessage + emoji.native);
    };

    const handleSendMessage = async () => {
        if (newMessage.trim() && selectedUser) {
            // Crear el arreglo de usuarios
            const users = [userId, selectedUser._id].sort();

            const messageData = {
                senderId: userId,
                receiverId: selectedUser._id,
                text: newMessage,
                createdAt: new Date().toISOString(),
                users: users,
            };

            if (socketRef.current) {
                socketRef.current.emit('sendMessage', messageData);
            }

            // Guardar el mensaje en la base de datos
            try {
                const response = await asApi.post('/chat', {
                    from: userId,
                    to: selectedUser._id,
                    text: newMessage,
                    users: users,
                });
            } catch (error) {
                console.error('Error al guardar el mensaje:', error);
            }

            // Actualizar la lista de mensajes localmente
            setMessages((prevMessages) => [
                ...prevMessages,
                {
                    sender: userId,
                    message: { text: newMessage },
                    createdAt: messageData.createdAt,
                    users: users, // Incluir el arreglo de usuarios
                },
            ]);
            setNewMessage('');
        }
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleSendMessage();
        }
    };

    // Formatear la hora del mensaje para mostrar solo hora:minutos:segundos
    const formatMessageTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    return (
        <div className="flex-1 flex flex-col bg-gradient-to-b from-slate-900/50 to-slate-800/50 backdrop-blur-xl h-full">
            {/* Header del chat */}
            <div className="bg-slate-800/60 backdrop-blur-xl p-4 border-b border-slate-700/30 flex items-center justify-between">
                <div className="flex items-center">
                    <div className="w-10 h-10 rounded-2xl overflow-hidden ring-2 ring-slate-600/50">
                        {selectedUser.avatar && avatarMap && avatarMap[selectedUser.avatar] ? (
                            <AvatarWrapper
                                style={{ width: '100%', height: '100%' }}
                                avatarStyle='Transparent'
                                {...avatarMap[selectedUser.avatar]}
                            />
                        ) : (
                            <div className="w-full h-full bg-blue-600 flex items-center justify-center text-white font-bold">
                                {selectedUser.username.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                    <div className="ml-4">
                        <h2 className="font-semibold text-white text-lg">{selectedUser.username}</h2>
                        <div className="flex items-center">
                            <span className={`inline-block w-2 h-2 rounded-full mr-2 ${isUserConnected ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                            <p className={`text-sm font-medium ${isUserConnected ? 'text-green-400' : 'text-gray-400'}`}>
                                {isUserConnected ? 'En línea' : 'Desconectado'}
                            </p>
                        </div>
                    </div>
                </div>
                <button
                    onClick={handleCloseChat}
                    className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-xl transition-all duration-300 hover:scale-105"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Área de mensajes */}
            <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-slate-900/30 to-slate-800/50 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
                <div className="space-y-6 max-w-4xl mx-auto">
                    {messages.map((msg, index) => {
                        const isSent = msg.sender === userId;
                        return (
                            <div key={index} className={`flex ${isSent ? "justify-end" : "justify-start"}`}>
                                <div className="max-w-xs lg:max-w-md">
                                    {!isSent && (
                                        <div className="text-xs text-slate-400 mb-2 ml-4 font-medium">
                                            {getUserNameById(msg.sender)}:
                                        </div>
                                    )}
                                    <div
                                        className={`px-5 py-3 rounded-3xl shadow-xl backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] ${isSent
                                            ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-br-lg shadow-blue-500/20"
                                            : "bg-slate-700/80 text-white rounded-bl-lg shadow-slate-900/50 border border-slate-600/30"
                                            }`}
                                    >
                                        <p className="text-sm leading-relaxed font-medium">{msg.message.text}</p>
                                        <p className={`text-xs mt-2 font-medium ${isSent ? "text-blue-100" : "text-slate-400"}`}>
                                            {formatMessageTime(msg.createdAt)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input para escribir mensajes */}
            <div className="bg-slate-800/60 backdrop-blur-xl p-6 border-t border-slate-700/30">
                <div className="flex items-center space-x-4 max-w-4xl mx-auto">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowEmojis(!showEmojis);
                        }}
                        data-emoji-button="true"
                        className="p-3 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-2xl transition-all duration-300 hover:scale-105 group"
                    >
                        <Smile className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </button>
                    {showEmojis && (
                        <div
                            ref={emojiRef}
                            className="absolute bottom-24 left-24 z-10 rounded-lg shadow-lg"
                            style={{ width: '320px' }}
                        >
                            <Picker data={data} onEmojiSelect={handleEmojiClick} />
                        </div>
                    )}

                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Escribe un mensaje..."
                            className="w-full px-6 py-4 bg-slate-700/50 backdrop-blur-sm text-white placeholder-slate-400 rounded-3xl border border-slate-600/30 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-slate-600/50 transition-all duration-300 text-sm"
                        />
                    </div>

                    <button
                        onClick={handleSendMessage}
                        className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 rounded-3xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 text-sm"
                    >
                        Enviar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Chat;