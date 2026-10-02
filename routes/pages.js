import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.send('Home page');
});

router.get('/about', (req, res) => {
  res.render('about', { title: 'About' });
});

export default router;

