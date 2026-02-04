"use client";
import { deleteUser, getAllUsers } from "@/actions/user";
import { UserDialog } from "@/components/users-dialog";
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
import { User } from "@/actions/user";
import { Edit, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [showUserDialog, setShowUserDialog] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const result = await getAllUsers();
            if (result.success) {
                setUsers(result.data);
            } else {
                alert(`Gagal memuat user: ${result.message}`);
            }
        } catch (error) {
            console.error("Failed to load users:", error);
            alert("Gagal memuat user");
        } finally {
            setLoading(false);
        }
    };

    const handleAddUser = () => {
        setSelectedUser(null);
        setShowUserDialog(true);
    };

    const handleEditUser = (user: User) => {
        setSelectedUser(user);
        setShowUserDialog(true);
    };

    const filteredUsers = users.filter(
        (user) =>
            user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleUserDialogSuccess = () => {
        loadUsers();
    };

    const handleDeleteUser = async (userId: string, authUserId: string, userName: string) => {
        if (
            !confirm(
                `Apakah Anda yakin ingin menghapus user ${userName}? Tindakan ini tidak dapat dibatalkan.`
            )
        )
            return;

        try {
            const result = await deleteUser(userId, authUserId);
            if (result.success) {
                loadUsers();
            } else {
                alert(`Gagal menghapus user: ${result.message}`);
            }
        } catch (error) {
            console.error("Failed to delete user:", error);
            alert("Gagal menghapus user");
        }
    };

    const getRoleBadge = (role: string) => {
        if (role === "admin") {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Admin
                </span>
            );
        }
        return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Kasir
            </span>
        );
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Manajemen User</h1>
                    <p className="text-muted-foreground">Kelola pengguna sistem</p>
                </div>
            </div>

            <div className="flex justify-between items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Cari user..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Button onClick={handleAddUser}>
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah User
                </Button>
            </div>

            <UserDialog
                open={showUserDialog}
                onOpenChange={setShowUserDialog}
                user={selectedUser}
                onSuccess={handleUserDialogSuccess}
            />

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nama</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Tanggal Dibuat</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-12">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                                        <p className="text-sm text-muted-foreground">
                                            Memuat user...
                                        </p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredUsers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-12">
                                    <p className="text-muted-foreground">
                                        {searchQuery ? "User tidak ditemukan" : "Belum ada user"}
                                    </p>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredUsers.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">
                                        {user.full_name}
                                    </TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                                    <TableCell>
                                        {new Date(user.created_at).toLocaleDateString("id-ID", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8"
                                                onClick={() => handleEditUser(user)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 text-destructive hover:text-destructive"
                                                onClick={() =>
                                                    handleDeleteUser(
                                                        user.id,
                                                        user.auth_user_id,
                                                        user.full_name
                                                    )
                                                }
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
    );
}