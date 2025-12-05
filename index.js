const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});

// --- NOUVEAU : PAGE /join PRÉSERVE L’URL YOUTUBE ---
app.get("/join/:roomId", (req, res) => {
    const { roomId } = req.params;
    const videoUrl = req.query.url || "https://www.youtube.com/";

    const finalUrl = `${videoUrl}${videoUrl.includes("?") ? "&" : "?"}room=${roomId}`;

    res.send(`
        <html>
          <head><title>WatchParty – Join</title></head>
          <body>
            <p>Joining WatchParty…</p>
            <script>
              window.location.href = "${finalUrl}";
            </script>
          </body>
        </html>
    `);
});

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
        console.log("❌ user disconnected");
    });

});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("WatchParty server running on", PORT));
