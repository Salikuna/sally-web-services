import { Router } from 'express';


const router = Router();

router.get('/about', (req, res) => {
  res.status(200).render('about', { title: 'About' });
});

router.get('/hello', (req, res) => {
  res.status(200).send('I am learning how to build web servers with Express.');
});

router.get('/hello/:name', (req, res) => {
  const name = req.params.name;
  res.status(200).send(`Hello, ${name}!`);
});

router.get('/repeat/:word', (req, res) => {
  const word = req.params.word;
  res.status(200).send(`${word} ${word} ${word}`);
});

router.get('/count', (req, res) => {
  const from = req.query.from || 1;
  const to = req.query.to || 10;

  res.status(200).send(`Counting from ${from} to ${to}.`);
});

// Unit 02: In-class activity
const projects = [
  { name: 'Weather app', tag: 'javascript' },
  { name: 'Portfolio site', tag: 'express' },
  { name: 'Budget tracker', tag: 'python' },
];

router.get('/projects', (req, res) => {
  const tag = req.query.tag;

  if (!tag) {
    return res.status(200).json(projects);
  }

  const filteredProjects = projects.filter(
    project => project.tag === tag
  );

  res.status(200).json(filteredProjects);
});

// Unit 05: In-class activity
const wishlist = [];

router.post('/wishlist', (req, res) => {
  const { item, note } = req.body;

  if (!item) {
    return res.status(400).json({ error: 'item is required' });
  }

  const newItem = { item, note };
  wishlist.push(newItem);
  res.status(201).json(newItem);
});

router.get('/events', (req, res) => {
  res.status(200).render('layout', {
    title: 'Events',
    page: 'events',
    events
  });
});

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

router.get('/slow', async (req, res) => {
  await wait(5000);
  res.status(200).send('Done waiting.');
});

router.get('/three-posts', async (req, res) => {
  const ids = [1, 2, 3];
  const titles = [];

  for (const id of ids) {
    const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`);
    const post = await response.json();
    titles.push(post.title);
  }

  res.status(200).json({ titles });
});

export default router;