import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../errors/AppError.ts';

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const timestamp = new Date().toISOString();

  // 1. Zod Validation Error
  if (err instanceof ZodError) {
    const issues = err.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));

    res.status(422).json({
      success: false,
      message: 'Dữ liệu gửi lên không đúng định dạng.',
      error: {
        code: 'VALIDATION_ERROR',
        message: issues[0]?.message || 'Dữ liệu không hợp lệ',
        details: issues,
      },
      timestamp,
    });
    return;
  }

  // 2. Custom AppError
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
      timestamp,
    });
    return;
  }

  // 3. SyntaxError (e.g. malformed JSON body)
  if (err instanceof SyntaxError && 'status' in err && (err as any).status === 400 && 'body' in err) {
    res.status(400).json({
      success: false,
      message: 'Định dạng JSON gửi lên không hợp lệ.',
      error: {
        code: 'INVALID_JSON',
        message: 'Malformed JSON payload in request body',
      },
      timestamp,
    });
    return;
  }

  // 4. Default unhandled server error
  const message = err instanceof Error ? err.message : 'Đã có lỗi xảy ra từ máy chủ.';
  console.error(`[API Error] ${req.method} ${req.url}:`, err);

  res.status(500).json({
    success: false,
    message: 'Lỗi hệ thống máy chủ. Vui lòng thử lại sau.',
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : message,
    },
    timestamp,
  });
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    message: `Không tìm thấy tài nguyên API: ${req.method} ${req.path}`,
    error: {
      code: 'RESOURCE_NOT_FOUND',
      message: `The endpoint '${req.method} ${req.path}' does not exist on this server.`,
    },
    timestamp: new Date().toISOString(),
  });
}
