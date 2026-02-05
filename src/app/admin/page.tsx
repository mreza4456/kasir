"use client";
import { getTransactions } from "@/actions/transaction"
import { getProducts } from "@/actions/products"
import { getCategories } from "@/actions/categories"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Transaction, Product, Categories } from "@/interface"
import { 
    ShoppingCart, 
    Package, 
    TrendingUp, 
    DollarSign,
    Percent
} from "lucide-react"
import { useEffect, useState } from "react"
import { 
    LineChart, 
    Line, 
    BarChart,
    Bar,
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    Legend, 
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from "recharts"

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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ffc658', '#ff7c7c']

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
            
            // Process monthly data
            processMonthlyData(transactionsData)
            
            // Process category data
            processCategoryData(productsData)
        } catch (error) {
            console.error('Failed to load dashboard data:', error)
        } finally {
            setLoading(false)
        }
    }

    const processMonthlyData = (transactions: Transaction[]) => {
        const monthlyMap = new Map<string, { total: number; count: number; totalPurchasePrice: number }>()
        
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
            .slice(-6) // Last 6 months
            .map(([key, value]) => {
                const date = new Date(key + '-01')
                const margin = value.total - value.totalPurchasePrice
                return {
                    month: new Intl.DateTimeFormat('id-ID', { 
                        month: 'short',
                        year: '2-digit'
                    }).format(date),
                    total: value.total,
                    transactions: value.count,
                    totalPurchasePrice: value.totalPurchasePrice,
                    margin: margin
                }
            })

        setMonthlyData(data)
    }

    const processCategoryData = (products: Product[]) => {
        const categoryMap = new Map<string, number>()
        
        products.forEach(product => {
            // Gunakan nama kategori dari relasi, atau fallback ke 'Tanpa Kategori'
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
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-2">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <p className="text-sm text-muted-foreground">Memuat dashboard...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground">Ringkasan bisnis Anda</p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Pendapatan
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
                        <p className="text-xs text-muted-foreground">
                            Dari {totalTransactions} transaksi
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Modal
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalPurchasePrice)}</div>
                        <p className="text-xs text-muted-foreground">
                            Harga beli produk terjual
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Margin
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{formatCurrency(totalMargin)}</div>
                        <p className="text-xs text-muted-foreground">
                            Keuntungan bersih
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Margin %
                        </CardTitle>
                        <Percent className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{marginPercentage.toFixed(1)}%</div>
                        <p className="text-xs text-muted-foreground">
                            Persentase keuntungan
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Secondary Stats */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Transaksi
                        </CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalTransactions}</div>
                        <p className="text-xs text-muted-foreground">
                            {monthlyData.length > 0 && `${monthlyData[monthlyData.length - 1].transactions} bulan ini`}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Produk
                        </CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalProducts}</div>
                        <p className="text-xs text-muted-foreground">
                            Dalam {categories.length} kategori
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Stok Rendah
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{lowStockProducts}</div>
                        <p className="text-xs text-muted-foreground">
                            Produk perlu restok
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Rata-rata Transaksi
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(totalTransactions > 0 ? totalRevenue / totalTransactions : 0)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Per transaksi
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-4 md:grid-cols-2">
                {/* Monthly Revenue vs Margin Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Pendapatan & Margin Bulanan</CardTitle>
                        <CardDescription>6 bulan terakhir</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis 
                                    dataKey="month" 
                                    style={{ fontSize: '12px' }}
                                />
                                <YAxis 
                                    style={{ fontSize: '12px' }}
                                    tickFormatter={(value) => `${(value / 1000)}k`}
                                />
                                <Tooltip 
                                    formatter={(value: any) => formatCurrency(Number(value))}
                                />
                                <Legend />
                                <Line 
                                    type="monotone" 
                                    dataKey="total" 
                                    stroke="#8884d8" 
                                    strokeWidth={2}
                                    name="Pendapatan"
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="margin" 
                                    stroke="#10b981" 
                                    strokeWidth={2}
                                    name="Margin"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Monthly Transactions Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Jumlah Transaksi</CardTitle>
                        <CardDescription>6 bulan terakhir</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis 
                                    dataKey="month" 
                                    style={{ fontSize: '12px' }}
                                />
                                <YAxis style={{ fontSize: '12px' }} />
                                <Tooltip />
                                <Legend />
                                <Bar 
                                    dataKey="transactions" 
                                    fill="#82ca9d" 
                                    name="Transaksi"
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            <h2 className="text-sm font-medium text-muted-foreground">Distribusi Produk & Transaksi Terakhir</h2>
            <div className="grid gap-4 md:grid-cols-2">
                {/* Category Pie Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Distribusi Produk</CardTitle>
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
                                        label={(entry: any) => `${entry.name} (${entry.value})`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend 
                                        verticalAlign="bottom" 
                                        height={36}
                                        formatter={(value, entry: any) => `${entry.payload.name}: ${entry.payload.value} produk`}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-[300px]">
                                <p className="text-muted-foreground">Belum ada data produk</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Transactions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Transaksi Terakhir</CardTitle>
                        <CardDescription>5 transaksi terbaru</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {recentTransactions.length > 0 ? (
                            <div className="space-y-4">
                                {recentTransactions.map((transaction) => {
                                    const transactionMargin = transaction.total - (transaction.total_purchase_price || 0)
                                    const transactionMarginPercent = transaction.total > 0 
                                        ? (transactionMargin / transaction.total) * 100 
                                        : 0
                                    
                                    return (
                                        <div key={transaction.id} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <ShoppingCart className="h-5 w-5 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">
                                                        {transaction.payment_method.toUpperCase()}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {formatDate(transaction.created_at)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-semibold">
                                                    {formatCurrency(transaction.total)}
                                                </p>
                                                <p className="text-xs text-green-600 font-medium">
                                                    +{formatCurrency(transactionMargin)} ({transactionMarginPercent.toFixed(1)}%)
                                                </p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-[300px]">
                                <p className="text-muted-foreground">Belum ada transaksi</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}