To implement user authentication and ensure that a user cannot connect with multiple users at the same time in your Omega Clone application, you'll need to modify both the backend and frontend. Below, I’ll walk you through adding a login system using JSON Web Tokens (JWT) for authentication and updating the socket handling to enforce single connections.

### Step 1: Enhance the Backend

1. **Install additional dependencies** for authentication and password handling:

   Navigate to your backend directory and run:

   ```bash
   npm install bcryptjs jsonwebtoken
   ```

2. **Create a User Model**:

   In `src/models/User.ts`, define a simple user schema:

   ```typescript
   import mongoose from 'mongoose';

   const UserSchema = new mongoose.Schema({
     username: { type: String, required: true, unique: true },
     password: { type: String, required: true },
     currentRoom: { type: String, default: null },
   });

   const User = mongoose.model('User', UserSchema);
   export default User;
   ```

3. **Update Your Express App for Authentication**:

   Modify `src/app.ts` to include login and registration routes, and modify the socket connection logic.

   ```typescript
   import express from 'express';
   import cors from 'cors';
   import { createServer } from 'http';
   import { Server } from 'socket.io';
   import mongoose from 'mongoose';
   import bcrypt from 'bcryptjs';
   import jwt from 'jsonwebtoken';
   import User from './models/User';

   const app = express();
   const secretKey = 'your_jwt_secret'; // Change this to a strong secret key
   const PORT = 5000;

   app.use(cors());
   app.use(express.json());

   mongoose.connect('mongodb://localhost/omega-clone', { useNewUrlParser: true, useUnifiedTopology: true });

   const server = createServer(app);
   const io = new Server(server, {
     cors: {
       origin: '*',
     },
   });

   // Register route
   app.post('/register', async (req, res) => {
     const { username, password } = req.body;
     const hashedPassword = await bcrypt.hash(password, 10);
     const user = new User({ username, password: hashedPassword });
     await user.save();
     res.status(201).json({ message: 'User created' });
   });

   // Login route
   app.post('/login', async (req, res) => {
     const { username, password } = req.body;
     const user = await User.findOne({ username });
     if (!user || !await bcrypt.compare(password, user.password)) {
       return res.status(401).json({ message: 'Invalid credentials' });
     }
     const token = jwt.sign({ id: user._id, username: user.username }, secretKey);
     res.json({ token });
   });

   const activeConnections: { [key: string]: string } = {}; // Store user ID and their current room

   io.on('connection', (socket) => {
     console.log('a user connected');

     socket.on('join', ({ room, token }) => {
       const decoded: any = jwt.verify(token, secretKey);
       if (activeConnections[decoded.id] && activeConnections[decoded.id] !== room) {
         socket.emit('error', 'You are already connected to another user');
         return;
       }
       activeConnections[decoded.id] = room;
       socket.join(room);
     });

     socket.on('signal', (data: any) => {
       io.to(data.room).emit('signal', { signal: data.signal, id: socket.id });
     });

     socket.on('disconnect', () => {
       // Handle disconnection
       console.log('user disconnected');
     });
   });

   server.listen(PORT, () => {
     console.log(`Server is running on port ${PORT}`);
   });
   ```

4. **Update MongoDB Connection URL**:

   Ensure your MongoDB connection string in the `mongoose.connect()` method points to your actual MongoDB instance.

### Step 2: Enhance the Frontend

1. **Handle Authentication**:

   Update the frontend to allow users to register and log in before entering a chat.

   - Create a new component for Login and Registration logic.

   In `src/components/Login.tsx`:

   ```tsx
   import React, { useState } from 'react';
   import axios from 'axios';

   const Login: React.FC<{ onLogin: (token: string) => void }> = ({ onLogin }) => {
     const [username, setUsername] = useState('');
     const [password, setPassword] = useState('');

     const handleLogin = async (e: React.FormEvent) => {
       e.preventDefault();
       const response = await axios.post('http://localhost:5000/login', { username, password });
       onLogin(response.data.token);
     };

     return (
       <form onSubmit={handleLogin}>
         <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" required />
         <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" type="password" required />
         <button type="submit">Login</button>
       </form>
     );
   };

   export default Login;
   ```

   In `src/App.tsx`, integrate Login and chat functionalities:

   ```tsx
   import React, { useEffect, useRef, useState } from 'react';
   import { io } from 'socket.io-client';
   import Login from './components/Login';

   const socket = io('http://localhost:5000');

   const App: React.FC = () => {
     const [localStream, setLocalStream] = useState<MediaStream | null>(null);
     const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
     const [token, setToken] = useState<string | null>(null);
     const localVideoRef = useRef<HTMLVideoElement>(null);
     const remoteVideoRef = useRef<HTMLVideoElement>(null);
     const [room, setRoom] = useState("room1"); // Set a default room

     useEffect(() => {
       const getUserMedia = async () => {
         const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
         setLocalStream(stream);
         if (localVideoRef.current) {
           localVideoRef.current.srcObject = stream;
         }
       };

       if (token) {
         socket.emit('join', { room, token });
       }

       socket.on('signal', (data: any) => {
         // Handle remote stream signals here
       });

       return () => {
         socket.disconnect();
       };
     }, [token]);

     return (
       <div>
         <h1>Omega Clone</h1>
         {!token ? (
           <Login onLogin={setToken} />
         ) : (
           <>
             <video ref={localVideoRef} autoPlay playsInline />
             <video ref={remoteVideoRef} autoPlay playsInline />
           </>
         )}
       </div>
     );
   };

   export default App;
   ```

### Step 3: Testing the Application

1. **Start Your Backend Server**:

   Ensure your backend server is running:

   ```bash
   cd backend
   npx ts-node src/app.ts
   ```

2. **Start Your React App**:

   Make sure your frontend app is running:

   ```bash
   cd frontend
   npm start
   ```

3. **Register and Login**:

   - Use the Registration endpoint (`/register`) to create a new user. You can use Postman or create a simple registration form in your frontend.
   - After registering, log in using the Login component, which uses the `/login` endpoint to authenticate.
   - After logging in, users can join a room and start a video chat.

### Summary

In this setup, we've added:

- User registration and login functionalities.
- JWT for securely handling user sessions.
- Logic to restrict users from joining multiple video calls simultaneously.

From here, you can continue to expand your application with more features like user profiles, chat histories, better error handling, and UI enhancements. If you have any specific questions or need further clarifications, feel free to ask!



---


To set up a complete WebRTC connection in your Omega Clone application using the MERN stack, TypeScript, Socket.IO, and React, we will create a peer-to-peer video chat solution. This will include everything from setting up the signaling server with Socket.IO to handling peer-to-peer connections with WebRTC.

### Overview

1. **Signaling Server**: Use Socket.IO to exchange connection details (ICE candidates and session descriptions) between peers.
2. **WebRTC Setup**: Handle the creation of local and remote media streams, as well as connection events.
3. **Frontend Implementation**: Build a user interface that lets users log in, select a room, and connect with each other.

### Step 1: Backend Setup

We'll use the backend code previously defined, with modifications to handle WebRTC signaling. This ensures that users can connect to each other for video calls.

#### Backend Code (`app.ts`)

Ensure your `app.ts` file in the `backend/src/` directory has the following:

```typescript
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from './models/User';

const app = express();
const secretKey = 'your_jwt_secret'; // Change this to a strong secret key
const PORT = 5000;

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb://localhost/omega-clone', { useNewUrlParser: true, useUnifiedTopology: true });

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

// User registration
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ username, password: hashedPassword });
  await user.save();
  res.status(201).json({ message: 'User created' });
});

// User login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user || !await bcrypt.compare(password, user.password)) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user._id, username: user.username }, secretKey);
  res.json({ token });
});

// For storing active connections
const activeConnections: { [key: string]: string[] } = {}; // userId: connectedRooms array

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('join', ({ room, token }) => {
    const decoded: any = jwt.verify(token, secretKey);

    // Join room
    socket.join(room);
    activeConnections[decoded.id] = [...(activeConnections[decoded.id] || []), room];

    console.log(`User ${decoded.username} joined room ${room}`);

    // Notify room of a new participant
    socket.to(room).emit('user-connected', socket.id);

    // Handle incoming signaling data
    socket.on('signal', (data: any) => {
      io.to(data.to).emit('signal', { signal: data.signal, sender: socket.id });
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
      activeConnections[decoded.id] = activeConnections[decoded.id].filter(r => r !== room);
    });
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
```

### Step 2: Frontend Setup

In your frontend folder, modify the main application file and add components for handling video chat. Here’s a step-by-step guide:

#### Frontend Code (`App.tsx`)

Update your `src/App.tsx` file to include the WebRTC connection logic:

```tsx
import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import Login from './components/Login';

const socket = io('http://localhost:5000');

const App: React.FC = () => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const roomRef = useRef<string>('room1'); // default room

  useEffect(() => {
    const getUserMedia = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    };

    getUserMedia();

    socket.on('user-connected', (userId: string) => {
      console.log(`User connected: ${userId}`);
      // Create a peer connection for the new user
      createPeerConnection(userId);
    });

    socket.on('signal', (data: any) => {
      if (data.sender !== socket.id) {
        handleSignal(data);
      }
    });

    return () => {
      socket.disconnect();
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, [token]);

  const handleLogin = (token: string) => {
    setToken(token);
    socket.emit('join', { room: roomRef.current, token });
  };

  const createPeerConnection = (userId: string) => {
    const peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }], // STUN server for public IP discovery
    });

    // When we receive a stream from the remote video
    peerConnection.ontrack = (event: RTCTrackEvent) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    // Add local stream tracks to the peer connection
    if (localStream) {
      localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
      });
    }

    // Handle ICE candidate generation
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('signal', { to: userId, signal: { candidate: event.candidate } });
      }
    };

    // Create an offer and set the local description
    peerConnection.createOffer().then(offer => {
      return peerConnection.setLocalDescription(offer);
    }).then(() => {
      socket.emit('signal', { to: userId, signal: { sdp: peerConnection.localDescription } });
    });

    peerConnectionRef.current = peerConnection;
  };

  const handleSignal = async (data: any) => {
    if (data.signal.sdp) {
      // If we received an SDP, set it as the remote description
      await peerConnectionRef.current?.setRemoteDescription(new RTCSessionDescription(data.signal.sdp));
      // If it's an answer, create an ice candidate
      if (data.signal.sdp.type === 'offer') {
        const answer = await peerConnectionRef.current?.createAnswer();
        await peerConnectionRef.current?.setLocalDescription(answer);
        socket.emit('signal', { to: data.sender, signal: { sdp: peerConnectionRef.current?.localDescription } });
      }
    } else if (data.signal.candidate) {
      // If we received an ICE candidate, add it
      await peerConnectionRef.current?.addIceCandidate(new RTCIceCandidate(data.signal.candidate));
    }
  };

  return (
    <div>
      <h1>Omega Clone</h1>
      {!token ? (
        <Login onLogin={handleLogin} />
      ) : (
        <>
          <video ref={localVideoRef} autoPlay playsInline style={{ width: '200px' }} />
          <video ref={remoteVideoRef} autoPlay playsInline style={{ width: '200px' }} />
        </>
      )}
    </div>
  );
};

export default App;
```

### Step 3: Login Component Update

Ensure your `src/components/Login.tsx` looks similar to this so that it properly handles the login events:

```tsx
import React, { useState } from 'react';
import axios from 'axios';

const Login: React.FC<{ onLogin: (token: string) => void }> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/login', { username, password });
      onLogin(response.data.token);
    } catch (error) {
      console.error('Login failed', error);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" required />
      <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" type="password" required />
      <button type="submit">Login</button>
    </form>
  );
};

export default Login;
```

### Step 4: Final Steps

1. **MongoDB**: Ensure you have MongoDB running, either locally or on a cloud provider such as MongoDB Atlas.
2. **Socket.IO**: Ensure your socket server (backend) is running with `ts-node` or compiled to JavaScript and run with Node.js:
   ```bash
   cd backend
   npx ts-node src/app.ts
   ```

3. **React App**:
   Start your React app in a different terminal:
   ```bash
   cd frontend
   npm start
   ```

### Testing

Visit your app in the browser, log in as different users with different credentials, and test the video chat functionality.

### Conclusion

This complete setup allows you to create WebRTC connections for video calling between users in a chat room. This example can serve as a foundation for adding additional features, such as:

- Error handling improvements.
- Better UI/UX design.
- Functionalities to handle multiple chat rooms and user disconnections.

Feel free to extend this application or ask if you need further features or help with specific functionalities!
