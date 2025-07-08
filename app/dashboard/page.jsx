'use client'
import React, { useEffect, useState, useRef } from 'react';
import jwt from 'jsonwebtoken';
import Sidebar from '@/components/layout/Sidebar';
import { useRouter } from 'next/navigation';
import Chat from '@/components/chat/Chat';
import io from 'socket.io-client';
import ContactsSidebar from '@/components/layout/ContactsSidebar';
import { asApi } from '@/apiAxios';
import { enqueueSnackbar } from 'notistack';

function DashboardPage() {

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState({});
  const [avatarMap, setAvatarMap] = useState({});

  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const router = useRouter();

  const socketRef = useRef(null);

  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState('');
  const [avatarId, setAvatarId] = useState(null);

  const [confirmedFriends, setConfirmedFriends] = useState([]);
  const [Allusers, setAllUsers] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [friendsWithStatus, setFriendsWithStatus] = useState([]);
  const [lastMessages, setLastMessages] = useState([]);

  const [currentConversationMessages, setCurrentConversationMessages] = useState([]);
  const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://socket-server:4000';
  
  useEffect(() => {
    const loadAvatars = async () => {
      try {
        const response = await fetch('/data/avatars.json');
        const avatars = await response.json();

        // Convertir el array a un objeto con el id como clave
        const avatarsMap = avatars.reduce((acc, avatar) => { acc[avatar.id] = avatar; return acc; }, {});
        setAvatarMap(avatarsMap);
      } catch (error) { console.error('Error cargando los avatares:', error); }
    };

    loadAvatars();
  }, []);

  // useEffect para evitar que el usuario vuelva a la pagina de login al volver con el boton de atras del navegador
  useEffect(() => {
    window.history.pushState(null, '', window.location.pathname);
    const handlePopState = () => {
      window.location.href = 'https://www.google.com';
    };
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [router]);

  // useEffect para verificar si el usuario está autenticado
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.replace('/auth/login');
    } else {
      try {
        const decoded = jwt.decode(token);
        setAvatarId(decoded.avatarId);
        setUserId(decoded.userId);
        setUsername(decoded.username);
        setLoading(false);
      } catch (error) {
        console.error('Error al decodificar el token:', error);
        setLoading(false);
      }
    }
  }, [router]);

  // useEffect para conectar al socket
  useEffect(() => {
    const socketInitializer = async () => {
      socketRef.current = io(SOCKET_URL, { reconnection: false });

      socketRef.current.on('connect', () => {
        if (userId && username && avatarId) {
          socketRef.current.emit('registerUser', { userId, username, avatarId });
        }
      });

      socketRef.current.on('receiveMessage', (message) => {
        // Actualizar la lista de mensajes localmente
        setMessages((prevMessages) => {
          const newMessages = [
            ...prevMessages,
            {
              sender: message.senderId,
              message: { text: message.text },
              createdAt: message.createdAt,
              users: message.users,
            },
          ];

          // Si el chat está abierto con este usuario, actualizar también los mensajes de la conversación actual
          if (isChatOpen && selectedUser && selectedUser._id === message.senderId) {
            setCurrentConversationMessages((prevConvMessages) => [
              ...prevConvMessages,
              {
                sender: message.senderId,
                message: { text: message.text },
                createdAt: message.createdAt,
                users: message.users,
              },
            ]);
          }

          return newMessages;
        });

        // Solo actualizar los mensajes no leídos si el chat no está abierto con este usuario
        if (!isChatOpen || selectedUser?._id !== message.senderId) {
          setUnreadMessages((prevUnread) => ({
            ...prevUnread,
            [message.senderId]: (prevUnread[message.senderId] || 0) + 1,
          }));
        } else {
          // Si el chat está abierto con este usuario, actualizar el timestamp de lectura
          try {
            const storageKey = `lastRead_${userId}`;
            const lastReadTimestamps = JSON.parse(localStorage.getItem(storageKey) || '{}');
            const currentTime = Date.now();
            lastReadTimestamps[message.senderId] = currentTime;
            localStorage.setItem(storageKey, JSON.stringify(lastReadTimestamps));
          } catch (error) {
            console.error('Error al actualizar timestamp de lectura:', error);
          }
        }
      });

      socketRef.current.on('updateUsers', (users) => {
        setConnectedUsers(users);
      });
    };

    socketInitializer();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [userId, username, avatarId, isChatOpen, selectedUser]);

  // Crear lista de amigos con estado de conexión
  useEffect(() => {
    const updateFriendsWithStatus = () => {
      const updatedFriends = confirmedFriends.map(friend => ({
        ...friend,
        isConnected: connectedUsers.some(user => user.userId === friend._id && user.isConnected)
      }));
      setFriendsWithStatus(updatedFriends);
    };

    updateFriendsWithStatus();
  }, [confirmedFriends, connectedUsers]);


  // GET para obtener los amigos confirmados
  const getConfirmedFriends = async (userId) => {
    try {
      const response = await asApi.get(`/friends?userId=${userId}&isVerified=true`);
      const confirmedFriends = response.data;
      setConfirmedFriends(confirmedFriends);
    } catch (error) {
      console.error('Error al obtener amigos confirmados:', error);
    }
  };

  // GET para obtener todos los usuarios
  const getUsers = async () => {
    const response = await asApi.get(`/users`);
    const data = response.data;
    setAllUsers(data);
  }

  // GET para obtener las solicitudes de amistad pendientes
  const getFriendRequests = async (userId) => {
    try {
      const response = await asApi.get(`/friends?receiverId=${userId}&isVerified=false`);
      const pendingRequests = response.data;
      setFriendRequests(pendingRequests);
    } catch (error) {
      console.error('Error al obtener solicitudes de amistad pendientes:', error);
    }
  };

  useEffect(() => {

    if (userId) {
      getConfirmedFriends(userId);
      getUsers();
      getFriendRequests(userId);
    }
  }, [userId]);

  // useEffect para recibir solicitudes de amistad
  useEffect(() => {
    const handleReceiveFriendRequest = ({ senderId, receiverId }) => {
      // Verificar explícitamente si este usuario es el receptor
      if (receiverId === userId) {

        // Buscar el usuario en Allusers que coincida con senderId
        const sender = Allusers.find(user => user._id === senderId);

        // Forzar una actualización inmediata de las solicitudes desde el servidor
        getFriendRequests(userId).then(() => {
        });
      }
    };

    if (socketRef.current) {
      socketRef.current.off('receiveFriendRequest');
      socketRef.current.on('receiveFriendRequest', handleReceiveFriendRequest);
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.off('receiveFriendRequest', handleReceiveFriendRequest);
      }
    };
  }, [userId, Allusers, socketRef]);

  // useEffect para manejar la aceptación de una solicitud de amistad que enviaste
  useEffect(() => {
    const handleFriendRequestAccepted = ({ receiverId }) => {
      getConfirmedFriends(userId);
      getFriendRequests(userId);
    };

    if (socketRef.current) {
      socketRef.current.on('friendRequestAccepted', handleFriendRequestAccepted);
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.off('friendRequestAccepted', handleFriendRequestAccepted);
      }
    };
  }, [userId]);



  // useEffect para recibir notificaciones de aceptación de amistad
  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on('friendRequestAccepted', ({ receiverId }) => {

        // Buscar el usuario en Allusers que coincida con receiverId
        const user = Allusers.find(user => user._id === receiverId);

        if (user) {
          // Formatear el objeto
          const formattedUser = {
            _id: user._id,
            username: user.username,
            avatar: user.avatar,
            isConnected: true
          };

          // Anexar el usuario formateado a la lista de amigos confirmados
          setConfirmedFriends(prevFriends => [...prevFriends, formattedUser]);
        } else {
          console.log('Usuario no encontrado');
        }
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.off('friendRequestAccepted');
      }
    };
  }, [socketRef, userId, Allusers]);


  // useEffect para manejar actualizaciones de solicitudes de amistad (evento global)
  useEffect(() => {
    // Solo configurar el listener si tenemos un userId válido y el socket está conectado
    if (!userId || !socketRef.current) return;

    const handleFriendRequestUpdated = (data) => {
      const { receiverId, senderId } = data;

      // Si el usuario actual es el receptor de la solicitud, actualizar la lista de solicitudes
      if (userId === receiverId) {

        // Primero actualizar la lista de todos los usuarios para incluir usuarios nuevos
        getUsers().then(() => {


          // Luego recargar las solicitudes de amistad
          getFriendRequests(userId).then(() => {

            // Notificar al usuario sobre la nueva solicitud
            enqueueSnackbar(`Has recibido una nueva solicitud de amistad`, {
              variant: 'info',
              autoHideDuration: 3000
            });
          });
        });
      }
    };

    // Limpiar cualquier listener previo para este evento específico
    socketRef.current.off('friendRequestUpdated', handleFriendRequestUpdated);

    // Añadir el nuevo listener
    socketRef.current.on('friendRequestUpdated', handleFriendRequestUpdated);

    // Función de limpieza
    return () => {
      if (socketRef.current) {
        socketRef.current.off('friendRequestUpdated', handleFriendRequestUpdated);
      }
    };
  }, [userId, socketRef, getUsers, getFriendRequests, enqueueSnackbar]);

  // useEffect para manejar actualizaciones globales de amistad
  useEffect(() => {
    const handleFriendshipUpdated = ({ senderId, receiverId }) => {

      // Si el usuario actual está involucrado en esta amistad (como emisor o receptor)
      if (userId === senderId || userId === receiverId) {

        // Identificar el ID del otro usuario en la amistad
        const otherUserId = userId === senderId ? receiverId : senderId;

        // Recargar amigos confirmados
        getConfirmedFriends(userId).then(() => {

          // Buscar el usuario recién confirmado en la lista de amigos
          const newFriend = confirmedFriends.find(friend => friend._id === otherUserId);

          if (newFriend) {

            // Seleccionar automáticamente al nuevo amigo para habilitar el chat
            setSelectedUser(newFriend);
            setIsChatOpen(true); // Asegurarse de que el chat esté abierto

            // Notificar al usuario sobre la nueva amistad
            enqueueSnackbar(`Chat habilitado con ${newFriend.username}`, {
              variant: 'success',
              autoHideDuration: 3000
            });
          } else {


            // Si no encontramos al usuario, intentamos recargar la lista de usuarios
            getUsers().then(() => {
              // Buscar el usuario en la lista completa
              const newUser = Allusers.find(user => user._id === otherUserId);

              if (newUser) {

                // Seleccionar automáticamente al nuevo usuario
                setSelectedUser(newUser);
                setIsChatOpen(true); // Asegurarse de que el chat esté abierto
              }
            });
          }
        });

        // Limpiar solicitudes pendientes si es necesario
        getFriendRequests(userId).then(() => {
        });
      }
    };

    if (socketRef.current) {
      // Eliminar cualquier listener previo para evitar duplicados
      socketRef.current.off('friendshipUpdated');
      // Añadir el nuevo listener
      socketRef.current.on('friendshipUpdated', handleFriendshipUpdated);
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.off('friendshipUpdated', handleFriendshipUpdated);
      }
    };
  }, [userId, socketRef, confirmedFriends, Allusers, getConfirmedFriends, getUsers, enqueueSnackbar]);

  // useEffect para cerrar la sesion
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setAvatarId(null);

    // Emitir evento de cierre de sesión
    if (socketRef.current) {
      socketRef.current.emit('logout', { userId });
      socketRef.current.disconnect();
    }

    router.replace('/');
  }


  // funcion para seleccionar un usuario y abrir el chat
  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setIsChatOpen(true);

    // Marcar mensajes como leídos
    setUnreadMessages((prevUnread) => ({
      ...prevUnread,
      [user._id]: 0,
    }));

    // Guardar el timestamp actual como último tiempo de lectura para este remitente
    const lastReadTimestamps = JSON.parse(localStorage.getItem(`lastRead_${userId}`) || '{}');
    lastReadTimestamps[user._id] = Date.now();
    localStorage.setItem(`lastRead_${userId}`, JSON.stringify(lastReadTimestamps));

    // Filtrar mensajes que incluyan el _id del usuario seleccionado
    const filteredMessages = messages.filter(message =>
      Array.isArray(message.users) && message.users.includes(user._id)
    );

    setCurrentConversationMessages(filteredMessages);
  };

  useEffect(() => {
    if (selectedUser) {
      const filteredMessages = messages.filter(message =>
        Array.isArray(message.users) && message.users.includes(selectedUser._id)
      );
      setCurrentConversationMessages(filteredMessages);
    }
  }, [messages, selectedUser]);

  // useEffect para recalcular los mensajes no leídos cuando cambia el estado de isChatOpen
  useEffect(() => {
    if (!isChatOpen && selectedUser) {
      // Si se cierra el chat, recalcular los mensajes no leídos
      calculateUnreadMessages();
    }
  }, [isChatOpen]);

  // useEffect para sincronizar el localStorage cuando cambia el usuario seleccionado
  useEffect(() => {
    if (selectedUser && isChatOpen) {
      try {
        const storageKey = `lastRead_${userId}`;
        const lastReadTimestamps = JSON.parse(localStorage.getItem(storageKey) || '{}');
        const currentTime = Date.now();
        lastReadTimestamps[selectedUser._id] = currentTime;
        localStorage.setItem(storageKey, JSON.stringify(lastReadTimestamps));
      } catch (error) {
        console.error('Error al actualizar timestamp en cambio de usuario:', error);
      }
    }
  }, [selectedUser?._id, isChatOpen]);

  // funcion para cerrar el chat
  const handleCloseChat = () => {
    setSelectedUser(null);
    setIsChatOpen(false);
  };

  // Función para obtener los mensajes
  const fetchMessages = async () => {
    try {
      const response = await asApi.get(`/chat?userId=${userId}`);
      if (response.status === 200) {
        const messagesData = response.data;

        // Guardar los mensajes en el estado
        setMessages(messagesData);

        // Calcular mensajes no leídos inmediatamente con los datos recibidos
        calculateUnreadMessages(messagesData);

        return messagesData;
      } else {
        console.error('Error al obtener mensajes:', response.statusText);
        return [];
      }
    } catch (error) {
      console.error('Error al obtener mensajes:', error);
      return [];
    }
  };

  // useEffect para obtener los mensajes al iniciar
  useEffect(() => {
    if (userId) {
      fetchMessages();
    }
  }, [userId]);

  // Función para calcular mensajes no leídos al cargar la página
  const calculateUnreadMessages = (messagesData) => {
    try {
      // Usar los mensajes pasados como parámetro o los del estado
      const currentMessages = messagesData || messages;

      if (!currentMessages || currentMessages.length === 0) {
        return;
      }

      // Obtener el registro de últimos mensajes leídos del localStorage
      const storageKey = `lastRead_${userId}`;
      let lastReadTimestamps = {};

      try {
        const storedData = localStorage.getItem(storageKey);
        lastReadTimestamps = storedData ? JSON.parse(storedData) : {};
      } catch (error) {
        console.error('Error al leer localStorage:', error);
        lastReadTimestamps = {}; // Asegurar que sea un objeto vacío en caso de error
      }

      // Crear un mapa de mensajes no leídos por remitente
      const unreadCounts = {};

      // Procesar cada mensaje
      currentMessages.forEach(msg => {
        // Verificar que el mensaje tenga los campos necesarios
        if (!msg || !msg.sender || !msg.users || !Array.isArray(msg.users) || !msg.createdAt) {
          return;
        }

        // Solo procesar mensajes enviados por otros usuarios al usuario actual
        if (msg.sender !== userId && msg.users.includes(userId)) {
          const senderId = msg.sender;
          const msgTime = new Date(msg.createdAt).getTime();
          const lastReadTime = lastReadTimestamps[senderId] || 0;

          // Si el mensaje es más reciente que el último tiempo de lectura, incrementar contador
          if (msgTime > lastReadTime) {
            unreadCounts[senderId] = (unreadCounts[senderId] || 0) + 1;
          }
        }
      });

      // Actualizar el estado de mensajes no leídos
      setUnreadMessages(unreadCounts);
    } catch (error) {
      console.error('Error al calcular mensajes no leídos:', error);
    }
  };

  // useEffect para obtener los ultimos mensajes
  useEffect(() => {
    const getLastMessages = () => {
      const chatMap = {};

      messages.forEach((msg) => {
        // Ordenar los IDs de los usuarios para crear una clave única
        const chatKey = msg.users.sort().join('-');

        // Si el chat no existe en el mapa o el mensaje actual es más reciente, actualizar el mapa
        if (!chatMap[chatKey] || new Date(msg.createdAt) > new Date(chatMap[chatKey].createdAt)) {
          chatMap[chatKey] = msg;
        }
      });

      // Convertir el mapa en un array de mensajes
      const lastMessagesArray = Object.values(chatMap);
      setLastMessages(lastMessagesArray);
    };

    getLastMessages();
  }, [messages]);


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

  const getUserNameById = (id) => {
    const allUser = Allusers.find(user => user._id === id);
    if (allUser) return allUser.username;

    const connectedUser = connectedUsers.find(user => user.userId === id);
    if (connectedUser) return connectedUser.username;

    return 'Desconocido';
  };

  const userInfo = {
    avatar: avatarId,
    userId: userId,
    username: username,
    socketRef: socketRef,
    friendRequests: friendRequests,
    setFriendRequests: setFriendRequests,
    Allusers: Allusers,
    setConfirmedFriends: setConfirmedFriends
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">

      <Sidebar userInfo={userInfo} handleLogout={handleLogout} avatarMap={avatarMap} />
      <ContactsSidebar
        contacts={friendsWithStatus}
        handleUserSelect={handleUserSelect}
        messages={messages}
        avatarMap={avatarMap}
        lastMessages={lastMessages}
        unreadMessages={unreadMessages}
        isChatOpen={isChatOpen}
      />

      <div className={`flex-1 ${isChatOpen ? 'block' : 'hidden'} md:block`}>
        {selectedUser ? (
          <Chat
            selectedUser={selectedUser}
            setSelectedUser={setSelectedUser}
            messages={currentConversationMessages}
            setMessages={setMessages}
            userId={userId}
            socketRef={socketRef}
            getUserNameById={getUserNameById}
            handleCloseChat={handleCloseChat}
            isChatOpen={isChatOpen}
            setLastMessages={setLastMessages}
            setUnreadMessages={setUnreadMessages}
            avatarMap={avatarMap}
          />
        ) : (
          <div className="flex justify-center items-center w-full h-screen bg-gradient-to-b from-slate-900/50 to-slate-800/50 backdrop-blur-xl">
            <div className="text-center p-8 bg-slate-800/60 backdrop-blur-xl rounded-3xl border border-slate-700/30 shadow-xl">
              <h2 className="text-2xl font-bold text-white mb-2">Bienvenido al Chat</h2>
              <p className="text-slate-300">Selecciona un contacto para comenzar a chatear</p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

export default DashboardPage;