from rest_framework import mixins, status as http_status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response

from usuarios.models import Usuario
from usuarios.permissions import (
    AdministradorOuSomenteLeitura,
    AtendenteOuAdministrador,
    eh_administrador,
)

from .models import Categoria, Pedido, Produto
from .serializers import (
    CategoriaSerializer,
    PedidoSerializer,
    ProdutoSerializer,
    StatusPedidoSerializer,
)


class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    permission_classes = [AdministradorOuSomenteLeitura]


class ProdutoViewSet(viewsets.ModelViewSet):
    serializer_class = ProdutoSerializer
    permission_classes = [AdministradorOuSomenteLeitura]

    def get_queryset(self):
        produtos = Produto.objects.select_related('categoria')

        if not eh_administrador(self.request.user):
            produtos = produtos.filter(disponivel=True)

        categoria = self.request.query_params.get('categoria')
        if categoria:
            produtos = produtos.filter(categoria_id=categoria)
        return produtos


class PedidoViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    serializer_class = PedidoSerializer

    def get_queryset(self):
        usuario = self.request.user
        pedidos = Pedido.objects.select_related('cliente', 'atendente').prefetch_related('itens__produto')

        if usuario.perfil == Usuario.Perfil.CLIENTE and not usuario.is_superuser:
            pedidos = pedidos.filter(cliente=usuario)

        status = self.request.query_params.get('status')
        if status:
            pedidos = pedidos.filter(status=status)
        return pedidos

    def perform_create(self, serializer):
        if self.request.user.perfil != Usuario.Perfil.CLIENTE:
            raise PermissionDenied('Apenas clientes podem fazer pedidos.')
        serializer.save(cliente=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[AtendenteOuAdministrador])
    def status(self, request, pk=None):
        pedido = self.get_object()
        serializer = StatusPedidoSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        novo_status = serializer.validated_data['status']

        if not pedido.pode_mudar_para(novo_status):
            return Response(
                {'detail': f'Não é possível mudar de "{pedido.get_status_display()}" '
                           f'para "{Pedido.Status(novo_status).label}".'},
                status=http_status.HTTP_400_BAD_REQUEST,
            )

        if novo_status == Pedido.Status.EM_PREPARO and pedido.atendente is None:
            pedido.atendente = request.user

        pedido.status = novo_status
        pedido.save(update_fields=['status', 'atendente', 'atualizado_em'])
        return Response(PedidoSerializer(pedido).data)

    @action(detail=True, methods=['post'])
    def cancelar(self, request, pk=None):
        pedido = self.get_object()
        if pedido.cliente != request.user:
            raise PermissionDenied('Só o cliente que fez o pedido pode cancelá-lo.')
        if pedido.status != Pedido.Status.PENDENTE:
            return Response(
                {'detail': 'Só é possível cancelar pedidos pendentes.'},
                status=http_status.HTTP_400_BAD_REQUEST,
            )
        pedido.status = Pedido.Status.CANCELADO
        pedido.save(update_fields=['status', 'atualizado_em'])
        return Response(PedidoSerializer(pedido).data)