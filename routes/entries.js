import { Router } from 'express';
import { readFile, writeFile } from 'fs/promises';
import { Ok, Err, Some, None } from '../result.js';

const router = Router();
const asyncHandler = (fn) => (req, res, next) => {
  fn(req, res, next).catch(next);
};
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

  writeQueue = result.catch(() => {});

  return result;
}

const validateEntry = ({ title, body } = {}) => {
  if (!title || !body) {
    return Err('title and body are required');
  }

  return Ok({ title, body });
};

const findEntryById = (entries, id) => {
  const entry = entries.find(entry => entry.id === id);
  return entry ? Some(entry) : None;
};

router.get('/', asyncHandler(async (req, res) => {
  const entries = await readEntries();

  res.set('Cache-Control', 'public, max-age=60');
  res.set('X-Total-Count', entries.length);

  res.status(200).render('layout', {
    title: 'My Notes',
    page: 'entries',
    entries
  });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const entries = await readEntries();

  const found = findEntryById(entries, id);

  if (!found.some) {
    return res.status(404).render('layout', {
      title: 'Error',
      page: 'error',
      message: 'Entry not found.'
    });
  }

  res.status(200).render('layout', {
    title: found.value.title,
    page: 'entry',
    entry: found.value
  });
}));

router.post('/', asyncHandler(async (req, res) => {
  const result = validateEntry(req.body);

  if (!result.ok) {
    return res.status(400).json({ error: result.error });
  }

  const newEntry = await queueWrite(async () => {
    const entries = await readEntries();

    const counterData = await readFile('next-entry-id.json', 'utf-8');
    const counter = JSON.parse(counterData);

    const entry = {
      id: counter.nextId,
      ...result.value
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
}));

router.post('/classic', asyncHandler(async (req, res) => {
  const result = validateEntry(req.body);

  if (!result.ok) {
    return res.status(400).send(result.error);
  }

  await queueWrite(async () => {
    const entries = await readEntries();

    const counterData = await readFile('next-entry-id.json', 'utf-8');
    const counter = JSON.parse(counterData);

    const newEntry = {
      id: counter.nextId,
      ...result.value
    };

    entries.push(newEntry);
    counter.nextId += 1;

    await saveEntries(entries);
    await writeFile(
      'next-entry-id.json',
      JSON.stringify(counter, null, 2)
    );
  });

  res.redirect('/entries');
}));

// Unit 10: Updating the existing entry while preserving its stable ID.
router.put('/:id', asyncHandler(async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 0) {
    return res.status(404).json({ error: 'Entry not found' });
  }

  const result = validateEntry(req.body);

  if (!result.ok) {
    return res.status(400).json({ error: result.error });
  }

  const updatedEntry = await queueWrite(async () => {
    const entries = await readEntries();
    const index = entries.findIndex(entry => entry.id === id);

    if (index === -1) {
      return null;
    }

    const entry = {
      ...entries[index],
      ...result.value
    };

    entries[index] = entry;
    await saveEntries(entries);

    return entry;
  });

  if (!updatedEntry) {
    return res.status(404).json({ error: 'Entry not found' });
  }

  res.status(200).json(updatedEntry);
}));
router.patch('/:id/pin', asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 0) {
    return res.status(404).json({ error: 'Entry not found' });
  }
  if (typeof req.body?.pinned !== 'boolean') {
    return res.status(400).json({ error: 'pinned must be a boolean' });
  }
  const updatedEntry = await queueWrite(async () => {
    const entries = await readEntries();
    const index = entries.findIndex(entry => entry.id === id);

    if (index === -1) {
      return null;
    }
    entries[index] = {
      ...entries[index],
      pinned: req.body.pinned
    };
    await saveEntries(entries);
    return entries[index];
  });

  if (!updatedEntry) {
    return res.status(404).json({ error: 'Entry not found' });
  }
  res.status(200).json(updatedEntry);
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 0) {
    return res.status(404).json({ error: 'Entry not found' });
  }

  const deleted = await queueWrite(async () => {
    const entries = await readEntries();

    const found = findEntryById(entries, id);

    if (!found.some) {
      return false;
    }

    const index = entries.findIndex(entry => entry.id === id);

    entries.splice(index, 1);
    await saveEntries(entries);

    return true;
  });

  if (!deleted) {
    return res.status(404).json({ error: 'Entry not found' });
  }

  res.status(204).send();
}));

export default router;