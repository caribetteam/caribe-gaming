import mongoose from 'mongoose';

export async function connectDatabase() {
  const uri = process.env['MONGODB_URI'];

  if (!uri) {
    throw new Error('MONGODB_URI não encontrada no arquivo .env');
  }

  await mongoose.connect(uri);

  console.log('MongoDB conectado com sucesso!');
}
