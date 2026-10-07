import express from 'express';
import pagesRouter from './routes/pages.js';
import apiRouter from './routes/api.js';


const app = express();
app.use(express.static('public'));
app.set("view engine", "ejs");
const PORT = process.env.PORT || 3000;

app.get('/about', (req, res) => {
  res.render('about', { title: 'About' });
});

app.use('/', pagesRouter);
app.use('/api', apiRouter);

app.get('/hello', (req, res) => {
  res.send('I am learning how to build web servers with Express.');
});

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

//Unit 2:In-Class Activity 
const projects = [
  { name: 'Weather app', tag: 'javascript' },
  { name: 'Portfolio site', tag: 'express' },
  { name: 'Budget tracker', tag: 'python' },
];

app.get('/projects', (req, res) => {
  const tag = req.query.tag;

  if (!tag) {
    res.json(projects);
    return;
  }

  const filteredProjects = projects.filter(
    project => project.tag === tag
  );

  res.json(filteredProjects);
});

const entries = [
  { title: 'First note', body: 'This is the first entry.' },
  { title: 'Second note', body: 'This is the second entry.' },
  { title: 'Third note', body: 'This is the third entry.' }
];

app.get('/entries', (req, res) => {
  res.render('layout', {
    title: 'My Notes',
    page: 'entries',
    entries
  });
});

app.get('/entries/:id', (req, res) => {
  const id = Number(req.params.id);
  const entry = entries[id];

  if (!entry) {
    res.status(404).render('layout', {
      title: 'Error',
      page: 'error',
      message: 'Entry not found.'
    });
    return;
  }

  res.render('layout', {
    title: entry.title,
    page: 'entry',
    entry
  });
});

const events = [
  { title: 'Career fair' },
  { title: 'Hackathon kickoff' },
  { title: 'Networking night' }
];

app.get('/events', (req, res) => {
  res.render('layout', {
    title: 'Events',
    page: 'events',
    events
  });
});

app.use((req, res) => {
  res.status(404).send('Page not found.');
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

