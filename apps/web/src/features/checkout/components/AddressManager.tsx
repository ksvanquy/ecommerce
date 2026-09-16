import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Modal, Input } from '@repo/ui';
import { MapPin, Phone, User, Plus, Trash2, Edit3, ShieldAlert, Check, Building2, Home } from 'lucide-react';
import { addressesApi } from '../api/addressesApi.ts';
import type { UserAddress, CreateAddressPayload } from '@repo/shared-types';

export function AddressManager({
  onSelectAddress,
  selectedAddressId,
  isSelectionMode = false,
}: {
  onSelectAddress?: (address: UserAddress) => void;
  selectedAddressId?: string;
  isSelectionMode?: boolean;
}) {
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal Address State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  // Form states
  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');
  const [ward, setWard] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [addressType, setAddressType] = useState<'home' | 'office' | 'other'>('home');
  const [isDefault, setIsDefault] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete Confirmation State
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await addressesApi.getAddresses();
      setAddresses(data);
    } catch (err: any) {
      console.error('Error loading addresses:', err);
      setError(err?.response?.data?.message || 'Không thể tải danh sách địa chỉ.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const openCreateModal = () => {
    setModalMode('create');
    setEditingAddressId(null);
    setReceiverName('');
    setReceiverPhone('');
    setProvince('');
    setDistrict('');
    setWard('');
    setStreetAddress('');
    setAddressType('home');
    setIsDefault(addresses.length === 0); // default true if first address
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (addr: UserAddress) => {
    setModalMode('edit');
    setEditingAddressId(addr.id);
    setReceiverName(addr.receiverName);
    setReceiverPhone(addr.receiverPhone);
    setProvince(addr.province);
    setDistrict(addr.district);
    setWard(addr.ward);
    setStreetAddress(addr.streetAddress);
    setAddressType(addr.addressType);
    setIsDefault(addr.isDefault);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Manual validations
    if (!receiverName.trim() || receiverName.trim().length < 2) {
      setFormError('Họ tên người nhận phải từ 2 ký tự trở lên');
      return;
    }
    if (!receiverPhone.trim() || receiverPhone.trim().length < 9) {
      setFormError('Số điện thoại không hợp lệ (phải từ 9 số trở lên)');
      return;
    }
    if (!province.trim()) {
      setFormError('Tỉnh/Thành phố không được để trống');
      return;
    }
    if (!district.trim()) {
      setFormError('Quận/Huyện không được để trống');
      return;
    }
    if (!ward.trim()) {
      setFormError('Phường/Xã không được để trống');
      return;
    }
    if (!streetAddress.trim()) {
      setFormError('Địa chỉ chi tiết không được để trống');
      return;
    }

    const payload: CreateAddressPayload = {
      receiverName: receiverName.trim(),
      receiverPhone: receiverPhone.trim(),
      province: province.trim(),
      district: district.trim(),
      ward: ward.trim(),
      streetAddress: streetAddress.trim(),
      addressType,
      isDefault,
    };

    try {
      if (modalMode === 'create') {
        const newAddr = await addressesApi.createAddress(payload);
        if (isSelectionMode && onSelectAddress && (addresses.length === 0 || isDefault)) {
          onSelectAddress(newAddr);
        }
      } else if (editingAddressId) {
        const updatedAddr = await addressesApi.updateAddress(editingAddressId, payload);
        if (isSelectionMode && onSelectAddress && selectedAddressId === editingAddressId) {
          onSelectAddress(updatedAddr);
        }
      }
      setIsModalOpen(false);
      loadAddresses();
    } catch (err: any) {
      console.error('Error saving address:', err);
      setFormError(err?.response?.data?.message || 'Có lỗi xảy ra khi lưu địa chỉ.');
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      await addressesApi.deleteAddress(id);
      setDeletingId(null);
      // If deleted active selection, refresh
      if (isSelectionMode && onSelectAddress && selectedAddressId === id) {
        const remaining = addresses.filter((a) => a.id !== id);
        const nextDefault = remaining.find((a) => a.isDefault) || remaining[0];
        if (nextDefault) {
          onSelectAddress(nextDefault);
        }
      }
      loadAddresses();
    } catch (err: any) {
      console.error('Error deleting address:', err);
      alert(err?.response?.data?.message || 'Không thể xóa địa chỉ này.');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const updated = await addressesApi.setDefaultAddress(id);
      if (isSelectionMode && onSelectAddress) {
        onSelectAddress(updated);
      }
      loadAddresses();
    } catch (err: any) {
      console.error('Error setting default address:', err);
      alert(err?.response?.data?.message || 'Không thể đặt làm địa chỉ mặc định.');
    }
  };

  if (loading && addresses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-400">
        <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-blue-500 animate-spin mb-3"></div>
        <p className="text-xs">Đang tải danh sách địa chỉ...</p>
      </div>
    );
  }

  return (
    <div id="address-manager" className="space-y-4">
      {/* Header section with add button */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
          <MapPin className="w-4 h-4 text-blue-600" />
          Sổ địa chỉ giao hàng
        </h3>
        <Button variant="outline" size="sm" onClick={openCreateModal} className="text-xs h-8">
          <Plus className="w-3.5 h-3.5 mr-1" />
          Thêm địa chỉ mới
        </Button>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-100 rounded-lg p-3 text-rose-600 text-xs flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Addresses List */}
      {addresses.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl bg-white">
          <MapPin className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-700">Chưa có địa chỉ nào được lưu</p>
          <p className="text-xs text-slate-400 mt-1 mb-4">Hãy thêm địa chỉ giao hàng đầu tiên của bạn để thanh toán nhanh hơn</p>
          <Button variant="primary" size="sm" onClick={openCreateModal}>
            <Plus className="w-3.5 h-3.5 mr-1" />
            Thêm địa chỉ ngay
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => {
            const isSelected = isSelectionMode && selectedAddressId === addr.id;
            return (
              <div
                key={addr.id}
                className={`relative bg-white border rounded-xl p-4 flex flex-col justify-between transition-all duration-200 ${
                  isSelected
                    ? 'border-blue-500 ring-2 ring-blue-50 shadow-xs'
                    : 'border-slate-100 hover:border-slate-200 shadow-xs'
                }`}
              >
                {/* Selection Overlay */}
                {isSelectionMode && (
                  <div
                    className="absolute inset-0 cursor-pointer rounded-xl"
                    onClick={() => onSelectAddress && onSelectAddress(addr)}
                  />
                )}

                <div className="space-y-2.5 z-10 pointer-events-none">
                  {/* Title Bar inside Address Card */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-slate-800 text-sm flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {addr.receiverName}
                      </span>
                      {addr.isDefault && (
                        <Badge variant="success" className="text-[9px] px-1.5 py-0.5">
                          Mặc định
                        </Badge>
                      )}
                      <Badge variant="neutral" className="text-[9px] px-1.5 py-0.5 flex items-center gap-1 bg-slate-50 text-slate-600">
                        {addr.addressType === 'home' ? (
                          <Home className="w-2.5 h-2.5" />
                        ) : addr.addressType === 'office' ? (
                          <Building2 className="w-2.5 h-2.5" />
                        ) : (
                          <MapPin className="w-2.5 h-2.5" />
                        )}
                        {addr.addressType === 'home' ? 'Nhà riêng' : addr.addressType === 'office' ? 'Cơ quan' : 'Khác'}
                      </Badge>
                    </div>
                  </div>

                  {/* Phone Info */}
                  <div className="text-slate-600 text-xs flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{addr.receiverPhone}</span>
                  </div>

                  {/* Address string */}
                  <div className="text-slate-600 text-xs flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">
                      {addr.streetAddress}, {addr.ward}, {addr.district}, {addr.province}
                    </span>
                  </div>
                </div>

                {/* Operations footer */}
                <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between gap-2 z-10">
                  <div className="flex items-center gap-1">
                    {!addr.isDefault && (
                      <button
                        onClick={() => handleSetDefault(addr.id)}
                        className="text-[11px] text-blue-600 hover:text-blue-700 font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                      >
                        Đặt làm mặc định
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditModal(addr)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded transition-all"
                      title="Sửa địa chỉ"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingId(addr.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-all"
                      title="Xóa địa chỉ"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'create' ? 'Thêm Địa chỉ giao hàng mới' : 'Cập nhật Địa chỉ giao hàng'}
      >
        <form onSubmit={handleSaveAddress} className="space-y-4">
          {formError && (
            <div className="bg-rose-50 border border-rose-100 rounded-lg p-3 text-rose-600 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Họ tên người nhận"
              placeholder="VD: Nguyễn Văn A"
              value={receiverName}
              onChange={(e) => setReceiverName(e.target.value)}
              required
            />
            <Input
              label="Số điện thoại"
              placeholder="VD: 0901234567"
              value={receiverPhone}
              onChange={(e) => setReceiverPhone(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Tỉnh / Thành phố"
              placeholder="VD: TP. Hồ Chí Minh"
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              required
            />
            <Input
              label="Quận / Huyện"
              placeholder="VD: Quận 1"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              required
            />
            <Input
              label="Phường / Xã"
              placeholder="VD: Phường Bến Nghé"
              value={ward}
              onChange={(e) => setWard(e.target.value)}
              required
            />
          </div>

          <Input
            label="Địa chỉ chi tiết (Số nhà, tên đường, thôn/xóm)"
            placeholder="VD: Số 123 Lê Lợi"
            value={streetAddress}
            onChange={(e) => setStreetAddress(e.target.value)}
            required
          />

          {/* Address Type & Default Options */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-slate-100">
            <div>
              <span className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                Loại địa chỉ
              </span>
              <div className="flex gap-2">
                {(['home', 'office', 'other'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setAddressType(type)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                      addressType === type
                        ? 'border-blue-500 bg-blue-50 text-blue-600'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {type === 'home' ? 'Nhà riêng' : type === 'office' ? 'Cơ quan' : 'Khác'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4 sm:mt-0">
              <input
                id="default-checkbox"
                type="checkbox"
                checked={isDefault}
                disabled={modalMode === 'edit' && addresses.find((a) => a.id === editingAddressId)?.isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer disabled:opacity-50"
              />
              <label
                htmlFor="default-checkbox"
                className="text-xs font-medium text-slate-700 select-none cursor-pointer"
              >
                Đặt làm địa chỉ giao hàng mặc định
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Hủy bỏ
            </Button>
            <Button type="submit" variant="primary">
              Lưu địa chỉ
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deletingId !== null}
        onClose={() => setDeletingId(null)}
        title="Xác nhận xóa địa chỉ"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Bạn có chắc chắn muốn xóa địa chỉ giao hàng này khỏi sổ địa chỉ không? Thao tác này không thể hoàn tác.
          </p>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setDeletingId(null)}>
              Hủy
            </Button>
            <Button variant="danger" onClick={() => deletingId && handleDeleteAddress(deletingId)}>
              Xác nhận xóa
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
