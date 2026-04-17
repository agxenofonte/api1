const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

jest.mock('cloudinary', () => ({
  v2: {
    uploader: {
      upload_stream: (options, callback) => {
        const stream = {
          end: () => callback(null, {
            secure_url: 'https://example.com/book-image.jpg',
            public_id: 'book-image-123'
          })
        };
        return stream;
      }
    },
    config: jest.fn()
  }
}));

let app;
let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongoServer.getUri();
  process.env.JWT_SECRET = 'test-secret';
  app = require('../src/app');

  if (mongoose.connection.readyState !== 1) {
    await new Promise(resolve => mongoose.connection.once('open', resolve));
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await mongoose.connection.db.dropDatabase();
});

describe('Book routes', () => {
  const novoLivro = {
    codigo: 100,
    titulo: 'Teste Jest',
    autor: 'Autor Jest',
    descricao: 'Descrição de teste',
    resenha: 'Resenha de teste'
  };

  test('POST /api/items cria um livro', async () => {
    const response = await request(app)
      .post('/api/items')
      .send(novoLivro)
      .expect(201);

    expect(response.body).toMatchObject({
      codigo: 100,
      titulo: 'Teste Jest',
      autor: 'Autor Jest'
    });
  });

  test('GET /api/items retorna lista de livros', async () => {
    await request(app).post('/api/items').send(novoLivro);
    const response = await request(app).get('/api/items').expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toMatchObject({ codigo: 100 });
  });

  test('GET /api/items/:codigo retorna livro pelo código', async () => {
    await request(app).post('/api/items').send(novoLivro);
    const response = await request(app).get('/api/items/100').expect(200);

    expect(response.body).toMatchObject({ codigo: 100, titulo: 'Teste Jest' });
  });

  test('PUT /api/items/:codigo atualiza o livro', async () => {
    await request(app).post('/api/items').send(novoLivro);

    const response = await request(app)
      .put('/api/items/100')
      .send({ titulo: 'Título Atualizado' })
      .expect(200);

    expect(response.body.livro).toMatchObject({ codigo: 100, titulo: 'Título Atualizado' });
  });

  test('DELETE /api/items/:codigo remove o livro', async () => {
    await request(app).post('/api/items').send(novoLivro);
    await request(app).delete('/api/items/100').expect(204);
  });

  test('GET /api/items/pdf retorna PDF', async () => {
    await request(app).post('/api/items').send(novoLivro);

    const response = await request(app)
      .get('/api/items/pdf')
      .expect(200);

    expect(response.headers['content-type']).toContain('application/pdf');
    expect(response.body.length).toBeGreaterThan(0);
  });

  test('POST /api/items/:codigo/image faz upload mockado de imagem', async () => {
    await request(app).post('/api/items').send(novoLivro);

    const response = await request(app)
      .post('/api/items/100/image')
      .attach('image', Buffer.from('abc'), 'imagem.png')
      .expect(200);

    expect(response.body).toMatchObject({ message: 'Imagem enviada com sucesso' });
    expect(response.body.imageUrl).toContain('https://example.com/book-image.jpg');
  });
});

describe('App routes', () => {
  test('POST /logar retorna token para credenciais válidas', async () => {
    const response = await request(app)
      .post('/logar')
      .send({ email: 'usuario@exemplo.com', senha: 'senha123' })
      .expect(200);

    expect(response.body.token).toBeDefined();
  });

  test('POST /logar retorna 401 para credenciais inválidas', async () => {
    await request(app)
      .post('/logar')
      .send({ email: 'usuario@exemplo.com', senha: 'senhaErrada' })
      .expect(401);
  });

  test('GET /api/requests/:date retorna 404 quando não há logs', async () => {
    await request(app).get('/api/requests/2025-01-01').expect(404);
  });
});
