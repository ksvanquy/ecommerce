import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, UserRole, RegisterPayload, LoginPayload } from '@repo/shared-types';
import { usersRepository, UsersRepository } from './users.repository.ts';
import { UserDb } from '../db/schema/index.ts';
import { JWT_SECRET, TokenPayload } from '../shared/middlewares/auth.middleware.ts';

export class UsersService {
  constructor(private repo: UsersRepository = usersRepository) {}

  /**
   * Chuyển đổi UserDb (trong database có passwordHash) sang User an toàn (cho client)
   */
  toPublicUser(userDb: UserDb): User {
    return {
      id: userDb.id,
      email: userDb.email,
      fullName: userDb.fullName,
      role: (userDb.role as UserRole) || 'customer',
      createdAt: userDb.createdAt instanceof Date ? userDb.createdAt.toISOString() : String(userDb.createdAt),
      updatedAt: userDb.updatedAt instanceof Date ? userDb.updatedAt.toISOString() : String(userDb.updatedAt),
    };
  }

  /**
   * Tạo JWT Token
   */
  generateToken(user: User): string {
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
  }

  /**
   * Đăng ký người dùng mới
   */
  async register(payload: RegisterPayload): Promise<{ user: User; token: string }> {
    const { email, password, fullName } = payload;

    if (!email || !email.includes('@')) {
      throw new Error('Email không hợp lệ.');
    }

    if (!password || password.length < 6) {
      throw new Error('Mật khẩu phải có tối thiểu 6 ký tự.');
    }

    if (!fullName || fullName.trim().length === 0) {
      throw new Error('Họ và tên không được để trống.');
    }

    const existingUser = await this.repo.findByEmail(email);
    if (existingUser) {
      throw new Error('Email này đã được sử dụng. Vui lòng chọn email khác hoặc đăng nhập.');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    const newUserDb = await this.repo.create({
      id: userId,
      email: email.trim().toLowerCase(),
      passwordHash,
      fullName: fullName.trim(),
      role: 'customer', // Luôn ép vai trò mặc định là khách hàng (Customer), không cho phép tự đăng ký Admin
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const user = this.toPublicUser(newUserDb);
    const token = this.generateToken(user);

    return { user, token };
  }

  /**
   * Đăng nhập
   */
  async login(payload: LoginPayload): Promise<{ user: User; token: string }> {
    const { email, password } = payload;

    if (!email || !password) {
      throw new Error('Vui lòng cung cấp đầy đủ email và mật khẩu.');
    }

    const userDb = await this.repo.findByEmail(email);
    if (!userDb) {
      throw new Error('Email hoặc mật khẩu không chính xác.');
    }

    const isMatch = await bcrypt.compare(password, userDb.passwordHash);
    if (!isMatch) {
      throw new Error('Email hoặc mật khẩu không chính xác.');
    }

    const user = this.toPublicUser(userDb);
    const token = this.generateToken(user);

    return { user, token };
  }

  /**
   * Lấy thông tin người dùng hiện tại theo ID
   */
  async getProfile(userId: string): Promise<User> {
    const userDb = await this.repo.findById(userId);
    if (!userDb) {
      throw new Error('Không tìm thấy thông tin tài khoản người dùng.');
    }
    return this.toPublicUser(userDb);
  }

  /**
   * Lấy danh sách tất cả người dùng (Dành cho Quản trị)
   */
  async getAllUsers(): Promise<User[]> {
    const list = await this.repo.listAll();
    return list.map((u) => this.toPublicUser(u));
  }

  /**
   * Cập nhật vai trò người dùng (Admin / Customer)
   */
  async updateUserRole(userId: string, role: UserRole): Promise<User> {
    const updated = await this.repo.updateRole(userId, role);
    if (!updated) {
      throw new Error(`Không tìm thấy người dùng với ID "${userId}"`);
    }
    return this.toPublicUser(updated);
  }

  /**
   * Xóa tài khoản người dùng
   */
  async deleteUser(userId: string): Promise<boolean> {
    return await this.repo.deleteUser(userId);
  }
}

export const usersService = new UsersService();
