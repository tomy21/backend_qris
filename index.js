const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const dbConfig = require("./dbConfig");
const response = require("./response");
const bodyParser = require("body-parser");
const exceljs = require("exceljs");

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3002",
      "http://localhost:5000",
      "https://landing-page-qris.vercel.app/",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Gunakan middleware cors
app.use(
  cors({
    origin: [
      "http://localhost:3002",
      "http://localhost:5000",
      "https://landing-page-qris.vercel.app/",
    ], // atau origin aplikasi frontend Anda
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);

app.use(bodyParser.json());

app.get("/", async (req, res) => {
  const sql =
    "SELECT tbl_transaksis.id_transaksi, tbl_transaksis.type, tbl_lokasi.Name, tbl_transaksis.inTime,tbl_transaksis.outTime,tbl_transaksis.payTime, tbl_transaksis.amount, tbl_transaksis.updated_at FROM `tbl_transaksis` JOIN tbl_gate ON tbl_gate.id = tbl_transaksis.id_gate JOIN tbl_lokasi ON tbl_lokasi.id = tbl_gate.id_location ORDER BY updated_at DESC LIMIT 10";
  try {
    const results = await new Promise((resolve, reject) => {
      dbConfig.query(sql, (error, results) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(results);
      });
    });

    const data = {
      code: 200,
      data: results,
    };

    response(200, results, "Get data successfully", res);
    io.emit("dataAllRealtime", data);
  } catch (error) {
    console.error("Error fetching data:", error);
    response(500, error, "Internal Server Error", res);
  }
});

app.get("/api/export", async (req, res) => {
  try {
    const sql =
      "SELECT tbl_transaksis.id_transaksi, tbl_transaksis.type, tbl_lokasi.Name, tbl_transaksis.inTime,tbl_transaksis.outTime,tbl_transaksis.payTime, tbl_transaksis.amount, tbl_transaksis.updated_at FROM `tbl_transaksis` JOIN tbl_gate ON tbl_gate.id = tbl_transaksis.id_gate JOIN tbl_lokasi ON tbl_lokasi.id = tbl_gate.id_location ORDER BY updated_at";

    dbConfig.query(sql, async (err, result) => {
      if (err) {
        console.error("Error executing query:", err);
        response(500, null, "Failed to fetch summary data", res);
      } else {
        const data = result.map((row, index) => {
          index + 1;
          row.id_transaksi;
          row.Name;
          row.type;
          row.inTime;
          row.payTime;
          row.amount;
        });

        const workbook = new exceljs.Workbook();
        const worksheet = workbook.addWorksheet("data 1");

        // Tambahkan header
        worksheet.addRow([
          "No",
          "No Trx",
          "Lokasi",
          "In Time",
          "Pay Time",
          "Out Time",
          "Amount",
        ]);

        // Tambahkan data
        data.forEach((row) => {
          worksheet.addRow(row);
        });

        // Set header agar dapat diunduh sebagai file Excel
        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader("Content-Disposition", "attachment; filename=data.xlsx");

        // Kembalikan file Excel ke client
        await workbook.xlsx.write(res);
        res.end();
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/summary", async (req, res) => {
  const currentSummarySql = `
    SELECT 
        COALESCE(SUM(amount), 0) as totalTariff,
        COUNT(*) as totalTransactions
    FROM tbl_transaksis
    WHERE MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE());
`;

  const previousSummarySql = `
    SELECT 
        COALESCE(SUM(amount), 0) as totalTariff,
        COUNT(*) AS transactions,
        MONTH(created_at) AS month
    FROM tbl_transaksis
    WHERE 
        created_at >= DATE_FORMAT(NOW(), '%Y-%m-01') - INTERVAL 3 MONTH
        AND created_at < DATE_FORMAT(NOW(), '%Y-%m-01')
    GROUP BY MONTH(created_at);
`;

  try {
    const currentResult = await new Promise((resolve, reject) => {
      dbConfig.query(currentSummarySql, (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(result[0]);
      });
    });

    const previousResult = await new Promise((resolve, reject) => {
      dbConfig.query(previousSummarySql, (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(result);
      });
    });

    const data = {
      current: currentResult,
      previous: previousResult,
    };

    io.emit("dataFromServer", data);
    response(200, data, "Successfully get summary data", res);
  } catch (error) {
    console.error(error);
    response(500, null, "Failed to fetch summary data", res);
  }
});

app.get("/transactions", async (req, res) => {
  const inTime = `SELECT COUNT(*) as total FROM tbl_transaksis WHERE inTime IS NOT NULL`;
  const payTime = `SELECT COUNT(*) as total FROM tbl_transaksis WHERE payTime IS NOT NULL`;
  const outTime = `SELECT COUNT(*) as total FROM tbl_transaksis WHERE outTime IS NOT NULL`;

  try {
    const inTimeTrx = await new Promise((resolve, reject) => {
      dbConfig.query(inTime, (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(result[0]);
      });
    });

    const payTimeTrx = await new Promise((resolve, reject) => {
      dbConfig.query(payTime, (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(result[0]);
      });
    });

    const outTimeTrx = await new Promise((resolve, reject) => {
      dbConfig.query(outTime, (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(result[0]);
      });
    });

    const data = {
      in: inTimeTrx,
      pay: payTimeTrx,
      out: outTimeTrx,
    };

    io.emit("getTransactions", data);
    response(200, data, "Successfully get summary data", res);
  } catch (error) {
    console.error(error);
    response(500, null, "Failed to fetch summary data", res);
  }
});

app.get("/weeklySumary", async (req, res) => {
  const totalTraffic = `SELECT
        COUNT(*) AS totalTransactions
    FROM
        tbl_transaksis
    WHERE
        created_at BETWEEN DATE_SUB(NOW(), INTERVAL 7 DAY) AND NOW()`;

  const totalAmount = `SELECT
        SUM(amount) AS totalAmount
    FROM
        tbl_transaksis
    WHERE
        created_at BETWEEN DATE_SUB(NOW(), INTERVAL 7 DAY) AND NOW()`;

  try {
    const traffic = await new Promise((resolve, reject) => {
      dbConfig.query(totalTraffic, (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(result[0]);
      });
    });

    const amount = await new Promise((resolve, reject) => {
      dbConfig.query(totalAmount, (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(result[0]);
      });
    });

    const data = {
      traffic: traffic,
      amount: amount,
    };

    io.emit("summaryDataWeekly", data);
    response(200, data, "Successfully get summary data", res);
  } catch (error) {
    console.error(error);
    response(500, null, "Failed to fetch summary data", res);
  }
});

app.get("/api/payment-confirm", (req, res) => {
  const data = {
    code: 200,
    data: "success",
  };
  io.emit("dataPayment", data);
  res.json(data);
});

io.on("connection", (socket) => {
  console.log("a user connected", socket.id);

  app.get("/api/payment-confirm", (req, res) => {
    const data = {
      code: 200,
      data: "success",
    };
    io.emit("dataPayment", data);
    res.json(data);
  });

  app.get("/", async (req, res) => {
    const sql =
      "SELECT tbl_transaksis.id_transaksi, tbl_transaksis.type, tbl_lokasi.Name, tbl_transaksis.inTime,tbl_transaksis.outTime,tbl_transaksis.payTime, tbl_transaksis.amount FROM `tbl_transaksis` JOIN tbl_gate ON tbl_gate.id = tbl_transaksis.id_gate JOIN tbl_lokasi ON tbl_lokasi.id = tbl_gate.id_location ORDER BY created_at DESC LIMIT 10";
    try {
      const results = await new Promise((resolve, reject) => {
        dbConfig.query(sql, (error, results) => {
          if (error) {
            reject(error);
            return;
          }
          resolve(results);
        });
      });

      const data = {
        data: results,
      };

      response(200, results, "Get data successfully", res);
      io.emit("dataFromServer", data);
    } catch (error) {
      console.error("Error fetching data:", error);
      response(500, error, "Internal Server Error", res);
    }
  });

  app.get("/summary", async (req, res) => {
    const currentSummarySql = `
        SELECT 
            COALESCE(SUM(amount), 0) as totalTariff,
            COUNT(*) as totalTransactions
        FROM tbl_transaksis
        WHERE MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE());
    `;

    const previousSummarySql = `
        SELECT 
            COALESCE(SUM(amount), 0) as totalTariff,
            COUNT(*) AS transactions,
            MONTH(created_at) AS month
        FROM tbl_transaksis
        WHERE 
            created_at >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH) 
            AND created_at < DATE_SUB(CURDATE(), INTERVAL 2 MONTH) 
        GROUP BY MONTH(created_at);
    `;

    try {
      const currentResult = await new Promise((resolve, reject) => {
        dbConfig.query(currentSummarySql, (error, result) => {
          if (error) {
            reject(error);
            return;
          }
          resolve(result[0]);
        });
      });

      const previousResult = await new Promise((resolve, reject) => {
        dbConfig.query(previousSummarySql, (error, result) => {
          if (error) {
            reject(error);
            return;
          }
          resolve(result);
        });
      });

      const data = {
        current: currentResult,
        previous: previousResult,
      };

      io.emit("dataFromServer", data);
      response(200, data, "Successfully get summary data", res);
    } catch (error) {
      console.error(error);
      response(500, null, "Failed to fetch summary data", res);
    }
  });

  app.get("/transactions", async (req, res) => {
    const inTime = `SELECT COUNT(*) as total FROM tbl_transaksis WHERE inTime IS NOT NULL`;
    const payTime = `SELECT COUNT(*) as total FROM tbl_transaksis WHERE payTime IS NOT NULL`;
    const outTime = `SELECT COUNT(*) as total FROM tbl_transaksis WHERE outTime IS NOT NULL`;

    try {
      const inTimeTrx = await new Promise((resolve, reject) => {
        dbConfig.query(inTime, (error, result) => {
          if (error) {
            reject(error);
            return;
          }
          resolve(result[0]);
        });
      });

      const payTimeTrx = await new Promise((resolve, reject) => {
        dbConfig.query(payTime, (error, result) => {
          if (error) {
            reject(error);
            return;
          }
          resolve(result);
        });
      });

      const outTimeTrx = await new Promise((resolve, reject) => {
        dbConfig.query(outTime, (error, result) => {
          if (error) {
            reject(error);
            return;
          }
          resolve(result);
        });
      });

      const data = {
        in: inTimeTrx,
        pay: payTimeTrx,
        out: outTimeTrx,
      };

      io.emit("getTransactions", data);
      response(200, data, "Successfully get summary data", res);
    } catch (error) {
      console.error(error);
      response(500, null, "Failed to fetch summary data", res);
    }
  });

  app.get("/weeklySumary", async (req, res) => {
    const totalTraffic = `SELECT
            COUNT(*) AS totalTransactions
        FROM
            tbl_transaksis
        WHERE
            created_at BETWEEN DATE_SUB(NOW(), INTERVAL 7 DAY) AND NOW()`;

    const totalAmount = `SELECT
            SUM(amount) AS totalAmount
        FROM
            tbl_transaksis
        WHERE
            created_at BETWEEN DATE_SUB(NOW(), INTERVAL 7 DAY) AND NOW()`;

    try {
      const traffic = await new Promise((resolve, reject) => {
        dbConfig.query(totalTraffic, (error, result) => {
          if (error) {
            reject(error);
            return;
          }
          resolve(result[0]);
        });
      });

      const amount = await new Promise((resolve, reject) => {
        dbConfig.query(totalAmount, (error, result) => {
          if (error) {
            reject(error);
            return;
          }
          resolve(result[0]);
        });
      });

      const data = {
        traffic: traffic,
        amount: amount,
      };

      io.emit("summaryDataWeekly", data);
      response(200, data, "Successfully get summary data", res);
    } catch (error) {
      console.error(error);
      response(500, null, "Failed to fetch summary data", res);
    }
  });
});

const PORT = process.env.PORT || 3002; // Menggunakan variabel PORT
server.listen(PORT, () => {
  console.log(`server running at http://127.0.0.1:${PORT}`);
});
