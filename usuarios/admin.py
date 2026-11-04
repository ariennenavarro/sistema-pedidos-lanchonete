from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import Usuario


@admin.register(Usuario)
class UsuarioAdmin(UserAdmin):
    list_display = ('username', 'nome', 'email', 'perfil', 'is_active', 'date_joined')
    list_filter = ('perfil', 'is_active', 'is_staff', 'date_joined')
    search_fields = ('username', 'first_name', 'last_name', 'email', 'telefone')
    ordering = ('first_name', 'username')
    list_per_page = 20

    fieldsets = UserAdmin.fieldsets + (
        ('Dados da lanchonete', {'fields': ('perfil', 'telefone')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Dados da lanchonete', {'fields': ('perfil', 'telefone')}),
    )

    @admin.display(description='Nome', ordering='first_name')
    def nome(self, obj):
        return obj.get_full_name()
