# Comunicação Síncrona entre APIs REST

Atividade da disciplina **Desenvolvimento de Sistemas Distribuídos**.

Duas APIs independentes, feitas em tecnologias diferentes, que conversam via HTTP
para processar pedidos e controlar o estoque.

| | API 1 – Produtos | API 2 – Pedidos |
|---|---|---|
| Tecnologia | Java 21 + Spring Boot | Node.js + Express |
| Endereço | http://localhost:8080 | http://localhost:8081 |
| Código | `produtos-api/src/main/java/com/faculdade/produtos/` | `pedidos-api/src/server.js` |

Os dados ficam em memória (sem banco de dados) e somem quando a API é desligada.

---

## Como funciona

```
Cliente (Postman)          API de Pedidos (8081)              API de Produtos (8080)
      │                            │                                   │
      │── POST /pedidos ──────────▶│                                   │
      │                            │── GET /produtos/1 ───────────────▶│
      │                            │◀────────────── 200 (dados) ───────│
      │                            │   tem estoque suficiente?         │
      │                            │── PATCH /produtos/1/estoque ─────▶│
      │                            │◀────────────── 200 (baixado) ─────│
      │◀──── 201 pedido criado ────│                                   │
```

A comunicação é **síncrona**: a API de Pedidos usa `await fetch(...)` e **espera** a
resposta da API de Produtos antes de continuar.

---

## Como executar

As duas APIs precisam estar ligadas ao mesmo tempo. Dê duplo clique, nesta ordem:

1. `iniciar-produtos-api.bat` → espere aparecer `Started ProdutosApiApplication`
2. `iniciar-pedidos-api.bat` → espere aparecer `API de Pedidos rodando em http://localhost:8081`

Ou, em dois terminais:

```powershell
# Terminal 1
$env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-21.0.12.101-hotspot"
cd produtos-api
.\mvnw.cmd spring-boot:run

# Terminal 2
cd pedidos-api
npm.cmd install
npm.cmd start
```

> No PowerShell, use `npm.cmd` em vez de `npm`: o Windows bloqueia o `npm.ps1` por
> padrão (erro "a execução de scripts foi desabilitada neste sistema").

A API de Produtos já começa com 3 produtos:

| id | nome | preço | estoque |
|----|------|-------|---------|
| 1 | Teclado | 250,00 | 10 |
| 2 | Mouse | 120,50 | 5 |
| 3 | Monitor | 899,90 | 2 |

---

## Endpoints

### API 1 – Produtos (porta 8080)

| Método | Rota | O que faz |
|--------|------|-----------|
| `POST` | `/produtos` | Cadastra um produto |
| `GET` | `/produtos` | Lista os produtos |
| `GET` | `/produtos/{id}` | Consulta um produto |
| `GET` | `/produtos/{id}/estoque` | Consulta a quantidade disponível |
| `PATCH` | `/produtos/{id}/estoque` | Dá baixa no estoque |

```json
POST /produtos
{ "nome": "Headset", "preco": 199.90, "estoque": 8 }

PATCH /produtos/1/estoque
{ "quantidade": 2 }
```

### API 2 – Pedidos (porta 8081)

| Método | Rota | O que faz |
|--------|------|-----------|
| `POST` | `/pedidos` | Cria um pedido (consulta e atualiza a API de Produtos) |
| `GET` | `/pedidos` | Lista os pedidos |

```json
POST /pedidos
{ "cliente": "Douglas", "produtoId": 1, "quantidade": 2 }
```

---

## Testes (Postman / Insomnia)

Importe o arquivo `postman_collection.json`. No VS Code, também dá para usar o
`requisicoes.http` com a extensão *REST Client*.

| # | Cenário | Envio | Resultado esperado |
|---|---------|-------|--------------------|
| 1 | Pedido com sucesso | produto 1, quantidade 2 | `201` e o estoque do produto 1 cai de 10 para 8 |
| 2 | Estoque insuficiente | produto 3, quantidade 99 | `409` e o estoque **não** muda |
| 3 | Produto inexistente | produto 999 | `404` |
| 4 | Dados inválidos | sem `produtoId` ou `quantidade` | `400` |
| 5 | API de Produtos fora do ar | desligue a API 1 (`Ctrl+C`) e envie um pedido | `503` |

O **cenário 5** mostra o tratamento de indisponibilidade: a API de Pedidos não trava
nem quebra. Ela espera no máximo 3 segundos (`AbortSignal.timeout(3000)`) e devolve
um erro tratado.

---

## Códigos HTTP usados

| Código | Significado |
|--------|-------------|
| `200` | OK |
| `201` | Criado com sucesso |
| `400` | Dados inválidos |
| `404` | Produto não encontrado |
| `409` | Estoque insuficiente |
| `503` | API de Produtos indisponível |
