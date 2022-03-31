const sdk = require("matrix-js-sdk");

const printfixedLengthContent = (content, length) => {
  if (content.length > length) {
    // \u2026 is …
    return content.substring(0, length - 2) + "\u2026";
  } else if (content.length < length) {
    // fill insufficient gap with space
    return content + Array(length - content.length).join(" ");
  } else {
    return content;
  }
};

const setRoomList = (client) => {
  let roomList = client.getRooms();
  roomList.sort((a, b) => {
    const aMsg = a.timeline[a.timeline.length - 1];
    const bMsg = b.timeline[b.timeline.length - 1];
    if (!aMsg) return -1;
    if (!bMsg) return 1;
    if (aMsg.getTs() > bMsg.getTs()) {
      return 1;
    } else {
      return -1;
    }
  });
  return roomList;
};

const printRoomList = (roomList) => {
  console.log("Room List:");
  roomList.forEach((room, index) => {
    const lastMsg = room.timeline[room.timeline.length - 1];
    const dateStr = lastMsg ? new Date(lastMsg.getTs()).toISOString().replace("T", " ").replace(/\..+/, "") : "---";
    const membership = room.getMyMembership();
    const name = room.name;
    console.log("[%s] %s (%s members) %s", index, name, room.getJoinedMembers().length, dateStr);
  });
};

const printHelp = () => {
  console.log("Global commands:");
  console.log("  '/help' : Show this help.");
  console.log("Room list index commands:");
  console.log("  '/join <index>' Join a room, e.g. '/join 5'");
  console.log("Room commands:");
  console.log("  '/exit' Return to the room list index.");
  console.log("  '/members' Show the room member list.");
  console.log("  '/invite @foo:bar' Invite @foo:bar to the room.");
  console.log("  '/more 15' Scrollback 15 events");
  console.log("  '/resend' Resend the oldest event which failed to send.");
  console.log("  '/roominfo' Display room info e.g. name, topic.");
};

const printRoomInfo = (room) => {
  // show it with table view in REPL
  const eventMap = room.currentState.events;
  const eventTypeHeader = "    Event Type(state_key)    ";
  const sendHeader = "        Sender        ";
  const restSpaceWidth = 36;
  const padSpace = Array(restSpaceWidth / 2).join(" ");
  const contentHeader = padSpace + "Content" + padSpace;

  console.log(eventTypeHeader + sendHeader + contentHeader);
  console.log(Array(100).join("-"));

  for (const [eventType, eventValue] of eventMap) {
    if (eventType === "m.room.member") return;
    for (const [stateKey, eventInfo] of eventValue) {
      const typeAndKey = eventType + `${stateKey.length > 0 ? "(" + stateKey + ")" : ""}`;
      const typeStr = printfixedLengthContent(typeAndKey, eventTypeHeader.length);
      const senderStr = printfixedLengthContent(eventInfo.getSender(), sendHeader.length);
      const eventContent = JSON.stringify(eventInfo.getContent());
      const contentStr = printfixedLengthContent(eventContent, contentHeader.length);
      console.log(`${typeStr} | ${senderStr} | ${contentStr}`);
    }
  }
};

const printMessages = (viewingRoom, roomList, userId) => {
  if (!viewingRoom) {
    printRoomList(roomList);
    return;
  }
  console.log("\x1B[2J");
  viewingRoom.timeline.map((message) => {
    printLine(message, userId);
  });
};

const printLine = (event, userId) => {
  const maxNameWidth = 15;
  let name = event.sender ? event.sender.name : event.getSender();
  if (name.length > maxNameWidth) {
    name = name.substring(0, maxNameWidth - 1) + "\u2026";
  }

  let separator = "<<<";
  if (event.getSender() === userId) {
    name = "Me";
    separator = ">>>";
    if (event.status === sdk.EventStatus.SENDING) {
      separator = "...";
    } else if (event.status === sdk.EventStatus.NOT_SENT) {
      separator = "x";
    }
  }

  const time = new Date(event.getTs()).toISOString().replace(/T/, " ").replace(/\..+/, "");

  let body;
  if (event.getType() === "m.room.message") {
    body = event.getContent().body;
  } else if (event.isState()) {
    let stateName = event.getType();
    if (event.getStateKey().length > 0) {
      stateName += ` (${event.getStateKey()})`;
    }
    body = `[State: stateName updated to: ${JSON.stringify(event.getContent())}]`;
    separator = "---";
  } else {
    body = `[Message: ${event.getType()} Content: ${JSON.stringify(event.getContent())}]`;
    separator = "---";
  }

  console.log(`[${time}] ${name} ${separator} ${body}`);
};

exports.setRoomList = setRoomList;
exports.printRoomList = printRoomList;
exports.printHelp = printHelp;
exports.printRoomInfo = printRoomInfo;
exports.printMessages = printMessages;
