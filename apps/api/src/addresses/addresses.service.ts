import { addressesRepository } from './addresses.repository.ts';
import { AppError } from '../shared/errors/AppError.ts';
import type {
  UserAddress,
  CreateAddressPayload,
  UpdateAddressPayload,
} from '@repo/shared-types';

export class AddressesService {
  async getAddressesByUserId(userId: string): Promise<UserAddress[]> {
    if (!userId) {
      throw new AppError('Vui lòng đăng nhập để xem danh sách địa chỉ', 401, 'UNAUTHORIZED');
    }
    return await addressesRepository.findByUserId(userId);
  }

  async getDefaultAddressByUserId(userId: string): Promise<UserAddress | null> {
    if (!userId) {
      throw new AppError('Vui lòng đăng nhập để xem địa chỉ mặc định', 401, 'UNAUTHORIZED');
    }
    return await addressesRepository.findDefaultByUserId(userId);
  }

  async createAddress(userId: string, payload: CreateAddressPayload): Promise<UserAddress> {
    if (!userId) {
      throw new AppError('Vui lòng đăng nhập để thêm địa chỉ', 401, 'UNAUTHORIZED');
    }

    if (!payload.receiverName || payload.receiverName.trim().length < 2) {
      throw new AppError('Họ tên người nhận phải từ 2 ký tự trở lên', 400, 'BAD_REQUEST');
    }

    if (!payload.receiverPhone) {
      throw new AppError('Số điện thoại không được để trống', 400, 'BAD_REQUEST');
    }

    return await addressesRepository.createAddress(userId, payload);
  }

  async updateAddress(addressId: string, userId: string, payload: UpdateAddressPayload): Promise<UserAddress> {
    if (!userId) {
      throw new AppError('Vui lòng đăng nhập để chỉnh sửa địa chỉ', 401, 'UNAUTHORIZED');
    }

    const existing = await addressesRepository.findById(addressId);
    if (!existing) {
      throw new AppError('Không tìm thấy địa chỉ yêu cầu', 404, 'ADDRESS_NOT_FOUND');
    }

    if (existing.userId !== userId) {
      throw new AppError('Bạn không có quyền chỉnh sửa địa chỉ này', 403, 'FORBIDDEN');
    }

    return await addressesRepository.updateAddress(addressId, userId, payload);
  }

  async deleteAddress(addressId: string, userId: string): Promise<boolean> {
    if (!userId) {
      throw new AppError('Vui lòng đăng nhập để xóa địa chỉ', 401, 'UNAUTHORIZED');
    }

    const existing = await addressesRepository.findById(addressId);
    if (!existing) {
      throw new AppError('Không tìm thấy địa chỉ yêu cầu', 404, 'ADDRESS_NOT_FOUND');
    }

    if (existing.userId !== userId) {
      throw new AppError('Bạn không có quyền xóa địa chỉ này', 403, 'FORBIDDEN');
    }

    return await addressesRepository.deleteAddress(addressId, userId);
  }

  async setDefaultAddress(addressId: string, userId: string): Promise<UserAddress> {
    if (!userId) {
      throw new AppError('Vui lòng đăng nhập để đặt địa chỉ mặc định', 401, 'UNAUTHORIZED');
    }

    const existing = await addressesRepository.findById(addressId);
    if (!existing) {
      throw new AppError('Không tìm thấy địa chỉ yêu cầu', 404, 'ADDRESS_NOT_FOUND');
    }

    if (existing.userId !== userId) {
      throw new AppError('Bạn không có quyền quản lý địa chỉ này', 403, 'FORBIDDEN');
    }

    return await addressesRepository.setDefaultAddress(userId, addressId);
  }
}

export const addressesService = new AddressesService();
