'use server'

import { createClient, getAuthenticatedUser } from '@/lib/supabase-server'
import { Transaction, CartItem } from '@/interface/'
import { revalidatePath } from 'next/cache'

export async function createTransaction(
    cartItems: CartItem[],
    paymentMethod: 'cash' | 'card' | 'qris'
) {
    const total = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
    const user = await getAuthenticatedUser();
    const supabase = await createClient();
    // Create transaction
    const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .insert([{ total, payment_method: paymentMethod }])
        .select()
        .single()

    if (transactionError) {
        console.error('Error creating transaction:', transactionError)
        return { error: transactionError.message }
    }

    // Create transaction items
    const transactionItems = cartItems.map(item => ({
        transaction_id: transaction.id,
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.product.price
    }))

    const { error: itemsError } = await supabase
        .from('transaction_items')
        .insert(transactionItems)

    if (itemsError) {
        console.error('Error creating transaction items:', itemsError)
        return { error: itemsError.message }
    }

    // Update stock for each product
    for (const item of cartItems) {
        const { error: stockError } = await supabase.rpc('decrease_stock', {
            product_id: item.product.id,
            decrease_amount: item.quantity
        })

        if (stockError) {
            console.error('Error updating stock:', stockError)
            return { error: stockError.message }
        }
    }

    revalidatePath('/')
    return { success: true, transaction }
}

export async function getTransactions(): Promise<Transaction[]> {
    const user = await getAuthenticatedUser();
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

    if (error) {
        console.error('Error fetching transactions:', error)
        return []
    }

    return data || []
}

export async function getTransactionDetails(transactionId: string) {
    const user = await getAuthenticatedUser();
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('transaction_items')
        .select(`
      *,
      products (*)
    `)
        .eq('transaction_id', transactionId)

    if (error) {
        console.error('Error fetching transaction details:', error)
        return []
    }

    return data || []
}