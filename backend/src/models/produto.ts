import mongoose from 'mongoose';

export interface Produto {
  produtoId: string;
  nome: string;
  preco: number;
  imagem?: string;
  gratis: boolean;
  ativo: boolean;
}

const ProdutoSchema = new mongoose.Schema(
  {
    produtoId: {
      type: String,
      required: true,
      unique: true,
    },
    nome: {
      type: String,
      required: true,
    },
    preco: {
      type: Number,
      required: true,
      min: 0,
    },
    imagem: {
      type: String,
    },
    gratis: {
      type: Boolean,
      default: false,
    },
    ativo: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

export const ProdutoModel = mongoose.model<Produto>('Produto', ProdutoSchema);
