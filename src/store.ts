import { useState, useEffect } from 'react';
import { User, Product, Sale, UserRole } from './types';

// Initial Users
const INITIAL_USERS: User[] = [
  {
    id: 'admin-1',
    username: 'admin',
    password: 'admin',
    name: 'Administrador',
    role: 'ADMIN',
    active: true,
    commissionEnabled: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'employee-1',
    username: 'Rivaldo',
    password: 'ENCANTO2026',
    name: 'Rivaldo',
    role: 'EMPLOYEE',
    active: true,
    commissionEnabled: true,
    createdAt: new Date().toISOString(),
  }
];

export function useStore() {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('encanto_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('encanto_products');
    return saved ? JSON.parse(saved) : [];
  });

  const [sales, setSales] = useState<Sale[]>(() => {
    const saved = localStorage.getItem('encanto_sales');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = sessionStorage.getItem('encanto_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    localStorage.setItem('encanto_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('encanto_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('encanto_sales', JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    if (currentUser) {
      sessionStorage.setItem('encanto_current_user', JSON.stringify(currentUser));
    } else {
      sessionStorage.removeItem('encanto_current_user');
    }
  }, [currentUser]);

  const login = (username: string, password: string, role: UserRole): boolean => {
    const user = users.find(u => u.username === username && u.password === password && u.role === role && u.active);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const addProduct = (product: Omit<Product, 'id' | 'createdAt'>) => {
    const newProduct: Product = {
      ...product,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setProducts(prev => [...prev, newProduct]);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const addUser = (user: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...user,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setUsers(prev => [...prev, newUser]);
  };

  const toggleUserStatus = (id: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, active: !u.active } : u));
  };

  const toggleUserCommission = (id: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, commissionEnabled: !u.commissionEnabled } : u));
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
    // If updating current user, update session storage
    if (currentUser?.id === id) {
      setCurrentUser(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const deleteUser = (id: string) => {
    if (id === 'admin-1') return; // Prevent deleting main admin
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const resetSystem = () => {
    setSales([]);
    setProducts([]);
    setUsers(INITIAL_USERS);
    localStorage.removeItem('encanto_sales');
    localStorage.removeItem('encanto_products');
    localStorage.removeItem('encanto_users');
  };

  const addSale = (sale: Omit<Sale, 'id' | 'timestamp'>) => {
    const newSale: Sale = {
      ...sale,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };

    // Update stock
    setProducts(prev => prev.map(p => {
      const saleItem = sale.items.find(item => item.productId === p.id);
      if (saleItem) {
        return { ...p, stock: p.stock - saleItem.quantity };
      }
      return p;
    }));

    setSales(prev => [...prev, newSale]);
  };

  const deleteSale = (id: string) => {
    const saleToDelete = sales.find(s => s.id === id);
    if (!saleToDelete) return;

    // Restore stock
    setProducts(prev => prev.map(p => {
      const saleItem = saleToDelete.items.find(item => item.productId === p.id);
      if (saleItem) {
        return { ...p, stock: p.stock + saleItem.quantity };
      }
      return p;
    }));

    setSales(prev => prev.filter(s => s.id !== id));
  };

  const updateSale = (id: string, updatedSale: Partial<Sale>) => {
    const oldSale = sales.find(s => s.id === id);
    if (!oldSale) return;

    // If items changed, we need to adjust stock
    if (updatedSale.items) {
      setProducts(prev => prev.map(p => {
        let newStock = p.stock;
        
        // Restore old items stock
        const oldItem = oldSale.items.find(item => item.productId === p.id);
        if (oldItem) newStock += oldItem.quantity;
        
        // Apply new items stock
        const newItem = updatedSale.items?.find(item => item.productId === p.id);
        if (newItem) newStock -= newItem.quantity;
        
        return { ...p, stock: newStock };
      }));
    }

    setSales(prev => prev.map(s => s.id === id ? { ...s, ...updatedSale } : s));
  };

  return {
    users,
    products,
    sales,
    currentUser,
    login,
    logout,
    addProduct,
    updateProduct,
    deleteProduct,
    addUser,
    updateUser,
    toggleUserStatus,
    toggleUserCommission,
    deleteUser,
    resetSystem,
    addSale,
    deleteSale,
    updateSale,
  };
}
