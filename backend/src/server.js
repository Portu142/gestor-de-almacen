// src/server.js — punto de entrada: crea la app y abre el puerto.
import { createApp } from './app.js';

const PORT = process.env.PORT ?? 3001;

createApp().listen(PORT, () => {
  console.log(`API del almacén escuchando en http://localhost:${PORT}`);
});
