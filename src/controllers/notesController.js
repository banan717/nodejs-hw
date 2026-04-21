import createHttpError from 'http-errors';

import { Note } from '../models/note.js';

export async function getAllNotes(req, res) {
  const { page = 1, perPage = 10, tag, search } = req.query;

  const pageNum = Number(page);
  const perPageNum = Number(perPage);
  const skip = (pageNum - 1) * perPageNum;

  const query = { userId: req.user._id };

  if (tag) query.tag = tag;
  if (search) query.$text = { $search: search };

  const totalNotes = await Note.countDocuments(query);

  const notes = await Note.find(query)
    .skip(skip)
    .limit(perPageNum);

  const totalPages = Math.ceil(totalNotes / perPageNum);

  res.status(200).json({
    page: pageNum,
    perPage: perPageNum,
    totalNotes,
    totalPages,
    notes,
  });
}

export async function getNoteById(req, res) {
  const noteId = req.params.noteId;
  const note = await Note.findOne({
    _id: noteId,
    userId: req.user._id,
  });
  if (!note) {
    throw createHttpError(404, 'Note not found');
  }
  res.status(200).json(note);
}

export async function createNote(req, res) {
  const note = await Note.create({ ...req.body, userId: req.user._id });
  res.status(201).json(note);
}

export async function deleteNote(req, res) {
  const noteId = req.params.noteId;
  const note = await Note.findOneAndDelete({
    _id: noteId,
    userId: req.user._id,
  });
  if (!note) {
    throw createHttpError(404, 'Note not found');
  }
  res.status(200).json(note);
}

export async function updateNote(req, res) {
  const noteId = req.params.noteId;
  const note = await Note.findOneAndUpdate(
    { _id: noteId, userId: req.user._id },
    req.body,
    {
      returnDocument: 'after',
      runValidators: true,
    },
  );
  if (!note) {
    throw createHttpError(404, 'Note not found');
  }
  res.status(200).json(note);
}
