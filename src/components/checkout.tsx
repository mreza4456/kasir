// components/checkout.tsx (update)
"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { CartItem } from "@/interface"
import { createTransaction } from "@/actions/transaction"
import { CreditCard, Wallet, Smartphone } from "lucide-react"
import { toast } from "sonner"
import { InvoiceDialog } from "./invoice-dialog"

interface CheckoutDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    items: CartItem[]
    onSuccess: () => void
}

export function CheckoutDialog({ open, onOpenChange, items, onSuccess }: CheckoutDialogProps) {
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'qris'>('cash')
    const [cashAmount, setCashAmount] = useState('')
    const [loading, setLoading] = useState(false)
    const [showInvoice, setShowInvoice] = useState(false)
    const [transactionData, setTransactionData] = useState<{
        id: string
        total: number
        paymentAmount: number
        change: number
    } | null>(null)

    const total = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
    const change = paymentMethod === 'cash' ? Math.max(0, parseFloat(cashAmount || '0') - total) : 0

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (paymentMethod === 'cash' && parseFloat(cashAmount) < total) {
            toast.error('Jumlah uang tidak cukup!')
            return
        }

        setLoading(true)

        const result = await createTransaction(items, paymentMethod)

        if (result.error) {
            toast.error(result.error)
            setLoading(false)
            return
        }

        if (result.transaction) {
            // Save transaction data for invoice
            setTransactionData({
                id: result.transaction.id,
                total: total,
                paymentAmount: parseFloat(cashAmount || '0'),
                change: change
            })

            toast.success('Transaksi berhasil!')
            onOpenChange(false)
            onSuccess()
            
            // Show invoice after a short delay
            setTimeout(() => {
                setShowInvoice(true)
            }, 300)
        }

        setLoading(false)
        setCashAmount('')
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount)
    }

    const handleInvoiceClose = () => {
        setShowInvoice(false)
        setTransactionData(null)
    }

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Pembayaran</DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Order Summary */}
                        <div className="space-y-2">
                            <h3 className="font-semibold">Ringkasan Pesanan</h3>
                            <div className="bg-muted rounded-lg p-4 space-y-2">
                                {items.map((item) => (
                                    <div key={item.product.id} className="flex justify-between text-sm">
                                        <span>{item.product.name} x{item.quantity}</span>
                                        <span>{formatCurrency(item.product.price * item.quantity)}</span>
                                    </div>
                                ))}
                                <div className="border-t pt-2 mt-2 flex justify-between font-semibold">
                                    <span>Total</span>
                                    <span>{formatCurrency(total)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="space-y-3">
                            <Label>Metode Pembayaran</Label>
                            <RadioGroup value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                                <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-muted">
                                    <RadioGroupItem value="cash" id="cash" />
                                    <Label htmlFor="cash" className="flex items-center gap-2 cursor-pointer flex-1">
                                        <Wallet className="h-4 w-4" />
                                        <span>Tunai</span>
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-muted">
                                    <RadioGroupItem value="card" id="card" />
                                    <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer flex-1">
                                        <CreditCard className="h-4 w-4" />
                                        <span>Kartu Debit/Kredit</span>
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-muted">
                                    <RadioGroupItem value="qris" id="qris" />
                                    <Label htmlFor="qris" className="flex items-center gap-2 cursor-pointer flex-1">
                                        <Smartphone className="h-4 w-4" />
                                        <span>QRIS</span>
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>

                        {/* Cash Payment */}
                        {paymentMethod === 'cash' && (
                            <div className="space-y-3">
                                <div className="space-y-2">
                                    <Label htmlFor="cash-amount">Jumlah Uang</Label>
                                    <Input
                                        id="cash-amount"
                                        type="number"
                                        placeholder="0"
                                        value={cashAmount}
                                        onChange={(e) => setCashAmount(e.target.value)}
                                        required
                                    />
                                </div>
                                {cashAmount && parseFloat(cashAmount) >= total && (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-green-800">Kembalian:</span>
                                            <span className="font-semibold text-green-800">
                                                {formatCurrency(change)}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex gap-2 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                className="flex-1"
                                disabled={loading}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1"
                                disabled={loading}
                            >
                                {loading ? 'Memproses...' : 'Bayar'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Invoice Dialog */}
            {transactionData && (
                <InvoiceDialog
                    open={showInvoice}
                    onOpenChange={handleInvoiceClose}
                    items={items}
                    transactionId={transactionData.id}
                    paymentMethod={paymentMethod}
                    total={transactionData.total}
                    paymentAmount={transactionData.paymentAmount}
                    change={transactionData.change}
                />
            )}
        </>
    )
}