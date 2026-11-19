from rest_framework import serializers
from .models import Categoria, Produto
from django.db import transaction
from .models import Categoria, ItemPedido, Pedido, Produto



class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = ('id', 'nome', 'descricao')


class ProdutoSerializer(serializers.ModelSerializer):
    categoria_nome = serializers.CharField(source='categoria.nome', read_only=True)

    class Meta:
        model = Produto
        fields = ('id', 'nome', 'descricao', 'preco', 'categoria', 'categoria_nome', 'disponivel')

class ItemPedidoSerializer(serializers.ModelSerializer):
    produto_nome = serializers.CharField(source='produto.nome', read_only=True)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = ItemPedido
        fields = ('id', 'produto', 'produto_nome', 'quantidade', 'preco_unitario', 'subtotal')
        read_only_fields = ('preco_unitario',)


class PedidoSerializer(serializers.ModelSerializer):
    itens = ItemPedidoSerializer(many=True)
    cliente_nome = serializers.CharField(source='cliente.get_full_name', read_only=True)
    atendente_nome = serializers.CharField(source='atendente.get_full_name', read_only=True, default=None)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    forma_pagamento_display = serializers.CharField(source='get_forma_pagamento_display', read_only=True)

    class Meta:
        model = Pedido
        fields = (
            'id', 'cliente', 'cliente_nome', 'atendente', 'atendente_nome',
            'status', 'status_display', 'forma_pagamento', 'forma_pagamento_display',
            'observacao', 'total', 'criado_em', 'itens',
        )
        read_only_fields = ('cliente', 'atendente', 'status', 'total', 'criado_em')

    def validate_itens(self, itens):
        if not itens:
            raise serializers.ValidationError('O pedido precisa ter pelo menos um item.')
        for item in itens:
            if not item['produto'].disponivel:
                raise serializers.ValidationError(f"{item['produto'].nome} não está disponível.")
        return itens

    @transaction.atomic
    def create(self, validated_data):
        itens = validated_data.pop('itens')
        pedido = Pedido.objects.create(**validated_data)
        for item in itens:
            ItemPedido.objects.create(pedido=pedido, **item)
        return pedido