import { Ok, Err } from "../result.js";
import * as repository from "../repositories/entriesRepository.js";
import { toEntryDto } from "../dtos/entryDto.js";

const validateEntry = ({ title, body } = {}) => {
  const trimmedTitle = typeof title === "string" ? title.trim() : "";
  const trimmedBody = typeof body === "string" ? body.trim() : "";

  if (!trimmedTitle || !trimmedBody) {
    return Err({ status: 400, message: "title and body are required" });
  }

  if (trimmedTitle.length > 60) {
    return Err({ status: 400, message: "Title must be 60 characters or less" });
  }

  return Ok({ title: trimmedTitle, body: trimmedBody });
};

export const listEntries = async () => {
  const entries = await repository.getAll();
  return entries.map(toEntryDto);
};

export const getEntry = async (id) => {
  const entry = await repository.findById(id);

  return entry
    ? Ok(toEntryDto(entry))
    : Err({ status: 404, message: "Entry not found" });
};

export const createEntry = async (data) => {
  const result = validateEntry(data);
  if (!result.ok) return result;

  const entry = await repository.create(result.value);
  return Ok(toEntryDto(entry));
};

export const updateEntry = async (id, data) => {
  const existing = await repository.findById(id);

  if (!existing) {
    return Err({ status: 404, message: "Entry not found" });
  }

  const result = validateEntry(data);
  if (!result.ok) return result;

  const updated = await repository.updateById(id, result.value);
  return Ok(toEntryDto(updated));
};

export const deleteEntry = async (id) => {
  const existing = await repository.findById(id);

  if (!existing) {
    return Err({ status: 404, message: "Entry not found" });
  }

  await repository.removeById(id);
  return Ok(null);
};

export const pinEntry = async (id, pinned) => {
  if (!repository.isValidId(id)) {
    return Err({ status: 400, message: "id must be a valid id" });
  }

  if (typeof pinned !== "boolean") {
    return Err({ status: 400, message: "pinned must be a boolean" });
  }

  const entry = await repository.findById(id);

  if (!entry) {
    return Err({ status: 404, message: "Entry not found" });
  }

  const updated = await repository.updateById(id, { pinned });

  return Ok(toEntryDto(updated));
};
