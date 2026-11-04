from django.contrib import admin
from django.db.models import Count

from .models import Categoria, Produto


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