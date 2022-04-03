# neko-matrix-client

A simple command line Matrix client support end-to-end encryption

## Installation

```bash
pnpm add
```

(I use pnpm instead of npm to manage package by default, but you can still use yarn or npm to install)

## Config

### Basic

1. You need to config  `accessToken`  and `userId` in `~/info.json`.

   `accessToken` can be founded by [this guide](https://matrix.org/docs/guides/client-server-api#login)

   `userId` format is supported in `info.json`.

2. delete `sessionStore`, `cryptoStore` and `deviceId` option in `~/main.js`

   ```javascript
   const { accessToken, userId } = require("./info.json");
   
   const client = sdk.createClient({
     baseUrl: "https://mx.alendia.dev",
     accessToken: accessToken,
     userId: userId,
   });
   ```

### E2E Encryption Support

You need to config `deviceId` in `info.json`. It should be unique.

## Usage

```bash
pnpm run start
```

## Command

### /help

Show help.

### /join \<index\> 

Join a room, e.g. `/join 5`

### /exit

Return to the room list index.

### /members

Show the room member list.

### /invite @example:example.com

Invite @example:example.com to the room.

### /more \<number\>

Scrollback more events

### /roominfo

🚫 **Cross Server Room Info cannot be displayed**

Display room info e.g. name, topic.