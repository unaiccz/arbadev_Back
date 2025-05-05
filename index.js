import express from 'express';
import cors from 'cors';
import pkg from 'pg';
import dotenv from 'dotenv';
import multer from 'multer';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const { Pool } = pkg;
dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

// PostgreSQL

const pool = new Pool({
  connectionString: 'postgresql://arbadev_bbdd_user:' + process.env.DB_PASSWORD + process.env.DB_URL,
  ssl: { rejectUnauthorized: false },
});

app.use(cors());
app.use(express.json());
// 🔸 Configurar rutas para carpetas persistentes en Render
const persistentPath = '/mnt/data/uploads';
const tempPath = '/mnt/data/temp';

// Asegúrate de que las carpetas existan y tengan los permisos correctos
[persistentPath, tempPath].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true, mode: 0o755 }); // Crear con permisos 755
  } else {
    try {
      fs.chmodSync(dir, 0o755); // Cambiar permisos si ya existen
      console.log(`Permisos de ${dir} ajustados correctamente`);
    } catch (err) {
      console.error(`Error al cambiar permisos de ${dir}:`, err);
    }
  }
});

// 🔸 Multer configuración para guardar en carpeta temporal
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, tempPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) cb(null, true);
  else cb(new Error('Solo se permiten archivos de imagen'), false);
};

const upload = multer({ storage, fileFilter });

// 🔸 Ruta para subir imagen
app.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ stat: "error", message: "No se subió ningún archivo" });
  }

  try {
    const outputFilename = 'img-' + req.file.filename;
    const outputPath = path.join(persistentPath, outputFilename);

    await sharp(req.file.path)
      .resize({ width: 1200, height: 1200, fit: sharp.fit.inside, withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toFile(outputPath);

    fs.unlinkSync(req.file.path);

    const fileUrl = `${req.protocol}://${req.get('host')}/files/${outputFilename}`;

    res.json({
      stat: "ok",
      message: "Imagen subida y redimensionada",
      file: {
        filename: outputFilename,
        url: fileUrl
      }
    });
  } catch (error) {
    console.error('Error al procesar la imagen:', error);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ stat: "error", message: "Error al procesar la imagen" });
  }
});

// 🔸 Servir las imágenes desde el disco persistente
app.use('/files', express.static(persistentPath));

// 🔸 Ruta para test de base de datos
app.get('/db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.send({ ok: true, time: result.rows[0].now });
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error);
    res.status(500).send({ ok: false, error: 'Error al conectar con la base de datos' });
  }
});`

// 🔸 Ruta básica
app.get('/', (req, res) => {
  res.send({ ok: true, res: 'Hello Arba Dev!' });
});

app.listen(port, () => {
  console.log('listening');
});
