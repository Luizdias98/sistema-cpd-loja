const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Criar pasta uploads se não existir
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Configuração do multer para upload de imagens
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas!'));
    }
  }
});

// Conexão com banco de dados
const pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: '',
  database: 'sistema_cpd',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
});

// ================= ROTAS PDVs =================

// Listar todos os PDVs
app.get('/api/pdvs', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM pdvs ORDER BY nome');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao listar PDVs' });
  }
});

// Adicionar PDV
app.post('/api/pdvs', async (req, res) => {
  try {
    const { nome } = req.body;
    
    if (!nome || nome.trim() === '') {
      return res.status(400).json({ erro: 'Nome do PDV é obrigatório' });
    }

    const [result] = await pool.query(
      'INSERT INTO pdvs (nome) VALUES (?)',
      [nome.trim()]
    );

    res.json({ sucesso: true, id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao adicionar PDV' });
  }
});

// Deletar PDV
app.delete('/api/pdvs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM pdvs WHERE id = ?', [id]);
    res.json({ sucesso: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao deletar PDV' });
  }
});

// ================= ROTAS REGISTROS =================

// Listar registros com filtros
app.get('/api/registros', async (req, res) => {
  try {
    const { data, pdv_id } = req.query;
    
    let query = `
      SELECT 
        r.*,
        GROUP_CONCAT(p.nome SEPARATOR ', ') as pdvs
      FROM registros r
      LEFT JOIN registro_pdvs rp ON r.id = rp.registro_id
      LEFT JOIN pdvs p ON rp.pdv_id = p.id
    `;
    
    const conditions = [];
    const params = [];
    
    if (data) {
      conditions.push('r.data = ?');
      params.push(data);
    }
    
    if (pdv_id) {
      conditions.push('rp.pdv_id = ?');
      params.push(pdv_id);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' GROUP BY r.id ORDER BY r.data DESC, r.horario_inicio DESC';
    
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao listar registros' });
  }
});

// Criar novo registro
app.post('/api/registros', upload.array('imagens', 5), async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const {
      tipo,
      data,
      horario_inicio,
      horario_fim,
      relatorio,
      tem_ocorrencia,
      descricao_ocorrencia,
      email_enviado,
      pdvs
    } = req.body;

    // Validações
    if (!tipo || !data || !horario_inicio) {
      throw new Error('Campos obrigatórios faltando');
    }

    // Inserir registro
    const [result] = await connection.query(
      `INSERT INTO registros 
       (tipo, data, horario_inicio, horario_fim, relatorio, 
        tem_ocorrencia, descricao_ocorrencia, email_enviado) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        tipo,
        data,
        horario_inicio,
        horario_fim || null,
        relatorio || '',
        tem_ocorrencia || 0,
        descricao_ocorrencia || null,
        email_enviado || 0
      ]
    );

    const registroId = result.insertId;

    // Inserir PDVs associados
    const pdvsList = typeof pdvs === 'string' ? JSON.parse(pdvs) : pdvs;
    
    if (Array.isArray(pdvsList) && pdvsList.length > 0) {
      for (const pdvId of pdvsList) {
        await connection.query(
          'INSERT INTO registro_pdvs (registro_id, pdv_id) VALUES (?, ?)',
          [registroId, pdvId]
        );
      }
    }

    // Inserir imagens
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        await connection.query(
          'INSERT INTO registro_imagens (registro_id, caminho_imagem) VALUES (?, ?)',
          [registroId, file.filename]
        );
      }
    }

    await connection.commit();
    res.json({ sucesso: true, id: registroId });

  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ erro: error.message || 'Erro ao salvar registro' });
  } finally {
    connection.release();
  }
});

// Obter imagens de um registro
app.get('/api/registros/:id/imagens', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      'SELECT * FROM registro_imagens WHERE registro_id = ?',
      [id]
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao buscar imagens' });
  }
});

// Deletar registro
app.delete('/api/registros/:id', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { id } = req.params;
    
    // Buscar e deletar imagens físicas
    const [imagens] = await connection.query(
      'SELECT caminho_imagem FROM registro_imagens WHERE registro_id = ?',
      [id]
    );
    
    for (const img of imagens) {
      const filePath = path.join(__dirname, 'uploads', img.caminho_imagem);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    // Deletar relações e registro
    await connection.query('DELETE FROM registro_imagens WHERE registro_id = ?', [id]);
    await connection.query('DELETE FROM registro_pdvs WHERE registro_id = ?', [id]);
    await connection.query('DELETE FROM registros WHERE id = ?', [id]);
    
    await connection.commit();
    res.json({ sucesso: true });
    
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ erro: 'Erro ao deletar registro' });
  } finally {
    connection.release();
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});