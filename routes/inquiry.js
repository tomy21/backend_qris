const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const bodyParser = require("body-parser");
const { createServer } = require("http");

const app = express();
const server = createServer(app);

app.use(bodyParser.json());

app.post("/api/inquiry", (req, res) => {
  const apiUrl =
    "http://147.139.135.195:2101/general/Partner/InquiryTransaction";
  createProxyMiddleware({ target: apiUrl })(req, res);
});

// Atur server untuk mendengarkan port tertentu
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://127.0.0.1:${PORT}`);
});
