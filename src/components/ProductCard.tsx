'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '../data/mockData';
import { useCart } from '../context/CartContext';
import { useState } from 'react';
import HeartIcon from './HeartIcon';
import { getWishlist, addToWishlist, removeFromWishlist } from '../data/mockWishlist';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart, getItemQuantity } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [wishlist, setWishlist] = useState<number[]>(getWishlist());
  const quantity = getItemQuantity(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsAdding(true);
    addToCart(product, 1);
    setTimeout(() => setIsAdding(false), 500);
  };

  const isFavorite = wishlist.includes(product.id);
  const handleToggleWishlist = () => {
    if (isFavorite) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product.id);
    }
    setWishlist([...getWishlist()]);
  };

  return (
    <div className="group relative">
      <Link href={`/product/${product.id}`} className="block">
        <div className="w-full min-h-80 bg-gray-200 aspect-w-1 aspect-h-1 rounded-md overflow-hidden group-hover:opacity-75">
          <Image
            src={product.image}
            alt={product.name}
            width={300}
            height={300}
            className="w-full h-full object-center object-cover"
          />
        </div>
        <div className="mt-4">
          <h3 className="text-sm text-gray-700">
            {product.name}
          </h3>
          <p className="mt-1 text-sm text-gray-500">{product.category}</p>
        </div>
        <div className="mt-2 flex items-center">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`h-4 w-4 ${
                  i < Math.floor(product.rating)
                    ? 'text-yellow-400'
                    : 'text-gray-300'
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <p className="ml-2 text-sm text-gray-500">({product.reviews} reviews)</p>
        </div>
      </Link>
      <div className="mt-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium text-gray-900">${product.price}</p>
          {quantity > 0 && (
            <span className="text-xs text-gray-500">({quantity} in cart)</span>
          )}
          <HeartIcon isFavorite={isFavorite} onClick={handleToggleWishlist} className="ml-auto" />
        </div>
        <button
          onClick={handleAddToCart}
          disabled={isAdding}
          className={`p-2 rounded-full ${
            isAdding
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
          } transition-colors duration-200`}
          title="Add to cart"
        >
          {isAdding ? (
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
} 