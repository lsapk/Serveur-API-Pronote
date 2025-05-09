import express from 'express';
import pronote from 'pronote-api-maintained';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Route de test
app.get('/', (req, res) => {
  res.send('API Pronote fonctionnelle - Accédez à /pronote');
});

// Route principale
app.get('/pronote', async (req, res) => {
  try {
    const session = await pronote.login(
      process.env.PRONOTE_URL,
      process.env.PRONOTE_USERNAME,
      process.env.PRONOTE_PASSWORD,
      process.env.PRONOTE_CAS
    );

    const timetable = await session.timetable();
    const homeworks = await session.homework();

    res.json({ 
      status: 'success',
      timetable,
      homeworks
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

app.listen(port, () => {
  console.log(`Serveur API Pronote lancé sur http://localhost:${port}`);
});
