// components/invoice-dialog.tsx
"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { CartItem } from "@/interface"
import { Download, Printer, X } from "lucide-react"
import { useRef } from "react"

interface InvoiceDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    items: CartItem[]
    transactionId: string
    paymentMethod: string
    total: number
    paymentAmount?: number
    change?: number
}

export function InvoiceDialog({
    open,
    onOpenChange,
    items,
    transactionId,
    paymentMethod,
    total,
    paymentAmount = 0,
    change = 0
}: InvoiceDialogProps) {
    const invoiceRef = useRef<HTMLDivElement>(null)

    const handlePrint = () => {
        const printContent = invoiceRef.current
        if (!printContent) return

        const originalContents = document.body.innerHTML
        const printContents = printContent.innerHTML

        document.body.innerHTML = `
            <html>
                <head>
                    <title>Invoice</title>
                    <style>
                        @media print {
                            body {
                                font-family: 'Courier New', monospace;
                                padding: 20px;
                                max-width: 300px;
                                margin: 0 auto;
                            }
                            .no-print { display: none; }
                        }
                        body {
                            font-family: 'Courier New', monospace;
                            padding: 20px;
                            max-width: 300px;
                            margin: 0 auto;
                        }
                    </style>
                </head>
                <body>
                    ${printContents}
                </body>
            </html>
        `

        window.print()
        document.body.innerHTML = originalContents
        window.location.reload()
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount)
    }

    const formatDate = () => {
        return new Intl.DateTimeFormat('id-ID', {
            dateStyle: 'medium',
            timeStyle: 'short'
        }).format(new Date())
    }

    const getPaymentMethodLabel = (method: string) => {
        const labels: Record<string, string> = {
            cash: 'Tunai',
            card: 'Kartu Debit/Kredit',
            qris: 'QRIS'
        }
        return labels[method] || method
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader className="no-print">
                    <DialogTitle className="flex items-center justify-between">
                        <span>Invoice Pembayaran</span>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onOpenChange(false)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </DialogTitle>
                </DialogHeader>

                {/* Invoice Content */}
                <div ref={invoiceRef} className="space-y-4 p-4 bg-white">
                    {/* Header */}
                    <div className="text-center space-y-1">
                        <h2 className="text-xl font-bold">TOKO SAYA</h2>
                        <p className="text-xs text-muted-foreground">
                            Jl. Contoh No. 123, Malang
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Telp: 0341-123456
                        </p>
                    </div>

                    <Separator />

                    {/* Transaction Info */}
                    <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">No. Invoice:</span>
                            <span className="font-mono font-medium">
                                {transactionId.substring(0, 8).toUpperCase()}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Tanggal:</span>
                            <span>{formatDate()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Kasir:</span>
                            <span>Admin</span>
                        </div>
                    </div>

                    <Separator />

                    {/* Items */}
                    <div className="space-y-2">
                        <h3 className="font-semibold text-sm">Detail Pembelian</h3>
                        {items.map((item, index) => (
                            <div key={index} className="space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium">{item.product.name}</span>
                                    <span>{formatCurrency(item.product.price * item.quantity)}</span>
                                </div>
                                <div className="flex justify-between text-xs text-muted-foreground pl-4">
                                    <span>
                                        {item.quantity} x {formatCurrency(item.product.price)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <Separator />

                    {/* Summary */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Subtotal:</span>
                            <span>{formatCurrency(total)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>Pajak (0%):</span>
                            <span>{formatCurrency(0)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between text-base font-bold">
                            <span>Total:</span>
                            <span>{formatCurrency(total)}</span>
                        </div>
                    </div>

                    <Separator />

                    {/* Payment Info */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Metode Pembayaran:</span>
                            <span className="font-medium">{getPaymentMethodLabel(paymentMethod)}</span>
                        </div>
                        {paymentMethod === 'cash' && (
                            <>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Dibayar:</span>
                                    <span>{formatCurrency(paymentAmount)}</span>
                                </div>
                                <div className="flex justify-between text-sm font-semibold">
                                    <span>Kembalian:</span>
                                    <span className="text-green-600">{formatCurrency(change)}</span>
                                </div>
                            </>
                        )}
                    </div>

                    <Separator />

                    {/* Footer */}
                    <div className="text-center space-y-2 text-xs text-muted-foreground">
                        <p>Terima kasih atas kunjungan Anda!</p>
                        <p>Barang yang sudah dibeli tidak dapat ditukar/dikembalikan</p>
                        <p className="font-mono text-[10px]">{new Date().toISOString()}</p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4 no-print">
                    <Button
                        variant="outline"
                        className="flex-1"
                        onClick={handlePrint}
                    >
                        <Printer className="mr-2 h-4 w-4" />
                        Print
                    </Button>
                    <Button
                        className="flex-1"
                        onClick={() => onOpenChange(false)}
                    >
                        Selesai
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}