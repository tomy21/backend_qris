const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const router = express.Router();

const bodyParser = require("body-parser");

router.use(bodyParser.json());

router.post("/api/inquiry", (req, res) => {
  const apiUrl =
    "http://147.139.135.195:2101/general/Partner/InquiryTransaction";
  createProxyMiddleware({ target: apiUrl })(req, res);
});

module.exports = router;
