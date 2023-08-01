<template>
    <div class="Home">
      <form @submit.prevent="submitToken" v-if="show">
        <input type="text" placeholder="Enter Name" v-model="form.userName" />
        <input type="radio"
          name="userRole" v-model="form.userRole" value="Agent"
        /><label>Agent</label>
        <input type="radio" name="userRole" v-model="form.userRole" value="Rider" title="Rider"/><label>Rider</label>
        <button type="submit">Submit</button>
      </form>
      <h5 v-if="!show">USer Name: {{ form.userName }}</h5>
      <hr />
      <div id="liveAlertPlaceholder"></div>
      <div class="box">
        <div class="messages">
          <div v-for="(message, index) in messages" :key="index">
            <div class="sender" v-if="message.username == form.userName">
              <div class="flex" style="display: flex; align-items: end; justify-content: right;"><span class="sender-name">{{ message.username }}</span><span class="sender-circle"></span></div>
              <div class="send-msg box2 sb1-send">{{ message.txt }}</div>
            </div>
            <div class="receiver" v-else>
              <div class="flex" style="display: flex; align-items: end; justify-content: left;"><span class="receiver-circle"></span><span class="receiver-name">{{ message.username }}</span></div>
              <div class="receive-msg box2 sb1-receive">{{ message.txt }}</div>
            </div>
          </div>
        </div>
      </div>
      <form class="input-div" @submit.prevent="submitMessage">
        <div class="type-msg">
          <input
            type="text"
            placeholder="Type in text....."
            v-model="inputMessageText"
            class="input-box"/>
          <button class="submit-btn" type="submit">Submit</button>
        </div>
      </form>
    </div>
  </template>
  <script>
  import SocketioService from "../services/socketio.service.js";
  import axios from "axios";
  const SENDER = {
    id: "000",
    name: "Me",
  };
  export default {
    data() {
      return {
        messages: [],
        inputMessageText: "",
        form: {
          userRole: "",
          userName: "",
        },
        roomName: "",
        show: true,
      };
    },
    methods: {
      setupSocketConnection() {
        this.showAlert("success", "This is a success message!");
      },
      showAlert(type, message) {
        // Code to create and display the alert message
        let alertPlaceholder = document.getElementById("liveAlertPlaceholder");
        let wrapper = document.createElement("div");
        wrapper.innerHTML = [
          `<div class="alert alert-${type} alert-dismissible" role="alert">`,
          `   <div>${message}</div>`,
          '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
          "</div>",
        ].join("");
        alertPlaceholder.prepend(wrapper);
      },
      submitToken() {
        //console.log(this.token);
        let header = {
          "Access-Control-Allow-Origin": "*",
          "content-type": "application/json",
        };
        let Promise = axios.post("http://65.1.73.254:3700", this.form, {
          header: header,
        });
        Promise.then((res) => {
          if (res.status == 200) {
            console.log(res);
            this.token = res.data.token;
            alert("Connection Established");
            this.show = false;
            SocketioService.setupSocketConnection(this.token);
            SocketioService.subscribeToMessages((err, data, uname, msgType) => {
              console.log("Message Reeived", data);
              if (msgType == "message") {
                this.messages.push({ txt: data, username: uname });
              }
              if (msgType == "startNewChat") {
                alert("New User has Started a Chat");
                this.roomName = data;
              }
            });
          }
        });
      },
      submitMessage() {
        var msg = {};
        if (this.form.userRole == "Agent") {
          msg = { messagetext: this.inputMessageText, roomName: this.roomName };
        } else {
          msg = { messagetext: this.inputMessageText };
        }
        alert(JSON.stringify(msg));
        SocketioService.sendMessage(msg, () => {
          console.log("Message sent", msg);
          this.messages.push({
            msg,
            ...SENDER,
          });
        });
        // clear the input after the message is sent
        this.inputMessageText = "";
      },
    },
  };
  </script>
  <style scoped>
  .box {
    background-color: #E5F6FF;
    width: 400px;
    height: 500px;
    overflow-y: auto;
    border: solid 1px #000;
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
    display: flex;
    flex-direction: column;
    margin-top: 1rem;
    margin-inline: auto;
  }
  .messages {
    flex-grow: 1;
  }
  .input-div {
    width: 400px;
    margin-inline: auto;
    display: flex;
  }
  .type-msg {
    width: 100%;
  }
  .input-box {
    width: 80%;
    height: 40px;
    border-bottom-left-radius: 10px;
    border: solid 1px #000;
    border-top: none;
  }
  .submit-btn {
    width: 20%;
    height: 40px;
    background-color: rgb(125, 196, 231);
    border-bottom-right-radius: 10px;
    border: solid 1px #000;
    border-top: none;
    border-left: none;
  }
  .sender-circle {
    width: 10px !important;
    height: 10px;
    margin-bottom: 11px !important;
    margin-bottom: 0px;
    background-color: #00A884;
    border-radius: 50%;
  }
  .receiver-circle {
    width: 10px !important;
    height: 10px;
    margin-bottom: 11px !important;
    margin-bottom: 0px;
    background-color: #111B21;
    border-radius: 50%;
  }
  .box2 {
    padding: 20px;
    color: #00A884;
    position: relative;
  }
  .sb1-send:before {
    content: "";
    width: 0px;
    height: 0px;
    position: absolute;
    border-left: 3px solid #00A884;
    border-right: 14px solid transparent;
    border-top: 9px solid #00A884;
    border-bottom: 5px solid transparent;
    right: -11px;
    top: 0px;
  }
  .sb1-receive:before {
    content: "";
    width: 0px;
    height: 0px;
    position: absolute;
    border-left: 14px solid transparent;
    border-right: 3px solid #111B21;
    border-top: 9px solid #111B21;
    border-bottom: 5px solid transparent;
    left: -11px;
    top: 0px;
  }
  .sender {
    width: 60%;
    margin-right: 25px;
    margin-left: auto;
    display: flex;
    flex-direction: column;
  }
  .sender-name {
    padding: 5px 4px;
    text-align: right;
    font-size: 18px;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    font-weight: bold;
  }
  .send-msg {
    width: fit-content;
    color:white;
    padding: 8px 15px;
    background-color: #00A884;
    border-top-left-radius: 10px;
    border-bottom-left-radius: 10px;
    border-bottom-right-radius: 10px;
    border-top-right-radius: none;
    text-align: left;
    align-self: flex-end;
  }
  .receiver {
    width: 60%;
    margin-left: 25px;
    margin-right: auto;
  }
  .receiver-name {
    padding: 5px 4px;
    text-align: left;
    font-size: 18px;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    font-weight: bold;
  }
  .receive-msg {
    width: fit-content;
    padding: 8px 15px;
    color:#fff;
    background-color: #111B21;
    border-top-left-radius: none;
    border-bottom-left-radius: 10px;
    border-bottom-right-radius: 10px;
    border-top-right-radius: 10px;
    text-align: left;
  }
  </style>