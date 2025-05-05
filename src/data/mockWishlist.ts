export let mockWishlist: number[] = [1, 3, 5];

export function addToWishlist(id: number) {
  if (!mockWishlist.includes(id)) mockWishlist.push(id);
}

export function removeFromWishlist(id: number) {
  const idx = mockWishlist.indexOf(id);
  if (idx !== -1) mockWishlist.splice(idx, 1);
}

export function getWishlist() {
  return mockWishlist;
} 