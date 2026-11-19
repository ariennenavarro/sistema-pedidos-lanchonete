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