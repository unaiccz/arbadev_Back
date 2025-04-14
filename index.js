import express from 'express';
import cors from 'cors';
import pkg from 'pg';
const { Pool } = pkg; // This is the correct way to extract Pool from the imported package

const app = express();
const port = process.env.PORT || 4000;

// Configuración de la conexión a PostgreSQL usando la URL
const pool = new Pool({
  connectionString: 'postgresql://arbadev_bbdd_user:uq46I0SHrGj5RyS51zMLwRt5I1FsmN83@dpg-cvr83jogjchc73bp9a00-a.oregon-postgres.render.com/arbadev_bbdd',
  ssl: {
    rejectUnauthorized: false, // Esto es necesario para evitar errores de certificado en entornos de producción
  },
});

app.use(cors());
app.use(express.json());

// Ruta de prueba para verificar la conexión a PostgreSQL
app.get('/db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.send({ ok: true, time: result.rows[0].now });
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error);
    res.status(500).send({ ok: false, error: 'Error al conectar con la base de datos' });
  }
});

app.get('/', (req, res) => {
  res.send({ ok: true, res: 'Hello World!' });
});

app.listen(port, () => {
  console.log(`Escuchando en el puerto ${port}`);
});