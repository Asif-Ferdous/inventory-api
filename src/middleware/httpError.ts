// error that carries an HTTP status; the error handler reads it
export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'HttpError';
  }
}

export const notFound = (msg = 'Resource not found') => new HttpError(404, msg);
export const badRequest = (msg = 'Invalid request') => new HttpError(400, msg);
export const conflict = (msg = 'Resource already exists') => new HttpError(409, msg);
