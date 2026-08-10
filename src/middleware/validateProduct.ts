import { Request, Response, NextFunction } from 'express';
import { badRequest } from './httpError';

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

function isNonNegativeNumber(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v) && v >= 0;
}

// partial=true for PATCH: only check the fields that were actually sent
export function validateProduct(partial: boolean) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const body = req.body ?? {};
    const errors: string[] = [];
    const has = (key: string) => body[key] !== undefined;

    if (!partial || has('name')) {
      if (!isNonEmptyString(body.name)) errors.push('name must be a non-empty string');
    }
    if (!partial || has('sku')) {
      if (!isNonEmptyString(body.sku)) errors.push('sku must be a non-empty string');
    }
    if (!partial || has('quantity')) {
      if (!isNonNegativeNumber(body.quantity)) errors.push('quantity must be a number >= 0');
    }
    if (!partial || has('price')) {
      if (!isNonNegativeNumber(body.price)) errors.push('price must be a number >= 0');
    }

    if (partial && Object.keys(body).length === 0) {
      errors.push('at least one field must be provided');
    }

    if (errors.length > 0) {
      return next(badRequest(errors.join('; ')));
    }
    next();
  };
}
