import express from 'express';
import cors from 'cors';
import { createServer } from 'vite';

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Vite server
const vite = await createServer({
  server: { middlewareMode: true },
  appType: 'spa',
});

app.use(vite.middlewares);

const port = process.env.PORT || 5173;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});