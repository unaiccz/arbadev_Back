import express from 'express'; 
import cors from 'cors';
import { Pool } from 'pg'; // Importar el cliente de PostgreSQL

const app = express();

const port = process.env.PORT || 4000; // puerto donde escuchará el servidor

// Configuración de la conexión a PostgreSQL usando la URL
const pool = new Pool({
  connectionString: 'postgresql://arbadev_bbdd_user:uq46I0SHrGj5RyS51zMLwRt5I1FsmN83@dpg-cvr83jogjchc73bp9a00-a.oregon-postgres.render.com/arbadev_bbdd',
  ssl: {
    rejectUnauthorized: false, // Necesario para conexiones seguras en algunos servicios en la nube
  },
});

app.use(cors()); // habilitar cors para permitir peticiones de otros dominios
app.use(express.json()); // usar el middleware para parsear el body de las peticiones a json

// Ruta de prueba para verificar la conexión a PostgreSQL
app.get('/db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()'); // Consulta de prueba
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