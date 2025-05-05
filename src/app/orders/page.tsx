'use client';

import { useState } from 'react';
import Image from 'next/image';
import { mockUserProfile } from '../../data/mockUserData';

export default function OrdersPage() {
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  const handleOrderClick = (orderId: string) => {
    setSelectedOrder(selectedOrder === orderId ? null : orderId);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Your Orders</h1>
            
            {mockUserProfile.orders.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">You haven't placed any orders yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {mockUserProfile.orders.map((order) => (
                  <div
                    key={order.id}
                    className="border rounded-lg overflow-hidden cursor-pointer"
                    onClick={() => handleOrderClick(order.id)}
                  >
                    <div className="p-4 bg-gray-50 flex justify-between items-center">
                      <div>
                        <p className="font-medium">Order #{order.id}</p>
                        <p className="text-sm text-gray-500">
                          Placed on {new Date(order.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'shipped' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                        <span className="font-medium">${order.total.toFixed(2)}</span>
                      </div>
                    </div>
                    
                    {selectedOrder === order.id && (
                      <div className="p-4 border-t">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h3 className="font-medium mb-2">Order Details</h3>
                            <div className="space-y-2 text-sm">
                              <p><span className="text-gray-500">Shipping Method:</span> {order.shippingMethod}</p>
                              <p><span className="text-gray-500">Payment Method:</span> {order.paymentMethod}</p>
                              <p><span className="text-gray-500">Shipping Address:</span> {order.shippingAddress}</p>
                            </div>
                          </div>
                          
                          <div>
                            <h3 className="font-medium mb-2">Items</h3>
                            <div className="space-y-4">
                              {order.items.map((item) => (
                                <div key={item.id} className="flex items-center space-x-4">
                                  <div className="relative w-16 h-16">
                                    <Image
                                      src={item.image}
                                      alt={item.name}
                                      fill
                                      className="object-cover rounded"
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-medium">{item.name}</p>
                                    <p className="text-sm text-gray-500">
                                      ${item.price.toFixed(2)} × {item.quantity}
                                    </p>
                                  </div>
                                  <p className="font-medium">
                                    ${(item.price * item.quantity).toFixed(2)}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 