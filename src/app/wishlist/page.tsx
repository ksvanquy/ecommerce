'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { products } from '../../data/mockData';
import { getWishlist, removeFromWishlist } from '../../data/mockWishlist';

export default function WishlistPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [wishlist, setWishlist] = useState<number[]>(getWishlist());
  const [wishlistProducts, setWishlistProducts] = useState<any[]>(products.filter(product => getWishlist().includes(product.id)));

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      router.push('/login');
    }

    const syncWishlist = () => {
      const ids = getWishlist();
      setWishlist(ids);
      setWishlistProducts(products.filter(product => ids.includes(product.id)));
    };

    window.addEventListener('focus', syncWishlist);
    syncWishlist();

    return () => {
      window.removeEventListener('focus', syncWishlist);
    };
  }, [router]);

  const handleRemoveFromWishlist = (productId: number) => {
    removeFromWishlist(productId);
    const ids = getWishlist();
    setWishlist(ids);
    setWishlistProducts(products.filter(product => ids.includes(product.id)));
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
          </div>

          <div className="border-t border-gray-200">
            {wishlistProducts.length === 0 ? (
              <div className="px-4 py-5 sm:p-6 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No items in wishlist</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by adding some products to your wishlist.
                </p>
                <div className="mt-6">
                  <Link
                    href="/"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Browse Products
                  </Link>
                </div>
              </div>
            ) : (
              <div className="px-4 py-5 sm:p-6">
                <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {wishlistProducts.map((product) => (
                    <div key={product.id} className="group relative">
                      <div className="w-full min-h-80 bg-gray-200 aspect-w-1 aspect-h-1 rounded-md overflow-hidden group-hover:opacity-75">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-center object-cover"
                        />
                      </div>
                      <div className="mt-4 flex justify-between">
                        <div>
                          <h3 className="text-sm text-gray-700">
                            <Link href={`/product/${product.id}`}>
                              <span aria-hidden="true" className="absolute inset-0" />
                              {product.name}
                            </Link>
                          </h3>
                          <p className="mt-1 text-sm text-gray-500">{product.category}</p>
                        </div>
                        <p className="text-sm font-medium text-gray-900">${product.price}</p>
                      </div>
                      <div className="mt-4 flex justify-between">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleRemoveFromWishlist(product.id);
                          }}
                          className="text-sm text-gray-500 hover:text-gray-700"
                        >
                          Remove
                        </button>
                        <button
                          type="button"
                          className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                        >
                          Add to cart
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 