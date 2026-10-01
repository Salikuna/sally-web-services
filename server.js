import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Hello, web!');
});

app.get('/hello', (req, res) => {
  res.send('I am learning how to build web servers with Express.');
});

app.get('/about', (req, res) => {
  res.send('This is a web programming course.');
});

app.get('/status', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime()
  });
});

app.use((req, res) => {
  res.status(404).send('Page not found.');
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
