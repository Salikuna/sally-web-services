
import { readFile, writeFile } from 'fs/promises';

const DATA_FILE = 'entries.json';
const COUNTER_FILE = 'next-entry-id.json';

export const getAll = async () => {
  const data = await readFile(DATA_FILE, 'utf-8');
  return JSON.parse(data);
};

export const save = async (entries) => {
  await writeFile(DATA_FILE, JSON.stringify(entries, null, 2));
};

export const getNextId = async () => {
  const data = await readFile(COUNTER_FILE, 'utf-8');
  const counter = JSON.parse(data);
  return counter.nextId;
};

export const saveNextId = async (nextId) => {
  await writeFile(
    COUNTER_FILE,
    JSON.stringify({ nextId }, null, 2)
  );
};
let writeQueue = Promise.resolve();
export const queueWrite = (operation) => {
  const result = writeQueue.then(operation);
  writeQueue = result.catch(() => {});
  return result;
};
