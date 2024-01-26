const express = require("express");
const bodyParser = require("body-parser");
const { createServer } = require("http");
const { readdirSync } = require("fs");
require("dotenv").config();

console.log(readdirSync("./routes"));

const app = express();
const server = createServer(app);
app.use(bodyParser.json());

const paymentConfirmation = require("./routes/payment.js");
const transaksi = require("./routes/transaksi");

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
