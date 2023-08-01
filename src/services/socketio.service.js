import { io } from "socket.io-client";

class SocketioService {
  socket;
  constructor() { }
  setupSocketConnection(token) {
    let header = {
      authorization: token
    };
    this.socket = io('http://65.1.73.254:3700/', { extraHeaders: header });


    this.socket.on('position-change-broadcast', (data) => {
      alert(data);
    });
  }

  // sendMessage(){
  //     this.socket.emit("position-change","User Moved to New Position");
  // }

  subscribeToMessages(cb) {
    if (!this.socket) return (true);
    this.socket.on('message', (msg) => {
      console.log('Room event received!');
      
      return cb(null, msg, 'message');
    });

    this.socket.on('startNewChat', msg => {
      console.log(`New User Join to Room ${msg}`);
      return cb(null, msg, null, 'startNewChat');
    })
  }

  sendMessage(msg, cb) {
    if (this.socket) {
      alert(JSON.stringify(msg));
      this.socket.emit('message', msg, cb);
    }
    else {
      alert("No socket");
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

}

export default new SocketioService();