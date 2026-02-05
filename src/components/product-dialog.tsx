// @/components/product-dialog.tsx
"use client";
import { createProduct, updateProduct } from "@/actions/products";
import { getCategories } from "@/actions/categories";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Product, Categories } from "@/interface";
import { useEffect, useState } from "react";

interface ProductDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product: Product | null;
    onSuccess: () => void;
}

export function ProductDialog({
    open,
    onOpenChange,
    product,
    onSuccess,
}: ProductDialogProps) {
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<Categories[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>("");

    // Gabungkan menjadi 1 useEffect
    useEffect(() => {
        if (open) {
            loadCategories();
            // Set kategori yang dipilih saat dialog dibuka
            // Konversi ke string untuk memastikan tipe data cocok
            setSelectedCategory(product?.categories_id?.toString() || "");
        }
    }, [open, product]);

    const loadCategories = async () => {
        const data = await getCategories();
        setCategories(data);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);

        try {
            if (product) {
                await updateProduct(product.id, formData);
            } else {
                await createProduct(formData);
            }
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error("Failed to save product:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {product ? "Edit Produk" : "Tambah Produk"}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nama Produk</Label>
                        <Input
                            id="name"
                            name="name"
                            defaultValue={product?.name}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="categories_id">Kategori</Label>
                        <Select
                            value={selectedCategory}
                            onValueChange={setSelectedCategory}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih kategori" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((category) => (
                                    <SelectItem 
                                        key={category.id} 
                                        value={category.id.toString()}
                                    >
                                        {category.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {/* Hidden input untuk mengirim nilai ke FormData */}
                        <input 
                            type="hidden" 
                            name="categories_id" 
                            value={selectedCategory} 
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="price">Harga</Label>
                        <Input
                            id="price"
                            name="price"
                            type="number"
                            step="0.01"
                            defaultValue={product?.price}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="purchase_price">Harga Pabrik</Label>
                        <Input
                            id="purchase_price"
                            name="purchase_price"
                            type="number"
                            step="0.01"
                            defaultValue={product?.purchase_price}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="stock">Stok</Label>
                        <Input
                            id="stock"
                            name="stock"
                            type="number"
                            defaultValue={product?.stock}
                            required
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Batal
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Menyimpan..." : "Simpan"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}