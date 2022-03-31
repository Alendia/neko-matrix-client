const readline = require("readline");
const sdk = require("matrix-js-sdk");
const { accessToken, alendiaRoomId, userId } = require("./info.json");
const { setRoomList, printRoomList, printHelp, printRoomInfo, printMessages } = require("./src/util");

const client = sdk.createClient({
  baseUrl: "https://mx.alendia.dev",
  accessToken: accessToken,
  userId: userId,
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const username = process.env.USERNAME;

let roomList;
let viewingRoom;

rl.setPrompt(`${username} > `);
rl.on("line", (line) => {
  if (line.trim().length === 0) {
    rl.prompt();
    return;
  }

  if (line === "/help") {
    printHelp();
    rl.prompt();
    return;
  }

  // current room you check
  if (viewingRoom) {
    if (line === "/exit") {
      viewingRoom = null;
      printRoomList(roomList)
    } else if (line === "/roominfo") {
      // only same server room info can be read
      printRoomInfo(viewingRoom);
    }
  } else {
    const [command, arg] = line.split(" ");
    if (command === "/join") {
      viewingRoom = roomList[arg];
      if (viewingRoom.getMember(userId).membership === "invite") {
        client
          .joinRoom(viewingRoom.roomId)
          .then((room) => {
            roomList = setRoomList(client);
            viewingRoom = room;
            printMessages(viewingRoom, roomList, userId);
          })
          .catch((e) => {
            console.log(e);
          });
      } else {
        printMessages(viewingRoom, roomList);
      }
    }
  }

  rl.prompt();
});

client.on("sync", (state, prevState, res) => {
  if (state === "PREPARED") {
    roomList = setRoomList(client);
    printRoomList(roomList);
  }
});

client.on("Room", () => {
  roomList = setRoomList(client);
  // if (!viewingRoom) {
  //   printRoomList();
  // }
});

client.on("Room.timeline", (event, room, token) => {
  // console.log(event.event);
});

const rooms = client.getRooms();
rooms.forEach((room) => {
  console.log(room.roomId);
  const members = room.getJoinedMembers();
  members.forEach((member) => {
    // console.log(member.name);
  });
});

rooms.forEach((room) => {
  room.timeline.forEach((t) => {
    // console.log(JSON.stringify(t.event.content));
  });
});

client.startClient();
