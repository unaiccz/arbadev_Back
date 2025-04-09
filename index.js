import express from 'express'; 
import cors from 'cors';
const app = express();



const port = 3000;
app.use(cors()); // habilitar cors para permitir peticiones de otros dominios
app.use(express.json()); // usar el middleware para parsear el body de las peticiones a json
app.get('/', (req, res) => {
  res.send({ok:true, res: 'Hello World!'});
});
app.listen(port, () => {
  console.log(`Escuchando en el puerto ${port}`);
});