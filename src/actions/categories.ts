'use server'

import { createClient, getAuthenticatedUser } from '@/lib/supabase-server'
import { Categories } from '@/interface'
import { revalidatePath } from 'next/cache'

export async function getCategories(): Promise<Categories[]> {

    const user = await getAuthenticatedUser();


    const supabase = await createClient();

    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true })

    if (error) {
        console.error('Error fetching categories:', error)
        return []
    }

    return data || []
}

export async function createCategory(formData: FormData) {
    const name = formData.get('name') as string
    const user = await getAuthenticatedUser();

    const supabase = await createClient();
    if (!name || name.trim() === '') {
        return { error: 'Nama kategori tidak boleh kosong' }
    }

    const { error } = await supabase
        .from('categories')
        .insert([{ name: name.trim() }])

    if (error) {
        console.error('Error creating category:', error)
        return { error: error.message }
    }

    revalidatePath('/')
    return { success: true }
}

export async function updateCategory(id: string, formData: FormData) {
    const name = formData.get('name') as string

    if (!name || name.trim() === '') {
        return { error: 'Nama kategori tidak boleh kosong' }
    }
    const user = await getAuthenticatedUser();


    const supabase = await createClient();
    const { error } = await supabase
        .from('categories')
        .update({ name: name.trim() })
        .eq('id', id)

    if (error) {
        console.error('Error updating category:', error)
        return { error: error.message }
    }

    revalidatePath('/')
    return { success: true }
}

export async function deleteCategory(id: string) {
    // Cek apakah ada produk yang menggunakan kategori ini
    const user = await getAuthenticatedUser();


    const supabase = await createClient();
    const { data: products, error: checkError } = await supabase
        .from('products')
        .select('id')
        .eq('category_id', id)
        .limit(1)

    if (checkError) {
        console.error('Error checking category usage:', checkError)
        return { error: checkError.message }
    }

    if (products && products.length > 0) {
        return { error: 'Kategori tidak dapat dihapus karena masih digunakan oleh produk' }
    }

    const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting category:', error)
        return { error: error.message }
    }

    revalidatePath('/')
    return { success: true }
}