const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();

// Atur middleware proxy untuk meneruskan permintaan ke backend eksternal
app.use(
  "/general",
  createProxyMiddleware({
    target: "http://147.139.135.195:2101",
    changeOrigin: true,
  })
);

// Jalankan server di port tertentu
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server berjalan di port ${port}`);
});
