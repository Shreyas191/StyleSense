import React, { useState, useEffect } from 'react';
import { outfitAPI } from '../services/api';
import CommunityCard from '../components/CommunityCard';
import { Loader, Users } from 'lucide-react';

const Community = () => {
    const [feed, setFeed] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchFeed();
    }, []);

    const fetchFeed = async () => {
        try {
            const response = await outfitAPI.getCommunityFeed();
            setFeed(response.data.data);
        } catch (err) {
            setError('Failed to load community feed');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader className="animate-spin text-primary-600" size={48} />
            </div>
        );
    }

    return (
        <div className="min-h-screen py-12 px-4 bg-gray-50">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col items-center mb-12 text-center">
                    <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-3 rounded-full mb-4">
                        <Users className="text-white" size={32} />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Style Community</h1>
                    <p className="text-gray-600 max-w-xl">
                        Discover trending styles, get inspired, and rate outfits from the community.
                    </p>
                </div>

                {error && (
                    <div className="text-center text-red-600 mb-8">{error}</div>
                )}

                {feed.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-gray-500 text-lg">No public outfits yet. Be the first to post!</p>
                    </div>
                ) : (
                    <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                        {feed.map(analysis => (
                            <div key={analysis._id} className="break-inside-avoid">
                                <CommunityCard analysis={analysis} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Community;
