// API 2 - Pedidos (http://localhost:8081)
import express from 'express';

const app = express();
app.use(express.json());

const PRODUTOS_API = 'http://localhost:8080';

// Os pedidos ficam em memoria (sem banco de dados): somem quando a API para.
const pedidos = [];

// GET /pedidos -> lista os pedidos criados
app.get('/pedidos', (req, res) => {
  res.json(pedidos);
});

// POST /pedidos -> cria um pedido
// Corpo: { "cliente": "Douglas", "produtoId": 1, "quantidade": 2 }
//
// A comunicacao com a API de Produtos e SINCRONA: cada "await fetch"
// fica esperando a resposta da outra API antes de continuar.
app.post('/pedidos', async (req, res) => {
  const { cliente, produtoId, quantidade } = req.body ?? {};

  // 1. Valida os dados recebidos
  if (!cliente || !Number.isInteger(produtoId) || !Number.isInteger(quantidade) || quantidade <= 0) {
    return res.status(400).json({ erro: 'Informe cliente, produtoId e quantidade (maior que zero)' });
  }

  try {
    // 2. Consulta o produto na API de Produtos (GET)
    const respostaProduto = await fetch(`${PRODUTOS_API}/produtos/${produtoId}`, {
      signal: AbortSignal.timeout(3000), // desiste se a outra API demorar mais de 3 segundos
    });

    if (respostaProduto.status === 404) {
      return res.status(404).json({ erro: `Produto ${produtoId} nao existe` });
    }

    const produto = await respostaProduto.json();

    // 3. Regra de negocio: tem estoque suficiente?
    if (produto.estoque < quantidade) {
      return res.status(409).json({
        erro: `Estoque insuficiente. Disponivel: ${produto.estoque}, solicitado: ${quantidade}`,
      });
    }

    // 4. Da baixa no estoque na API de Produtos (PATCH)
    const respostaBaixa = await fetch(`${PRODUTOS_API}/produtos/${produtoId}/estoque`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantidade }),
      signal: AbortSignal.timeout(3000),
    });

    if (!respostaBaixa.ok) {
      return res.status(respostaBaixa.status).json({ erro: 'A API de Produtos recusou a baixa no estoque' });
    }

    // 5. Salva o pedido confirmado
    const pedido = {
      id: pedidos.length + 1,
      cliente,
      produto: produto.nome,
      quantidade,
      total: Number((produto.preco * quantidade).toFixed(2)),
      status: 'CONFIRMADO',
    };
    pedidos.push(pedido);

    return res.status(201).json(pedido);
  } catch (erro) {
    // O fetch da erro quando a API de Produtos esta desligada ou demorou demais
    return res.status(503).json({ erro: 'API de Produtos indisponivel. Tente novamente mais tarde.' });
  }
});

app.listen(8081, () => {
  console.log('API de Pedidos rodando em http://localhost:8081');
});
