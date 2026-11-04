from django.contrib import admin
from django.db.models import Count

from .models import Categoria, ItemPedido, Pedido, Produto


@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
    list_display = ('nome', 'total_produtos')
    search_fields = ('nome', 'descricao')

    def get_queryset(self, request):
        return super().get_queryset(request).annotate(qtd_produtos=Count('produtos'))

    @admin.display(description='Produtos', ordering='qtd_produtos')
    def total_produtos(self, obj):
        return obj.qtd_produtos


@admin.register(Produto)
class ProdutoAdmin(admin.ModelAdmin):
    list_display = ('nome', 'categoria', 'preco', 'disponivel', 'atualizado_em')
    list_filter = ('categoria', 'disponivel', 'criado_em')
    search_fields = ('nome', 'descricao', 'categoria__nome')
    list_editable = ('preco', 'disponivel')
    list_per_page = 20


class ItemPedidoInline(admin.TabularInline):
    model = ItemPedido
    extra = 1
    fields = ('produto', 'quantidade', 'preco_unitario', 'subtotal')
    readonly_fields = ('subtotal',)
    autocomplete_fields = ('produto',)

    @admin.display(description='Subtotal')
    def subtotal(self, obj):
        if obj.pk:
            return obj.subtotal
        return '-'


@admin.register(Pedido)
class PedidoAdmin(admin.ModelAdmin):
    list_display = ('id', 'cliente', 'atendente', 'status', 'forma_pagamento', 'total', 'criado_em')
    list_filter = ('status', 'forma_pagamento', 'atendente', 'criado_em')
    search_fields = ('id', 'cliente__username', 'cliente__first_name', 'cliente__last_name')
    list_editable = ('status',)
    date_hierarchy = 'criado_em'
    list_per_page = 20
    inlines = [ItemPedidoInline]
    fields = ('cliente', 'atendente', 'status', 'forma_pagamento', 'observacao', 'total', 'criado_em', 'atualizado_em')
    readonly_fields = ('total', 'criado_em', 'atualizado_em')