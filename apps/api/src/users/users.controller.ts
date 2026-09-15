import { Router, Response } from 'express';
import { ApiResponse, AuthResponseData, User } from '@repo/shared-types';
import { usersService } from './users.service.ts';
import { authMiddleware, AuthenticatedRequest } from '../shared/middlewares/auth.middleware.ts';

const router = Router();

/**
 * POST /api/auth/register (hoặc /auth/register)
 * Đăng ký tài khoản mới
 */
router.post('/register', async (req, res: Response<ApiResponse<AuthResponseData>>) => {
  try {
    const { email, password, fullName, role } = req.body;
    const result = await usersService.register({ email, password, fullName, role });

    res.status(201).json({
      success: true,
      message: 'Đăng ký tài khoản thành công.',
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Đăng ký thất bại';
    res.status(400).json({
      success: false,
      message,
      error: {
        code: 'REGISTRATION_FAILED',
        message,
      },
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * POST /api/auth/login
 * Đăng nhập người dùng
 */
router.post('/login', async (req, res: Response<ApiResponse<AuthResponseData>>) => {
  try {
    const { email, password } = req.body;
    const result = await usersService.login({ email, password });

    res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công.',
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Đăng nhập thất bại';
    res.status(401).json({
      success: false,
      message,
      error: {
        code: 'LOGIN_FAILED',
        message,
      },
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/auth/me
 * Lấy thông tin tài khoản người dùng đang đăng nhập
 * Yêu cầu Header: Authorization: Bearer <token>
 */
router.get('/me', authMiddleware, async (req: AuthenticatedRequest, res: Response<ApiResponse<User>>) => {
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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Không thể lấy thông tin người dùng';
    res.status(404).json({
      success: false,
      message,
      error: {
        code: 'USER_NOT_FOUND',
        message,
      },
      timestamp: new Date().toISOString(),
    });
  }
});

export const authRouter = router;
export default authRouter;
