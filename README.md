# multi-voice-chat
A mini project about multi-user voice-chat for browsers, made with made using WebRTC and Socket.IO.

## How it works
Create a room by entering a random a 6-character code of your choice. You become the host of this room.
Share this code with your friends and see all joining requests in lobby.
By default the mic is on mute, hold 'M' to temporarily unmute yourself when speaking.
If everybody leaves a current room the connection is closed and the code is now invalid.

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
HTML-CSS, Javascript
