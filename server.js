import express from 'express';
import pagesRouter from './routes/pages.js';
import apiRouter from './routes/api.js';


const app = express();
const PORT = process.env.PORT || 3000;

app.use('/', pagesRouter);
app.use('/api', apiRouter);

// app.get('/', (req, res) => {
//   res.send('Hello, web!');
// });

app.get('/hello', (req, res) => {
  res.send('I am learning how to build web servers with Express.');
});

// app.get('/about', (req, res) => {
//   res.send('This is a web programming course.');
// });

// app.get('/status', (req, res) => {
//   res.json({
//     status: 'ok',
//     uptime: process.uptime()
//   });
// });

app.get('/hello/:name', (req, res) => {
  const name = req.params.name;
  res.send(`Hello, ${name}!`);
});

app.get('/repeat/:word', (req, res) => {
  const word = req.params.word;
  res.send(`${word} ${word} ${word}`);
});

app.get('/count', (req, res) => {
  const from = req.query.from || 1;
  const to = req.query.to || 10;

  res.send(`Counting from ${from} to ${to}.`);
});

// app.get('/api/info', (req, res) => {
//   res.json({
//     course: 'Web Services',
//     unit: 2
//   });
// });

// app.get('/api/error', (req, res) => {
//   res.status(400).send('Bad request.');
// });

app.use((req, res) => {
  res.status(404).send('Page not found.');
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

