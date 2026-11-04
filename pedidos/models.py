from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models


class Categoria(models.Model):
    nome = models.CharField(max_length=50, unique=True)
    descricao = models.TextField('descrição', blank=True)

    class Meta:
        verbose_name = 'Categoria'
        verbose_name_plural = 'Categorias'
        ordering = ['nome']

    def __str__(self):
        return self.nome


class Produto(models.Model):
    nome = models.CharField(max_length=100)
    descricao = models.TextField('descrição', blank=True)
    preco = models.DecimalField(
        'preço',
        max_digits=8,
        decimal_places=2,
        validators=[MinValueValidator(0)],
    )
    categoria = models.ForeignKey(
        Categoria,
        on_delete=models.PROTECT,
        related_name='produtos',
    )
    disponivel = models.BooleanField('disponível', default=True)
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Produto'
        verbose_name_plural = 'Produtos'
        ordering = ['categoria', 'nome']

    def __str__(self):
        return self.nome


class Pedido(models.Model):
    class Status(models.TextChoices):
        PENDENTE = 'pendente', 'Pendente'
        EM_PREPARO = 'em_preparo', 'Em preparo'
        PRONTO = 'pronto', 'Pronto'
        ENTREGUE = 'entregue', 'Entregue'
        CANCELADO = 'cancelado', 'Cancelado'

    class FormaPagamento(models.TextChoices):
        DINHEIRO = 'dinheiro', 'Dinheiro'
        CARTAO = 'cartao', 'Cartão'
        PIX = 'pix', 'Pix'

    cliente = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='pedidos_feitos',
        limit_choices_to={'perfil': 'cliente'},
    )
    atendente = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='pedidos_atendidos',
        limit_choices_to={'perfil': 'atendente'},
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDENTE,
    )
    forma_pagamento = models.CharField(
        'forma de pagamento',
        max_length=20,
        choices=FormaPagamento.choices,
    )
    observacao = models.TextField('observação', blank=True)
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0, editable=False)
    criado_em = models.DateTimeField('data do pedido', auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Pedido'
        verbose_name_plural = 'Pedidos'
        ordering = ['-criado_em']

    def __str__(self):
        return f'Pedido #{self.pk} - {self.cliente}'

    def atualizar_total(self):
        self.total = sum(item.subtotal for item in self.itens.all())
        self.save(update_fields=['total'])


class ItemPedido(models.Model):
    pedido = models.ForeignKey(
        Pedido,
        on_delete=models.CASCADE,
        related_name='itens',
    )
    produto = models.ForeignKey(
        Produto,
        on_delete=models.PROTECT,
        related_name='itens_pedido',
    )
    quantidade = models.PositiveIntegerField(default=1, validators=[MinValueValidator(1)])
    preco_unitario = models.DecimalField(
        'preço unitário',
        max_digits=8,
        decimal_places=2,
        blank=True,
    )

    class Meta:
        verbose_name = 'Item do pedido'
        verbose_name_plural = 'Itens do pedido'

    def __str__(self):
        return f'{self.quantidade}x {self.produto}'

    @property
    def subtotal(self):
        return self.quantidade * self.preco_unitario

    def save(self, *args, **kwargs):
        if self.preco_unitario is None:
            self.preco_unitario = self.produto.preco
        super().save(*args, **kwargs)
        self.pedido.atualizar_total()

    def delete(self, *args, **kwargs):
        pedido = self.pedido
        super().delete(*args, **kwargs)
        pedido.atualizar_total()