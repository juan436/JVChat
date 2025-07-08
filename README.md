# JVChat

**JVChat** es una aplicación de mensajería instantánea en tiempo real, desarrollada con tecnologías modernas como Next.js, React, Socket.IO y MongoDB. Permite a los usuarios registrarse, personalizar su perfil, gestionar contactos y conversar de forma fluida y segura.

---

## Características principales

- **Registro y autenticación de usuarios** con JWT
- **Selección de avatar** personalizado al crear cuenta
- **Chat en tiempo real** usando Socket.IO
- **Gestión de contactos**: buscar, agregar y aceptar solicitudes de amistad
- **Notificaciones** de mensajes y solicitudes en tiempo real
- **Historial de mensajes** persistente y sincronizado
- **Indicadores de conexión** y mensajes no leídos
- **Interfaz responsiva** y moderna con Tailwind CSS
- **Sincronización entre múltiples sesiones** abiertas del mismo usuario

---

## Tecnologías utilizadas

- **Frontend:**  
  - Next.js 14  
  - React 18  
  - Tailwind CSS  
  - Socket.IO Client  
  - JWT (jsonwebtoken)  

- **Backend:**  
  - Node.js  
  - Express  
  - Socket.IO  
  - MongoDB & Mongoose  
  - Bcrypt (hashing de contraseñas)  

---

## Instalación y ejecución local

### 1. Clona el repositorio

```bash
git clone https://github.com/tuusuario/JVChat.git
cd JVChat
```

### 2. Instala las dependencias

```bash
yarn install
```

### 3. Configura las variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```env
MONGODB_URI=mongodb://localhost:27017/jvchat
JWT_SECRET=secret_key
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
```

### 4. Inicia el backend (servidor Socket.IO y API)

```bash
node serverSocket/server.js
```

### 5. En otra terminal, inicia el frontend (Next.js)

```bash
yarn dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

---

## Usuarios y pruebas

1. Abre la aplicación en [http://localhost:3000](http://localhost:3000)
2. Regístrate con un correo y contraseña
3. Selecciona un avatar
4. En otra ventana o navegador, regístrate con otro usuario
5. Busca y envía una solicitud de amistad
6. Acepta la solicitud desde el otro usuario
7. ¡Comienza a chatear en tiempo real!

---

## Estructura del proyecto

```
JVChat/
├── app/                # Código fuente del frontend (Next.js)
│   ├── api/            # Rutas de la API
│   ├── auth/           # Páginas de autenticación
│   └── dashboard/      # Páginas del dashboard
├── components/         # Componentes de React reutilizables
├── serverSocket/       # Servidor backend (Express + Socket.IO)
├── models/             # Modelos de datos (Mongoose)
├── public/             # Recursos estáticos
└── styles/             # Estilos globales (Tailwind)
```

---

## Notas importantes

- Asegúrate de tener MongoDB instalado y corriendo localmente
- El servidor Socket.IO debe estar en ejecución para el chat en tiempo real
- El frontend corre en el puerto 3000 por defecto
- El backend corre en el puerto 4000 por defecto
- Para desarrollo, puedes usar `yarn dev` en modo desarrollo

---

## Solución de problemas

### Problema: No se conecta el socket
- Verifica que el servidor backend esté en ejecución
- Revisa que la URL del socket en `.env.local` sea correcta

### Problema: No se guardan los mensajes
- Asegúrate que MongoDB esté corriendo
- Verifica la conexión a la base de datos en `MONGODB_URI`

---

## Autor

- **Juan Villegas**
- [LinkedIn](https://www.linkedin.com/in/juan-villegas-aaa05b20a/)
- [GitHub](https://github.com/juan436)

---
