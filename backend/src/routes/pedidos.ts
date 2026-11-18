import { Router } from 'express';
import { PedidoModel } from '../models/pedido';
import { ProdutoModel } from '../models/produto';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { itens } = req.body;

    if (!Array.isArray(itens) || itens.length === 0) {
      res.status(400).json({
        mensagem: 'O pedido precisa ter pelo menos um produto.',
      });
      return;
    }

    let total = 0;
    const itensPedido = [];

    for (const item of itens) {
      const produto = await ProdutoModel.findOne({
        produtoId: item.produtoId,
        ativo: true,
      });

      if (!produto) {
        res.status(404).json({
          mensagem: `Produto ${item.produtoId} não encontrado.`,
        });
        return;
      }

      const quantidade = Number(item.quantidade);

      if (!Number.isInteger(quantidade) || quantidade < 1) {
        res.status(400).json({
          mensagem: 'Quantidade inválida.',
        });
        return;
      }

      const precoUnitario = produto.preco;

      total += precoUnitario * quantidade;

      itensPedido.push({
        produtoId: produto.produtoId,
        nome: produto.nome,
        quantidade,
        precoUnitario,
      });
    }

    const pedido = new PedidoModel({
      itens: itensPedido,
      total,
    });

    await pedido.save();

    res.status(201).json(pedido);
  } catch (error) {
    console.error('Erro ao criar pedido:', error);

    res.status(500).json({
      mensagem: 'Erro ao criar pedido.',
      detalhe: error instanceof Error ? error.message : String(error),
    });
  }
});

export default router;
