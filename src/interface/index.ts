export interface Product {
  id: string
  name: string
  price: number
  purchase_price:number
  stock: number
  created_at: string
  categories_id: string

  categories: Categories
}

export interface Transaction {
  id: string
  total: number;
  total_purchase_price:number;
  payment_method: 'cash' | 'card' | 'qris'
  postage: number;
  created_at: string
}

export interface TransactionItem {
  id: string
  transaction_id: string
  product_id: string
  quantity: number
  price: number
  purchase_price:number
  created_at: string
}

export interface CartItem {
  product: Product
  quantity: number
}
export interface Categories {
  id:string
  name:string
  created_at: string
}