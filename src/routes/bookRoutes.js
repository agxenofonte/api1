const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const router = express.Router();
const PDFDocument = require('pdfkit');
const Book = require('../models/Book');

const cloudinaryConfig = {};
if (process.env.CLOUDINARY_CLOUD_NAME) cloudinaryConfig.cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
if (process.env.CLOUDINARY_API_KEY) cloudinaryConfig.api_key = process.env.CLOUDINARY_API_KEY;
if (process.env.CLOUDINARY_API_SECRET) cloudinaryConfig.api_secret = process.env.CLOUDINARY_API_SECRET;
if (Object.keys(cloudinaryConfig).length > 0) {
  cloudinary.config(cloudinaryConfig);
}

const upload = multer({ storage: multer.memoryStorage() });

// POST para enviar imagem do livro para a nuvem
router.post('/:codigo/image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Arquivo de imagem obrigatório' });
    }

    const codigo = parseInt(req.params.codigo);
    const livro = await Book.findOne({ codigo });
    if (!livro) {
      return res.status(404).json({ message: 'Livro não encontrado' });
    }

    const uploadStream = () => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'books',
            resource_type: 'image'
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );

        stream.end(req.file.buffer);
      });
    };

    const result = await uploadStream();
    livro.imageUrl = result.secure_url;
    livro.imagePublicId = result.public_id;
    await livro.save();

    res.json({ message: 'Imagem enviada com sucesso', imageUrl: result.secure_url });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao enviar imagem', error: error.message });
  }
});

// GET para listar os livros
router.get('/', async (req, res) => {
  try {
    const livros = await Book.find();
    res.json(livros);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar livros', error: error.message });
  }
});

// POST para adicionar um novo livro
router.post('/', async (req, res) => {
  try {
    const { codigo, titulo, autor, descricao, resenha, imageUrl } = req.body;

    // ✅ Validação de campos obrigatórios
    if (!codigo || !titulo || !autor) {
      return res.status(400).json({ message: 'Campos obrigatórios: codigo, titulo e autor' });
    }

    const novoLivro = new Book({ codigo, titulo, autor, descricao, resenha, imageUrl });
    await novoLivro.save();
    res.status(201).json(novoLivro);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Código já existe' });
    } else {
      res.status(500).json({ message: 'Erro ao criar livro', error: error.message });
    }
  }
});

// ✅ Rota /pdf ANTES de /:codigo para não ser interceptada
router.get('/pdf', async (req, res) => {
  try {
    const livros = await Book.find();
    const doc = new PDFDocument();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=livros.pdf');

    doc.pipe(res);

    doc.fontSize(18).text('Lista de Livros', { align: 'center' });
    doc.fontSize(12).moveDown();

    livros.forEach(livro => {
      doc.text(`Título: ${livro.titulo}`);
      doc.text(`Autor: ${livro.autor}`);
      doc.text(`Descrição: ${livro.descricao}`);
      doc.text(`Resenha: ${livro.resenha}`);
      doc.moveDown();
    });

    doc.end();
  } catch (error) {
    res.status(500).json({ message: 'Erro ao gerar PDF', error: error.message });
  }
});

// GET para pesquisar um livro pelo código
router.get('/:codigo', async (req, res) => {
  try {
    const codigo = parseInt(req.params.codigo);
    const livro = await Book.findOne({ codigo });
    if (!livro) return res.status(404).json({ message: 'Livro não encontrado' });
    res.json(livro);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar livro', error: error.message });
  }
});

// PUT para atualizar um livro existente
router.put('/:codigo', async (req, res) => {
  try {
    const codigo = parseInt(req.params.codigo);
    const updateData = { ...req.body };

    if ('codigo' in updateData) {
      delete updateData.codigo;
    }

    const livroAtualizado = await Book.findOneAndUpdate(
      { codigo },
      updateData,
      { new: true, runValidators: true }
    );

    if (!livroAtualizado) {
      return res.status(404).json({ message: 'Livro não encontrado' });
    }

    res.json({ message: 'Livro atualizado com sucesso', livro: livroAtualizado });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar livro', error: error.message });
  }
});

// DELETE para excluir um livro
router.delete('/:codigo', async (req, res) => {
  try {
    const codigo = parseInt(req.params.codigo);
    const livro = await Book.findOneAndDelete({ codigo });
    if (!livro) return res.status(404).json({ message: 'Livro não encontrado' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Erro ao excluir livro', error: error.message });
  }
});

// ✅ module.exports sempre no final
module.exports = router;