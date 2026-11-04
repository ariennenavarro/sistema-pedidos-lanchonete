from django.contrib.auth.models import AbstractUser
from django.db import models


class Usuario(AbstractUser):
    class Perfil(models.TextChoices):
        ADMINISTRADOR = 'administrador', 'Administrador'
        ATENDENTE = 'atendente', 'Atendente'
        CLIENTE = 'cliente', 'Cliente'

    perfil = models.CharField(
        max_length=20,
        choices=Perfil.choices,
        default=Perfil.CLIENTE,
    )
    telefone = models.CharField(max_length=20, blank=True)

    class Meta:
        verbose_name = 'Usuário'
        verbose_name_plural = 'Usuários'

    def __str__(self):
        return self.get_full_name() or self.username
