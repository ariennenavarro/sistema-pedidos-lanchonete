from rest_framework import generics, permissions

from .serializers import CadastroSerializer, UsuarioSerializer


class CadastroView(generics.CreateAPIView):
    serializer_class = CadastroSerializer
    permission_classes = [permissions.AllowAny]


class MeView(generics.RetrieveAPIView):
    serializer_class = UsuarioSerializer

    def get_object(self):
        return self.request.user