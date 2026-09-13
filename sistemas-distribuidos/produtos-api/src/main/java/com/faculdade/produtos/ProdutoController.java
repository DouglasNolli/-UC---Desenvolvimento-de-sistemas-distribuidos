package com.faculdade.produtos;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collection;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * API 1 - Produtos/Estoque (http://localhost:8080)
 */
@RestController
@RequestMapping("/produtos")
public class ProdutoController {

    // Os produtos ficam em memoria (sem banco de dados): somem quando a API para.
    private final Map<Long, Produto> produtos = new ConcurrentHashMap<>();
    private long proximoId = 1;

    // Produtos que ja existem quando a API sobe.
    public ProdutoController() {
        salvar(new Produto("Teclado", 250.00, 10));
        salvar(new Produto("Mouse", 120.50, 5));
        salvar(new Produto("Monitor", 899.90, 2));
    }

    // POST /produtos -> cadastra um produto
    @PostMapping
    public ResponseEntity<Object> cadastrar(@RequestBody Produto produto) {
        if (produto.nome == null || produto.nome.isBlank()
                || produto.preco == null || produto.preco <= 0
                || produto.estoque == null || produto.estoque < 0) {
            return erro(400, "Informe nome, preco (maior que zero) e estoque (zero ou mais)");
        }
        return ResponseEntity.status(201).body(salvar(produto));
    }

    // GET /produtos -> lista todos os produtos
    @GetMapping
    public Collection<Produto> listar() {
        return produtos.values();
    }

    // GET /produtos/{id} -> consulta um produto (a API de Pedidos usa este)
    @GetMapping("/{id}")
    public ResponseEntity<Object> buscar(@PathVariable Long id) {
        Produto produto = produtos.get(id);
        if (produto == null) {
            return erro(404, "Produto " + id + " nao encontrado");
        }
        return ResponseEntity.ok(produto);
    }

    // GET /produtos/{id}/estoque -> consulta so a quantidade disponivel
    @GetMapping("/{id}/estoque")
    public ResponseEntity<Object> consultarEstoque(@PathVariable Long id) {
        Produto produto = produtos.get(id);
        if (produto == null) {
            return erro(404, "Produto " + id + " nao encontrado");
        }
        return ResponseEntity.ok(Map.of("produtoId", id, "estoque", produto.estoque));
    }

    // PATCH /produtos/{id}/estoque -> retira do estoque (a API de Pedidos usa este)
    // Corpo: { "quantidade": 2 }
    // "synchronized" evita que dois pedidos ao mesmo tempo baixem o mesmo estoque.
    @PatchMapping("/{id}/estoque")
    public synchronized ResponseEntity<Object> baixarEstoque(@PathVariable Long id,
                                                             @RequestBody Map<String, Integer> corpo) {
        Produto produto = produtos.get(id);
        if (produto == null) {
            return erro(404, "Produto " + id + " nao encontrado");
        }

        Integer quantidade = corpo.get("quantidade");
        if (quantidade == null || quantidade <= 0) {
            return erro(400, "Informe a quantidade (maior que zero)");
        }
        if (quantidade > produto.estoque) {
            return erro(409, "Estoque insuficiente. Disponivel: " + produto.estoque);
        }

        produto.estoque -= quantidade;
        return ResponseEntity.ok(produto);
    }

    private synchronized Produto salvar(Produto produto) {
        produto.id = proximoId++;
        produtos.put(produto.id, produto);
        return produto;
    }

    private ResponseEntity<Object> erro(int status, String mensagem) {
        return ResponseEntity.status(status).body(Map.of("erro", mensagem));
    }
}
