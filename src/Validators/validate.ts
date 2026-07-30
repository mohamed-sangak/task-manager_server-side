import { ZodSchema, ZodError } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { badRequest } from '../Utils/error.js';

export type Schemas = {
  body?: ZodSchema<any>;
  params?: ZodSchema<any>;
  query?: ZodSchema<any>;
};

export const validate = (schemas: Schemas) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schemas.params) {
        const parsed = schemas.params.parse(req.params);
        req.params = parsed ;
      }

      if (schemas.query) {
        const parsed = schemas.query.parse(req.query);
        req.query = parsed ;
      }

      if (schemas.body) {
        const parsed = schemas.body.parse(req.body);
        req.body = parsed ;
      }

      next();
    } catch (err) {
      if (err instanceof ZodError) {
        throw badRequest('Validation failed.', err.flatten());
      }
      throw err;
    }
  };
};
