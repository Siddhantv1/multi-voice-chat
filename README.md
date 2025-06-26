# multi-voice-chat
A mini project about multi-user voice-chat for browsers, made using WebRTC and Socket.IO.

## How it works
- Create a room by entering a random a 6-character code of your choice. You become the host of this room.
- Share this code with your friends and see all joining requests in lobby.
- By default the mic is on mute, hold 'M' or press unmute button to temporarily unmute yourself when speaking.
- If the host gets disconnected, the first guest who joined the room becomes the host.
- If everybody leaves the room becomes empty and the connection is closed.
- Upto 4 members can join a Room.

## Quick set up
1. Clone this repository and navigate to the folder:
```sh
git clone https://github.com/siddhantv1/multi-voice-chat.git
cd multi-voice-chat
```
2. Install dependencies
```sh
npm install
```

3. Run the server and then open `index.html` 
```sh
node server.js
```
### Tech Stack
- frontend, server: HTML-CSS, Javascript
- communication: SocketIO WebRTC

**Deployment Link:** 
multi-voice-chat.onrender.com
