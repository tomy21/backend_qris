const express = require("express");
const http = require("http"); // Import modul http untuk membuat permintaan HTTP
const router = express.Router();
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

router.use(bodyParser.json());
router.use(
  cors({
    origin: [
      "http://localhost:3000",
      process.env.CORS_URL_2,
      process.env.CORS_URL_3,
    ], // atau origin aplikasi frontend Anda
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);
router.post("/api/inquiry", (req, res) => {
  try {
    const postData = JSON.stringify(req.body);
    const options = {
      hostname: "147.139.135.195",
      port: 2101,
      path: "/general/Partner/InquiryTransaction",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": postData.length,
      },
    };

    // Buat permintaan HTTP dengan modul http
    const request = http.request(options, (response) => {
      let data = "";

      response.on("data", (chunk) => {
        data += chunk;
      });

      response.on("end", () => {
        // Kirim respons dari permintaan internal ke klien
        res.status(response.statusCode).send(data);
      });
    });

    request.on("error", (error) => {
      console.error("Error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    });

    request.write(postData);
    request.end();
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
