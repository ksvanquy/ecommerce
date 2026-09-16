import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, requireRole } from './auth.middleware.ts';

/**
 * Middleware chặn đứng tất cả người dùng không có vai trò 'admin'
 */
export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  // Sử dụng requireRole có sẵn và tự định nghĩa thông điệp lỗi phù hợp đặc tả
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Không tìm thấy token xác thực. Vui lòng đăng nhập.',
      timestamp: new Date().toISOString(),
    });
    return;
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Quyền truy cập bị từ chối. Bạn không có thẩm quyền truy cập tài nguyên quản trị.',
      error: {
        code: 'FORBIDDEN_ADMIN',
        message: 'Admin privilege is required to access this resource',
      },
      timestamp: new Date().toISOString(),
    });
    return;
  }

  next();
};
