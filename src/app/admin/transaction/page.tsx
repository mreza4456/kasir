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
import { Badge } from "@/components/ui/badge";
import { Transaction } from "@/interface"
import { Eye, Search, Download } from "lucide-react";
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
        return (
            transaction.id.toLowerCase().includes(searchLower) ||
            transaction.payment_method.toLowerCase().includes(searchLower)
        )
    })

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

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Transaksi</h1>
                <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                </Button>
            </div>

            <div className="flex justify-between items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Cari ID transaksi atau metode pembayaran..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID Transaksi</TableHead>
                            <TableHead>Tanggal & Waktu</TableHead>
                            <TableHead>Metode Pembayaran</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-12">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                                        <p className="text-sm text-muted-foreground">Memuat transaksi...</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredTransactions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-12">
                                    <p className="text-muted-foreground">
                                        {searchQuery ? 'Transaksi tidak ditemukan' : 'Belum ada transaksi'}
                                    </p>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredTransactions.map((transaction) => (
                                <TableRow key={transaction.id}>
                                    <TableCell className="font-mono text-sm">
                                        {transaction.id.substring(0, 8)}...
                                    </TableCell>
                                    <TableCell>
                                        {formatDate(transaction.created_at)}
                                    </TableCell>
                                    <TableCell>
                                        {getPaymentMethodBadge(transaction.payment_method)}
                                    </TableCell>
                                    <TableCell className="font-semibold">
                                        {formatCurrency(transaction.total)}
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

            {/* Detail Dialog */}
            <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Detail Transaksi</DialogTitle>
                        <DialogDescription>
                            ID: {selectedTransaction?.id}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedTransaction && (
                        <div className="space-y-6">
                            {/* Transaction Info */}
                            <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                                <div>
                                    <p className="text-sm text-muted-foreground">Tanggal & Waktu</p>
                                    <p className="font-medium">{formatDate(selectedTransaction.created_at)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Metode Pembayaran</p>
                                    <div className="mt-1">
                                        {getPaymentMethodBadge(selectedTransaction.payment_method)}
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-sm text-muted-foreground">Total Pembayaran</p>
                                    <p className="text-2xl font-bold text-primary">
                                        {formatCurrency(selectedTransaction.total)}
                                    </p>
                                </div>
                            </div>

                            {/* Items Table */}
                            <div>
                                <h3 className="font-semibold mb-3">Item Transaksi</h3>
                                {loadingDetails ? (
                                    <div className="text-center py-8">
                                        <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
                                    </div>
                                ) : (
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
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}