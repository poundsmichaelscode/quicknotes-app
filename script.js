const noteForm = document.querySelector("#note-form");
const noteInput = document.querySelector("#note-input");
const noteCategory = document.querySelector("#note-category");
const searchInput = document.querySelector("#search-input");
const notesList = document.querySelector("#notes-list");
const noteCount = document.querySelector("#note-count");
const errorMessage = document.querySelector("#error-message");
const clearAllBtn = document.querySelector("#clear-all-btn");

const STORAGE_KEY = "quicknotes-notes";

let notes = loadNotes();

/*
  Load notes from localStorage.
*/
function loadNotes() {
  const savedNotes = localStorage.getItem(STORAGE_KEY);

  if (!savedNotes) {
    return [];
  }

  try {
    const parsedNotes = JSON.parse(savedNotes);

    return Array.isArray(parsedNotes) ? parsedNotes : [];
  } catch (error) {
    console.error("Could not load saved notes:", error);
    return [];
  }
}

/*
  Save the current notes array.
*/
function saveNotes() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(notes)
  );
}

/*
  Update note count message.
*/
function updateCount() {
  const total = notes.length;

  if (total === 0) {
    noteCount.textContent = "You have no notes yet.";
  } else if (total === 1) {
    noteCount.textContent = "You have 1 note.";
  } else {
    noteCount.textContent = `You have ${total} notes.`;
  }
}

/*
  Delete a note using its id.
*/
function deleteNote(id) {
  notes = notes.filter((note) => note.id !== id);

  saveNotes();
  render();
}

/*
  Create and return a note card.
*/
function createNoteCard(note) {
  const listItem = document.createElement("li");

  listItem.classList.add(
    "note-card",
    `category-${note.category}`
  );

  const noteText = document.createElement("p");
  noteText.classList.add("note-text");

  /*
    textContent is used instead of innerHTML
    so user-entered text is handled safely.
  */
  noteText.textContent = note.text;

  const meta = document.createElement("div");
  meta.classList.add("note-meta");

  const categoryLabel = document.createElement("span");
  categoryLabel.classList.add("category-label");
  categoryLabel.textContent = note.category;

  const date = document.createElement("span");
  date.textContent = note.createdAt;

  meta.append(categoryLabel, date);

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.classList.add("delete-btn");
  deleteButton.textContent = "Delete";

  deleteButton.addEventListener("click", () => {
    deleteNote(note.id);
  });

  listItem.append(noteText, meta, deleteButton);

  return listItem;
}

/*
  Rebuild the notes list from the array.
*/
function render() {
  notesList.textContent = "";

  const searchTerm = searchInput.value
    .trim()
    .toLowerCase();

  const filteredNotes = notes.filter((note) =>
    note.text.toLowerCase().includes(searchTerm)
  );

  if (searchTerm && filteredNotes.length === 0) {
    const message = document.createElement("li");

    message.classList.add("no-results");
    message.textContent = "No notes match your search.";

    notesList.appendChild(message);
  } else {
    filteredNotes.forEach((note) => {
      const noteCard = createNoteCard(note);
      notesList.appendChild(noteCard);
    });
  }

  updateCount();
}

/*
  Add note.
*/
noteForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const text = noteInput.value.trim();
  const category = noteCategory.value;

  if (text.length === 0) {
    errorMessage.textContent =
      "Please type a note first.";
    return;
  }

  if (text.length > 200) {
    errorMessage.textContent =
      "Notes must be 200 characters or fewer.";
    return;
  }

  errorMessage.textContent = "";

  const newNote = {
    id: Date.now(),
    text: text,
    category: category,
    createdAt: new Date().toLocaleString(),
  };

  notes.push(newNote);

  saveNotes();
  render();

  noteInput.value = "";
  noteInput.focus();
});

/*
  Search notes as the user types.
*/
searchInput.addEventListener("input", render);

/*
  Bonus:
  Clear all notes after confirmation.
*/
clearAllBtn.addEventListener("click", () => {
  if (notes.length === 0) {
    return;
  }

  const confirmed = confirm("Delete all notes?");

  if (!confirmed) {
    return;
  }

  notes = [];

  saveNotes();
  render();
});

/*
  Initial render.
*/
render();
