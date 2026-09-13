// API de Pedidos (http://localhost:3000)
import express from 'express';

const app = express();
app.use(express.json());

// Os pedidos ficam em memoria (sem banco de dados): somem quando a API para.
const pedidos = [];
let proximoPedidoId = 1;
let proximoItemId = 1;

function buscarPedido(id) {
  return pedidos.find((pedido) => pedido.id === Number(id));
}

// 1) POST /pedidos -> gera um pedido
// Corpo: { "cliente": "Douglas", "status": "ABERTO", "data": "2026-09-13" }
app.post('/pedidos', (req, res) => {
  const { cliente, status, data } = req.body ?? {};

  if (!cliente || !status || !data) {
    return res.status(400).json({ erro: 'Informe cliente, status e data' });
  }

  const pedido = { id: proximoPedidoId++, cliente, status, data, itens: [] };
  pedidos.push(pedido);

  res.status(201).json(pedido);
});

// 2) POST /pedidos/:id/itens -> adiciona um item no pedido
// Corpo: { "produto": "Teclado", "quantidade": 2 }
app.post('/pedidos/:id/itens', (req, res) => {
  const pedido = buscarPedido(req.params.id);
  if (!pedido) {
    return res.status(404).json({ erro: 'Pedido nao encontrado' });
  }

  const { produto, quantidade } = req.body ?? {};
  if (!produto || !Number.isInteger(quantidade) || quantidade <= 0) {
    return res.status(400).json({ erro: 'Informe produto e quantidade (maior que zero)' });
  }

  const item = { id: proximoItemId++, produto, quantidade };
  pedido.itens.push(item);

  res.status(201).json(pedido);
});

// 3) DELETE /pedidos/:id/itens/:itemId -> exclui um item do pedido
app.delete('/pedidos/:id/itens/:itemId', (req, res) => {
  const pedido = buscarPedido(req.params.id);
  if (!pedido) {
    return res.status(404).json({ erro: 'Pedido nao encontrado' });
  }

  const posicao = pedido.itens.findIndex((item) => item.id === Number(req.params.itemId));
  if (posicao === -1) {
    return res.status(404).json({ erro: 'Item nao encontrado' });
  }

  pedido.itens.splice(posicao, 1);
  res.json(pedido);
});

// 4) GET /pedidos -> lista todos os pedidos
app.get('/pedidos', (req, res) => {
  res.json(pedidos);
});

// GET /pedidos/:id -> mostra um pedido com seus itens
app.get('/pedidos/:id', (req, res) => {
  const pedido = buscarPedido(req.params.id);
  if (!pedido) {
    return res.status(404).json({ erro: 'Pedido nao encontrado' });
  }

  res.json(pedido);
});

app.listen(3000, () => {
  console.log('API de Pedidos rodando em http://localhost:3000');
});
