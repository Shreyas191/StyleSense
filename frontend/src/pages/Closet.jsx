import React, { useState, useEffect } from 'react';
import { closetAPI } from '../services/api';
import { Plus, Trash2, Tag, Loader, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Closet = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newItem, setNewItem] = useState({
        name: '',
        category: 'top',
        color: '',
        description: '',
        tags: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchCloset();
    }, []);

    const fetchCloset = async () => {
        try {
            const response = await closetAPI.getCloset();
            setItems(response.data);
        } catch (err) {
            toast.error('Failed to load closet items');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Convert comma-separated tags to array for API if needed, 
        // but schema says [str], so assume we pass list.
        // For now the UI handles simple inputs.
        const itemData = {
            ...newItem,
            tags: newItem.tags.split(',').map(t => t.trim()).filter(Boolean)
        };

        try {
            const response = await closetAPI.addItem(itemData);
            setItems([response.data, ...items]);
            setShowModal(false);
            setNewItem({ name: '', category: 'top', color: '', description: '', tags: '' });
            toast.success('Item added to closet!');
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Failed to add item');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Confirm delete?')) return;
        try {
            await closetAPI.deleteItem(id);
            setItems(items.filter(item => item._id !== id));
            toast.success('Item removed');
        } catch (err) {
            toast.error('Failed to delete item');
        }
    };

    const categories = ['top', 'bottom', 'shoes', 'accessory', 'outerwear', 'dress', 'other'];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader className="animate-spin text-primary-600" size={48} />
            </div>
        );
    }

    return (
        <div className="min-h-screen py-12 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">Virtual Closet</h1>
                        <p className="text-gray-600">Digitize and manage your wardrobe</p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="btn-primary flex items-center"
                    >
                        <Plus className="mr-2" size={20} />
                        Add Item
                    </button>
                </div>

                {items.length === 0 ? (
                    <div className="text-center py-16 card">
                        <Tag className="mx-auto text-gray-400 mb-4" size={64} />
                        <h3 className="text-2xl font-semibold text-gray-900 mb-2">Closet is empty</h3>
                        <p className="text-gray-600 mb-6">Add your clothes to start mixing and matching!</p>
                        <button onClick={() => setShowModal(true)} className="btn-primary">
                            Add First Item
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {items.map(item => (
                            <div key={item._id} className="card group relative hover:shadow-lg transition-all">
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleDelete(item._id)}
                                        className="bg-white p-2 rounded-full text-red-500 hover:text-red-700 shadow-sm"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                <div className={`h-32 w-full rounded-md mb-4 flex items-center justify-center ${item.color ? `bg-[${item.color}]` : 'bg-gray-100'
                                    }`}>
                                    {/* Placeholder for item image or color swatch */}
                                    <span className="text-4xl">👕</span>
                                </div>

                                <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded capitalize">
                                        {item.category}
                                    </span>
                                    <span className="text-sm text-gray-500">{item.color}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Add Item Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">Add New Item</h2>
                                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleCreate} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                                    <input
                                        type="text"
                                        required
                                        maxLength={50}
                                        className="input-field"
                                        placeholder="e.g. Navy Blue Blazer"
                                        value={newItem.name}
                                        onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                        <select
                                            className="input-field"
                                            value={newItem.category}
                                            onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                                        >
                                            {categories.map(c => (
                                                <option key={c} value={c} className="capitalize">{c}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                                        <input
                                            type="text"
                                            required
                                            className="input-field"
                                            placeholder="e.g. Blue"
                                            value={newItem.color}
                                            onChange={e => setNewItem({ ...newItem, color: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        placeholder="casual, summer, cotton"
                                        value={newItem.tags}
                                        onChange={e => setNewItem({ ...newItem, tags: e.target.value })}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="btn-primary w-full mt-6"
                                >
                                    {isSubmitting ? 'Adding...' : 'Add directly to Closet'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Closet;
