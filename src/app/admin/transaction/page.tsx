"use client";
import { getTransactions, getTransactionDetails } from "@/actions/transaction"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Transaction } from "@/interface"
import { Eye, Search, Download, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { useEffect, useState } from "react"

interface TransactionItem {
    id: string;
    transaction_id: string;
    product_id: string;
    quantity: number;
    price: number;
    products: {
        id: string;
        name: string;
        category: string;
    };
}

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [showDetailDialog, setShowDetailDialog] = useState(false)
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
    const [transactionItems, setTransactionItems] = useState<TransactionItem[]>([])
    const [loadingDetails, setLoadingDetails] = useState(false)
    
    // Pagination states
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)
    
    // Date filter states
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')

    useEffect(() => {
        loadTransactions()
    }, [])

    const loadTransactions = async () => {
        setLoading(true)
        try {
            const data = await getTransactions()
            setTransactions(data)
        } catch (error) {
            console.error('Failed to load transactions:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleViewDetails = async (transaction: Transaction) => {
        setSelectedTransaction(transaction)
        setShowDetailDialog(true)
        setLoadingDetails(true)
        
        try {
            const items = await getTransactionDetails(transaction.id)
            setTransactionItems(items as TransactionItem[])
        } catch (error) {
            console.error('Failed to load transaction details:', error)
        } finally {
            setLoadingDetails(false)
        }
    }

    const filteredTransactions = transactions.filter(transaction => {
        const searchLower = searchQuery.toLowerCase()
        const matchesSearch = 
            transaction.id.toLowerCase().includes(searchLower) ||
            transaction.payment_method.toLowerCase().includes(searchLower)
        
        // Date filtering
        const transactionDate = new Date(transaction.created_at)
        const matchesStartDate = !startDate || transactionDate >= new Date(startDate)
        const matchesEndDate = !endDate || transactionDate <= new Date(endDate + 'T23:59:59')
        
        return matchesSearch && matchesStartDate && matchesEndDate
    })

    // Pagination calculations
    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex)

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1)
    }, [searchQuery, startDate, endDate, itemsPerPage])

    const getPaymentMethodBadge = (method: string) => {
        const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
            cash: { variant: "default", label: "Tunai" },
            card: { variant: "secondary", label: "Kartu" },
            qris: { variant: "outline", label: "QRIS" }
        }
        const config = variants[method] || { variant: "default" as const, label: method }
        return <Badge variant={config.variant}>{config.label}</Badge>
    }

    const formatDate = (dateString: string) => {
        return new Intl.DateTimeFormat('id-ID', {
            dateStyle: 'medium',
            timeStyle: 'short'
        }).format(new Date(dateString))
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount)
    }

    const handleExport = () => {
        // TODO: Implement export functionality
        console.log('Exporting transactions...')
    }

    const clearDateFilters = () => {
        setStartDate('')
        setEndDate('')
    }

    return (
        <div className="space-y-4 p-4 md:p-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-bold">Transaksi</h1>
                <Button variant="outline" size="sm" onClick={handleExport} className="w-full sm:w-auto">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                </Button>
            </div>

            {/* Filters Section */}
            <div className="space-y-3">
                {/* Search Bar */}
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Cari ID transaksi atau metode pembayaran..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>

                {/* Date Filters */}
                <div className="flex flex-col sm:flex-row gap-2">
                    <div className="flex-1 space-y-1">
                        <label className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Dari Tanggal
                        </label>
                        <Input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full"
                        />
                    </div>
                    <div className="flex-1 space-y-1">
                        <label className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Sampai Tanggal
                        </label>
                        <Input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full"
                        />
                    </div>
                    {(startDate || endDate) && (
                        <div className="flex items-end">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={clearDateFilters}
                                className="w-full sm:w-auto"
                            >
                                Reset Filter
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID Transaksi</TableHead>
                            <TableHead>Tanggal & Waktu</TableHead>
                            <TableHead>Metode</TableHead>
                            <TableHead>Total Jual</TableHead>
                            <TableHead>Total Beli</TableHead>
                            <TableHead>Margin</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-12">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                                        <p className="text-sm text-muted-foreground">Memuat transaksi...</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : paginatedTransactions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-12">
                                    <p className="text-muted-foreground">
                                        {searchQuery || startDate || endDate ? 'Transaksi tidak ditemukan' : 'Belum ada transaksi'}
                                    </p>
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedTransactions.map((transaction) => (
                                <TableRow key={transaction.id}>
                                    <TableCell className="font-mono text-sm">
                                        {transaction.id.substring(0, 8)}...
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap">
                                        {formatDate(transaction.created_at)}
                                    </TableCell>
                                    <TableCell>
                                        {getPaymentMethodBadge(transaction.payment_method)}
                                    </TableCell>
                                    <TableCell className="font-semibold">
                                        {formatCurrency(transaction.total)}
                                    </TableCell>
                                    <TableCell className="font-semibold">
                                        {formatCurrency(transaction.total_purchase_price)}
                                    </TableCell>
                                    <TableCell className="font-semibold text-green-600">
                                        {formatCurrency(transaction.total - transaction.total_purchase_price)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleViewDetails(transaction)}
                                        >
                                            <Eye className="h-4 w-4 mr-2" />
                                            Detail
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-3">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-12 border rounded-lg">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                        <p className="text-sm text-muted-foreground mt-2">Memuat transaksi...</p>
                    </div>
                ) : paginatedTransactions.length === 0 ? (
                    <div className="text-center py-12 border rounded-lg">
                        <p className="text-muted-foreground">
                            {searchQuery || startDate || endDate ? 'Transaksi tidak ditemukan' : 'Belum ada transaksi'}
                        </p>
                    </div>
                ) : (
                    paginatedTransactions.map((transaction) => (
                        <div key={transaction.id} className="border rounded-lg p-4 space-y-3">
                            <div className="flex justify-between items-start gap-2">
                                <div className="flex-1 min-w-0">
                                    <p className="font-mono text-xs text-muted-foreground truncate">
                                        {transaction.id}
                                    </p>
                                    <p className="text-sm mt-1">{formatDate(transaction.created_at)}</p>
                                </div>
                                {getPaymentMethodBadge(transaction.payment_method)}
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">Total Jual</p>
                                    <p className="font-semibold">{formatCurrency(transaction.total)}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">Total Beli</p>
                                    <p className="font-semibold">{formatCurrency(transaction.total_purchase_price)}</p>
                                </div>
                                <div className="col-span-2 space-y-1">
                                    <p className="text-xs text-muted-foreground">Margin</p>
                                    <p className="font-bold text-green-600">
                                        {formatCurrency(transaction.total - transaction.total_purchase_price)}
                                    </p>
                                </div>
                            </div>

                            <Button
                                size="sm"
                                variant="outline"
                                className="w-full"
                                onClick={() => handleViewDetails(transaction)}
                            >
                                <Eye className="h-4 w-4 mr-2" />
                                Lihat Detail
                            </Button>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            {!loading && filteredTransactions.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <span className="text-sm text-muted-foreground whitespace-nowrap">Baris per halaman:</span>
                        <Select
                            value={itemsPerPage.toString()}
                            onValueChange={(value) => setItemsPerPage(Number(value))}
                        >
                            <SelectTrigger className="w-20">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="5">5</SelectItem>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="20">20</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                            {startIndex + 1}-{Math.min(endIndex, filteredTransactions.length)} dari {filteredTransactions.length}
                        </span>
                        <div className="flex gap-1">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Detail Dialog */}
            <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
                <DialogContent className="max-w-4xl max-h-[90vh] p-0">
                    <div className="p-6 space-y-4">
                        <DialogHeader>
                            <DialogTitle>Detail Transaksi</DialogTitle>
                            <DialogDescription className="font-mono text-xs">
                                ID: {selectedTransaction?.id}
                            </DialogDescription>
                        </DialogHeader>

                        {selectedTransaction && (
                            <div className="space-y-4">
                                {/* Transaction Info */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-muted rounded-lg">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Tanggal & Waktu</p>
                                        <p className="font-medium text-sm">{formatDate(selectedTransaction.created_at)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Metode Pembayaran</p>
                                        <div className="mt-1">
                                            {getPaymentMethodBadge(selectedTransaction.payment_method)}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Total Harga Jual</p>
                                        <p className="text-lg sm:text-xl font-bold text-primary">
                                            {formatCurrency(selectedTransaction.total)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Total Harga Beli</p>
                                        <p className="text-lg sm:text-xl font-bold text-orange-600">
                                            {formatCurrency(selectedTransaction.total_purchase_price)}
                                        </p>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <p className="text-xs text-muted-foreground">Margin</p>
                                        <p className="text-lg sm:text-xl font-bold text-green-600">
                                            {formatCurrency(selectedTransaction.total - selectedTransaction.total_purchase_price)}
                                        </p>
                                    </div>
                                </div>

                                {/* Items - Desktop Table */}
                                <div className="hidden md:block">
                                    <h3 className="font-semibold mb-3">Item Transaksi</h3>
                                    {loadingDetails ? (
                                        <div className="text-center py-8">
                                            <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
                                        </div>
                                    ) : (
                                        <div className="border rounded-lg">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Produk</TableHead>
                                                        <TableHead>Kategori</TableHead>
                                                        <TableHead className="text-center">Qty</TableHead>
                                                        <TableHead className="text-right">Harga</TableHead>
                                                        <TableHead className="text-right">Subtotal</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {transactionItems.map((item) => (
                                                        <TableRow key={item.id}>
                                                            <TableCell className="font-medium">
                                                                {item.products.name}
                                                            </TableCell>
                                                            <TableCell>{item.products.category}</TableCell>
                                                            <TableCell className="text-center">
                                                                {item.quantity}
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                {formatCurrency(item.price)}
                                                            </TableCell>
                                                            <TableCell className="text-right font-semibold">
                                                                {formatCurrency(item.price * item.quantity)}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    )}
                                </div>

                                {/* Items - Mobile Cards */}
                                <div className="md:hidden">
                                    <h3 className="font-semibold mb-3">Item Transaksi</h3>
                                    {loadingDetails ? (
                                        <div className="text-center py-8">
                                            <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {transactionItems.map((item) => (
                                                <div key={item.id} className="border rounded-lg p-3 space-y-2">
                                                    <div className="flex justify-between items-start gap-2">
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-medium text-sm">{item.products.name}</p>
                                                            <p className="text-xs text-muted-foreground">{item.products.category}</p>
                                                        </div>
                                                        <Badge variant="outline" className="whitespace-nowrap">
                                                            {item.quantity}x
                                                        </Badge>
                                                    </div>
                                                    <div className="flex justify-between items-center text-sm pt-2 border-t">
                                                        <span className="text-muted-foreground">@ {formatCurrency(item.price)}</span>
                                                        <span className="font-semibold">{formatCurrency(item.price * item.quantity)}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}