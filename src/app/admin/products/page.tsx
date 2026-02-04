"use client";
import { deleteProduct, getProducts } from "@/actions/products"
import { ProductDialog } from "@/components/product-dialog"
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
import { Product } from "@/interface"
import { Edit, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react"

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [showProductDialog, setShowProductDialog] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        loadProducts()
    }, [])

    const loadProducts = async () => {
        setLoading(true)
        try {
            const data = await getProducts()
            setProducts(data)
        } catch (error) {
            console.error('Failed to load products:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleAddProduct = () => {
        setSelectedProduct(null)
        setShowProductDialog(true)
    }

    const handleEditProduct = (product: Product) => {
        setSelectedProduct(product)
        setShowProductDialog(true)
    }

   const filteredProducts = products.filter(product =>
  product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
  product.categories?.name.toLowerCase().includes(searchQuery.toLowerCase())
)
    const handleProductDialogSuccess = () => {
        loadProducts()
    }

    const handleDeleteProduct = async (id: string) => {
        if (!confirm('Apakah Anda yakin ingin menghapus produk ini?')) return

        try {
            await deleteProduct(id)
            loadProducts()
        } catch (error) {
            console.error('Failed to delete product:', error)
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Cari produk atau kategori..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Button onClick={handleAddProduct}>
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah Produk
                </Button>
            </div>

            <ProductDialog
                open={showProductDialog}
                onOpenChange={setShowProductDialog}
                product={selectedProduct}
                onSuccess={handleProductDialogSuccess}
            />

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nama Produk</TableHead>
                            <TableHead>Kategori</TableHead>
                            <TableHead>Harga</TableHead>
                            <TableHead>Stok</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-12">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                                        <p className="text-sm text-muted-foreground">Memuat produk...</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredProducts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-12">
                                    <p className="text-muted-foreground">
                                        {searchQuery ? 'Produk tidak ditemukan' : 'Belum ada produk'}
                                    </p>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredProducts.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell className="font-medium">{product.name}</TableCell>
                                    <TableCell>{product.categories?.name || 'Tidak ada kategori'}</TableCell>
                                    <TableCell>
                                        {new Intl.NumberFormat('id-ID', {
                                            style: 'currency',
                                            currency: 'IDR',
                                            minimumFractionDigits: 0
                                        }).format(product.price || 0)}
                                    </TableCell>
                                    <TableCell>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            (product.stock || 0) > 10 
                                                ? 'bg-green-100 text-green-800' 
                                                : (product.stock || 0) > 0 
                                                ? 'bg-yellow-100 text-yellow-800' 
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {product.stock || 0}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8"
                                                onClick={() => handleEditProduct(product)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 text-destructive hover:text-destructive"
                                                onClick={() => handleDeleteProduct(product.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}