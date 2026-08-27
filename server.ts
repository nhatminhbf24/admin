import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'GiftPrint Pro - Print & Gift Management API',
      timestamp: new Date().toISOString(),
    });
  });

  // Calculate pricing API
  app.post('/api/quote/calculate', (req, res) => {
    try {
      const { quantity, basePrice, technique, positionsCount, packaging, isUrgent } = req.body;
      const qty = Number(quantity) || 1;
      const base = Number(basePrice) || 50000;
      const pos = Number(positionsCount) || 1;

      let unitPrint = 15000;
      if (technique === 'laser') unitPrint = 8000;
      else if (technique === 'uv') unitPrint = 18000;
      else if (technique === 'in_luoi') unitPrint = 6000;
      else if (technique === 'chuyen_nhiet') unitPrint = 10000;

      const extraPos = pos > 1 ? (pos - 1) * (unitPrint * 0.7) : 0;
      const totalPrintPerUnit = unitPrint + extraPos;

      let packagingCost = 0;
      if (packaging === 'hop_carton') packagingCost = 5000;
      else if (packaging === 'hop_xi_lot_lua') packagingCost = 25000;

      const subtotal = (base + totalPrintPerUnit + packagingCost) * qty;
      const discountRate = qty >= 500 ? 0.15 : qty >= 100 ? 0.08 : 0;
      const discount = subtotal * discountRate;
      const urgentFee = isUrgent ? (subtotal - discount) * 0.2 : 0;
      const total = subtotal - discount + urgentFee;

      res.json({
        success: true,
        quantity: qty,
        unitPrice: Math.round(total / qty),
        totalAmount: Math.round(total),
        discountAmount: Math.round(discount),
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development vs static for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[GiftPrint PRO] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
