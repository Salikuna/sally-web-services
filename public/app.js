const form = document.querySelector('#entry-form');
const list = document.querySelector('#entries');

const buildItem = (entry) => {
  const item = document.createElement('li');
  item.className = 'card';
  item.dataset.id = entry.id;

  const text = document.createElement('span');
  const title = document.createElement('strong');
  title.textContent = `${entry.title}:`;
  text.append(title, ` ${entry.body}`);

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'delete-btn';
  button.textContent = 'Delete';

  item.append(text, button);
  return item;
};

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const data = new FormData(form);
  const entry = Object.fromEntries(data);
  const button = form.querySelector('button');

  // Prevent submitting the same note twice while saving.
  button.disabled = true;

  try {
    const response = await fetch('/entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      const { error } = await response.json();
      alert(error);
      return;
    }

    const saved = await response.json();
    list.append(buildItem(saved));
    form.reset();
  } catch {
    alert('Your entry was not saved: the server did not answer properly. Please try again.');
  } finally {
    button.disabled = false;
  }
});

list.addEventListener('click', async (event) => {
  if (!event.target.matches('.delete-btn')) return;

  const button = event.target;
  const item = button.closest('li');
  const id = item.dataset.id;

  // Prevent double-clicking Delete while the request is pending.
  button.disabled = true;

  try {
    const response = await fetch(`/entries/${id}`, {
      method: 'DELETE',
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      const { error } = await response.json();
      alert(error);
      button.disabled = false;
      return;
    }

    item.remove();
  } catch {
    alert('That entry was not deleted: the server did not answer properly. Please try again.');
    button.disabled = false;
  }
});
