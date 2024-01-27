const express = require("express");
const bodyParser = require("body-parser");
const { createServer } = require("http");
const { readdirSync } = require("fs");
require("dotenv").config();
const cors = require("cors");
console.log(readdirSync("./routes"));

const app = express();
const server = createServer(app);

app.use(
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

app.use(bodyParser.json());

const paymentConfirmation = require("./routes/payment.js");
const transaksi = require("./routes/transaksi.js");
const inquiryTransaksi = require("./routes/inquiry.js");

app.post("/api/inquiry", inquiryTransaksi);

app.get("/api/payment-confirm", paymentConfirmation);
app.get("/api/payment", paymentConfirmation);

app.get("/", transaksi);
app.get("/transaksi/export", transaksi);
app.get("/transaksi/summary", transaksi);
app.get("/transactions", transaksi);
app.get("/transaksi/weeklySumary", transaksi);

const PORT = process.env.PORT || 3002; // Menggunakan variabel PORT
server.listen(PORT, () => {
  console.log(`server running at http://127.0.0.1:${PORT}`);
});
