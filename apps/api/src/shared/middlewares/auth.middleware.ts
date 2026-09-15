import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '@repo/shared-types';

export const JWT_SECRET = process.env.JWT_SECRET || 'dev-ecommerce-super-secret-jwt-key-2026';

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  fullName: string;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      message: 'Không tìm thấy token xác thực. Vui lòng đăng nhập.',
      error: {
        code: 'UNAUTHORIZED',
        message: 'Missing or malformed Authorization header with Bearer token',
      },
      timestamp: new Date().toISOString(),
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    req.user = decoded;
    next();
  } catch (error: unknown) {
    const isExpired = error instanceof jwt.TokenExpiredError;
    res.status(401).json({
      success: false,
      message: isExpired ? 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' : 'Token không hợp lệ.',
      error: {
        code: isExpired ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN',
        message: error instanceof Error ? error.message : 'Invalid JWT token',
      },
      timestamp: new Date().toISOString(),
    });
    return;
  }
}

export function requireRole(allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Yêu cầu xác thực.',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Bạn không có quyền thực hiện hành động này.',
        error: {
          code: 'FORBIDDEN',
          message: `User role '${req.user.role}' is not in allowed roles: [${allowedRoles.join(', ')}]`,
        },
        timestamp: new Date().toISOString(),
      });
      return;
    }

    next();
  };
}
