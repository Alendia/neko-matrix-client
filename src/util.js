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

exports.setRoomList = setRoomList;
exports.printRoomList = printRoomList;
