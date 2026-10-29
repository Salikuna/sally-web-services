
import * as entriesService from '../services/entriesService.js';

const parseId = (rawId) => {
  const id = Number(rawId);
  return Number.isInteger(id) && id >= 0 ? id : null;
};

const sendResult = (res, result, successStatus = 200) => {
  if (!result.ok) {
    return res.status(result.error.status).json({
      error: result.error.message
    });
  }
  return res.status(successStatus).json(result.value);
};

export const index = async (req, res) => {
  const entries = await entriesService.listEntries();

  res.set('Cache-Control', 'public, max-age=60');
  res.set('X-Total-Count', entries.length);

  res.status(200).render('layout', {
    title: 'My Notes',
    page: 'entries',
    entries
  });
};

export const show = async (req, res) => {
  const id = parseId(req.params.id);
  const result = await entriesService.getEntry(id);

  if (!result.ok) {
    return res.status(404).render('layout', {
      title: 'Error',
      page: 'error',
      message: 'Entry not found.'
    });
  }

  res.status(200).render('layout', {
    title: result.value.title,
    page: 'entry',
    entry: result.value
  });
};

export const create = async (req, res) => {
  const result = await entriesService.createEntry(req.body);
  return sendResult(res, result, 201);
};

export const createClassic = async (req, res) => {
  const result = await entriesService.createEntry(req.body);

  if (!result.ok) {
    return res.status(result.error.status).send(result.error.message);
  }

  return res.redirect('/entries');
};

export const update = async (req, res) => {
  const id = parseId(req.params.id);

  if (id === null) {
    return res.status(404).json({ error: 'Entry not found' });
  }

  const result = await entriesService.updateEntry(id, req.body);
  return sendResult(res, result);
};

export const pin = async (req, res) => {
  const id = parseId(req.params.id);

  if (id === null) {
    return res.status(404).json({ error: 'Entry not found' });
  }

  const result = await entriesService.pinEntry(id, req.body?.pinned);
  return sendResult(res, result);
};

export const destroy = async (req, res) => {
  const id = parseId(req.params.id);

  if (id === null) {
    return res.status(404).json({ error: 'Entry not found' });
  }

  const result = await entriesService.deleteEntry(id);

  if (!result.ok) {
    return res.status(result.error.status).json({
      error: result.error.message
    });
  }

  return res.status(204).send();
};
