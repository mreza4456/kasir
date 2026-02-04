"use client";
import { createUser, updateUser } from "@/actions/user";
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
import { User } from "@/actions/user";
import { useState } from "react";

interface UserDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: User | null;
    onSuccess: () => void;
}

export function UserDialog({
    open,
    onOpenChange,
    user,
    onSuccess,
}: UserDialogProps) {
    const [loading, setLoading] = useState(false);
    const [role, setRole] = useState<string>(user?.role || "kasir");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        
        // Add role to formData since Select component doesn't add it automatically
        formData.set("role", role);

        try {
            let result;
            if (user) {
                // Edit mode
                result = await updateUser(user.id, formData);
            } else {
                // Add mode
                result = await createUser(formData);
            }

            if (result.success) {
                onSuccess();
                onOpenChange(false);
                // Reset role to default
                setRole("kasir");
            } else {
                alert(`Gagal menyimpan user: ${result.message}`);
            }
        } catch (error) {
            console.error("Failed to save user:", error);
            alert("Gagal menyimpan user");
        } finally {
            setLoading(false);
        }
    };

    // Reset role when dialog opens/closes
    const handleOpenChange = (open: boolean) => {
        if (open && user) {
            setRole(user.role);
        } else if (!open) {
            setRole("kasir");
        }
        onOpenChange(open);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        {user ? "Edit User" : "Tambah User Baru"}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="full_name">Nama Lengkap</Label>
                        <Input
                            id="full_name"
                            name="full_name"
                            defaultValue={user?.full_name}
                            placeholder="Masukkan nama lengkap"
                            required
                        />
                    </div>

                    {!user && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="contoh@email.com"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="Minimal 6 karakter"
                                    minLength={6}
                                    required
                                />
                            </div>
                        </>
                    )}

                    {user && (
                        <div className="space-y-2">
                            <Label htmlFor="email-display">Email</Label>
                            <Input
                                id="email-display"
                                value={user.email}
                                disabled
                                className="bg-muted"
                            />
                            <p className="text-xs text-muted-foreground">
                                Email tidak dapat diubah
                            </p>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Select
                            value={role}
                            onValueChange={setRole}
                            required
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="kasir">Kasir</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
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