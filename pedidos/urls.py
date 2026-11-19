from rest_framework.routers import DefaultRouter

from .views import CategoriaViewSet, PedidoViewSet, ProdutoViewSet

router = DefaultRouter()
router.register('categorias', CategoriaViewSet)
router.register('produtos', ProdutoViewSet, basename='produto')
router.register('pedidos', PedidoViewSet, basename='pedido')

urlpatterns = router.urls