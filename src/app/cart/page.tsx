'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '../../context/CartContext';
import Image from 'next/image';

export default function CartPage() {
  const router = useRouter();
  const { 
    items, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    getTotalPrice,
    getTotalItems 
  } = useCart();
  const [isUpdating, setIsUpdating] = useState<number | null>(null);
  const [quantityInputs, setQuantityInputs] = useState<{ [key: number]: string }>({});

  const handleQuantityChange = async (productId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    setIsUpdating(productId);
    await updateQuantity(productId, newQuantity);
    setIsUpdating(null);
  };

  const handleInputChange = (productId: number, value: string) => {
    setQuantityInputs(prev => ({ ...prev, [productId]: value }));
  };

  const handleInputBlur = async (productId: number) => {
    const value = quantityInputs[productId];
    if (value) {
      const quantity = parseInt(value);
      if (!isNaN(quantity) && quantity > 0) {
        await handleQuantityChange(productId, quantity);
      }
    }
    setQuantityInputs(prev => ({ ...prev, [productId]: '' }));
  };

  const handleIncrement = async (productId: number, currentQuantity: number) => {
    await handleQuantityChange(productId, currentQuantity + 1);
  };

  const handleDecrement = async (productId: number, currentQuantity: number) => {
    if (currentQuantity > 1) {
      await handleQuantityChange(productId, currentQuantity - 1);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-500 mb-6">Looks like you haven't added any items to your cart yet.</p>
            <Link
              href="/products"
              className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <div className="text-sm text-gray-500">
            {getTotalItems()} {getTotalItems() === 1 ? 'item' : 'items'}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="divide-y divide-gray-200">
            {items.map((item) => (
              <div key={item.id} className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="relative h-24 w-24 flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="rounded-md object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                        <p className="mt-1 text-sm text-gray-500">{item.description}</p>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <p className="text-lg font-medium text-gray-900">${item.price.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center space-x-4">
                      <div className="flex items-center border border-gray-300 rounded-md">
                        <button
                          onClick={() => handleDecrement(item.id, item.quantity)}
                          disabled={isUpdating === item.id || item.quantity <= 1}
                          className="px-3 py-1 text-gray-600 hover:text-gray-900 disabled:opacity-50"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={quantityInputs[item.id] || item.quantity}
                          onChange={(e) => handleInputChange(item.id, e.target.value)}
                          onBlur={() => handleInputBlur(item.id)}
                          disabled={isUpdating === item.id}
                          className="w-16 text-center border-x border-gray-300 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        <button
                          onClick={() => handleIncrement(item.id, item.quantity)}
                          disabled={isUpdating === item.id}
                          className="px-3 py-1 text-gray-600 hover:text-gray-900 disabled:opacity-50"
                        >
                          +
                        </button>
                      </div>
                      {isUpdating === item.id && (
                        <span className="text-sm text-gray-500">Updating...</span>
                      )}
                      <div className="flex space-x-2">
                        <Link
                          href={`/product/${item.id}`}
                          className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                        >
                          View Details
                        </Link>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-600 hover:text-red-900 text-sm font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      Subtotal: ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="border-t border-gray-200 px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="text-lg font-medium text-gray-900">
                Total ({getTotalItems()} {getTotalItems() === 1 ? 'item' : 'items'}): ${getTotalPrice().toFixed(2)}
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={() => clearCart()}
                  className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                >
                  Clear Cart
                </button>
                <button
                  onClick={() => router.push('/checkout')}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 