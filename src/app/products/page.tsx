'use client';

import { useState } from 'react';
import { products as allProducts, Product } from '../../data/mockData';
import ProductCard from '../../components/ProductCard';
import SearchAndFilter from '../../components/SearchAndFilter';
import CategoryNavigation from '@/components/CategoryNavigation';

export default function ProductsPage() {
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(allProducts);

  // Tìm kiếm theo tên sản phẩm
  const handleSearch = (query: string) => {
    const q = query.toLowerCase();
    setFilteredProducts(
      allProducts.filter((p) => p.name.toLowerCase().includes(q))
    );
  };

  // Lọc theo giá và rating
  const handleFilter = ({
    minPrice,
    maxPrice,
    minRating,
  }: {
    minPrice: number;
    maxPrice: number;
    minRating: number;
  }) => {
    setFilteredProducts(
      allProducts.filter(
        (p) =>
          p.price >= minPrice &&
          p.price <= maxPrice &&
          p.rating >= minRating
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">All Products</h1>
        <SearchAndFilter
          onSearch={handleSearch}
          onFilter={handleFilter}
          products={allProducts}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
          {filteredProducts.length === 0 && (
            <div className="col-span-full text-center text-gray-500 py-12">
              No products found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
