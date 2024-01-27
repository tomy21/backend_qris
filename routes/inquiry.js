const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const router = express.Router();
const { createServer } = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const dbConfig = require("../dbConfig");
const response = require("../response");
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

router.use(
  cors({
    origin: [
      process.env.CORS_URL_1,
      process.env.CORS_URL_2,
      process.env.CORS_URL_3,
    ], // atau origin aplikasi frontend Anda
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);

const bodyParser = require("body-parser");

router.use(bodyParser.json());

router.post("/api/inquiry", (req, res) => {
  const apiUrl =
    "http://147.139.135.195:2101/general/Partner/InquiryTransaction";
  createProxyMiddleware({ target: apiUrl })(req, res);
});

module.exports = router;
