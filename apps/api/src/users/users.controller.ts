import { Router, Response } from 'express';
import { ApiResponse, AuthResponseData, User, registerSchema, loginSchema } from '@repo/shared-types';
import { usersService } from './users.service.ts';
import { authMiddleware, AuthenticatedRequest } from '../shared/middlewares/auth.middleware.ts';
import { validateBody } from '../shared/middlewares/validation.middleware.ts';

const router = Router();

/**
 * POST /api/auth/register
 * Đăng ký tài khoản mới (Validate input bằng Zod registerSchema)
 */
router.post(
  '/register',
  validateBody(registerSchema),
  async (req, res: Response<ApiResponse<AuthResponseData>>, next) => {
    try {
      const { email, password, fullName, role } = req.body;
      const result = await usersService.register({ email, password, fullName, role });

      res.status(201).json({
        success: true,
        message: 'Đăng ký tài khoản thành công.',
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/auth/login
 * Đăng nhập người dùng (Validate input bằng Zod loginSchema)
 */
router.post(
  '/login',
  validateBody(loginSchema),
  async (req, res: Response<ApiResponse<AuthResponseData>>, next) => {
    try {
      const { email, password } = req.body;
      const result = await usersService.login({ email, password });

      res.status(200).json({
        success: true,
        message: 'Đăng nhập thành công.',
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/auth/me
 * Lấy thông tin tài khoản người dùng đang đăng nhập
 * Yêu cầu Header: Authorization: Bearer <token>
 */
router.get(
  '/me',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response<ApiResponse<User>>, next) => {
    try {
      if (!req.user?.userId) {
        res.status(401).json({
          success: false,
          message: 'Không tìm thấy phiên làm việc.',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const user = await usersService.getProfile(req.user.userId);

      res.status(200).json({
        success: true,
        message: 'Lấy thông tin người dùng thành công.',
        data: user,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
);

export const authRouter = router;
export default authRouter;
