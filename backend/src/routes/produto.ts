import { Router } from 'express';
import { ProdutoModel } from '../models/produto';

const router = Router();

// Listar produtos cadastrados
router.get('/', async (_req, res) => {
  try {
    const produtos = await ProdutoModel.find({ ativo: true });

    res.json(produtos);
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);

    res.status(500).json({
      mensagem: 'Erro ao buscar produtos.',
    });
  }
});

// Cadastrar um produto
router.post('/', async (req, res) => {
  try {
    const produto = new ProdutoModel(req.body);

    await produto.save();

    res.status(201).json(produto);
  } catch (error) {
    console.error('Erro ao cadastrar produto:', error);

    res.status(400).json({
      mensagem: 'Não foi possível cadastrar o produto.',
    });
  }
});

export default router;
