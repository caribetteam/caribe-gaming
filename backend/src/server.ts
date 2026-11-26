import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDatabase } from './config/database';
import pedidosRoutes from './routes/pedidos';
import produtosRoutes from './routes/produto';
import mercadoPagoRoutes from './routes/mercadopago';

const app = express();

app.use(
  cors({
    origin: ['http://localhost:4200', 'https://caribesgaming.vercel.app'],
  }),
);

app.use(express.json());

app.use('/api/pedidos', pedidosRoutes);
app.use('/api/produtos', produtosRoutes);
app.use('/api/mercado-pago', mercadoPagoRoutes);

app.get('/api/status', (_req, res) => {
  res.json({
    message: 'Backend do Caribe Gaming funcionando!',
    status: 'online',
  });
});

async function startServer() {
  const PORT = Number(process.env['PORT']) || 4000;

  try {
    await connectDatabase();
    console.log('MongoDB conectado com sucesso!');
  } catch (error) {
    console.warn('MongoDB indisponível. O backend iniciará sem acesso ao banco.');
    console.warn(error);
  }

  app.listen(PORT, () => {
    console.log(`Backend rodando em http://localhost:${PORT}`);
  });
}

startServer();
