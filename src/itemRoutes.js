// src/routes/bookRoutes.js
const express = require('express');
const router = express.Router();

// Mock de livros (dados fictícios)
let livros = [
    // Harry Potter
  { codigo: 1, titulo: 'Harry Potter e a Pedra Filosofal', autor: 'J.K. Rowling', descricao: 'O primeiro livro da famosa série de fantasia.', resenha: 'Uma história envolvente sobre magia e amizade.' },
  { codigo: 2, titulo: 'Harry Potter e a Câmara Secreta', autor: 'J.K. Rowling', descricao: 'O segundo livro da série Harry Potter, com novos mistérios e aventuras.', resenha: 'Muitas reviravoltas e mistérios envolvendo magia.' },
  { codigo: 3, titulo: 'Harry Potter e o Prisioneiro de Azkaban', autor: 'J.K. Rowling', descricao: 'O terceiro livro da série, com grandes revelações e ação.', resenha: 'Exploração dos mistérios de Azkaban e os segredos de Harry.' },
  { codigo: 4, titulo: 'Harry Potter e o Cálice de Fogo', autor: 'J.K. Rowling', descricao: 'O quarto livro, que traz o Torneio Tribruxo e um confronto mortal.', resenha: 'Torneio, mistério e a volta do maior vilão da história.' },
  { codigo: 5, titulo: 'Harry Potter e a Ordem da Fênix', autor: 'J.K. Rowling', descricao: 'O quinto livro, com a crescente luta contra Voldemort.', resenha: 'Muitas batalhas e o confronto entre o bem e o mal.' },
  { codigo: 6, titulo: 'Harry Potter e o Enigma do Príncipe', autor: 'J.K. Rowling', descricao: 'O sexto livro da saga, com revelações sobre o passado de Voldemort.', resenha: 'O penúltimo livro, cheio de mistérios e grandes perdas.' },
  { codigo: 7, titulo: 'Harry Potter e as Relíquias da Morte', autor: 'J.K. Rowling', descricao: 'O último livro da saga, com a batalha final contra Voldemort.', resenha: 'A grande conclusão da saga mágica de Harry Potter.' },

  // Percy Jackson
  { codigo: 8, titulo: 'Percy Jackson e os Olimpianos: O Ladrão de Raios', autor: 'Rick Riordan', descricao: 'O primeiro livro da série Percy Jackson, com mitologia grega.', resenha: 'Aventura e mitologia misturados com um pouco de humor adolescente.' },
  { codigo: 9, titulo: 'Percy Jackson e os Olimpianos: O Mar de Monstros', autor: 'Rick Riordan', descricao: 'O segundo livro, em que Percy parte para um novo desafio.', resenha: 'Mistura de ação, mitologia e diversão com personagens carismáticos.' },
  { codigo: 10, titulo: 'Percy Jackson e os Olimpianos: A Maldição do Titã', autor: 'Rick Riordan', descricao: 'O terceiro livro, com desafios mais difíceis e perigosos.', resenha: 'Mitologia e ação em uma nova escala.' },
  { codigo: 11, titulo: 'Percy Jackson e os Olimpianos: A Batalha do Labirinto', autor: 'Rick Riordan', descricao: 'O quarto livro, com mais aventuras e grandes batalhas.', resenha: 'Ação e emoção em cada página com grandes reviravoltas.' },
  { codigo: 12, titulo: 'Percy Jackson e os Olimpianos: O Último Olimpiano', autor: 'Rick Riordan', descricao: 'O quinto e último livro da série, com a batalha final.', resenha: 'O fechamento de uma grande saga épica.' },

  // Renegados
  { codigo: 13, titulo: 'Renegados', autor: 'Marissa Meyer', descricao: 'Primeiro livro da série Renegados, sobre heróis e vilões.', resenha: 'Uma trama com muitos reviravoltas e personagens complexos.' },

  // Em Rota de Colisão
  { codigo: 14, titulo: 'Em Rota de Colisão', autor: 'Bal Khabra', descricao: 'Romance com ação e mistério.', resenha: 'Uma história envolvente com emoção e mistério.' },

  // No Ritmo do Jogo
  { codigo: 15, titulo: 'No Ritmo do Jogo', autor: 'Bal Khabra', descricao: 'História de superação e romance.', resenha: 'Uma narrativa intensa sobre a busca pela vitória.' },

  // Quebrando o Gelo
  { codigo: 16, titulo: 'Quebrando o Gelo', autor: 'Hannah Grace', descricao: 'História de amor e redenção em tempos difíceis.', resenha: 'Um romance com personagens profundos e uma história emocionante.' },

  // No Calor do Momento
  { codigo: 17, titulo: 'No Calor do Momento', autor: 'Hannah Grace', descricao: 'Segunda parte da série, com mais emoção e romance.', resenha: 'Continuação que mantém o ritmo e a emoção do primeiro.' },

  // Sonhando Acordado
  { codigo: 18, titulo: 'Sonhando Acordado', autor: 'Hannah Grace', descricao: 'História de amor e autodescoberta.', resenha: 'Um romance doce e com uma bela mensagem sobre a vida.' },

  // Drácula
  { codigo: 19, titulo: 'Drácula', autor: 'Bram Stoker', descricao: 'Clássico sobre o famoso vampiro.', resenha: 'Uma obra-prima do terror gótico.' },

  // SHADA (Dr. Who)
  { codigo: 20, titulo: 'SHADA', autor: 'Douglas Adams', descricao: 'Aventura do Doctor Who perdida e finalmente publicada.', resenha: 'Uma história divertida e cheia de ação no universo de Doctor Who.' },

  // Verity
  { codigo: 21, titulo: 'Verity', autor: 'Colleen Hoover', descricao: 'Romance psicológico cheio de reviravoltas.', resenha: 'Uma história sombria e intensa que prende a atenção.' },

  // Eu te Sinto
  { codigo: 22, titulo: 'Eu Te Sinto', autor: 'Irene Cao', descricao: 'Trilogia romântica com muitas emoções.', resenha: 'Uma narrativa envolvente de amor, dor e redenção.' }
];


//GET para listar os livros
router.get('/', (req, res) => {
  res.json(livros);  // Retorna todos os livros
});

//POst para adicionar um novo livro
router.post('/', (req, res) => {
  const { codigo, titulo, autor, descricao, resenha } = req.body;
  const novoLivro = { codigo, titulo, autor, descricao, resenha };
  livros.push(novoLivro);  // Adiciona o novo livro ao array
  res.status(201).json(novoLivro);  // Retorna o livro adicionado
});

//DELETE para excluir um livro
router.delete('/:codigo', (req, res) => {
  const { codigo } = req.params;
  livros = livros.filter(livro => livro.codigo !== parseInt(codigo));  // Remove o livro com o código informado
  res.status(204).send();  // Retorna um status 204 (sem conteúdo)
});

//GET para pesquisar um livro pelo código
router.get('/:codigo', (req, res) => {
  const { codigo } = req.params;
  const livro = livros.find(livro => livro.codigo === parseInt(codigo));  
  if (!livro) return res.status(404).json({ message: 'Livro não encontrado' });
  res.json(livro);  
});

module.exports = router;