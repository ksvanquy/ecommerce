export interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  rating: number;
  reviews: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export const categories: Category[] = [
  { id: 1, name: "Electronics", slug: "electronics" },
  { id: 2, name: "Clothing", slug: "clothing" },
  { id: 3, name: "Home & Kitchen", slug: "home-kitchen" },
  { id: 4, name: "Books", slug: "books" },
  { id: 5, name: "Sports", slug: "sports" },
];

export const products: Product[] = [
  {
    id: 1,
    name: "Smartphone X",
    price: 999.99,
    description: "Latest smartphone with advanced features and high-resolution camera",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&h=500&fit=crop",
    category: "electronics",
    rating: 4.5,
    reviews: 120,
  },
  {
    id: 2,
    name: "Laptop Pro",
    price: 1299.99,
    description: "Powerful laptop for professionals and gamers",
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&h=500&fit=crop",
    category: "electronics",
    rating: 4.8,
    reviews: 85,
  },
  {
    id: 3,
    name: "Men's Casual Shirt",
    price: 29.99,
    description: "Comfortable and stylish casual shirt for everyday wear",
    image: "https://images.unsplash.com/photo-1598033129183-c4f827c4e3e0?w=500&h=500&fit=crop",
    category: "clothing",
    rating: 4.2,
    reviews: 45,
  },
  {
    id: 4,
    name: "Coffee Maker",
    price: 79.99,
    description: "Automatic coffee maker with programmable features",
    image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500&h=500&fit=crop",
    category: "home-kitchen",
    rating: 4.6,
    reviews: 67,
  },
  {
    id: 5,
    name: "Wireless Headphones",
    price: 149.99,
    description: "Premium wireless headphones with noise cancellation",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop",
    category: "electronics",
    rating: 4.7,
    reviews: 92,
  },
]; 