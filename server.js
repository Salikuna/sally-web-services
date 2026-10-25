import express from 'express';
import morgan from 'morgan';
import pagesRouter from './routes/pages.js';
import apiRouter from './routes/api.js';
import entriesRouter from './routes/entries.js';
import legacyRouter from './routes/legacy.js';

const app = express(), PORT = process.env.PORT || 3000;
app.use(express.json(), express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set("view engine", "ejs");


app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});
app.use(morgan('dev'));
app.use('/', pagesRouter);
app.use('/api', apiRouter);
app.use('/entries', entriesRouter);
app.use('/', legacyRouter);
app.use((req, res) => res.status(404).send('Page not found.'));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send('Something went wrong.');
});
app.listen(PORT, () => console.log(`Server is running at http://localhost:${PORT}`));
