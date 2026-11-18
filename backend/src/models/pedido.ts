import mongoose from 'mongoose';

export interface ItemPedido {
  produtoId: string;
  nome: string;
  quantidade: number;
  precoUnitario: number;
}

export interface Pedido {
  itens: ItemPedido[];
  total: number;
  status: 'pendente' | 'pago' | 'cancelado';
  paymentId?: string;
  createdAt?: Date;
}

const ItemPedidoSchema = new mongoose.Schema({
  produtoId: {
    type: String,
    required: true,
  },
  nome: {
    type: String,
    required: true,
  },
  quantidade: {
    type: Number,
    required: true,
    min: 1,
  },
  precoUnitario: {
    type: Number,
    required: true,
    min: 0,
  },
});
const PedidoSchema = new mongoose.Schema(
  {
    itens: {
      type: [ItemPedidoSchema],
      required: true,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pendente', 'pago', 'cancelado'],
      default: 'pendente',
    },
    paymentId: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  },
);
export const PedidoModel = mongoose.model<Pedido>('Pedido', PedidoSchema);
