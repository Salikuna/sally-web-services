
export const toEntryDto = (entry) => ({
  id: entry.id,
  title: entry.title,
  body: entry.body,
  ...(entry.pinned !== undefined ? { pinned: entry.pinned } : {})
});
