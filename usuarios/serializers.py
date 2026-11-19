from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import Usuario


class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ('id', 'username', 'first_name', 'last_name', 'email', 'telefone', 'perfil')
        read_only_fields = fields


class CadastroSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])

    class Meta:
        model = Usuario
        fields = ('id', 'username', 'password', 'first_name', 'last_name', 'email', 'telefone')

    def create(self, validated_data):
        return Usuario.objects.create_user(**validated_data)