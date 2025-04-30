import { NextFunction, Request, Response } from "express";
import { body, param, query, validationResult } from "express-validator";

export const validateEncodeRequest: any = [
  body("originalUrl").notEmpty().withMessage("Original URL is required").isURL().withMessage("Invalid URL format"),
  validateResults,
];

export const validateDecodeRequest: any = [
  body("shortUrl").notEmpty().withMessage("Short URL is required").isURL().withMessage("Invalid URL format"),
  validateResults,
];

export const validateStatisticRequest: any = [
  param("url_path").notEmpty().withMessage("URL path is required"),
  validateResults,
];

export const validateListRequest: any = [
  query("search")
    .optional()
    .isLength({ min: 3 })
    .withMessage("Search term must be at least 3 characters long")
    .if(query("search").exists()),
  validateResults,
];

function validateResults(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 400, errors: errors.array() });
  }
  return next();
}
