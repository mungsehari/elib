import path from "node:path";
import fs from "node:fs";
import { NextFunction, Request, Response } from "express";

import createHttpError from "http-errors";
import bookModel from "./bookModel";
import cloudinary from "../config/cloudinary";
import { AuthRequest } from "../middlewares/authenticate";

const createBook = async (req: Request, res: Response, next: NextFunction) => {
  const { title, genre } = req.body;
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  const coverImgaseMimeType = files.coverImage[0].mimetype.split("/").at(-1);

  const fileName = files.coverImage[0].filename;

  const filePath = path.resolve(
    __dirname,
    "../../public/data/uploads",
    fileName
  );

  try {
    const uploadResult = await cloudinary.uploader.upload(filePath, {
      filename_override: fileName,
      folder: "books-covers",
      format: coverImgaseMimeType,
    });

    const bookFileName = files.file[0].filename;
    const bookFilePath = path.resolve(
      __dirname,
      "../../public/data/uploads",
      bookFileName
    );
    const bookFileUploadResult = await cloudinary.uploader.upload(
      bookFilePath,
      {
        resource_type: "raw",
        filename_override: bookFileName,
        folder: "books-pdfs",
        format: "pdf",
      }
    );

    const _req = req as AuthRequest;
    const newBook = await bookModel.create({
      title,
      genre,
      author: _req.userId,
      coverImage: uploadResult.secure_url,
      file: bookFileUploadResult.secure_url,
    });
    // delete file
    try {
      await fs.promises.unlink(filePath);
      await fs.promises.unlink(bookFilePath);
    } catch (error) {
      return next(createHttpError(500, "Error while deleting file"));
    }
    res.status(201).json({ id: newBook._id });
  } catch (error) {
    return next(createHttpError(500, "Error while uploading file"));
  }
};

const updateBook = async (req: Request, res: Response, next: NextFunction) => {
  const { title, genre } = req.body;
  const bookId = req.params.bookId;

  const book = await bookModel.findOne({ _id: bookId });

  if (!book) {
    return next(createHttpError(404, "Book not found"));
  }
  // check access
  const _req = req as AuthRequest;

  if (book.author.toString() !== _req.userId) {
    return next(
      createHttpError(403, "You are not allowed to update this book")
    );
  }

  // check if image filed is exists
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  let completeCoverImage = "";
  if (files.coverImage) {
    const filename = files.coverImage[0].filename;
    const coverMimeType = files.coverImage[0].mimetype.split("/").at(-1);
    const filePath = path.resolve(
      __dirname,
      "../../public/data/uploads",
      filename
    );
    completeCoverImage = filename;
    const uploadResult = await cloudinary.uploader.upload(filePath, {
      filename_override: completeCoverImage,
      folder: "books-covers",
      format: coverMimeType,
    });
    completeCoverImage = uploadResult.secure_url;
    try {
      await fs.promises.unlink(filePath);
    } catch (error) {
      return next(createHttpError(500, "Error while deleting file"));
    }
  }

  // check if file is exists
  let completeFileName = "";
  if (files.file) {
    const bookFilePath = path.resolve(
      __dirname,
      "../../public/data/uploads",
      files.file[0].filename
    );
    const bookFileName = files.file[0].filename;
    completeFileName = bookFileName;
    const uploadResult = await cloudinary.uploader.upload(bookFilePath, {
      resource_type: "raw",
      filename_override: completeFileName,
      folder: "book-pdfs",
      format: "pdf",
    });
    completeFileName = uploadResult.secure_url;

    const updateBook = await bookModel.findOneAndUpdate(
      { _id: bookId },
      {
        title: title,
        genre: genre,
        coverImage: completeCoverImage ? completeCoverImage : book.coverImage,
        file: completeFileName ? completeFileName : book.file,
      },
      { new: true }
    );
    res.json(updateBook);
  }
};

const listBooks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const book = await bookModel.find();
    res.json(book);
  } catch (error) {
    return next(createHttpError(500, "Error while listing books"));
  }
};
const getSingleBook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const bookId = req.params.bookId;
  try {
    const book = await bookModel.findOne({ _id: bookId });
    if (!book) {
      return next(createHttpError(404, "Book not found"));
    }
    res.json(book);
  } catch (error) {
    return next(createHttpError(500, "Error while getting book"));
  }
};

const deleteBook = async (req: Request, res: Response, next: NextFunction) => {
  const bookId = req.params.bookId;

  const book = await bookModel.findOne({ _id: bookId });
  if (!book) {
    return next(createHttpError(404, "Book not found"));
  }
  const _req = req as AuthRequest;
  if (book.author.toString() !== _req.userId) {
    return next(
      createHttpError(403, "You are not allowed to delete this book")
    );
  }
  const coverFileSplits = book.coverImage.split("/");
  const coverImagePublicId =
    coverFileSplits.at(-2) + "/" + coverFileSplits.at(-1)?.split(".").at(-2);

  const bookFileSplits = book.file.split("/");
  const bookFilePublicId = bookFileSplits.at(-2) + "/" + bookFileSplits.at(-1);

  try {
    await cloudinary.uploader.destroy(coverImagePublicId);
    await cloudinary.uploader.destroy(bookFilePublicId, {
      resource_type: "raw",
    });
    await bookModel.deleteOne({ _id: bookId });
    return res.sendStatus(200);
  } catch (error) {
    return next(createHttpError(500, "Error while deleting book"));
  }
};

export { createBook, updateBook, listBooks, getSingleBook, deleteBook };
