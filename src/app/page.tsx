'use client'

import React, { useState, useEffect } from 'react'
import { Product, CartItem } from '@/interface'
import { ProductCard } from '@/components/product-card'
import { Cart } from '@/components/carts'
import { CheckoutDialog } from '@/components/checkout'
import { ProductDialog } from '@/components/product-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getProducts, deleteProduct } from '@/actions/products'
import { Package, Search, Plus, Trash2, Edit, Loader2, LogOut } from 'lucide-react'
import { toast } from 'sonner'
import { logoutAction } from '@/actions/user'

export default function CashierPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showCheckout, setShowCheckout] = useState(false)
  const [showProductDialog, setShowProductDialog] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  const [isLoggingOut, setIsLoggingOut] = React.useState(false)
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      await logoutAction()
    } catch (error) {
      console.error("Error logging out:", error)
    } finally {
      setIsLoggingOut(false)
    }
  }


  const loadProducts = async () => {
    setLoading(true)
    const data = await getProducts()
    setProducts(data)
    setLoading(false)
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (product.categories?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.product.id === product.id)

    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        toast('Stok tidak mencukupi!')
        return
      }
      setCart(cart.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setCart([...cart, { product, quantity: 1 }])
    }
  }

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId)
      return
    }

    setCart(cart.map(item =>
      item.product.id === productId
        ? { ...item, quantity: newQuantity }
        : item
    ))
  }

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId))
  }

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast('Keranjang masih kosong!')
      return
    }
    setShowCheckout(true)
  }

  const handleCheckoutSuccess = () => {
    setCart([])
    loadProducts()
  }

  const handleAddProduct = () => {
    setSelectedProduct(null)
    setShowProductDialog(true)
  }

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product)
    setShowProductDialog(true)
  }

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus produk ini?')) return

    await deleteProduct(id)
    loadProducts()
  }



  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between ">
            <div className="flex items-center">
             <img className='h-10' src="/logo-horizontal.png" alt="" />
            </div>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center space-x-2 px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
            >
              {isLoggingOut ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogOut className="w-4 h-4" />
              )}
              <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
            </button>

          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products Section */}
          <div className="lg:col-span-2 space-y-4">
            <div className="relative">
              <Search className="absolute right-5 top-1/2 transform -translate-y-1/2 h-6 w-6 text-muted-foreground " />
              <Input
                placeholder="Cari produk atau kategori..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 p-7"
              />
            </div>

            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Memuat produk...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {searchQuery ? 'Produk tidak ditemukan' : 'Belum ada produk'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="relative group">
                    <ProductCard product={product} onAddToCart={addToCart} />
                   
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart Section */}
          <div className="lg:sticky lg:top-24 h-fit">
            <Cart
              items={cart}
              onUpdateQuantity={updateQuantity}
              onRemoveItem={removeFromCart}
              onCheckout={handleCheckout}
            />
          </div>
        </div>
      </div>

      {/* Checkout Dialog */}
      <CheckoutDialog
        open={showCheckout}
        onOpenChange={setShowCheckout}
        items={cart}
        onSuccess={handleCheckoutSuccess}
      />

      {/* Product Dialog */}

    </div>
  )
}