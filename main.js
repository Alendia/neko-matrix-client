global.Olm = require("@matrix-org/olm");

const readline = require("readline");
const { createReadStream } = require("fs");
const path = require("path");
const homedir = require("os").homedir();
const sdk = require("matrix-js-sdk");
const { accessToken, userId, deviceId } = require("./info.json");
const { setRoomList, printRoomList, printHelp, printRoomInfo, printMemberList, printMessages } = require("./src/util");
const { Storage, readContent } = require("./src/storage");

const storage = readContent();

const client = sdk.createClient({
  baseUrl: "https://mx.alendia.dev",
  accessToken: accessToken,
  userId: userId,
  sessionStore: new sdk.WebStorageSessionStore(storage),
  cryptoStore: new sdk.MemoryCryptoStore(),
  deviceId: deviceId,
});

client.initCrypto();

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
  const [command, arg] = line.split(" ");
  if (viewingRoom) {
    if (line === "/exit") {
      viewingRoom = null;
      printRoomList(roomList);
    } else if (line === "/roominfo") {
      // only same server room info can be read
      printRoomInfo(viewingRoom);
    } else if (line === "/members") {
      printMemberList(viewingRoom, userId);
    } else if (command === "/more") {
      const amount = parseInt(arg) || 20;
      client.scrollback(viewingRoom, amount).then(
        (room) => {
          printMessages(room, roomList, userId);
          rl.prompt();
        },
        (e) => {
          console.log(e);
        }
      );
    } else if (command === "/invite") {
      const inviteUserId = arg.trim();
      client.invite(viewingRoom.roomId, inviteUserId).then(
        () => {
          printMessages(viewingRoom, roomList, userId);
          rl.prompt();
        },
        (e) => {
          console.log(e);
        }
      );
      console.log("Alendia's Reminder: Reinvite someone will remove him/her");
    } else if (command === "/file") {
      // upload local file to room
      const fileName = path.join(homedir, arg.trim());
      const stream = createReadStream(fileName);
      client.uploadContent({ stream: stream, name: fileName }).then((url) => {
        const content = {
          msgType: "m.file",
          body: fileName,
          url: JSON.parse(url).content_uri,
        };
        client.sendMessage(viewingRoom.roomId, content);
      });
    }
  } else {
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
