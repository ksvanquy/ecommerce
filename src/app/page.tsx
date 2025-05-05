'use client';

import { useState } from 'react';
import CategoryNavigation from '../components/CategoryNavigation';
import ProductCard from '../components/ProductCard';
import SearchAndFilter from '../components/SearchAndFilter';
import { products } from '../data/mockData';

export default function Home() {
  const [filteredProducts, setFilteredProducts] = useState(products);

  const handleSearch = (query: string) => {
    const filtered = products.filter((product) =>
      product.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  const handleFilter = (filters: {
    minPrice: number;
    maxPrice: number;
    minRating: number;
  }) => {
    const filtered = products.filter(
      (product) =>
        product.price >= filters.minPrice &&
        product.price <= filters.maxPrice &&
        product.rating >= filters.minRating
    );
    setFilteredProducts(filtered);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <CategoryNavigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SearchAndFilter
          onSearch={handleSearch}
          onFilter={handleFilter}
          products={products}
        />
        <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </main>
    </div>
  );
}
