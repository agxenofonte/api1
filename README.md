# api1

## Requisitos de ambiente

Configure as variáveis de ambiente do Cloudinary antes de rodar o app:

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

Opcionalmente, use `CLOUDINARY_URL` se preferir.

## Endpoints principais

- `GET /api/items` — lista todos os livros
- `POST /api/items` — cria um livro
- `GET /api/items/:codigo` — busca livro por código
- `DELETE /api/items/:codigo` — exclui livro
- `POST /api/items/:codigo/image` — envia imagem do livro para Cloudinary
- `GET /api/items/pdf` — gera PDF com livros

## Exemplo de upload de imagem com curl

```bash
curl -X POST http://localhost:3000/api/items/1/image \
  -H "Content-Type: multipart/form-data" \
  -F "image=@/caminho/para/o/arquivo.jpg"
```

### Exemplo de JSON de criação de livro

```bash
curl -X POST http://localhost:3000/api/items \
  -H "Content-Type: application/json" \
  -d '{
    "codigo": 1,
    "titulo": "Livro Exemplo",
    "autor": "Autor Exemplo",
    "descricao": "Descrição do livro",
    "resenha": "Resenha do livro"
  }'
```

## Como usar no Postman

1. Defina o método como `POST`.
2. Use a URL: `http://localhost:3000/api/items/1/image`.
3. Na aba `Body`, selecione `form-data`.
4. Adicione o campo `image` do tipo `File`.
5. Envie o arquivo e clique em `Send`.

## Resultado esperado

A resposta JSON deve conter:

```json
{
  "message": "Imagem enviada com sucesso",
  "imageUrl": "https://res.cloudinary.com/.../image.jpg"
}
```
