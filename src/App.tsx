import React, { useState, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  TrendingUp, 
  LogOut, 
  Plus, 
  Trash2, 
  AlertTriangle,
  Search,
  ChevronRight,
  Menu,
  X,
  User as UserIcon,
  DollarSign,
  Edit,
  History,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { format, startOfDay, endOfDay, subDays, isWithinInterval, parseISO, startOfWeek, startOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { useStore } from './store';
import { cn, formatCurrency, formatNumber } from './lib/utils';
import { Product, Sale, User, ProductUnit, SaleItem, UserRole } from './types';

// --- Components ---

const Card = ({ children, className, ...props }: { children: React.ReactNode; className?: string; [key: string]: any }) => (
  <div className={cn("bg-white rounded-2xl shadow-sm border border-orange-100 overflow-hidden", className)} {...props}>
    {children}
  </div>
);

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  className,
  disabled,
  type = 'button',
  ...props
}: { 
  children: React.ReactNode; 
  onClick?: () => void; 
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit';
  [key: string]: any;
}) => {
  const variants = {
    primary: "bg-orange-600 text-white hover:bg-orange-700 shadow-orange-200",
    secondary: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200",
    danger: "bg-rose-600 text-white hover:bg-rose-700 shadow-rose-200",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-100",
    outline: "bg-transparent border border-orange-200 text-orange-700 hover:bg-orange-50"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "px-4 py-2 rounded-xl font-medium transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

const Input = ({ 
  label, 
  type = 'text', 
  value, 
  onChange, 
  placeholder, 
  className,
  required
}: { 
  label?: string; 
  type?: string; 
  value: string | number; 
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
}) => (
  <div className={cn("flex flex-col gap-1.5", className)}>
    {label && <label className="text-sm font-semibold text-gray-700 ml-1">{label}</label>}
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="w-full px-4 py-2.5 bg-orange-50/30 border border-orange-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
    />
  </div>
);

// --- Views ---

const LoginView = ({ onLogin }: { onLogin: (u: string, p: string, r: UserRole) => boolean }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('EMPLOYEE');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onLogin(username, password, role)) {
      setError(true);
      setTimeout(() => setError(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFBF5] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-orange-100 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-inner">
            <LayoutDashboard size={48} className="text-orange-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Encanto</h1>
          <p className="text-gray-500">Transformando receitas em boas memórias</p>
        </div>

        <Card className="p-8">
          <div className="flex p-1 bg-orange-50 rounded-xl mb-8">
            <button
              onClick={() => setRole('EMPLOYEE')}
              className={cn(
                "flex-1 py-2 text-sm font-bold rounded-lg transition-all",
                role === 'EMPLOYEE' ? "bg-white text-orange-600 shadow-sm" : "text-gray-400 hover:text-gray-600"
              )}
            >
              Funcionário
            </button>
            <button
              onClick={() => setRole('ADMIN')}
              className={cn(
                "flex-1 py-2 text-sm font-bold rounded-lg transition-all",
                role === 'ADMIN' ? "bg-white text-orange-600 shadow-sm" : "text-gray-400 hover:text-gray-600"
              )}
            >
              Administrador
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-gap flex flex-col gap-6">
            <Input 
              label={role === 'ADMIN' ? "Usuário Admin" : "Usuário Funcionário"}
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              placeholder="Digite seu usuário"
              required
            />
            <Input 
              label="Senha" 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="••••••••"
              required
            />
            
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-rose-50 text-rose-600 p-3 rounded-lg text-sm font-medium flex items-center gap-2"
              >
                <XCircle size={16} />
                {role === 'ADMIN' ? 'Acesso administrativo negado' : 'Acesso de funcionário negado'}
              </motion.div>
            )}

            <Button type="submit" className="w-full py-3 text-lg">
              Entrar como {role === 'ADMIN' ? 'Admin' : 'Funcionário'}
            </Button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

// --- Admin Dashboard Components ---

const AdminStats = ({ sales, products }: { sales: Sale[], products: Product[] }) => {
  const now = new Date();
  
  const dailyTotal = sales
    .filter(s => isWithinInterval(parseISO(s.timestamp), { start: startOfDay(now), end: endOfDay(now) }))
    .reduce((acc, s) => acc + s.total, 0);

  const weeklyTotal = sales
    .filter(s => isWithinInterval(parseISO(s.timestamp), { start: startOfWeek(now), end: endOfDay(now) }))
    .reduce((acc, s) => acc + s.total, 0);

  const monthlyTotal = sales
    .filter(s => isWithinInterval(parseISO(s.timestamp), { start: startOfMonth(now), end: endOfDay(now) }))
    .reduce((acc, s) => acc + s.total, 0);

  const totalProfit = sales.reduce((acc, s) => acc + s.profit, 0);

  const stats = [
    { label: 'Faturamento Hoje', value: dailyTotal, icon: DollarSign, color: 'text-orange-600', bg: 'bg-orange-100' },
    { label: 'Faturamento Semana', value: weeklyTotal, icon: BarChart3, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Faturamento Mês', value: monthlyTotal, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { label: 'Lucro Estimado', value: totalProfit, icon: CheckCircle2, color: 'text-purple-600', bg: 'bg-purple-100' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, i) => (
        <Card key={i} className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className={cn("p-3 rounded-2xl", stat.bg)}>
              <stat.icon size={24} className={stat.color} />
            </div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Geral</span>
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">{stat.label}</p>
          <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(stat.value)}</h3>
        </Card>
      ))}
    </div>
  );
};

const AdminProducts = ({ products, onAdd, onUpdate, onDelete }: { 
  products: Product[], 
  onAdd: (p: any) => void, 
  onUpdate: (id: string, p: any) => void,
  onDelete: (id: string) => void
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    code: '',
    salePrice: 0,
    costPrice: 0,
    stock: 0,
    unit: 'gramas',
    minStockAlert: 100
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      onUpdate(editingId, formData);
      setEditingId(null);
    } else {
      onAdd(formData);
      setIsAdding(false);
    }
    setFormData({ name: '', code: '', salePrice: 0, costPrice: 0, stock: 0, unit: 'gramas', minStockAlert: 100 });
  };

  const startEdit = (p: Product) => {
    setFormData(p);
    setEditingId(p.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">📦 Cadastro de Produtos</h2>
        <Button onClick={() => setIsAdding(true)} className="px-6">
          <Plus size={20} /> Novo Produto
        </Button>
      </div>

      {(isAdding || editingId) && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-8 border-2 border-orange-200">
            <h3 className="text-xl font-bold mb-6">{editingId ? 'Editar Produto' : 'Novo Produto'}</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Input label="Nome do Produto" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} required />
              <Input label="Código" value={formData.code || ''} onChange={e => setFormData({...formData, code: e.target.value})} required />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700 ml-1">Unidade</label>
                <select 
                  value={formData.unit} 
                  onChange={e => setFormData({...formData, unit: e.target.value as ProductUnit})}
                  className="w-full px-4 py-2.5 bg-orange-50/30 border border-orange-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                >
                  <option value="gramas">Gramas (g)</option>
                  <option value="kg">Quilo (kg)</option>
                  <option value="unidade">Unidade (un)</option>
                  <option value="pacote">Pacote (pct)</option>
                </select>
              </div>
              <Input label="Preço de Venda" type="number" value={formData.salePrice || 0} onChange={e => setFormData({...formData, salePrice: Number(e.target.value)})} required />
              <Input label="Preço de Custo" type="number" value={formData.costPrice || 0} onChange={e => setFormData({...formData, costPrice: Number(e.target.value)})} />
              <Input label="Comissão (%)" type="number" value={formData.commissionPercentage || 0} onChange={e => setFormData({...formData, commissionPercentage: Number(e.target.value)})} />
              <Input label="Estoque Atual" type="number" value={formData.stock || 0} onChange={e => setFormData({...formData, stock: Number(e.target.value)})} required />
              <Input label="Alerta de Estoque Baixo" type="number" value={formData.minStockAlert || 0} onChange={e => setFormData({...formData, minStockAlert: Number(e.target.value)})} />
              
              <div className="lg:col-span-3 flex justify-end gap-4 mt-4">
                <Button variant="ghost" onClick={() => { setIsAdding(false); setEditingId(null); }}>Cancelar</Button>
                <Button type="submit">{editingId ? 'Salvar Alterações' : 'Cadastrar Produto'}</Button>
              </div>
            </form>
          </Card>
        </motion.div>
      )}

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-orange-50/50 border-b border-orange-100">
                <th className="px-6 py-4 font-bold text-gray-700">Produto</th>
                <th className="px-6 py-4 font-bold text-gray-700">Código</th>
                <th className="px-6 py-4 font-bold text-gray-700">Unidade</th>
                <th className="px-6 py-4 font-bold text-gray-700">Preço Venda</th>
                <th className="px-6 py-4 font-bold text-gray-700">Comissão</th>
                <th className="px-6 py-4 font-bold text-gray-700">Estoque</th>
                <th className="px-6 py-4 font-bold text-gray-700 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-orange-50">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-orange-50/20 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{p.name}</td>
                  <td className="px-6 py-4 text-gray-500 font-mono text-sm">{p.code}</td>
                  <td className="px-6 py-4 text-gray-600 capitalize">{p.unit}</td>
                  <td className="px-6 py-4 text-emerald-600 font-bold">{formatCurrency(p.salePrice)}</td>
                  <td className="px-6 py-4 text-orange-600 font-medium">{p.commissionPercentage || 0}%</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "px-2.5 py-1 rounded-full text-xs font-bold",
                        p.stock <= (p.minStockAlert || 0) ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"
                      )}>
                        {formatNumber(p.stock)}
                      </span>
                      {p.stock <= (p.minStockAlert || 0) && <AlertTriangle size={14} className="text-rose-500" />}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <Button variant="ghost" className="p-2" onClick={() => startEdit(p)}>
                      <ChevronRight size={18} />
                    </Button>
                    <Button variant="ghost" className="p-2 text-rose-600 hover:bg-rose-50" onClick={() => onDelete(p.id)}>
                      <Trash2 size={18} />
                    </Button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">Nenhum produto cadastrado</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

const AdminUsers = ({ users, onAdd, onUpdate, onToggle, onToggleCommission, onDelete }: {
  users: User[],
  onAdd: (u: any) => void,
  onUpdate: (id: string, u: any) => void,
  onToggle: (id: string) => void,
  onToggleCommission: (id: string) => void,
  onDelete: (id: string) => void
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', username: '', password: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      onUpdate(editingId, formData);
      setEditingId(null);
    } else {
      onAdd({ ...formData, role: 'EMPLOYEE', active: true, commissionEnabled: true });
      setIsAdding(false);
    }
    setFormData({ name: '', username: '', password: '' });
  };

  const startEdit = (u: User) => {
    setFormData({ name: u.name, username: u.username, password: u.password || '' });
    setEditingId(u.id);
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">👥 Gestão de Funcionários</h2>
        <Button onClick={() => setIsAdding(true)} className="px-6">
          <Plus size={20} /> Novo Funcionário
        </Button>
      </div>

      {(isAdding || editingId) && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-8 border-2 border-orange-200">
            <h3 className="text-xl font-bold mb-6">{editingId ? 'Editar Usuário' : 'Novo Funcionário'}</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input label="Nome Completo" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              <Input label="Usuário de Login" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} required />
              <Input label="Senha" type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
              <div className="md:col-span-3 flex justify-end gap-4">
                <Button variant="ghost" onClick={() => { setIsAdding(false); setEditingId(null); }}>Cancelar</Button>
                <Button type="submit">{editingId ? 'Salvar Alterações' : 'Criar Acesso'}</Button>
              </div>
            </form>
          </Card>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map(u => (
          <Card key={u.id} className={cn("p-6", !u.active && "opacity-60 grayscale")}>
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-2xl">
                <UserIcon size={24} className="text-orange-600" />
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" className="p-2 text-orange-600" onClick={() => startEdit(u)}>
                  <Edit size={18} />
                </Button>
                {u.id !== 'admin-1' && (
                  <>
                    <Button 
                      variant="ghost" 
                      className={cn("p-2", u.commissionEnabled ? "text-emerald-600" : "text-gray-400")} 
                      onClick={() => onToggleCommission(u.id)}
                      title={u.commissionEnabled ? "Comissão Ativada" : "Comissão Desativada"}
                    >
                      <DollarSign size={18} />
                    </Button>
                    <Button variant="ghost" className="p-2" onClick={() => onToggle(u.id)}>
                      {u.active ? <XCircle size={18} className="text-rose-500" /> : <CheckCircle2 size={18} className="text-emerald-500" />}
                    </Button>
                    <Button variant="ghost" className="p-2 text-rose-600 hover:bg-rose-50" onClick={() => onDelete(u.id)}>
                      <Trash2 size={18} />
                    </Button>
                  </>
                )}
              </div>
            </div>
            <h4 className="text-lg font-bold text-gray-900">{u.name}</h4>
            <p className="text-sm text-gray-500 mb-4">@{u.username}</p>
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <span className={cn(
                  "px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                  u.role === 'ADMIN' ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                )}>
                  {u.role}
                </span>
                {u.commissionEnabled && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700">
                    %
                  </span>
                )}
              </div>
              <span className={cn(
                "text-xs font-medium",
                u.active ? "text-emerald-600" : "text-rose-600"
              )}>
                {u.active ? 'Ativo' : 'Inativo'}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

const AdminReports = ({ sales, products, onReset, onDeleteSale, onUpdateSale }: { 
  sales: Sale[], 
  products: Product[],
  onReset?: () => void, 
  onDeleteSale?: (id: string) => void,
  onUpdateSale?: (id: string, updated: Partial<Sale>) => void
}) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState<string | null>(null);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const date = subDays(new Date(), 6 - i);
      const daySales = sales.filter(s => isWithinInterval(parseISO(s.timestamp), { start: startOfDay(date), end: endOfDay(date) }));
      return {
        date: format(date, 'dd/MM'),
        total: daySales.reduce((acc, s) => acc + s.total, 0),
        profit: daySales.reduce((acc, s) => acc + s.profit, 0)
      };
    });
    return last7Days;
  }, [sales]);

  const topProducts = useMemo(() => {
    const productMap: Record<string, { name: string, quantity: number, revenue: number }> = {};
    sales.forEach(s => {
      s.items.forEach(item => {
        if (!productMap[item.productId]) {
          productMap[item.productId] = { name: item.productName, quantity: 0, revenue: 0 };
        }
        productMap[item.productId].quantity += item.quantity;
        productMap[item.productId].revenue += item.total;
      });
    });
    return Object.values(productMap).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [sales]);

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-900">💰 Faturamento e Relatórios</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-8">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-orange-600" /> Desempenho (Últimos 7 dias)
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Bar dataKey="total" fill="#EA580C" radius={[4, 4, 0, 0]} name="Faturamento" />
                <Bar dataKey="profit" fill="#059669" radius={[4, 4, 0, 0]} name="Lucro" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-8">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <BarChart3 size={20} className="text-orange-600" /> Produtos Mais Vendidos
          </h3>
          <div className="space-y-4">
            {topProducts.map((p, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-orange-50/50 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-orange-200 rounded-xl flex items-center justify-center font-bold text-orange-700">
                    {i + 1}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{p.name}</p>
                    <p className="text-xs text-gray-500">{formatNumber(p.quantity)} vendidos</p>
                  </div>
                </div>
                <p className="font-bold text-emerald-600">{formatCurrency(p.revenue)}</p>
              </div>
            ))}
            {topProducts.length === 0 && <p className="text-center text-gray-400 py-12">Nenhuma venda registrada</p>}
          </div>
        </Card>
      </div>

      <Card className="p-8">
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
          <History size={20} className="text-orange-600" /> Histórico de Vendas
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-orange-50/50 border-b border-orange-100">
                <th className="px-6 py-4 font-bold text-gray-700">Data/Hora</th>
                <th className="px-6 py-4 font-bold text-gray-700">Vendedor</th>
                <th className="px-6 py-4 font-bold text-gray-700">Itens</th>
                <th className="px-6 py-4 font-bold text-gray-700">Total</th>
                <th className="px-6 py-4 font-bold text-gray-700">Comissão</th>
                <th className="px-6 py-4 font-bold text-gray-700">Lucro</th>
                <th className="px-6 py-4 font-bold text-gray-700 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-orange-50">
              {sales.slice().reverse().map(s => (
                <tr key={s.id} className="hover:bg-orange-50/20 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-600">{format(parseISO(s.timestamp), "dd/MM/yyyy HH:mm")}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{s.employeeName}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {s.items.map(item => `${item.quantity}${item.unit.charAt(0)} ${item.productName}`).join(', ')}
                  </td>
                  <td className="px-6 py-4 font-bold text-orange-600">{formatCurrency(s.total)}</td>
                  <td className="px-6 py-4 font-bold text-blue-600">{formatCurrency(s.commissionTotal || 0)}</td>
                  <td className="px-6 py-4 font-bold text-emerald-600">{formatCurrency(s.profit)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {onUpdateSale && (
                        <Button 
                          variant="ghost" 
                          className="p-2 text-orange-600 hover:bg-orange-50" 
                          onClick={() => setEditingSale(s)}
                          title="Editar Venda"
                        >
                          <Edit size={18} />
                        </Button>
                      )}
                      {onDeleteSale && (
                        <Button 
                          variant="ghost" 
                          className="p-2 text-rose-600 hover:bg-rose-50" 
                          onClick={() => setSaleToDelete(s.id)}
                          title="Cancelar Venda"
                        >
                          <Trash2 size={18} />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {sales.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">Nenhuma venda realizada</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {onReset && (
        <div className="pt-8 border-t border-orange-100">
          <div className="flex flex-col md:flex-row items-center justify-between p-8 bg-rose-50 rounded-3xl border-2 border-rose-100 gap-6">
            <div>
              <h3 className="text-xl font-bold text-rose-900 mb-2">Zona de Perigo</h3>
              <p className="text-rose-600 font-medium">Esta ação irá apagar todo o histórico de vendas, produtos e funcionários cadastrados.</p>
            </div>
            <Button variant="danger" onClick={() => setShowResetConfirm(true)} className="px-8 whitespace-nowrap">
              Zerar Todo o Sistema
            </Button>
          </div>
        </div>
      )}

      <AnimatePresence>
        {showResetConfirm && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-md">
              <Card className="p-8">
                <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                  <AlertTriangle size={32} className="text-rose-600" />
                </div>
                <h3 className="text-2xl font-bold text-center mb-4">Tem certeza absoluta?</h3>
                <p className="text-gray-500 text-center mb-8">
                  Esta ação é irreversível. Todas as vendas, produtos e acessos de funcionários serão excluídos permanentemente.
                </p>
                <div className="flex gap-4">
                  <Button variant="ghost" className="flex-1" onClick={() => setShowResetConfirm(false)}>Cancelar</Button>
                  <Button variant="danger" className="flex-1" onClick={() => { onReset(); setShowResetConfirm(false); }}>Sim, Zerar Tudo</Button>
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editingSale && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-2xl">
              <Card className="p-8 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold">Editar Venda</h3>
                  <button onClick={() => setEditingSale(null)} className="text-gray-400 hover:text-gray-600">
                    <X size={24} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <Input 
                    label="Nome do Cliente" 
                    value={editingSale.customerName} 
                    onChange={e => setEditingSale({...editingSale, customerName: e.target.value})} 
                  />
                  <Input 
                    label="Empresa (Opcional)" 
                    value={editingSale.companyName || ''} 
                    onChange={e => setEditingSale({...editingSale, companyName: e.target.value})} 
                  />
                  <Input 
                    label="Rua" 
                    value={editingSale.address.street} 
                    onChange={e => setEditingSale({
                      ...editingSale, 
                      address: { ...editingSale.address, street: e.target.value }
                    })} 
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input 
                      label="Bairro" 
                      value={editingSale.address.neighborhood} 
                      onChange={e => setEditingSale({
                        ...editingSale, 
                        address: { ...editingSale.address, neighborhood: e.target.value }
                      })} 
                    />
                    <Input 
                      label="Número" 
                      value={editingSale.address.number} 
                      onChange={e => setEditingSale({
                        ...editingSale, 
                        address: { ...editingSale.address, number: e.target.value }
                      })} 
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700 ml-1">Forma de Pagamento</label>
                    <select 
                      value={editingSale.paymentMethod} 
                      onChange={e => setEditingSale({...editingSale, paymentMethod: e.target.value as any})}
                      className="w-full px-4 py-2.5 bg-orange-50/30 border border-orange-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                    >
                      <option value="Dinheiro">Dinheiro</option>
                      <option value="PIX">PIX</option>
                      <option value="Crédito">Crédito</option>
                      <option value="Débito">Débito</option>
                      <option value="Boleto">Boleto</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <h4 className="font-bold text-gray-700 border-b border-orange-100 pb-2">Itens da Venda</h4>
                  {editingSale.items.map((item, idx) => (
                    <div key={item.productId} className="flex items-center justify-between p-3 bg-orange-50/50 rounded-xl">
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 text-sm">{item.productName}</p>
                        <p className="text-xs text-gray-500">{formatCurrency(item.price)}/{item.unit === 'gramas' ? 'kg' : item.unit}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-24">
                          <Input 
                            label="" 
                            type="number" 
                            value={item.quantity} 
                            onChange={e => {
                              const newQty = Number(e.target.value);
                              const newItems = [...editingSale.items];
                              const pricePerUnit = item.price / (item.unit === 'gramas' ? 1000 : 1);
                              const newTotal = newQty * pricePerUnit;
                              
                              // Find product to recalculate commission
                              const product = products.find(p => p.id === item.productId);
                              const newCommission = product?.commissionPercentage 
                                ? newTotal * (product.commissionPercentage / 100)
                                : 0;

                              newItems[idx] = { 
                                ...item, 
                                quantity: newQty, 
                                total: newTotal,
                                commission: newCommission
                              };
                              
                              const total = newItems.reduce((acc, i) => acc + i.total, 0);
                              const commissionTotal = newItems.reduce((acc, i) => acc + (i.commission || 0), 0);
                              
                              // Recalculate profit
                              const profit = newItems.reduce((acc, i) => {
                                const p = products.find(prod => prod.id === i.productId);
                                if (!p || !p.costPrice) return acc + (i.total * 0.3);
                                const costPerUnit = p.costPrice / (p.unit === 'gramas' ? 1000 : 1);
                                return acc + (i.total - (i.quantity * costPerUnit));
                              }, 0);

                              setEditingSale({
                                ...editingSale,
                                items: newItems,
                                total,
                                commissionTotal,
                                profit
                              });
                            }}
                          />
                        </div>
                        <p className="font-bold text-orange-600 min-w-[80px] text-right">{formatCurrency(item.total)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-gray-50 p-6 rounded-2xl space-y-2 mb-8">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Comissão Total:</span>
                    <span className="font-bold text-blue-600">{formatCurrency(editingSale.commissionTotal || 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Lucro Estimado:</span>
                    <span className="font-bold text-emerald-600">{formatCurrency(editingSale.profit)}</span>
                  </div>
                  <div className="flex justify-between text-xl pt-2 border-t border-gray-200">
                    <span className="font-bold text-gray-900">Total:</span>
                    <span className="font-bold text-orange-600">{formatCurrency(editingSale.total)}</span>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button variant="ghost" className="flex-1" onClick={() => setEditingSale(null)}>Cancelar</Button>
                  <Button className="flex-1" onClick={() => {
                    onUpdateSale?.(editingSale.id, editingSale);
                    setEditingSale(null);
                  }}>Salvar Alterações</Button>
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {saleToDelete && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-md">
              <Card className="p-8">
                <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                  <AlertTriangle size={32} className="text-rose-600" />
                </div>
                <h3 className="text-2xl font-bold text-center mb-4">Cancelar Venda?</h3>
                <p className="text-gray-500 text-center mb-8">
                  Esta ação irá excluir a venda permanentemente e devolver os produtos ao estoque.
                </p>
                <div className="flex gap-4">
                  <Button variant="ghost" className="flex-1" onClick={() => setSaleToDelete(null)}>Voltar</Button>
                  <Button variant="danger" className="flex-1" onClick={() => { onDeleteSale?.(saleToDelete); setSaleToDelete(null); }}>Confirmar Cancelamento</Button>
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Employee View Components ---

const EmployeeSales = ({ products, onSale, currentUser, sales }: { products: Product[], onSale: (s: any) => void, currentUser: User, sales: Sale[] }) => {
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<number>(100);
  const [isFinishing, setIsFinishing] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    customerName: '',
    companyName: '',
    street: '',
    neighborhood: '',
    number: '',
    paymentMethod: 'Dinheiro' as any
  });

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.code.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = () => {
    if (!selectedProduct) return;
    
    // Validate stock
    const existingInCart = cart.find(item => item.productId === selectedProduct.id);
    const currentCartQty = existingInCart ? existingInCart.quantity : 0;
    const totalRequested = currentCartQty + quantity;

    if (totalRequested > selectedProduct.stock) {
      alert(`Quantidade indisponível! Estoque atual: ${formatNumber(selectedProduct.stock)}${selectedProduct.unit === 'gramas' ? 'g' : ''}`);
      return;
    }

    if (existingInCart) {
      setCart(cart.map(item => item.productId === selectedProduct.id ? {
        ...item,
        quantity: item.quantity + quantity,
        total: (item.quantity + quantity) * (selectedProduct.salePrice / (selectedProduct.unit === 'gramas' ? 1000 : 1)),
        commission: currentUser.commissionEnabled 
          ? ((item.quantity + quantity) * (selectedProduct.salePrice / (selectedProduct.unit === 'gramas' ? 1000 : 1))) * ((selectedProduct.commissionPercentage || 0) / 100)
          : 0
      } : item));
    } else {
      const pricePerUnit = selectedProduct.salePrice / (selectedProduct.unit === 'gramas' ? 1000 : 1);
      const itemTotal = quantity * pricePerUnit;
      setCart([...cart, {
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        quantity: quantity,
        unit: selectedProduct.unit,
        price: selectedProduct.salePrice,
        total: itemTotal,
        commission: currentUser.commissionEnabled 
          ? itemTotal * ((selectedProduct.commissionPercentage || 0) / 100)
          : 0
      }]);
    }
    setSelectedProduct(null);
    setQuantity(100);
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.productId !== id));
  };

  const total = cart.reduce((acc, item) => acc + item.total, 0);

  const finishSale = () => {
    if (cart.length === 0) return;
    
    const profit = cart.reduce((acc, item) => {
      const product = products.find(p => p.id === item.productId);
      if (!product || !product.costPrice) return acc + (item.total * 0.3);
      const costPerUnit = product.costPrice / (product.unit === 'gramas' ? 1000 : 1);
      return acc + (item.total - (item.quantity * costPerUnit));
    }, 0);

    const commissionTotal = cart.reduce((acc, item) => acc + (item.commission || 0), 0);

    onSale({
      items: cart,
      total,
      profit,
      commissionTotal,
      employeeId: currentUser.id,
      employeeName: currentUser.name,
      customerName: customerInfo.customerName,
      companyName: customerInfo.companyName,
      address: {
        street: customerInfo.street,
        neighborhood: customerInfo.neighborhood,
        number: customerInfo.number
      },
      paymentMethod: customerInfo.paymentMethod
    });
    
    setCart([]);
    setIsFinishing(false);
    setCustomerInfo({
      customerName: '',
      companyName: '',
      street: '',
      neighborhood: '',
      number: '',
      paymentMethod: 'Dinheiro'
    });
  };

  const dailySales = useMemo(() => {
    const today = new Date();
    return sales.filter(s => 
      s.employeeId === currentUser.id && 
      isWithinInterval(parseISO(s.timestamp), { start: startOfDay(today), end: endOfDay(today) })
    );
  }, [sales, currentUser.id]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-orange-100">
            <Search className="text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar produto por nome ou código..." 
              className="flex-1 outline-none bg-transparent"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProducts.map(p => (
              <Card key={p.id} className="p-4 hover:border-orange-400 transition-all cursor-pointer group" onClick={() => setSelectedProduct(p)}>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors">{p.name}</h4>
                    <p className="text-xs text-gray-500 font-mono">{p.code}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-600">{formatCurrency(p.salePrice)}/{p.unit === 'gramas' ? 'kg' : p.unit}</p>
                    <p className={cn("text-[10px] font-bold uppercase", p.stock <= (p.minStockAlert || 0) ? "text-rose-500" : "text-gray-400")}>
                      Estoque: {formatNumber(p.stock)}{p.unit === 'gramas' ? 'g' : ''}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <Card className="p-6 sticky top-6">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <ShoppingCart size={24} className="text-orange-600" /> Carrinho de Vendas
            </h3>
            
            <div className="space-y-4 mb-8 max-h-[300px] overflow-y-auto pr-2">
              {cart.map(item => (
                <div key={item.productId} className="flex items-center justify-between p-3 bg-orange-50/50 rounded-xl group">
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{item.productName}</p>
                    <p className="text-xs text-gray-500">{formatNumber(item.quantity)}{item.unit === 'gramas' ? 'g' : item.unit} x {formatCurrency(item.price)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-bold text-orange-600">{formatCurrency(item.total)}</p>
                    <button onClick={() => removeFromCart(item.productId)} className="text-gray-400 hover:text-rose-600 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
              {cart.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <ShoppingCart size={48} className="mx-auto mb-4 opacity-20" />
                  <p>Carrinho vazio</p>
                </div>
              )}
            </div>

            <div className="border-t border-orange-100 pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-medium">Total da Venda</span>
                <span className="text-2xl font-bold text-gray-900">{formatCurrency(total)}</span>
              </div>
              <Button onClick={() => setIsFinishing(true)} disabled={cart.length === 0} className="w-full py-4 text-lg">
                Continuar para Pagamento
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Daily Report for Employee */}
      <Card className="p-8">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <History size={24} className="text-orange-600" /> Minhas Vendas de Hoje
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-orange-50/50 border-b border-orange-100">
                <th className="px-6 py-4 font-bold text-gray-700">Hora</th>
                <th className="px-6 py-4 font-bold text-gray-700">Cliente</th>
                <th className="px-6 py-4 font-bold text-gray-700">Pagamento</th>
                <th className="px-6 py-4 font-bold text-gray-700">Total</th>
                <th className="px-6 py-4 font-bold text-gray-700">Comissão</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-orange-50">
              {dailySales.slice().reverse().map(s => (
                <tr key={s.id} className="hover:bg-orange-50/20 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-600">{format(parseISO(s.timestamp), "HH:mm")}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {s.customerName} {s.companyName && <span className="text-xs text-gray-400">({s.companyName})</span>}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold uppercase">
                      {s.paymentMethod}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-orange-600">{formatCurrency(s.total)}</td>
                  <td className="px-6 py-4 font-bold text-blue-600">{formatCurrency(s.commissionTotal || 0)}</td>
                </tr>
              ))}
              {dailySales.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400">Nenhuma venda hoje</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
              <Card className="w-full max-w-md p-8">
                <h3 className="text-2xl font-bold mb-2">{selectedProduct.name}</h3>
                <p className="text-gray-500 mb-6">Defina a quantidade para venda ({selectedProduct.unit})</p>
                
                <div className="space-y-6">
                  <Input 
                    label={`Quantidade (${selectedProduct.unit})`} 
                    type="number" 
                    value={quantity} 
                    onChange={e => setQuantity(Number(e.target.value))} 
                    required 
                  />
                  
                  <div className="bg-orange-50 p-4 rounded-xl flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Subtotal</span>
                    <span className="text-xl font-bold text-orange-600">
                      {formatCurrency(quantity * (selectedProduct.salePrice / (selectedProduct.unit === 'gramas' ? 1000 : 1)))}
                    </span>
                  </div>

                  <div className="flex gap-4">
                    <Button variant="ghost" className="flex-1" onClick={() => setSelectedProduct(null)}>Cancelar</Button>
                    <Button className="flex-1" onClick={addToCart}>Adicionar</Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        )}

        {isFinishing && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-2xl">
              <Card className="p-8">
                <h3 className="text-2xl font-bold mb-6">Finalizar Venda</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <Input label="Nome do Cliente" value={customerInfo.customerName} onChange={e => setCustomerInfo({...customerInfo, customerName: e.target.value})} required />
                  <Input label="Nome da Empresa (Opcional)" value={customerInfo.companyName} onChange={e => setCustomerInfo({...customerInfo, companyName: e.target.value})} />
                  <Input label="Rua" value={customerInfo.street} onChange={e => setCustomerInfo({...customerInfo, street: e.target.value})} required />
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Bairro" value={customerInfo.neighborhood} onChange={e => setCustomerInfo({...customerInfo, neighborhood: e.target.value})} required />
                    <Input label="Número" value={customerInfo.number} onChange={e => setCustomerInfo({...customerInfo, number: e.target.value})} required />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700 ml-1">Forma de Pagamento</label>
                    <select 
                      value={customerInfo.paymentMethod} 
                      onChange={e => setCustomerInfo({...customerInfo, paymentMethod: e.target.value as any})}
                      className="w-full px-4 py-2.5 bg-orange-50/30 border border-orange-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                    >
                      <option value="Dinheiro">Dinheiro</option>
                      <option value="PIX">PIX</option>
                      <option value="Crédito">Cartão de Crédito</option>
                      <option value="Débito">Cartão de Débito</option>
                      <option value="Boleto">Boleto</option>
                    </select>
                  </div>
                </div>

                <div className="bg-orange-50 p-6 rounded-2xl mb-8 flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Total a Pagar</p>
                    <p className="text-3xl font-bold text-orange-600">{formatCurrency(total)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 font-medium">Itens no Carrinho</p>
                    <p className="text-xl font-bold text-gray-900">{cart.length}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button variant="ghost" className="flex-1" onClick={() => setIsFinishing(false)}>Voltar ao Carrinho</Button>
                  <Button className="flex-1" onClick={finishSale} disabled={!customerInfo.customerName || !customerInfo.street}>Confirmar Venda</Button>
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const store = useStore();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'users' | 'reports' | 'sales'>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!store.currentUser) {
    return <LoginView onLogin={store.login} />;
  }

  const isAdmin = store.currentUser.role === 'ADMIN';

  const navItems = isAdmin ? [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Produtos', icon: Package },
    { id: 'reports', label: 'Relatórios', icon: BarChart3 },
    { id: 'users', label: 'Funcionários', icon: Users },
    { id: 'sales', label: 'Vendas', icon: ShoppingCart },
  ] : [
    { id: 'sales', label: 'Vendas', icon: ShoppingCart },
  ];

  // Set default tab for employee
  if (!isAdmin && activeTab !== 'sales') {
    setActiveTab('sales');
  }

  return (
    <div className="min-h-screen bg-[#FFFBF5] flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className={cn(
        "fixed md:relative inset-y-0 left-0 z-50 w-72 bg-white border-r border-orange-100 transform transition-transform duration-300 md:translate-x-0",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-8 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-200">
              <LayoutDashboard size={24} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Encanto</h1>
          </div>

          <nav className="flex-1 space-y-2">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id as any); setMobileMenuOpen(false); }}
                className={cn(
                  "w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-semibold transition-all group",
                  activeTab === item.id 
                    ? "bg-orange-600 text-white shadow-lg shadow-orange-200" 
                    : "text-gray-500 hover:bg-orange-50 hover:text-orange-600"
                )}
              >
                <item.icon size={20} className={cn(activeTab === item.id ? "text-white" : "text-gray-400 group-hover:text-orange-600")} />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="mt-auto pt-8 border-t border-orange-50">
            <div className="flex items-center gap-4 mb-6 px-4">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                <UserIcon size={20} className="text-orange-600" />
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-gray-900 truncate">{store.currentUser.name}</p>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">{store.currentUser.role}</p>
              </div>
            </div>
            <button 
              onClick={store.logout}
              className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold text-rose-600 hover:bg-rose-50 transition-all"
            >
              <LogOut size={20} />
              Sair do Sistema
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <header className="flex items-center justify-between mb-10 md:hidden">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
              <LayoutDashboard size={18} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Encanto</h1>
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 bg-white rounded-lg border border-orange-100">
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </header>

        <div className="max-w-7xl mx-auto">
          {activeTab === 'dashboard' && isAdmin && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Olá, {store.currentUser.name.split(' ')[0]} 👋</h2>
              <AdminStats sales={store.sales} products={store.products} />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <AdminReports 
                    sales={store.sales} 
                    products={store.products}
                    onReset={store.resetSystem} 
                    onDeleteSale={store.deleteSale}
                    onUpdateSale={store.updateSale}
                  />
                </div>
                <div className="space-y-8">
                  <Card className="p-6">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <AlertTriangle size={20} className="text-rose-500" /> Alertas de Estoque
                    </h3>
                    <div className="space-y-3">
                      {store.products.filter(p => p.stock <= (p.minStockAlert || 0)).map(p => (
                        <div key={p.id} className="p-3 bg-rose-50 rounded-xl flex items-center justify-between">
                          <span className="text-sm font-bold text-rose-700">{p.name}</span>
                          <span className="text-xs font-bold text-rose-600">{formatNumber(p.stock)}{p.unit.charAt(0)}</span>
                        </div>
                      ))}
                      {store.products.filter(p => p.stock <= (p.minStockAlert || 0)).length === 0 && (
                        <p className="text-sm text-gray-400 text-center py-4">Estoque em dia</p>
                      )}
                    </div>
                  </Card>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'products' && isAdmin && (
            <AdminProducts 
              products={store.products} 
              onAdd={store.addProduct} 
              onUpdate={store.updateProduct} 
              onDelete={store.deleteProduct} 
            />
          )}

          {activeTab === 'users' && isAdmin && (
            <AdminUsers 
              users={store.users} 
              onAdd={store.addUser} 
              onUpdate={store.updateUser}
              onToggle={store.toggleUserStatus} 
              onToggleCommission={store.toggleUserCommission}
              onDelete={store.deleteUser} 
            />
          )}

          {activeTab === 'reports' && isAdmin && (
            <AdminReports 
              sales={store.sales} 
              products={store.products}
              onReset={store.resetSystem} 
              onDeleteSale={store.deleteSale}
              onUpdateSale={store.updateSale}
            />
          )}

          {activeTab === 'sales' && (
            <EmployeeSales 
              products={store.products} 
              onSale={store.addSale} 
              currentUser={store.currentUser} 
              sales={store.sales}
            />
          )}
        </div>
      </main>
    </div>
  );
}
