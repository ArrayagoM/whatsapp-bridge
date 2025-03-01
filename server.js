require('dotenv').config();
const app = require('./src/app');
const PORT = process.env.PORT || 5656;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
