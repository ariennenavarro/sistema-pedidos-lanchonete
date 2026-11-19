from rest_framework.permissions import SAFE_METHODS, BasePermission

from .models import Usuario


def eh_administrador(usuario):
    return usuario.is_authenticated and (
        usuario.is_superuser or usuario.perfil == Usuario.Perfil.ADMINISTRADOR
    )


class AdministradorOuSomenteLeitura(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return request.user.is_authenticated
        return eh_administrador(request.user)

def eh_atendente(usuario):
    return eh_administrador(usuario) or (
        usuario.is_authenticated and usuario.perfil == Usuario.Perfil.ATENDENTE
    )


class AtendenteOuAdministrador(BasePermission):
    message = 'Apenas atendentes podem atualizar pedidos.'

    def has_permission(self, request, view):
        return eh_atendente(request.user)