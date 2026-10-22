import express from 'express';
import pagesRouter from './routes/pages.js';
import apiRouter from './routes/api.js';
import { readFile, writeFile } from 'fs/promises';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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

async function readEntries() {
  const data = await readFile('entries.json', 'utf-8');
  return JSON.parse(data);
}

async function saveEntries(entries) {
  await writeFile('entries.json', JSON.stringify(entries, null, 2));
}

let writeQueue = Promise.resolve();

function queueWrite(operation) {
  const result = writeQueue.then(operation);

  // Serialize writes to prevent concurrent requests from overwriting each other.
  writeQueue = result.catch(() => {});

  return result;
}

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

app.get('/entries', async (req, res) => {
  const entries = await readEntries();

  res.set('Cache-Control', 'public, max-age=60');
  res.set('X-Total-Count', entries.length);

  res.status(200).render('layout', {
    title: 'My Notes',
    page: 'entries',
    entries
  });
});

app.post('/entries', async (req, res) => {
  const { title, body } = req.body ?? {};

  if (!title || !body) {
    return res.status(400).json({
      error: 'title and body are required'
    });
  }

  const newEntry = await queueWrite(async () => {
    const entries = await readEntries();

    const counterData = await readFile('next-entry-id.json', 'utf-8');
    const counter = JSON.parse(counterData);

    const entry = {
      id: counter.nextId,
      title,
      body
    };

    entries.push(entry);
    counter.nextId += 1;

    await saveEntries(entries);
    await writeFile(
      'next-entry-id.json',
      JSON.stringify(counter, null, 2)
    );

    return entry;
  });

  res.status(201).json(newEntry);
});

// Unit 08: Classic HTML form using Post/Redirect/Get.
app.post('/entries/classic', async (req, res) => {
  const { title, body } = req.body ?? {};
  if (!title || !body) {
    return res.status(400).send('title and body are required');
  }
  await queueWrite(async () => {
    const entries = await readEntries();

    const counterData = await readFile('next-entry-id.json', 'utf-8');
    const counter = JSON.parse(counterData);

    const newEntry = {
      id: counter.nextId,
      title,
      body
    };

    entries.push(newEntry);
    counter.nextId += 1;

    await saveEntries(entries);
    await writeFile(
      'next-entry-id.json',
      JSON.stringify(counter, null, 2)
    );
  });

  // Refreshing the page repeats GET, not POST.
  res.redirect('/entries');
});

app.get('/entries/:id', async (req, res) => {
  const id = Number(req.params.id);
  const entries = await readEntries();

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

app.delete('/entries/:id', async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 0) {
    return res.status(404).json({ error: 'Entry not found' });
  }

  const deleted = await queueWrite(async () => {
    const entries = await readEntries();
    const index = entries.findIndex(entry => entry.id === id);

    if (index === -1) {
      return false;
    }

    entries.splice(index, 1);
    await saveEntries(entries);

    return true;
  });

  if (!deleted) {
    // Return 404 because the entry does not exist or was already deleted.
    return res.status(404).json({ error: 'Entry not found' });
  }

  res.status(204).send();
});

app.get('/events', (req, res) => {
  res.status(200).render('layout', {
    title: 'Events',
    page: 'events',
    events
  });
});

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

app.get('/slow', async (req, res) => {
  await wait(5000);
  res.status(200).send('Done waiting.');
});

app.get('/three-posts', async (req, res) => {
  const ids = [1, 2, 3];
  const titles = [];

  for (const id of ids) {
    const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`);
    const post = await response.json();
    titles.push(post.title);
  }

  res.status(200).json({ titles });
});

app.use((req, res) => {
  res.status(404).send('Page not found.');
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

