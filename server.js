require('dotenv').config();
const express = require('express');
const router = require('./src/routes/routes');
const cors = require('cors');
const app = express();
const port = process.env.PORT;
const { startBot } = require('./bot');

app.use(express.json());
app.use('/', router);
app.use(cors());

app.listen(port, async () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
  try {
    await startBot();
    console.log('🤖 Bot Telegram iniciado com sucesso!');
  } catch (error) {
    console.error('❌ Falha ao iniciar bot:', error.message);
  }
});