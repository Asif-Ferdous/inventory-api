import express, { Application, Request, Response } from 'express';
import productRoutes from './routes/productRoutes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// builds the app but doesn't listen, so it can be imported in tests
export function createApp(): Application {
  const app = express();

  app.use(express.json({ limit: '1mb' }));

  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', uptime: process.uptime() });
  });

  app.use('/api/products', productRoutes);

  // 404 after real routes, error handler last
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
