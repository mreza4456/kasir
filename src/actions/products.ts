// @/actions/products.ts
'use server'

import { createClient, getAuthenticatedUser } from '@/lib/supabase-server'
import { Product } from '@/interface'
import { revalidatePath } from 'next/cache'

export async function getProducts(): Promise<Product[]> {
    const user = await getAuthenticatedUser();
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('products')
        .select(`
      *,
      categories (
        id,
        name
      )
    `)
        .order('name', { ascending: true })

    if (error) {
        console.error('Error fetching products:', error)
        return []
    }

    return data || []
}

export async function createProduct(formData: FormData) {
    const name = formData.get('name') as string
    const price = parseFloat(formData.get('price') as string)
    const stock = parseInt(formData.get('stock') as string)
    const categories_id = formData.get('categories_id') as string
    const user = await getAuthenticatedUser();
    const supabase = await createClient();
    const { error } = await supabase
        .from('products')
        .insert([{ name, price, stock, categories_id }])

    if (error) {
        console.error('Error creating product:', error)
        return { error: error.message }
    }

    revalidatePath('/')
    return { success: true }
}

export async function updateProduct(id: string, formData: FormData) {
    const name = formData.get('name') as string
    const price = parseFloat(formData.get('price') as string)
    const stock = parseInt(formData.get('stock') as string)
    const categories_id = formData.get('categories_id') as string
    const user = await getAuthenticatedUser();
    const supabase = await createClient();
    const { error } = await supabase
        .from('products')
        .update({ name, price, stock, categories_id })
        .eq('id', id)

    if (error) {
        console.error('Error updating product:', error)
        return { error: error.message }
    }

    revalidatePath('/')
    return { success: true }
}

export async function deleteProduct(id: string) {
        const user = await getAuthenticatedUser();
    const supabase = await createClient();
    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting product:', error)
        return { error: error.message }
    }

    revalidatePath('/')
    return { success: true }
}

export async function updateStock(id: string, quantity: number) {
        const user = await getAuthenticatedUser();
    const supabase = await createClient();
    const { error } = await supabase.rpc('decrease_stock', {
        product_id: id,
        decrease_amount: quantity
    })

    if (error) {
        console.error('Error updating stock:', error)
        return { error: error.message }
    }

    revalidatePath('/')
    return { success: true }
}