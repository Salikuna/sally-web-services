
import { Ok, Err } from '../result.js';
import * as repository from '../repositories/entriesRepository.js';
import { toEntryDto } from '../dtos/entryDto.js';

const validateEntry = ({ title, body } = {}) => {
  const trimmedTitle = typeof title === 'string' ? title.trim() : '';
  const trimmedBody = typeof body === 'string' ? body.trim() : '';

  if (!trimmedTitle || !trimmedBody) {
    return Err({ status: 400, message: 'title and body are required' });
  }

  return Ok({ title: trimmedTitle, body: trimmedBody });
};

const findEntry = (entries, id) =>
  entries.find(entry => entry.id === id);

export const listEntries = async () => {
    return (await repository.getAll()).map(toEntryDto);
};

export const getEntry = async (id) => {
  const entries = await repository.getAll();
  const entry = findEntry(entries, id);

  return entry
    ? Ok(toEntryDto(entry))
    : Err({ status: 404, message: 'Entry not found' });
};

export const createEntry = async (data) => {
  const result = validateEntry(data);
  if (!result.ok) return result;

  const entry = await repository.queueWrite(async () => {
    const entries = await repository.getAll();
    const nextId = await repository.getNextId();

    const newEntry = { id: nextId, ...result.value };
    entries.push(newEntry);

    await repository.save(entries);
    await repository.saveNextId(nextId + 1);

    return newEntry;
  });

  return Ok(toEntryDto(entry));
};

export const updateEntry = async (id, data) => {
  if (!Number.isInteger(id) || id < 0) {
    return Err({ status: 404, message: 'Entry not found' });
  }

  const result = validateEntry(data);
  if (!result.ok) return result;

  const updated = await repository.queueWrite(async () => {
    const entries = await repository.getAll();
    const index = entries.findIndex(entry => entry.id === id);

    if (index === -1) return null;

    entries[index] = { ...entries[index], ...result.value };
    await repository.save(entries);

    return entries[index];
  });

  return updated
  ? Ok(toEntryDto(updated))
  : Err({ status: 404, message: 'Entry not found' });
};

export const pinEntry = async (id, pinned) => {
  if (!Number.isInteger(id) || id < 0) {
    return Err({ status: 404, message: 'Entry not found' });
  }

  if (typeof pinned !== 'boolean') {
    return Err({ status: 400, message: 'pinned must be a boolean' });
  }
  const updated = await repository.queueWrite(async () => {
    const entries = await repository.getAll();
    const index = entries.findIndex(entry => entry.id === id);
    if (index === -1) return null;
    entries[index] = { ...entries[index], pinned };
    await repository.save(entries);
    return entries[index];
  });
  return updated
  ? Ok(toEntryDto(updated))
  : Err({ status: 404, message: 'Entry not found' });
};

export const deleteEntry = async (id) => {
  if (!Number.isInteger(id) || id < 0) {
    return Err({ status: 404, message: 'Entry not found' });
  }
  const deleted = await repository.queueWrite(async () => {
    const entries = await repository.getAll();
    const index = entries.findIndex(entry => entry.id === id);

    if (index === -1) return false;

    entries.splice(index, 1);
    await repository.save(entries);

    return true;
  });

  return deleted
    ? Ok(null)
    : Err({ status: 404, message: 'Entry not found' });
};
