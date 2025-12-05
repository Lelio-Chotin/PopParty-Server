const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});

// Page join
app.get("/join/:roomId", (req, res) => {
    const { roomId } = req.params;

    res.send(`
        <html>
        <head>
            <title>WatchParty – Join</title>
        </head>
        <body style="font-family: sans-serif; padding: 20px;">
            <h2>Connexion à la WatchParty...</h2>

            <script>
                // Redirection vers YouTube avec hash
                const currentVideo = localStorage.getItem("last-video-url")
                    || "https://www.youtube.com";

                window.location.href = currentVideo + "#room=${roomId}";
            </script>
        </body>
        </html>
    `);
});

// SOCKETS
io.on("connection", socket => {

    socket.on("join-room", ({ roomId, username }) => {
        socket.join(roomId);
        socket.roomId = roomId;
        socket.username = username;
        console.log(`${username} joined ${roomId}`);
    });

    socket.on("video-event", data => {
        socket.to(data.roomId).emit("video-event", data);
    });

    socket.on("video-change", data => {
        socket.to(data.roomId).emit("video-change", data);
    });

    socket.on("chat-message", data => {
        io.to(data.roomId).emit("chat-message", {
            username: socket.username,
            message: data.message
        });
    });

    socket.on("disconnect", () => {
        console.log("user disconnected");
    });

});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () =>
    console.log("WatchParty server running on", PORT)
);
