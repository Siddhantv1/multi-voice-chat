const express = require('express');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve the index.html file from the same directory
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

const rooms = {}; // In-memory store for rooms

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('join', (roomID) => {
        // Find the room or create it if it doesn't exist
        if (!rooms[roomID]) {
            rooms[roomID] = {
                members: [],
                pending: new Set(),
                host: socket.id
            };
        }
        
        const room = rooms[roomID];

        // Room capacity check
        if (room.members.length >= 4) {
            return socket.emit('room-full');
        }
        
        // If the room is empty, the first user becomes the host automatically
        if (room.members.length === 0) {
            room.members.push(socket.id);
            socket.join(roomID);
            socket.emit('room-created', roomID);
            console.log(`Room ${roomID} created by host ${socket.id}`);
        } else {
            // Otherwise, ask the host for approval
            room.pending.add(socket.id);
            io.to(room.host).emit('approval-request', { guestId: socket.id, roomID });
            console.log(`User ${socket.id} requesting to join room ${roomID}`);
        }
    });

    socket.on('approve-user', ({ roomID, guestId, accept }) => {
        const room = rooms[roomID];
        // Security check: only the host can approve
        if (!room || socket.id !== room.host) {
            return;
        }

        room.pending.delete(guestId);

        if (accept) {
            // Check capacity again in case multiple were approved at once
             if (room.members.length >= 4) {
                io.to(guestId).emit('room-full');
                return;
            }
            room.members.push(guestId);
            socket.to(roomID).emit('new-user', guestId);
            io.to(guestId).emit('join-accepted', {
                roomID,
                existingUsers: room.members.filter(id => id !== guestId),
            });
            const guestSocket = io.sockets.sockets.get(guestId);
            if(guestSocket) guestSocket.join(roomID);
            console.log(`User ${guestId} approved for room ${roomID}`);
        } else {
            io.to(guestId).emit('join-rejected');
            console.log(`User ${guestId} rejected for room ${roomID}`);
        }
    });
    
    // --- WebRTC Signaling Handlers ---
    socket.on('offer', (data) => {
        io.to(data.target).emit('offer', { sdp: data.sdp, caller: socket.id });
    });

    socket.on('answer', (data) => {
        io.to(data.target).emit('answer', { sdp: data.sdp, callee: socket.id });
    });

    socket.on('ice-candidate', (data) => {
        io.to(data.target).emit('ice-candidate', { candidate: data.candidate, sender: socket.id });
    });
    
    // --- Speaking indicator ---
    socket.on('speaking', ({roomID, speaking}) => {
        socket.to(roomID).emit('user-speaking', { userId: socket.id, speaking });
    });

    // --- Disconnect and Leave Handlers ---
    const handleDisconnect = () => {
        console.log(`User disconnected: ${socket.id}`);
        for (const roomID in rooms) {
            const room = rooms[roomID];
            const memberIndex = room.members.indexOf(socket.id);

            if (memberIndex > -1) {
                room.members.splice(memberIndex, 1);
                socket.to(roomID).emit('user-disconnected', socket.id);
                
                // If the host disconnects, make the next person the host
                if (socket.id === room.host && room.members.length > 0) {
                    room.host = room.members[0];
                    console.log(`Host migrated to ${room.host} in room ${roomID}`);
                     // Optional: notify the new host
                    io.to(room.host).emit('new-host');
                }
                
                // If the room is now empty, delete it
                if (room.members.length === 0) {
                    delete rooms[roomID];
                    console.log(`Room ${roomID} is now empty and has been closed.`);
                }
                break; // A user can only be in one room
            }
            // Also remove from pending if they were waiting
            room.pending.delete(socket.id);
        }
    };
    
    socket.on('leave', (roomID) => {
        handleDisconnect();
    });
    
    socket.on('disconnect', () => {
       handleDisconnect();
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
