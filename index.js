import express from 'express';
import pronote from 'pronote-api-maintained';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware critique pour Render
app.use(express.json());
app.use((req, res, next) => {
  res.set('Connection', 'keep-alive');
  next();
});

// Route de test obligatoire pour Render
app.get('/', (req, res) => {
  res.json({ 
    status: 'online',
    message: 'API Pronote - Utilisez /pronote',
    timestamp: new Date().toISOString()
  });
});

// Route Pronote avec timeout géré
app.get('/pronote', async (req, res) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

  try {
    console.log("Tentative de connexion à Pronote...");
    const session = await pronote.login(
      process.env.PRONOTE_URL + '/pronote', // Note le /pronote ajouté
      process.env.PRONOTE_USERNAME,
      process.env.PRONOTE_PASSWORD,
      'ac-lyon', // Force le CAS (plus fiable que la variable env)
      { signal: controller.signal }
    );

    const [timetable, homeworks] = await Promise.all([
      session.timetable(),
      session.homework()
    ]);

    res.json({
      status: 'success',
      lastUpdate: new Date().toISOString(),
      timetable: timetable.slice(0, 3), // Retourne seulement 3 premiers éléments pour le test
      homeworks: homeworks.slice(0, 3)
    });
  } catch (error) {
    console.error('ERREUR:', error);
    res.status(500).json({
      status: 'error',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? {
        url: process.env.PRONOTE_URL,
        cas: 'ac-lyon'
      } : undefined
    });
  } finally {
    clearTimeout(timeout);
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Serveur actif : http://0.0.0.0:${port}`);
});
