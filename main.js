const readline = require("readline");
const sdk = require("matrix-js-sdk");
const { accessToken, alendiaRoomId } = require("./info.json");

const client = sdk.createClient({
  baseUrl: "https://mx.alendia.dev",
  accessToken: accessToken,
  userId: "@alendia:mx.alendia.dev",
});

client.startClient();

client.on("sync", (state, prevState, res) => {
  console.log(state, prevState, res);
});

client.on("event", (event) => {
  console.log(event.getType());
});

client.on("Room.timeline", (event, room, token) => {
  console.log(event.event);
});

const rooms = client.getRooms();
rooms.forEach((room) => {
  console.log(room.roomId);
  const members = room.getJoinedMembers();
  members.forEach((member) => {
    console.log(member.name);
  });
});

rooms.forEach((room) => {
  room.timeline.forEach((t) => {
    console.log(JSON.stringify(t.event.content));
  });
});

const content = {
  body: "Hello Neko!",
  msgtype: "m.text",
};

// send message to Alendia in Matrix.org Server
/* client
  .sendEvent(alendiaRoomId, "m.room.message", content, "")
  .then((res) => {
    console.log("success");
  })
  .catch((err) => {
    console.log(err);
  });
 */

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.on("line", (line) => {
  console.log(line);
});


