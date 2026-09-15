import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

export function validateBody<T extends z.ZodTypeAny>(schema: T) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        res.status(422).json({
          success: false,
          message: 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.',
          error: {
            code: 'VALIDATION_ERROR',
            message: issues[0]?.message || 'Validation failed',
            details: issues,
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }
      next(error);
    }
  };
}

export function validateQuery<T extends z.ZodTypeAny>(schema: T) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = await schema.parseAsync(req.query);
      req.query = parsed as any;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        res.status(422).json({
          success: false,
          message: 'Tham số truy vấn không hợp lệ.',
          error: {
            code: 'QUERY_VALIDATION_ERROR',
            message: issues[0]?.message || 'Query validation failed',
            details: issues,
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }
      next(error);
    }
  };
}
