// components/invoice-dialog.tsx
"use client"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CartItem } from "@/interface"
import { Printer } from "lucide-react"
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
    postage?: number
}

export function InvoiceDialog({
    open,
    onOpenChange,
    items,
    transactionId,
    paymentMethod,
    total,
    paymentAmount = 0,
    change = 0,
    postage = 0
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
                               margin: 0;
                               padding: 20px;
                            }
                            .no-print { display: none; }
                        }
                        body {
                           font-family: system-ui, -apple-system, sans-serif;
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
            day: '2-digit',
            month: 'short',
            year: 'numeric'
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

    const subtotal = items.reduce((sum, item) => sum + (item.product?.price || 0) * (item.quantity || 0), 0)
    const tax = subtotal * 0.1 // 10% tax

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTitle>

            </DialogTitle>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
                <div ref={invoiceRef} className="bg-white p-12">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-8">
                        <img src="logo-gemilangnew.png" className="w-25 h-25" alt="" />
                        <div className="text-right">
                            <h1 className="text-4xl font-serif mb-2">Invoice</h1>
                            <p className="text-sm text-gray-600">Invoice No. {transactionId.substring(0, 5)}</p>
                            <p className="text-sm text-gray-600">{formatDate()}</p>
                        </div>
                    </div>

                    {/* From Section */}
                    <div className="mb-8">
                        <p className="text-xs text-gray-500 mb-2">From:</p>
                        <p className="font-semibold text-sm">Gemilang Abadi</p>
                        <p className="text-sm text-gray-600">+62 822 4597 1825</p>
                        <p className="text-sm text-gray-600">Perumahan Tambak Asri B-24, RT10/RW 02</p>
                        <p className="text-sm text-gray-600">Ds. Tambak Asri, Tajinan, Kab. Malang</p>
                    </div>

                    {/* Items Table */}
                    <div className="mb-8">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-300">
                                    <th className="text-left py-3 font-semibold">Item</th>
                                    <th className="text-center py-3 font-semibold">Quantity</th>
                                    <th className="text-right py-3 font-semibold">Unit Price</th>
                                    <th className="text-right py-3 font-semibold">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items && items.length > 0 ? (
                                    items.map((item, index) => (
                                        <tr key={index} className="border-b border-gray-200">
                                            <td className="py-3">{item.product?.name || 'Produk'}</td>
                                            <td className="py-3 text-center">{item.quantity || 0}</td>
                                            <td className="py-3 text-right">{formatCurrency(item.product?.price || 0)}</td>
                                            <td className="py-3 text-right font-medium">
                                                {formatCurrency((item.product?.price || 0) * (item.quantity || 0))}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="py-4 text-center text-gray-500">
                                            Tidak ada item
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Summary */}
                    <div className="flex justify-end mb-8">
                        <div className="w-64 space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="font-medium">{formatCurrency(subtotal)}</span>
                            </div>
                            {postage > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Ongkir</span>
                                    <span className="font-medium">{formatCurrency(postage)}</span>
                                </div>
                            )}
                            <div className="flex justify-between pt-2 border-t-2 border-gray-800">
                                <span className="font-bold">Total</span>
                                <span className="font-bold text-lg">{formatCurrency(total + postage)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Thank You */}
                    {/* <div className="text-center mb-8">
                        <p className="text-3xl font-serif italic text-gray-400">Thank You!</p>
                    </div> */}

                    {/* Payment Information */}
                    {/* <div className="grid grid-cols-2 gap-8 text-sm">
                        <div>
                            <p className="font-semibold mb-2">Payment Information</p>
                            <p className="text-gray-600">{getPaymentMethodLabel(paymentMethod)}</p>
                            {paymentMethod !== 'cash' && (
                                <>
                                    <p className="text-gray-600 mt-1">Account Name: Admin Toko</p>
                                    <p className="text-gray-600">Account No: {transactionId.substring(0, 14)}</p>
                                    <p className="text-gray-600">Pay by: {formatDate()}</p>
                                </>
                            )}
                            {paymentMethod === 'cash' && (
                                <div className="mt-2 space-y-1">
                                    <p className="text-gray-600">Dibayar: {formatCurrency(paymentAmount)}</p>
                                    <p className="text-green-600 font-semibold">Kembalian: {formatCurrency(change)}</p>
                                </div>
                            )}
                        </div>
                        <div className="text-right">
                            <div className="inline-block mb-12">
                                <div className="w-48 h-16 border-b-2 border-gray-800"></div>
                            </div>
                            <p className="font-semibold">Admin Toko</p>
                            <p className="text-gray-600">Perumahan Tambak Asri B-24, Tajinan</p>
                        </div>
                    </div> */}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 p-4 bg-gray-50 no-print border-t">
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