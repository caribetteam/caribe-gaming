import { Router, Request, Response } from 'express';
import {
  criarPreferenciaMercadoPago,
  consultarPagamentoMercadoPago,
} from '../services/mercadopagoservice';

const router = Router();

interface ItemRequisicao {
  id: string | number;
  quantity: number;
}

interface PreferenciaRequest {
  items: ItemRequisicao[];
  payer: {
    email: string;
  };
}

// Criar preferência de pagamento
router.post('/preference', async (req: Request, res: Response) => {
  try {
    const { items, payer } = req.body as PreferenciaRequest;

    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({
        error: 'O carrinho está vazio ou inválido.',
      });
      return;
    }

    if (!payer?.email) {
      res.status(400).json({
        error: 'O e-mail do comprador é obrigatório.',
      });
      return;
    }

    const itens = items.map((item) => ({
      id: item.id,
      quantidade: item.quantity,
    }));

    const resultado = await criarPreferenciaMercadoPago(itens, payer.email);

    res.status(201).json(resultado);
  } catch (error) {
    console.error('Erro ao criar preferência:', error);

    res.status(500).json({
      error: error instanceof Error ? error.message : 'Erro ao criar preferência de pagamento.',
    });
  }
});

// Consultar pagamento
router.get('/payment/:id', async (req: Request, res: Response) => {
  try {
    const pagamento = await consultarPagamentoMercadoPago(String(req.params.id));

    res.json(pagamento);
  } catch (error) {
    console.error('Erro ao consultar pagamento:', error);

    res.status(500).json({
      error: 'Não foi possível consultar o pagamento.',
    });
  }
});

// Webhook
router.post('/webhook', async (req: Request, res: Response) => {
  try {
    console.log('Webhook Mercado Pago recebido:', req.body);

    res.sendStatus(200);
  } catch (error) {
    console.error('Erro no webhook:', error);
    res.sendStatus(500);
  }
});

export default router;
