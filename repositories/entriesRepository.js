import mongoose from "mongoose";

const entrySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    body: { type: String, required: true },
    pinned: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const Entry = mongoose.model("Entry", entrySchema);

export const isValidId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

export const getAll = async () => {
  return Entry.find().lean();
};

export const findById = async (id) => {
  return Entry.findById(id).lean();
};

export const create = async (data) => {
  const entry = await Entry.create(data);
  return entry.toObject();
};

export const updateById = async (id, data) => {
  return Entry.findByIdAndUpdate(id, data, { new: true }).lean();
};

export const removeById = async (id) => {
  await Entry.findByIdAndDelete(id);
};
