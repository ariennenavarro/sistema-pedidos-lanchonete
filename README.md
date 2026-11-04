# Sistema de Pedidos - Lanchonete

Trabalho prático da disciplina GAC116 - Programação Web (UFLA).

## Integrantes
- Arienne Alves Navarro
- Thales Rodrigues Resende

## Descrição
Sistema para gerenciar os pedidos de uma lanchonete. O administrador cadastra o cardápio (categorias e produtos) e os usuários, o cliente faz pedidos e o atendente acompanha o andamento de cada pedido.

Nesta primeira etapa o sistema conta com a modelagem do banco de dados e o painel
administrativo do Django personalizado com o tema Jazzmin.

## Tecnologias
- Python 3
- Django 4.2
- Django Jazzmin (tema do painel administrativo)
- SQLite

## Instalação
Clone o repositório e entre na pasta:
```
git clone https://github.com/ariennenavarro/sistema-pedidos-lanchonete.git
cd sistema-pedidos-lanchonete
```

Crie e ative o ambiente virtual:
```
python -m venv venv
source venv/bin/activate      # Linux/Mac
venv\Scripts\activate         # Windows
```

Instale as dependências:
```
pip install -r requirements.txt
```

Crie o banco de dados e um usuário administrador:
```
python manage.py migrate
python manage.py createsuperuser
```

## Execução
```
python manage.py runserver
```

O painel administrativo fica em http://127.0.0.1:8000/admin