package com.faculdade.produtos;

public class Produto {

    public Long id;
    public String nome;
    public Double preco;
    public Integer estoque;

    public Produto() {
    }

    public Produto(String nome, Double preco, Integer estoque) {
        this.nome = nome;
        this.preco = preco;
        this.estoque = estoque;
    }
}
