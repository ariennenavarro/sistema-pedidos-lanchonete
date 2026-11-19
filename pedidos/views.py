from rest_framework import viewsets

from usuarios.permissions import AdministradorOuSomenteLeitura, eh_administrador

from .models import Categoria, Produto
from .serializers import CategoriaSerializer, ProdutoSerializer


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