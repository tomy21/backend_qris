const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const router = express.Router();

// Import middleware untuk parsing body JSON
const bodyParser = require("body-parser");

// Gunakan middleware untuk parsing body JSON
router.use(bodyParser.json());

// Handler untuk permintaan POST ke /api/inquiry
router.post("/api/inquiry", (req, res) => {
  // Tujuan URL eksternal yang ingin Anda hubungi
  const apiUrl =
    "http://147.139.135.195:2101/general/Partner/InquiryTransaction";

  // Teruskan permintaan ke server eksternal menggunakan proxy middleware
  createProxyMiddleware({ target: apiUrl })(req, res);
});

module.exports = router;
