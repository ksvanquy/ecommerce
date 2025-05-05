// Mock user data
const mockUsers = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    role: 'user'
  }
];

// Mock authentication service
export const authService = {
  // Login
  async login(email: string, password: string) {
    const user = mockUsers.find(u => u.email === email && u.password === password);
    if (!user) {
      throw new Error('Invalid email or password');
    }
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };
  },

  // Register
  async register(name: string, email: string, password: string) {
    const existingUser = mockUsers.find(u => u.email === email);
    if (existingUser) {
      throw new Error('Email already exists');
    }

    const newUser = {
      id: mockUsers.length + 1,
      name,
      email,
      password,
      role: 'user'
    };

    mockUsers.push(newUser);
    return {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    };
  },

  // Logout
  async logout() {
    // In a real app, this would invalidate the session/token
    return Promise.resolve();
  },

  // Get current user
  getCurrentUser() {
    const userFromLocalStorage = localStorage.getItem('user');
    const userFromSessionStorage = sessionStorage.getItem('user');
    
    if (userFromLocalStorage) {
      return JSON.parse(userFromLocalStorage);
    }
    
    if (userFromSessionStorage) {
      return JSON.parse(userFromSessionStorage);
    }
    
    return null;
  }
}; 