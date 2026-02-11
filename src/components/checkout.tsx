// components/checkout.tsx (DEBUG VERSION)
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
    // 🔍 DEBUG: Log items saat component render
    console.log('🔍 CheckoutDialog - Items received:', items)
    console.log('🔍 CheckoutDialog - Items count:', items?.length || 0)
    console.log('🔍 CheckoutDialog - Items detail:', JSON.stringify(items, null, 2))

    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'qris'>('cash')
    const [cashAmount, setCashAmount] = useState('')
    const [postage, setPostage] = useState('')
    const [loading, setLoading] = useState(false)
    const [showInvoice, setShowInvoice] = useState(false)
    const [transactionData, setTransactionData] = useState<{
        id: string
        items: CartItem[] // 🔥 SIMPAN ITEMS DI SINI!
        total: number
        postage: number
        paymentAmount: number
        change: number
    } | null>(null)

    const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
    const postageAmount = parseFloat(postage || '0')
    const total = subtotal + postageAmount
    const cashAmountNum = parseFloat(cashAmount || '0')
    const change = paymentMethod === 'cash' ? Math.max(0, cashAmountNum - total) : 0

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        console.log('🔍 Submitting checkout with items:', items)

        if (paymentMethod === 'cash' && cashAmountNum < total) {
            toast.error('Jumlah uang tidak cukup!')
            return
        }

        setLoading(true)

        try {
            const result = await createTransaction(items, paymentMethod, postageAmount)

            console.log('🔍 Transaction result:', result)

            if (result.error) {
                toast.error(result.error)
                setLoading(false)
                return
            }

            if (result.transaction) {
                // 🔥 SIMPAN ITEMS BERSAMA TRANSACTION DATA
                const txData = {
                    id: result.transaction.id,
                    items: items, // 🔥 SIMPAN ITEMS!
                    total: subtotal,
                    postage: postageAmount,
                    paymentAmount: cashAmountNum,
                    change: change
                }

                console.log('🔍 Setting transaction data:', txData)
                setTransactionData(txData)

                toast.success('Transaksi berhasil!')
                
                onOpenChange(false)
                onSuccess()
                
                // Tampilkan invoice
                setTimeout(() => {
                    console.log('🔍 Opening invoice with items:', items)
                    setShowInvoice(true)
                }, 300)

                setCashAmount('')
                setPostage('')
            }
        } catch (error) {
            console.error('❌ Checkout error:', error)
            toast.error('Terjadi kesalahan saat checkout')
        } finally {
            setLoading(false)
        }
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

    // 🔍 DEBUG: Log saat invoice dialog dibuka
    console.log('🔍 showInvoice:', showInvoice)
    console.log('🔍 transactionData:', transactionData)
    console.log('🔍 transactionData?.items:', transactionData?.items)

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Pembayaran</DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Order Summary */}
                        <div className="space-y-2">
                            <h3 className="font-semibold">Ringkasan Pesanan ({items.length} item)</h3>
                            <div className="bg-muted rounded-lg p-4 space-y-2">
                                {items.map((item) => (
                                    <div key={item.product.id} className="flex justify-between text-sm">
                                        <span className="flex-1 truncate pr-2">
                                            {item.product.name} <span className="text-muted-foreground">x{item.quantity}</span>
                                        </span>
                                        <span className="font-medium whitespace-nowrap">
                                            {formatCurrency(item.product.price * item.quantity)}
                                        </span>
                                    </div>
                                ))}
                                <div className="border-t pt-2 mt-2 space-y-1">
                                    <div className="flex justify-between text-sm">
                                        <span>Subtotal</span>
                                        <span className="font-medium">{formatCurrency(subtotal)}</span>
                                    </div>
                                    {postageAmount > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span>Ongkir</span>
                                            <span className="font-medium">{formatCurrency(postageAmount)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between font-bold text-base mt-2 pt-2 border-t">
                                        <span>Total</span>
                                        <span className="text-primary">{formatCurrency(total)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Postage Input */}
                        <div className="space-y-2">
                            <Label htmlFor="postage">Ongkir (Opsional)</Label>
                            <Input
                                id="postage"
                                type="number"
                                placeholder="0"
                                value={postage}
                                onChange={(e) => setPostage(e.target.value)}
                                min="0"
                                step="1000"
                            />
                        </div>

                        {/* Payment Method */}
                        <div className="space-y-3">
                            <Label>Metode Pembayaran</Label>
                            <RadioGroup value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                                <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-muted transition-colors">
                                    <RadioGroupItem value="cash" id="cash" />
                                    <Label htmlFor="cash" className="flex items-center gap-2 cursor-pointer flex-1">
                                        <Wallet className="h-4 w-4" />
                                        <span>Tunai</span>
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-muted transition-colors">
                                    <RadioGroupItem value="card" id="card" />
                                    <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer flex-1">
                                        <CreditCard className="h-4 w-4" />
                                        <span>Kartu Debit/Kredit</span>
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-muted transition-colors">
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
                                        placeholder={`Minimal ${formatCurrency(total)}`}
                                        value={cashAmount}
                                        onChange={(e) => setCashAmount(e.target.value)}
                                        required
                                        min={total}
                                        step="1000"
                                    />
                                </div>
                                {cashAmountNum > 0 && cashAmountNum >= total && (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-green-800 font-medium">Kembalian:</span>
                                            <span className="font-bold text-green-800">
                                                {formatCurrency(change)}
                                            </span>
                                        </div>
                                    </div>
                                )}
                                {cashAmountNum > 0 && cashAmountNum < total && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-red-800 font-medium">Kurang:</span>
                                            <span className="font-bold text-red-800">
                                                {formatCurrency(total - cashAmountNum)}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Action Buttons */}
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
                                disabled={loading || (paymentMethod === 'cash' && cashAmountNum < total)}
                            >
                                {loading ? 'Memproses...' : 'Bayar Sekarang'}
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
                    items={transactionData.items} // 🔥 GUNAKAN ITEMS DARI transactionData!
                    transactionId={transactionData.id}
                    paymentMethod={paymentMethod}
                    total={transactionData.total}
                    postage={transactionData.postage}
                    paymentAmount={transactionData.paymentAmount}
                    change={transactionData.change}
                />
            )}
        </>
    )
}