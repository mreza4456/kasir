"use client";

import { getTransactions } from "@/actions/transaction"
import { getProducts } from "@/actions/products"
import { getCategories } from "@/actions/categories"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Transaction, Product, Categories } from "@/interface"
import { ShoppingCart, Package, TrendingUp, DollarSign, Percent, AlertTriangle, BarChart3 } from "lucide-react"
import { useEffect, useState } from "react"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

interface MonthlyData {
  month: string
  total: number
  transactions: number
  totalPurchasePrice: number
  margin: number
}

interface CategoryData {
  name: string
  value: number
  color?: string
}

// Enhanced color palettes
const CHART_COLORS = ['#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#EF4444', '#06B6D4', '#F97316']
const GRADIENT_COLORS = {
  revenue: { from: '#8B5CF6', to: '#EC4899' },
  cost: { from: '#F59E0B', to: '#EF4444' },
  margin: { from: '#10B981', to: '#06B6D4' },
  percentage: { from: '#3B82F6', to: '#8B5CF6' }
}

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Categories[]>([])
  const [loading, setLoading] = useState(true)
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const [categoryData, setCategoryData] = useState<CategoryData[]>([])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      const [transactionsData, productsData, categoriesData] = await Promise.all([
        getTransactions(),
        getProducts(),
        getCategories()
      ])

      setTransactions(transactionsData)
      setProducts(productsData)
      setCategories(categoriesData)

      processMonthlyData(transactionsData)
      processCategoryData(productsData)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const processMonthlyData = (transactions: Transaction[]) => {
    const monthlyMap = new Map()

    transactions.forEach(transaction => {
      const date = new Date(transaction.created_at)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

      const existing = monthlyMap.get(monthKey) || { total: 0, count: 0, totalPurchasePrice: 0 }
      monthlyMap.set(monthKey, {
        total: existing.total + transaction.total,
        count: existing.count + 1,
        totalPurchasePrice: existing.totalPurchasePrice + (transaction.total_purchase_price || 0)
      })
    })

    const data = Array.from(monthlyMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-6)
      .map(([key, value]) => {
        const date = new Date(key + '-01')
        const margin = value.total - value.totalPurchasePrice
        return {
          month: new Intl.DateTimeFormat('id-ID', { month: 'short', year: '2-digit' }).format(date),
          total: value.total,
          transactions: value.count,
          totalPurchasePrice: value.totalPurchasePrice,
          margin: margin
        }
      })

    setMonthlyData(data)
  }

  const processCategoryData = (products: Product[]) => {
    const categoryMap = new Map()

    products.forEach(product => {
      const categoryName = product.categories?.name || 'Tanpa Kategori'
      const existing = categoryMap.get(categoryName) || 0
      categoryMap.set(categoryName, existing + 1)
    })

    const data = Array.from(categoryMap.entries()).map(([name, value]) => ({
      name,
      value
    }))

    setCategoryData(data)
  }

  const totalRevenue = transactions.reduce((sum, t) => sum + t.total, 0)
  const totalPurchasePrice = transactions.reduce((sum, t) => sum + (t.total_purchase_price || 0), 0)
  const totalMargin = totalRevenue - totalPurchasePrice
  const marginPercentage = totalRevenue > 0 ? (totalMargin / totalRevenue) * 100 : 0

  const totalTransactions = transactions.length
  const totalProducts = products.length
  const lowStockProducts = products.filter(p => (p.stock || 0) < 10).length
  const recentTransactions = transactions.slice(0, 5)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date(dateString))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen ">
        <div className="text-center space-y-4 flex justify-center items-center flex-col">
         <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-lg font-semibold text-primary">Memuat dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6  min-h-screen">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-primary">
          Dashboard
        </h1>
        <p className="text-slate-600 text-lg">Ringkasan bisnis Anda</p>
      </div>

      {/* Main Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Revenue */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-700 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-purple-100">Total Pendapatan</CardTitle>
            <DollarSign className="h-5 w-5 text-purple-200" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-purple-200 mt-1">Dari {totalTransactions} transaksi</p>
          </CardContent>
        </Card>

        {/* Total Cost */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-red-600 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-orange-100">Total Modal</CardTitle>
            <Package className="h-5 w-5 text-orange-200" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold">{formatCurrency(totalPurchasePrice)}</div>
            <p className="text-xs text-orange-200 mt-1">Harga beli produk terjual</p>
          </CardContent>
        </Card>

        {/* Total Margin */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-cyan-600 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-emerald-100">Total Margin</CardTitle>
            <TrendingUp className="h-5 w-5 text-emerald-200" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold">{formatCurrency(totalMargin)}</div>
            <p className="text-xs text-emerald-200 mt-1">Keuntungan bersih</p>
          </CardContent>
        </Card>

        {/* Margin Percentage */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-indigo-700 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-blue-100">Margin %</CardTitle>
            <Percent className="h-5 w-5 text-blue-200" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold">{marginPercentage.toFixed(1)}%</div>
            <p className="text-xs text-blue-200 mt-1">Persentase keuntungan</p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {/* Total Transactions */}
        <Card className="border border-purple-200 shadow-md hover:shadow-xl transition-shadow bg-white/80 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Total Transaksi</CardTitle>
            <div className="p-2 bg-purple-100 rounded-lg">
              <ShoppingCart className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">{totalTransactions}</div>
            <p className="text-xs text-slate-500 mt-1">
              {monthlyData.length > 0 && `${monthlyData[monthlyData.length - 1].transactions} bulan ini`}
            </p>
          </CardContent>
        </Card>

        {/* Total Products */}
        <Card className="border border-blue-200 shadow-md hover:shadow-xl transition-shadow bg-white/80 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Total Produk</CardTitle>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">{totalProducts}</div>
            <p className="text-xs text-slate-500 mt-1">Dalam {categories.length} kategori</p>
          </CardContent>
        </Card>

        {/* Low Stock */}
        <Card className="border border-orange-200 shadow-md hover:shadow-xl transition-shadow bg-white/80 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Stok Rendah</CardTitle>
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-700">{lowStockProducts}</div>
            <p className="text-xs text-slate-500 mt-1">Produk perlu restok</p>
          </CardContent>
        </Card>

        {/* Average Transaction */}
        <Card className="border border-emerald-200 shadow-md hover:shadow-xl transition-shadow bg-white/80 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Rata-rata Transaksi</CardTitle>
            <div className="p-2 bg-emerald-100 rounded-lg">
              <BarChart3 className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-700">
              {formatCurrency(totalTransactions > 0 ? totalRevenue / totalTransactions : 0)}
            </div>
            <p className="text-xs text-slate-500 mt-1">Per transaksi</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Monthly Revenue vs Margin Chart */}
        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Pendapatan & Margin Bulanan
            </CardTitle>
            <CardDescription>6 bulan terakhir</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#EC4899" stopOpacity={0.2}/>
                  </linearGradient>
                  <linearGradient id="colorMargin" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" stroke="#6B7280" />
                <YAxis stroke="#6B7280" tickFormatter={(value) => `${(value / 1000)}k`} />
                <Tooltip 
                  formatter={(value: any) => formatCurrency(Number(value))}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#8B5CF6" 
                  strokeWidth={3}
                  name="Pendapatan" 
                  fill="url(#colorRevenue)"
                  dot={{ fill: '#8B5CF6', r: 5 }}
                  activeDot={{ r: 7 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="margin" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  name="Margin" 
                  fill="url(#colorMargin)"
                  dot={{ fill: '#10B981', r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Transactions Chart */}
        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Jumlah Transaksi
            </CardTitle>
            <CardDescription>6 bulan terakhir</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.9}/>
                    {/* <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.7}/> */}
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="transactions" 
                  fill="url(#colorBar)" 
                  name="Transaksi" 
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Category Pie Chart */}
        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-xl bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent">
              Distribusi Produk
            </CardTitle>
            <CardDescription>Per kategori</CardDescription>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name} (${entry.value})`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any, name, entry: any) => `${entry.payload.name}: ${entry.payload.value} produk`}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-slate-400">
                <p>Belum ada data produk</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-xl bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
              Transaksi Terakhir
            </CardTitle>
            <CardDescription>5 transaksi terbaru</CardDescription>
          </CardHeader>
          <CardContent>
            {recentTransactions.length > 0 ? (
              <div className="space-y-3">
                {recentTransactions.map((transaction, index) => {
                  const transactionMargin = transaction.total - (transaction.total_purchase_price || 0)
                  const transactionMarginPercent = transaction.total > 0 
                    ? (transactionMargin / transaction.total) * 100 
                    : 0

                  return (
                    <div 
                      key={transaction.id} 
                      className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 hover:from-purple-50 hover:to-pink-50 transition-all border border-slate-200 hover:border-purple-300"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-lg ${
                          ['bg-purple-100', 'bg-blue-100', 'bg-emerald-100', 'bg-orange-100', 'bg-pink-100'][index % 5]
                        }`}>
                          <ShoppingCart className={`h-5 w-5 ${
                            ['text-purple-600', 'text-blue-600', 'text-emerald-600', 'text-orange-600', 'text-pink-600'][index % 5]
                          }`} />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-700 text-sm px-3 py-1 bg-white rounded-full inline-block border border-slate-200">
                            {transaction.payment_method.toUpperCase()}
                          </div>
                          <p className="text-xs text-slate-500 mt-1">{formatDate(transaction.created_at)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-slate-800">{formatCurrency(transaction.total)}</div>
                        <p className="text-xs text-emerald-600 font-semibold">
                          +{formatCurrency(transactionMargin)} ({transactionMarginPercent.toFixed(1)}%)
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-slate-400">
                <p>Belum ada transaksi</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}