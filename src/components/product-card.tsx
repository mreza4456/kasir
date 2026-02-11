'use client'

import { Product } from '@/interface'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { Plus } from 'lucide-react'

interface ProductCardProps {
  product: Product
  onAddToCart: (product: Product) => void
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const isOutOfStock = product.stock <= 0

  return (
    <Card className={isOutOfStock ? 'opacity-50' : ''}>
      <CardContent className="">
        <div className="space-y-2">
          <h3 className="font-bold text-xl  ">{product.name}</h3>
          <p className="text-sm text-muted-foreground">{product.categories?.name || 'Tanpa Kategori'}</p>
          <div className="flex flex-col md:flex-row   justify-between">
            <p className="text-2xl font-bold text-slate-900">
              {formatCurrency(product.price)}
            </p>
            <p className={`text-sm ${isOutOfStock ? 'text-destructive' : 'text-muted-foreground'}`}>
              Stok: {product.stock}
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={() => onAddToCart(product)}
          disabled={isOutOfStock}
          className="w-full bg-[#19629f]"
        >
          <Plus className="mr-2 h-4 w-4" />
          {isOutOfStock ? 'Stok Habis' : 'Tambah'}
        </Button>
      </CardFooter>
    </Card>
  )
}