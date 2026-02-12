'use client';

import { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api-client';
import { Plus, Check, Trash2, Shield, Loader2, UserPlus, X } from 'lucide-react';

interface Role {
    id: string;
    name: string;
    permissions: string[];
    description: string;
}

const AVAILABLE_PERMISSIONS = [
    { key: 'dashboard', label: 'Panel Principal' },
    { key: 'bookings', label: 'Reservas' },
    { key: 'experiences', label: 'Experiencias' },
    { key: 'customers', label: 'Clientes' },
    { key: 'reports', label: 'Reportes' },
    { key: 'settings', label: 'Configuración' },
];

export default function RoleManager() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isCreatingUser, setIsCreatingUser] = useState(false);
    const [currentRole, setCurrentRole] = useState<Partial<Role>>({ permissions: [] });

    // User Creation State
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserPassword, setNewUserPassword] = useState('');
    const [newUserRole, setNewUserRole] = useState('');
    const [creatingUserLoading, setCreatingUserLoading] = useState(false);

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            const data = await fetchApi<Role[]>('admin/roles/index.php');
            if (data) {
                setRoles(data);
                if (data.length > 0 && !newUserRole) {
                    setNewUserRole(data[0].id); // Default to first role
                }
            }
        } catch (error) {
            console.error('Error fetching roles:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!currentRole.name) return alert('El nombre es requerido');

        try {
            const payload = {
                id: currentRole.id,
                name: currentRole.name,
                description: currentRole.description,
                permissions: currentRole.permissions || []
            };

            await fetchApi('admin/roles/upsert.php', {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            setIsEditing(false);
            setCurrentRole({ permissions: [] });
            fetchRoles();
        } catch (error: any) {
            alert('Error al guardar: ' + error.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro? Esto podría afectar a usuarios existentes.')) return;
        try {
            await fetchApi('admin/roles/delete.php', {
                method: 'POST',
                body: JSON.stringify({ id })
            });
            fetchRoles();
        } catch (error: any) {
            alert('Error al eliminar: ' + error.message);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreatingUserLoading(true);

        try {
            const data = await fetchApi<any>('admin/users/create', {
                method: 'POST',
                body: JSON.stringify({
                    email: newUserEmail,
                    password: newUserPassword,
                    role_id: newUserRole
                })
            });

            alert('Usuario creado exitosamente con el rol asignado.');

            setIsCreatingUser(false);
            setNewUserEmail('');
            setNewUserPassword('');
        } catch (error: any) {
            alert('Error: ' + error.message);
        } finally {
            setCreatingUserLoading(false);
        }
    };


    const togglePermission = (key: string) => {
        const perms = new Set(currentRole.permissions || []);
        if (perms.has(key)) perms.delete(key);
        else perms.add(key);
        setCurrentRole({ ...currentRole, permissions: Array.from(perms) });
    };

    if (loading) return <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-moma-green" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-[#1a1a1a]">Roles y Permisos</h2>
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsCreatingUser(true)}
                        className="bg-stone-100 text-stone-600 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-stone-200 transition-all"
                    >
                        <UserPlus className="w-4 h-4" /> Asignar Usuario
                    </button>
                    <button
                        onClick={() => { setCurrentRole({ permissions: [] }); setIsEditing(true); }}
                        className="bg-[#061a15] text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:opacity-90 transition-all"
                    >
                        <Plus className="w-4 h-4" /> Nuevo Rol
                    </button>
                </div>
            </div>

            <div className="grid gap-4">
                {roles.map(role => (
                    <div key={role.id} className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-lg text-[#1a1a1a] flex items-center gap-2">
                                <Shield className="w-4 h-4 text-moma-green" />
                                {role.name}
                            </h3>
                            <p className="text-sm text-stone-400 mb-2">{role.description || 'Sin descripción'}</p>
                            <div className="flex flex-wrap gap-2">
                                {role.permissions.includes('all') ? (
                                    <span className="bg-moma-green/10 text-moma-green px-2 py-0.5 rounded text-xs font-bold">Acceso Total</span>
                                ) : (
                                    role.permissions.map(p => (
                                        <span key={p} className="bg-stone-100 text-stone-500 px-2 py-0.5 rounded text-xs font-bold capitalize">
                                            {AVAILABLE_PERMISSIONS.find(ap => ap.key === p)?.label || p}
                                        </span>
                                    ))
                                )}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => { setCurrentRole(role); setIsEditing(true); }}
                                className="px-3 py-1.5 text-xs font-bold bg-stone-100 rounded-lg hover:bg-stone-200"
                            >
                                Editar
                            </button>
                            {role.name !== 'Admin' && (
                                <button
                                    onClick={() => handleDelete(role.id)}
                                    className="px-3 py-1.5 text-xs font-bold bg-red-50 text-red-500 rounded-lg hover:bg-red-100"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal de Crear Usuario */}
            {isCreatingUser && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl relative">
                        <button
                            onClick={() => setIsCreatingUser(false)}
                            className="absolute top-4 right-4 p-2 text-stone-400 hover:bg-stone-100 rounded-full"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                            <UserPlus className="w-6 h-6 text-moma-green" />
                            Asignar Nuevo Usuario
                        </h3>

                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-stone-400 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={newUserEmail}
                                    onChange={e => setNewUserEmail(e.target.value)}
                                    className="w-full bg-stone-50 border-none rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-moma-green outline-none"
                                    placeholder="usuario@moma.com"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-stone-400 mb-1">Contraseña</label>
                                <input
                                    type="password"
                                    value={newUserPassword}
                                    onChange={e => setNewUserPassword(e.target.value)}
                                    className="w-full bg-stone-50 border-none rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-moma-green outline-none"
                                    placeholder="••••••••"
                                    minLength={6}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-stone-400 mb-1">Rol Asignado</label>
                                <select
                                    value={newUserRole}
                                    onChange={e => setNewUserRole(e.target.value)}
                                    className="w-full bg-stone-50 border-none rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-moma-green outline-none"
                                >
                                    {roles.map(role => (
                                        <option key={role.id} value={role.id}>{role.name}</option>
                                    ))}
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={creatingUserLoading}
                                className="w-full py-3 rounded-xl font-bold bg-[#061a15] text-white hover:opacity-90 shadow-lg mt-4 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {creatingUserLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                                Crear y Asignar
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de Edición */}
            {isEditing && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl">
                        <h3 className="text-xl font-black mb-6">{currentRole.id ? 'Editar Rol' : 'Crear Nuevo Rol'}</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-stone-400 mb-1">Nombre del Rol</label>
                                <input
                                    type="text"
                                    value={currentRole.name || ''}
                                    onChange={e => setCurrentRole({ ...currentRole, name: e.target.value })}
                                    className="w-full bg-stone-50 border-none rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-moma-green outline-none"
                                    placeholder="Ej: Editor de Ventas"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-stone-400 mb-1">Descripción</label>
                                <input
                                    type="text"
                                    value={currentRole.description || ''}
                                    onChange={e => setCurrentRole({ ...currentRole, description: e.target.value })}
                                    className="w-full bg-stone-50 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-moma-green outline-none"
                                    placeholder="Breve descripción..."
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-stone-400 mb-2">Permisos (Pestañas Visibles)</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {AVAILABLE_PERMISSIONS.map(perm => (
                                        <label key={perm.key} className="flex items-center gap-3 p-3 rounded-xl border border-stone-100 cursor-pointer hover:bg-stone-50 transition-colors">
                                            <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${(currentRole.permissions || []).includes(perm.key)
                                                ? 'bg-moma-green border-moma-green text-white'
                                                : 'border-stone-300 bg-white'
                                                }`}>
                                                {(currentRole.permissions || []).includes(perm.key) && <Check className="w-3 h-3" />}
                                            </div>
                                            <input
                                                type="checkbox"
                                                className="hidden"
                                                checked={(currentRole.permissions || []).includes(perm.key)}
                                                onChange={() => togglePermission(perm.key)}
                                            />
                                            <span className="text-sm font-bold text-stone-600">{perm.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button
                                onClick={() => setIsEditing(false)}
                                className="flex-1 py-3 rounded-xl font-bold text-stone-500 hover:bg-stone-100"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex-1 py-3 rounded-xl font-bold bg-moma-green text-white hover:opacity-90 shadow-lg shadow-moma-green/30"
                            >
                                Guardar Rol
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
