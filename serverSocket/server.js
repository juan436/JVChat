import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
        allowedHeaders: ['my-custom-header'],
        credentials: true,
    },
});

const connectedUsers = {};
const pendingAccepts = new Set();

io.on('connection', (socket) => {
    socket.on('registerUser', ({ userId, username, avatarId }) => {
        if (userId && username && avatarId) {

            // Verificar si el usuario ya está conectado
            const existingUser = connectedUsers[userId];

            if (existingUser && existingUser.socketId !== socket.id) {
                // Desconectar el socket anterior
                const oldSocket = io.sockets.sockets.get(existingUser.socketId);
                if (oldSocket) {
                    oldSocket.leave(`user:${userId}`);
                    oldSocket.disconnect(true);
                }
            }

            // Limpiar cualquier sala anterior a la que este socket pudiera pertenecer
            for (const room of socket.rooms) {
                if (room !== socket.id) {
                    socket.leave(room);
                }
            }

            // Registrar el nuevo socket
            connectedUsers[userId] = {
                userId,
                socketId: socket.id,
                username,
                avatarId,
                isConnected: true
            };

            // Unir al room correcto
            socket.join(`user:${userId}`);

            // Emitir actualización de usuarios
            io.emit('updateUsers', Object.values(connectedUsers));
        }
    });

    socket.on('acceptFriendRequest', ({ senderId, receiverId }) => {
        const requestKey = `${senderId}-${receiverId}`;
        if (pendingAccepts.has(requestKey)) {
            return;
        }
        pendingAccepts.add(requestKey);

        // Notificar al remitente de la solicitud que su solicitud fue aceptada
        io.to(`user:${senderId}`).emit('friendRequestAccepted', {
            receiverId,
            timestamp: Date.now()
        });

        io.emit('friendshipUpdated', {
            senderId,
            receiverId,
            timestamp: Date.now()
        });

        setTimeout(() => {
            pendingAccepts.delete(requestKey);
        }, 5000);
    });

    socket.on('sendMessage', (messageData) => {
        const { senderId, receiverId, text, createdAt } = messageData;
        const receiver = connectedUsers[receiverId];

        if (receiver) {
            // Crear el arreglo de usuarios
            const users = [senderId, receiverId].sort();

            // Emitir el mensaje al room específico del receptor en lugar de al socket específico
            io.to(`user:${receiverId}`).emit('receiveMessage', { senderId, text, createdAt, users });
        } else {
            console.log('Receptor no encontrado para el mensaje:', messageData);
        }
    });

    socket.on('friendRequestSent', ({ receiverId, senderId }) => {
        // Emitir a la sala específica del usuario
        io.to(`user:${receiverId}`).emit('receiveFriendRequest', { senderId, receiverId });

        // Emitir evento global para sincronización
        io.emit('friendRequestUpdated', { receiverId, senderId });
    });

    socket.on('logout', ({ userId }) => {
        if (userId && connectedUsers[userId]) {

            // Abandonar la sala específica del usuario
            socket.leave(`user:${userId}`);

            // Marcar como desconectado
            connectedUsers[userId].isConnected = false;

            // Emitir actualización de usuarios
            io.emit('updateUsers', Object.values(connectedUsers));
        }
    });

    socket.on('disconnect', () => {

        let disconnectedUserId = null;

        // Encontrar el usuario asociado a este socket
        for (const [userId, userInfo] of Object.entries(connectedUsers)) {
            if (userInfo.socketId === socket.id) {
                disconnectedUserId = userId;
                connectedUsers[userId].isConnected = false;
                break;
            }
        }

        // Emitir actualización de usuarios
        io.emit('updateUsers', Object.values(connectedUsers));
    });
});

const PORT = 4000;
httpServer.listen(PORT, () => { });