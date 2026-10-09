import express from 'express';
import pagesRouter from './routes/pages.js';
import apiRouter from './routes/api.js';


const app = express();
app.use(express.json());
app.use(express.static('public'));
app.set("view engine", "ejs");
const PORT = process.env.PORT || 3000;

app.get('/about', (req, res) => {
  res.status(200).render('about', { title: 'About' });
});

app.use('/', pagesRouter);
app.use('/api', apiRouter);

app.get('/hello', (req, res) => {
  res.status(200).send('I am learning how to build web servers with Express.');
});

app.get('/hello/:name', (req, res) => {
  const name = req.params.name;
  res.status(200).send(`Hello, ${name}!`);
});

app.get('/repeat/:word', (req, res) => {
  const word = req.params.word;
  res.status(200).send(`${word} ${word} ${word}`);
});

app.get('/count', (req, res) => {
  const from = req.query.from || 1;
  const to = req.query.to || 10;

  res.status(200).send(`Counting from ${from} to ${to}.`);
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
    res.status(200).json(projects);
    return;
  }

  const filteredProjects = projects.filter(
    project => project.tag === tag
  );

  res.status(200).json(filteredProjects);
});

const entries = [
  { id: 0, title: 'First note', body: 'This is the first entry.' },
  { id: 1, title: 'Second note', body: 'This is the second entry.' },
  { id: 2, title: 'Third note', body: 'This is the third entry.' }
];

let nextEntryId = 3;
//Unit 5: In-Class Activity
const wishlist = [];
app.post('/wishlist', (req, res) => {
  const { item, note } = req.body;

  if (!item) {
    res.status(400).json({ error: 'item is required' });
    return;
  }

  const newItem = { item, note };
  wishlist.push(newItem);
  res.status(201).json(newItem);
});

app.get('/entries', (req, res) => {
  res.set('Cache-Control', 'public, max-age=60');
  res.set('X-Total-Count', entries.length);

  res.status(200).render('layout', {
    title: 'My Notes',
    page: 'entries',
    entries
  });
});

app.post('/entries', (req, res) => {
  const { title, body } = req.body;

  if (!title || !body) {
    res.status(400).json({ error: 'title and body are required' });
    return;
  }

  const newEntry = { id: nextEntryId++, title, body };
  entries.push(newEntry);
  res.status(201).json(newEntry);
});


app.get('/entries/:id', (req, res) => {
  const id = Number(req.params.id);
  const entry = entries.find(entry => entry.id === id);

  if (!entry) {
    res.status(404).render('layout', {
      title: 'Error',
      page: 'error',
      message: 'Entry not found.'
    });
    return;
  }

  res.status(200).render('layout', {
    title: entry.title,
    page: 'entry',
    entry
  });
});

app.delete('/entries/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = entries.findIndex(entry => entry.id === id);

  if (!Number.isInteger(id) || id < 0 || index === -1) {
    // Return 404 because the requested entry does not exist or was already deleted.
    res.status(404).json({ error: 'Entry not found' });
    return;
  }

  entries.splice(index, 1);
  res.status(204).send();
});

const events = [
  { title: 'Career fair' },
  { title: 'Hackathon kickoff' },
  { title: 'Networking night' }
];

app.get('/events', (req, res) => {
  res.status(200).render('layout', {
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

