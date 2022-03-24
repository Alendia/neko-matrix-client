const readline = require("readline");
const sdk = require("matrix-js-sdk");
const { accessToken, alendiaRoomId } = require("./info.json");
const { setRoomList, printRoomList } = require("./src/util");

const client = sdk.createClient({
  baseUrl: "https://mx.alendia.dev",
  accessToken: accessToken,
  userId: "@alendia:mx.alendia.dev",
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const username = process.env.USERNAME;

let roomList;

rl.setPrompt(`${username}> `);
rl.on("line", (line) => {});

client.startClient();

client.on("sync", (state, prevState, res) => {
  if (state === "PREPARED") {
    roomList = setRoomList(client);
    printRoomList(roomList);
  }
});

client.on("event", (event) => {
  // console.log(event.getType());
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
