import { Request, Response, NextFunction } from 'express';
import * as productService from '../services/productService';
import { badRequest } from '../middleware/httpError';

function parseId(raw: string): number {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) throw badRequest('id must be a positive integer');
  return id;
}

export function list(_req: Request, res: Response, next: NextFunction): void {
  try {
    res.json(productService.getAllProducts());
  } catch (err) {
    next(err);
  }
}

export function getOne(req: Request, res: Response, next: NextFunction): void {
  try {
    const id = parseId(req.params.id);
    res.json(productService.getProductById(id));
  } catch (err) {
    next(err);
  }
}

export function create(req: Request, res: Response, next: NextFunction): void {
  try {
    const product = productService.createProduct(req.body);
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
}

export function update(req: Request, res: Response, next: NextFunction): void {
  try {
    const id = parseId(req.params.id);
    res.json(productService.updateProduct(id, req.body));
  } catch (err) {
    next(err);
  }
}

export function remove(req: Request, res: Response, next: NextFunction): void {
  try {
    const id = parseId(req.params.id);
    productService.deleteProduct(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
