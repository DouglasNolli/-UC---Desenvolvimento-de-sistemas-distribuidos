# API de Pedidos

API simples em Node.js + Express. Os pedidos ficam em memória: somem quando a API é desligada.

## Endpoints

| Ação | Método e rota | Corpo (JSON) |
|---|---|---|
| 1) Gerar pedido | `POST /pedidos` | `{ "cliente": "Douglas", "status": "ABERTO", "data": "2026-09-13" }` |
| 2) Adicionar item no pedido | `POST /pedidos/:id/itens` | `{ "produto": "Teclado", "quantidade": 2 }` |
| 3) Excluir item do pedido | `DELETE /pedidos/:id/itens/:itemId` | — |
| 4) Listar pedidos | `GET /pedidos` | — |

## Como rodar

Precisa ter o [Node.js](https://nodejs.org) instalado (versão 18 ou mais nova).

Abra um terminal dentro da pasta `API produtos` e rode:

```
npm install
npm start
```

Vai aparecer `API de Pedidos rodando em http://localhost:3000`. Deixe esse terminal aberto.

## Como testar

Use o arquivo `requisicoes.http` no VS Code. Ele precisa da extensão **REST Client** (humao.rest-client).

Com a API rodando, abra o `requisicoes.http` e clique em **Send Request**, que aparece em cima de cada requisição. Vá de cima para baixo:

1. Gerar pedido: cria o pedido com id 1.
2. Adicionar item: adiciona Teclado e depois Mouse no pedido 1.
3. Excluir item: remove o Teclado do pedido 1.
4. Listar pedidos.

Se estiver tudo certo, a última requisição mostra o pedido do Douglas só com o item Mouse:

```json
[{"id":1,"cliente":"Douglas","status":"ABERTO","data":"2026-09-13","itens":[{"id":2,"produto":"Mouse","quantidade":1}]}]
```

Para desligar a API, aperte `Ctrl + C` no terminal onde ela está rodando.
