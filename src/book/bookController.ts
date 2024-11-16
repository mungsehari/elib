import path from "node:path";
import { NextFunction, Request, Response } from "express";
import cloudinary from "../config/cloudinary";
import createHttpError from "http-errors";

const createBook = async (req: Request, res: Response, next: NextFunction) => {
  console.log("file", req.files);
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  const coverImgaseMimeType = files.converImgae[0].mimetype.split("/").at(-1);

  const fileName = files.converImgae[0].filename;

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
    console.log("bookFileUploadResult", bookFileUploadResult);
    console.log("uploadResult", uploadResult);
  } catch (error) {
    return next(createHttpError(500, "Error while uploading file"));
  }

  res.json({ message: "create book" });
};

export { createBook };
