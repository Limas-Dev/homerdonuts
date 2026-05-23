import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Database path
  const dbDir = path.join(process.cwd(), "data");
  const dbPath = path.join(dbDir, "stock.json");

  // Ensure directory exists
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const defaultStock: Record<string, number> = {
    "dleite": 30,
    "pink-homer": 30,
    "choco": 30
  };

  const readStock = (): Record<string, number> => {
    try {
      if (fs.existsSync(dbPath)) {
        const content = fs.readFileSync(dbPath, "utf-8");
        return JSON.parse(content);
      }
    } catch (e) {
      console.error("Error reading db file, fallback to default", e);
    }
    return { ...defaultStock };
  };

  const writeStock = (stock: Record<string, number>) => {
    try {
      fs.writeFileSync(dbPath, JSON.stringify(stock, null, 2), "utf-8");
    } catch (e) {
      console.error("Error writing db file", e);
    }
  };

  // API routes
  app.get("/api/stock", (req, res) => {
    res.json(readStock());
  });

  app.post("/api/stock/update", (req, res) => {
    const { id, stock } = req.body;
    if (!id || typeof stock !== "number") {
      return res.status(400).json({ error: "Invalid parameters" });
    }
    const current = readStock();
    current[id] = Math.max(0, stock);
    writeStock(current);
    res.json({ success: true, stock: current });
  });

  app.post("/api/stock/purchase", (req, res) => {
    const { items } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: "Invalid parameters" });
    }
    const current = readStock();
    for (const item of items) {
      const donutId = item.id;
      const qty = item.quantity;
      if (donutId && typeof qty === "number") {
        const currentQty = current[donutId] !== undefined ? current[donutId] : 30;
        current[donutId] = Math.max(0, currentQty - qty);
      }
    }
    writeStock(current);
    res.json({ success: true, stock: current });
  });

  // Serve Vite in dev mode
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
