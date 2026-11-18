import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDatabase } from './database';
import pedidosRoutes from './routes/pedidos';
import produtosRoutes from './routes/produto';

const app = express();

app.use(
  cors({
    origin: 'http://localhost:4200',
  }),
);

app.use(express.json());
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/produtos', produtosRoutes);

// Rota para testar a API
app.get('/api/status', (_req, res) => {
  res.json({
    message: 'Backend do Caribe Gaming funcionando!',
    status: 'online',
  });
});

// Iniciar o backend
async function startServer() {
  try {
    await connectDatabase();

    const PORT = Number(process.env['PORT']) || 4000;

    app.listen(PORT, () => {
      console.log(`Backend rodando em http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Erro ao iniciar o backend:', error);
    process.exit(1);
  }
}

startServer();
