'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import { shippingMethods, paymentMethods, orderStatuses } from '../../data/mockCheckoutData';
import Image from 'next/image';
import { mockUserProfile } from '../../data/mockUserData';

type CheckoutStep = 'shipping' | 'payment' | 'review' | 'confirmation';

type PaymentFormData = {
  cardNumber: string;
  cardName: string;
  expiryDate: string;
  cvv: string;
  paypalEmail: string;
  paypalPassword: string;
  bankAccount: string;
  bankName: string;
  routingNumber: string;
};

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCart();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('shipping');
  const [selectedShipping, setSelectedShipping] = useState<number>(1);
  const [selectedPayment, setSelectedPayment] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentFormData, setPaymentFormData] = useState<PaymentFormData>({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    paypalEmail: '',
    paypalPassword: '',
    bankAccount: '',
    bankName: '',
    routingNumber: '',
  });

  const handleShippingSelect = (methodId: number) => {
    setSelectedShipping(methodId);
  };

  const handlePaymentSelect = (methodId: number) => {
    setSelectedPayment(methodId);
  };

  const handleNextStep = () => {
    if (currentStep === 'shipping') {
      if (selectedShipping) {
        setCurrentStep('payment');
      }
    } else if (currentStep === 'payment') {
      if (isPaymentFormValid()) {
        setCurrentStep('review');
      }
    }
  };

  const handlePreviousStep = () => {
    if (currentStep === 'payment') {
      setCurrentStep('shipping');
    } else if (currentStep === 'review') {
      setCurrentStep('payment');
    }
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Create new order
    const newOrder = {
      id: `ORD-${new Date().getFullYear()}-${(mockUserProfile.orders.length + 1).toString().padStart(3, '0')}`,
      date: new Date().toISOString(),
      status: 'processing' as const,
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      })),
      total: totalPrice,
      shippingMethod: shippingMethod?.name || '',
      shippingAddress: mockUserProfile.shippingAddress,
      paymentMethod: paymentMethod?.name || '',
    };

    // Update user profile with new order
    mockUserProfile.orders.push(newOrder);
    mockUserProfile.recentOrders.unshift(newOrder);
    mockUserProfile.totalSpent += totalPrice;

    clearCart();
    setCurrentStep('confirmation');
    setIsProcessing(false);
  };

  const handlePaymentInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPaymentFormData(prev => ({ ...prev, [name]: value }));
  };

  const isPaymentFormValid = () => {
    if (selectedPayment === 1) { // Credit Card
      return (
        paymentFormData.cardNumber.length === 16 &&
        paymentFormData.cardName.trim() !== '' &&
        paymentFormData.expiryDate.match(/^(0[1-9]|1[0-2])\/([0-9]{2})$/),
        paymentFormData.cvv.length === 3
      );
    } else if (selectedPayment === 2) { // PayPal
      return (
        paymentFormData.paypalEmail.includes('@') &&
        paymentFormData.paypalPassword.length >= 6
      );
    } else if (selectedPayment === 3) { // Bank Transfer
      return (
        paymentFormData.bankAccount.length >= 8 &&
        paymentFormData.bankName.trim() !== '' &&
        paymentFormData.routingNumber.length === 9
      );
    }
    return false;
  };

  if (items.length === 0 && currentStep !== 'confirmation') {
    router.push('/cart');
    return null;
  }

  const shippingMethod = shippingMethods.find(m => m.id === selectedShipping);
  const paymentMethod = paymentMethods.find(m => m.id === selectedPayment);
  const totalPrice = getTotalPrice() + (shippingMethod?.price || 0);

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Progress Steps */}
          <div className="border-b border-gray-200">
            <div className="flex justify-between p-6">
              <div className={`flex items-center ${currentStep === 'shipping' ? 'text-indigo-600' : 'text-gray-500'}`}>
                <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center mr-2">
                  1
                </div>
                <span>Shipping</span>
              </div>
              <div className={`flex items-center ${currentStep === 'payment' ? 'text-indigo-600' : 'text-gray-500'}`}>
                <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center mr-2">
                  2
                </div>
                <span>Payment</span>
              </div>
              <div className={`flex items-center ${currentStep === 'review' ? 'text-indigo-600' : 'text-gray-500'}`}>
                <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center mr-2">
                  3
                </div>
                <span>Review</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {currentStep === 'shipping' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Shipping Method</h2>
                <div className="space-y-4">
                  {shippingMethods.map((method) => (
                    <div
                      key={method.id}
                      className={`p-4 border rounded-lg cursor-pointer ${
                        selectedShipping === method.id ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200'
                      }`}
                      onClick={() => handleShippingSelect(method.id)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">{method.name}</h3>
                          <p className="text-sm text-gray-500">{method.description}</p>
                        </div>
                        <div className="text-lg font-medium">
                          ${method.price.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 'payment' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Payment Method</h2>
                <div className="space-y-4">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className={`p-4 border rounded-lg cursor-pointer ${
                        selectedPayment === method.id ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200'
                      }`}
                      onClick={() => handlePaymentSelect(method.id)}
                    >
                      <div className="flex items-center">
                        <div className="w-8 h-8 mr-4">
                          <Image
                            src={`/icons/${method.icon}.svg`}
                            alt={method.name}
                            width={32}
                            height={32}
                          />
                        </div>
                        <div>
                          <h3 className="font-medium">{method.name}</h3>
                          <p className="text-sm text-gray-500">{method.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Payment Form */}
                <div className="mt-8">
                  {selectedPayment === 1 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Credit Card Details</h3>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700">
                            Card Number
                          </label>
                          <input
                            type="text"
                            id="cardNumber"
                            name="cardNumber"
                            value={paymentFormData.cardNumber}
                            onChange={handlePaymentInputChange}
                            placeholder="1234 5678 9012 3456"
                            maxLength={16}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          />
                        </div>
                        <div>
                          <label htmlFor="cardName" className="block text-sm font-medium text-gray-700">
                            Name on Card
                          </label>
                          <input
                            type="text"
                            id="cardName"
                            name="cardName"
                            value={paymentFormData.cardName}
                            onChange={handlePaymentInputChange}
                            placeholder="John Doe"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          />
                        </div>
                        <div>
                          <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">
                            Expiry Date
                          </label>
                          <input
                            type="text"
                            id="expiryDate"
                            name="expiryDate"
                            value={paymentFormData.expiryDate}
                            onChange={handlePaymentInputChange}
                            placeholder="MM/YY"
                            maxLength={5}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          />
                        </div>
                        <div>
                          <label htmlFor="cvv" className="block text-sm font-medium text-gray-700">
                            CVV
                          </label>
                          <input
                            type="text"
                            id="cvv"
                            name="cvv"
                            value={paymentFormData.cvv}
                            onChange={handlePaymentInputChange}
                            placeholder="123"
                            maxLength={3}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedPayment === 2 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">PayPal Login</h3>
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="paypalEmail" className="block text-sm font-medium text-gray-700">
                            PayPal Email
                          </label>
                          <input
                            type="email"
                            id="paypalEmail"
                            name="paypalEmail"
                            value={paymentFormData.paypalEmail}
                            onChange={handlePaymentInputChange}
                            placeholder="your@email.com"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          />
                        </div>
                        <div>
                          <label htmlFor="paypalPassword" className="block text-sm font-medium text-gray-700">
                            PayPal Password
                          </label>
                          <input
                            type="password"
                            id="paypalPassword"
                            name="paypalPassword"
                            value={paymentFormData.paypalPassword}
                            onChange={handlePaymentInputChange}
                            placeholder="••••••••"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedPayment === 3 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Bank Transfer Details</h3>
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="bankName" className="block text-sm font-medium text-gray-700">
                            Bank Name
                          </label>
                          <input
                            type="text"
                            id="bankName"
                            name="bankName"
                            value={paymentFormData.bankName}
                            onChange={handlePaymentInputChange}
                            placeholder="Bank Name"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          />
                        </div>
                        <div>
                          <label htmlFor="bankAccount" className="block text-sm font-medium text-gray-700">
                            Account Number
                          </label>
                          <input
                            type="text"
                            id="bankAccount"
                            name="bankAccount"
                            value={paymentFormData.bankAccount}
                            onChange={handlePaymentInputChange}
                            placeholder="Account Number"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          />
                        </div>
                        <div>
                          <label htmlFor="routingNumber" className="block text-sm font-medium text-gray-700">
                            Routing Number
                          </label>
                          <input
                            type="text"
                            id="routingNumber"
                            name="routingNumber"
                            value={paymentFormData.routingNumber}
                            onChange={handlePaymentInputChange}
                            placeholder="Routing Number"
                            maxLength={9}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {currentStep === 'review' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Order Review</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-2">Shipping Method</h3>
                    <p>{shippingMethod?.name} - ${shippingMethod?.price.toFixed(2)}</p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Payment Method</h3>
                    <p>{paymentMethod?.name}</p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Order Summary</h3>
                    <div className="border rounded-lg p-4">
                      {items.map((item) => (
                        <div key={item.id} className="flex justify-between mb-2">
                          <span>{item.name} x {item.quantity}</span>
                          <span>${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                      <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between">
                          <span>Shipping</span>
                          <span>${shippingMethod?.price.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold mt-2">
                          <span>Total</span>
                          <span>${totalPrice.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 'confirmation' && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold mb-4">Order Confirmed!</h2>
                <p className="text-gray-600 mb-8">Thank you for your purchase. Your order has been received.</p>
                <div className="space-y-4">
                  {orderStatuses.map((status) => (
                    <div key={status.id} className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${
                        status.status === 'delivered' ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        {status.status === 'delivered' ? (
                          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <div className="w-2 h-2 bg-gray-400 rounded-full" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{status.description}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(status.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-8">
                  <button
                    onClick={() => router.push('/')}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          {currentStep !== 'confirmation' && (
            <div className="border-t border-gray-200 px-6 py-4">
              <div className="flex justify-between">
                {currentStep !== 'shipping' && (
                  <button
                    onClick={handlePreviousStep}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Back
                  </button>
                )}
                <div className="flex-1" />
                {currentStep === 'review' ? (
                  <button
                    onClick={handlePlaceOrder}
                    disabled={isProcessing}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {isProcessing ? 'Processing...' : 'Place Order'}
                  </button>
                ) : (
                  <button
                    onClick={handleNextStep}
                    disabled={
                      (currentStep === 'shipping' && !selectedShipping) ||
                      (currentStep === 'payment' && !isPaymentFormValid())
                    }
                    className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                  >
                    Continue
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 