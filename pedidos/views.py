from rest_framework import mixins, viewsets
from rest_framework.exceptions import PermissionDenied

from usuarios.models import Usuario
from usuarios.permissions import AdministradorOuSomenteLeitura, eh_administrador

from .models import Categoria, Pedido, Produto
from .serializers import CategoriaSerializer, PedidoSerializer, ProdutoSerializer


class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    permission_classes = [AdministradorOuSomenteLeitura]


class ProdutoViewSet(viewsets.ModelViewSet):
    serializer_class = ProdutoSerializer
    permission_classes = [AdministradorOuSomenteLeitura]

    def get_queryset(self):
        produtos = Produto.objects.select_related('categoria')

        # Cliente e atendente só veem o que está à venda
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