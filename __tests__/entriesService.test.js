import { jest } from "@jest/globals";

// Replace the real MongoDB repository with fake functions.
jest.unstable_mockModule("../repositories/entriesRepository.js", () => ({
  isValidId: jest.fn(() => true),
  getAll: jest.fn(),
  findById: jest.fn(),
  create: jest.fn((data) => ({ _id: "fake-id", ...data })),
  updateById: jest.fn(),
  removeById: jest.fn(),
}));

// Import the service AFTER registering the mock.
const { createEntry, updateEntry, deleteEntry, listEntries } =
  await import("../services/entriesService.js");
const repository = await import("../repositories/entriesRepository.js");
test("createEntry rejects a missing title", async () => {
  const result = await createEntry({ title: "", body: "something" });

  expect(result.ok).toBe(false);
  expect(result.error.status).toBe(400);
});

test("createEntry saves a valid entry and returns its DTO", async () => {
  const result = await createEntry({
    title: "Groceries",
    body: "Milk, eggs",
  });

  expect(result.ok).toBe(true);
  expect(result.value).toEqual({
    id: "fake-id",
    title: "Groceries",
    body: "Milk, eggs",
    favorite: false,
  });
});

test("updateEntry returns 404 when entry does not exist", async () => {
  // Arrange: mocked findById returns undefined
  const id = "missing-id";

  // Act
  const result = await updateEntry(id, {
    title: "Updated",
    body: "Updated body",
  });

  // Assert
  expect(result.ok).toBe(false);
  expect(result.error.status).toBe(404);
});

test("deleteEntry returns 404 when entry does not exist", async () => {
  // Arrange: mocked findById returns undefined
  const id = "missing-id";

  // Act
  const result = await deleteEntry(id);

  // Assert
  expect(result.ok).toBe(false);
  expect(result.error.status).toBe(404);
});

test("listEntries returns entries sorted alphabetically by title", async () => {
  // Arrange: Return entries in the wrong order
  repository.getAll.mockResolvedValue([
    { _id: "2", title: "Zebra", body: "Last" },
    { _id: "1", title: "Apple", body: "First" },
  ]);

  // Act
  const result = await listEntries();

  // Assert
  expect(result.map((entry) => entry.title)).toEqual(["Apple", "Zebra"]);
});
