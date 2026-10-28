const form = document.querySelector('#entry-form');
const list = document.querySelector('#entries');

const buildItem = (entry) => {
  const item = document.createElement('li');
  item.className = 'card';
  item.dataset.id = entry.id;
  item.dataset.title = entry.title;
  item.dataset.body = entry.body;

  const display = document.createElement('span');
  display.className = 'entry-display';

  const title = document.createElement('strong');
  title.textContent = `${entry.title}:`;
  display.append(title, ` ${entry.body}`);

  const editButton = document.createElement('button');
  editButton.type = 'button';
  editButton.className = 'edit-btn';
  editButton.textContent = 'Edit';

  const deleteButton = document.createElement('button');
  deleteButton.type = 'button';
  deleteButton.className = 'delete-btn';
  deleteButton.textContent = 'Delete';

  item.append(display, editButton, deleteButton);
  return item;
};

const makeInput = (name, value) => {
  const input = document.createElement('input');
  input.type = 'text';
  input.name = name;
  input.value = value;
  return input;
};
const fillDisplay = (display, entry) => {
  const title = document.createElement('strong');
  title.textContent = `${entry.title}:`;
  display.replaceChildren(title, ` ${entry.body}`);
};
const startEdit = (item) => {
  const display = item.querySelector('.entry-display');
  const buttons = item.querySelectorAll('.edit-btn, .delete-btn');

  const editForm = document.createElement('form');
  editForm.className = 'edit-form';

  const save = document.createElement('button');
  save.type = 'submit';
  save.textContent = 'Save';

  const cancel = document.createElement('button');
  cancel.type = 'button';
  cancel.textContent = 'Cancel';
  cancel.className = 'cancel-btn';

  editForm.append(
    makeInput('title', item.dataset.title),
    makeInput('body', item.dataset.body),
    save,
    cancel
  );
  display.replaceWith(editForm);
  buttons.forEach(button => { button.hidden = true; });

  cancel.addEventListener('click', () => {
    editForm.replaceWith(display);
    buttons.forEach(button => { button.hidden = false; });
  });

  editForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const entry = Object.fromEntries(new FormData(editForm));
    save.disabled = true;

    try {
      const response = await fetch(`/entries/${item.dataset.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
        signal: AbortSignal.timeout(5000),
      });

      if (response.status === 404) {
        alert('This entry was already deleted.');
        item.remove();
        return;
      }

      if (!response.ok) {
        const { error } = await response.json();
        alert(error);
        return;
      }
      const saved = await response.json();

      item.dataset.title = saved.title;
      item.dataset.body = saved.body;

      fillDisplay(display, saved);
      editForm.replaceWith(display);
      buttons.forEach(button => { button.hidden = false; });

    } catch {
      alert('Your changes were not saved: the server did not answer properly. Please try again.');
    } finally {
      save.disabled = false;
    }
  });
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
  if (event.target.matches('.edit-btn')) {
    startEdit(event.target.closest('li'));
    return;
  }

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
