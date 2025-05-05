'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { products, categories } from '../../../data/mockData';
import ProductCard from '../../../components/ProductCard';
import CategoryNavigation from '../../../components/CategoryNavigation';

export default function CategoryPage() {
  const params = useParams();
  const [category, setCategory] = useState<typeof categories[0] | null>(null);
  const [categoryProducts, setCategoryProducts] = useState<typeof products>([]);

  useEffect(() => {
    if (params?.slug) {
      const categorySlug = params.slug as string;
      const foundCategory = categories.find((c) => c.slug === categorySlug);
      const filteredProducts = products.filter((p) => p.category === categorySlug);
      
      setCategory(foundCategory || null);
      setCategoryProducts(filteredProducts);
    }
  }, [params?.slug]);

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Category not found</h1>
          <p className="mt-2 text-gray-500">The category you are looking for does not exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <CategoryNavigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
          <p className="mt-2 text-gray-500">
            Browse our collection of {category.name.toLowerCase()} products
          </p>
        </div>
        {categoryProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No products found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categoryProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 