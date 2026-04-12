require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
app.set('trust proxy', 1);
app.use(express.static(path.join(__dirname, '..', 'public')));

const PORT = process.env.PORT || 3000;

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Routes added in Task 8
module.exports = app;

if (require.main === module) {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
