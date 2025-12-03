const express = require("express");
const app = express();
const http = require("http").createServer(app);
const { Server } = require("socket.io");

const io = new Server(http, {
    cors: { origin: "*" }
});

// ✅ ROUTE JOIN
app.get("/join/:roomId", (req, res) => {
    const roomId = req.params.roomId;

    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>WatchParty Join</title>
        </head>
        <body>
            <script>
                localStorage.setItem("watchparty-room", "${roomId}");
                window.location.href = "https://www.youtube.com";
            </script>
        </body>
        </html>
    `);
});

// ⚡ SOCKET LOGIC
io.on("connection", (socket) => {
    socket.on("join-room", ({ roomId, username }) => {
        socket.join(roomId);
        io.to(roomId).emit("chat-message", {
            username: "System",
            message: username + " a rejoint la room"
        });
    });

    socket.on("chat-message", ({ roomId, message }) => {
        io.to(roomId).emit("chat-message", {
            username: socket.id.slice(0, 4),
            message
        });
    });

    socket.on("video-event", (data) => {
        socket.to(data.roomId).emit("video-event", data);
    });
});

http.listen(process.env.PORT || 3000, () => {
    console.log("Server running");
});
