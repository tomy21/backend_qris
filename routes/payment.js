const express = require("express");
const router = express.Router();
const { createServer } = require("http");
const { Server } = require("socket.io");
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      process.env.CORS_URL_1,
      process.env.CORS_URL_2,
      process.env.CORS_URL_3,
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

router.get("/api/payment-confirm", (req, res) => {
  const data = {
    code: 200,
    data: "success",
  };
  io.emit("dataPayment", data);
  res.json(data);
});

module.exports = router;
