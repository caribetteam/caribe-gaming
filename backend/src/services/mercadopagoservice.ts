import { MercadoPagoConfig, Preference } from 'mercadopago';
import { randomUUID } from 'node:crypto';

interface ItemCheckout {
  id: string | number;
  quantidade?: number;
}

interface SteamApp {
  success: boolean;
  data?: {
    name?: string;
    price_overview?: {
      final?: number;
      currency?: string;
    };
  };
}

const FRONTEND_URL = 'https://caribesgaming.vercel.app';

// Consulta o preço atualizado na Steam brasileira
async function consultarPrecoSteam(appId: string | number) {
  const id = String(appId);

  if (!/^\d+$/.test(id)) {
    throw new Error(`ID inválido: ${id}`);
  }

  const url = `https://store.steampowered.com/api/appdetails?appids=${id}&cc=br`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Erro ao consultar a Steam: ${id}`);
  }

  const resultado = (await response.json()) as Record<string, SteamApp>;
  const jogo = resultado[id];

  if (!jogo?.success || !jogo.data?.price_overview) {
    throw new Error(`Não foi possível obter o preço do jogo ${id}`);
  }

  const preco = jogo.data.price_overview;

  if (preco.currency !== 'BRL' || typeof preco.final !== 'number' || preco.final <= 0) {
    throw new Error(`O jogo ${id} não possui preço válido em reais`);
  }

  return {
    id,
    title: jogo.data.name || `Jogo ${id}`,
    quantity: 1,
    currency_id: 'BRL',
    unit_price: Number((preco.final / 100).toFixed(2)),
  };
}

// Cria a preferência de pagamento
export async function criarPreferenciaMercadoPago(itens: ItemCheckout[], email: string) {
  const accessToken = process.env['MERCADO_PAGO_ACCESS_TOKEN'];

  if (!accessToken) {
    throw new Error('MERCADO_PAGO_ACCESS_TOKEN não configurado');
  }

  if (!Array.isArray(itens) || itens.length === 0) {
    throw new Error('O carrinho está vazio');
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('E-mail inválido');
  }

  const itensComPreco = await Promise.all(
    itens.map(async (item) => {
      const produto = await consultarPrecoSteam(item.id);
      const quantidade = item.quantidade ?? 1;

      if (!Number.isInteger(quantidade) || quantidade < 1) {
        throw new Error('Quantidade inválida');
      }

      return {
        ...produto,
        quantity: quantidade,
      };
    }),
  );

  const client = new MercadoPagoConfig({
    accessToken,
    options: {
      timeout: 10000,
    },
  });

  const preference = new Preference(client);
  const externalReference = randomUUID();

  const resultado = await preference.create({
    body: {
      items: itensComPreco,
      payer: {
        email,
      },
      external_reference: externalReference,

      back_urls: {
        success: `${FRONTEND_URL}/checkout?status=success`,
        pending: `${FRONTEND_URL}/checkout?status=pending`,
        failure: `${FRONTEND_URL}/checkout?status=failure`,
      },

      auto_return: 'approved',
    },
  });

  if (!resultado.init_point || !resultado.id) {
    throw new Error('O Mercado Pago não retornou os dados da preferência');
  }

  return {
    id: resultado.id,
    initPoint: resultado.init_point,
    externalReference,
  };
}

// Consulta o pagamento pelo ID
export async function consultarPagamentoMercadoPago(paymentId: string) {
  const accessToken = process.env['MERCADO_PAGO_ACCESS_TOKEN'];

  if (!accessToken) {
    throw new Error('MERCADO_PAGO_ACCESS_TOKEN não configurado');
  }

  if (!/^\d+$/.test(paymentId)) {
    throw new Error('ID de pagamento inválido');
  }

  const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Não foi possível consultar o pagamento');
  }

  const pagamento = (await response.json()) as {
    id: number;
    status: string;
    external_reference?: string;
  };

  return {
    id: pagamento.id,
    status: pagamento.status,
    externalReference: pagamento.external_reference,
  };
}
