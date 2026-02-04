"use client";
import { deleteCategory, getCategories } from "@/actions/categories"
import { CategoryDialog } from "@/components/categories-dialog"
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
import { Categories } from "@/interface"
import { Edit, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react"

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Categories[]>([])
    const [showCategoryDialog, setShowCategoryDialog] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState<Categories | null>(null)
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        loadCategories()
    }, [])

    const loadCategories = async () => {
        setLoading(true)
        try {
            const data = await getCategories()
            setCategories(data)
        } catch (error) {
            console.error('Failed to load categories:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleAddCategory = () => {
        setSelectedCategory(null)
        setShowCategoryDialog(true)
    }

    const handleEditCategory = (category: Categories) => {
        setSelectedCategory(category)
        setShowCategoryDialog(true)
    }

    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleCategoryDialogSuccess = () => {
        loadCategories()
    }

    const handleDeleteCategory = async (id: string) => {
        if (!confirm('Apakah Anda yakin ingin menghapus kategori ini? Produk yang terkait dengan kategori ini mungkin terpengaruh.')) return

        try {
            const result = await deleteCategory(id)
            if (result.error) {
                alert(`Gagal menghapus kategori: ${result.error}`)
            } else {
                loadCategories()
            }
        } catch (error) {
            console.error('Failed to delete category:', error)
            alert('Gagal menghapus kategori')
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Cari kategori..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Button onClick={handleAddCategory}>
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah Kategori
                </Button>
            </div>

            <CategoryDialog
                open={showCategoryDialog}
                onOpenChange={setShowCategoryDialog}
                category={selectedCategory}
                onSuccess={handleCategoryDialogSuccess}
            />

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nama Kategori</TableHead>
                            <TableHead>Tanggal Dibuat</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center py-12">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                                        <p className="text-sm text-muted-foreground">Memuat kategori...</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredCategories.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center py-12">
                                    <p className="text-muted-foreground">
                                        {searchQuery ? 'Kategori tidak ditemukan' : 'Belum ada kategori'}
                                    </p>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredCategories.map((category) => (
                                <TableRow key={category.id}>
                                    <TableCell className="font-medium">{category.name}</TableCell>
                                    <TableCell>
                                        {new Date(category.created_at).toLocaleDateString('id-ID', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8"
                                                onClick={() => handleEditCategory(category)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 text-destructive hover:text-destructive"
                                                onClick={() => handleDeleteCategory(category.id)}
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