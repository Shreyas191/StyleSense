import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, User, ThumbsDown } from 'lucide-react';
import { outfitAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const CommunityCard = ({ analysis }) => {
    const { user } = useAuth();
    const [liked, setLiked] = useState(analysis.likes?.includes(user?.id) || false);
    const [disliked, setDisliked] = useState(analysis.dislikes?.includes(user?.id) || false);
    const [likesCount, setLikesCount] = useState(analysis.likes?.length || 0);
    const [dislikesCount, setDislikesCount] = useState(analysis.dislikes?.length || 0);

    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState(analysis.comments || []);
    const [newComment, setNewComment] = useState('');

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    const handleLike = async () => {
        // Optimistic update
        const wasLiked = liked;
        const wasDisliked = disliked;

        setLiked(!wasLiked);
        setLikesCount(prev => wasLiked ? prev - 1 : prev + 1);

        if (wasDisliked && !wasLiked) {
            setDisliked(false);
            setDislikesCount(prev => prev - 1);
        }

        try {
            await outfitAPI.toggleLike(analysis._id);
        } catch (err) {
            // Revert
            setLiked(wasLiked);
            setLikesCount(prev => wasLiked ? prev + 1 : prev - 1);
            if (wasDisliked && !wasLiked) {
                setDisliked(true);
                setDislikesCount(prev => prev + 1);
            }
            toast.error("Failed to like");
        }
    };

    const handleDislike = async () => {
        // Optimistic
        const wasDisliked = disliked;
        const wasLiked = liked;

        setDisliked(!wasDisliked);
        setDislikesCount(prev => wasDisliked ? prev - 1 : prev + 1);

        if (wasLiked && !wasDisliked) {
            setLiked(false);
            setLikesCount(prev => prev - 1);
        }

        try {
            await outfitAPI.toggleDislike(analysis._id);
        } catch (err) {
            // Revert
            setDisliked(wasDisliked);
            setDislikesCount(prev => wasDisliked ? prev + 1 : prev - 1);
            if (wasLiked && !wasDisliked) {
                setLiked(true);
                setLikesCount(prev => prev + 1);
            }
            toast.error("Failed to dislike");
        }
    };

    const handleComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            const response = await outfitAPI.addComment(analysis._id, newComment);
            if (response && response.data && response.data.data) {
                setComments([...comments, response.data.data]);
            } else {
                setComments([...comments, { text: newComment, username: user?.username || 'You', created_at: new Date().toISOString() }]);
            }
            setNewComment('');
            toast.success('Comment added!');
        } catch (err) {
            toast.error('Failed to add comment');
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
                <img
                    src={`${API_URL}/uploads/${analysis.image_filename}`}
                    alt="Outfit"
                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                    {analysis.analysis_result.outfit_rating.score}/10
                </div>
                {analysis.tags && analysis.tags.length > 0 && (
                    <div className="absolute bottom-2 left-2 flex flex-wrap gap-1">
                        {analysis.tags.map((tag, i) => (
                            <span key={i} className="bg-white/80 text-gray-800 text-xs px-2 py-0.5 rounded-full backdrop-blur-sm font-medium">
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            <div className="p-4">
                <div className="mb-3">
                    <p className="text-gray-800 line-clamp-2 text-sm">
                        {analysis.analysis_result.style_description}
                    </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={handleLike}
                            className={`flex items-center space-x-1 ${liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
                        >
                            <Heart size={20} fill={liked ? "currentColor" : "none"} />
                            <span className="text-sm font-medium">{likesCount}</span>
                        </button>

                        <button
                            onClick={handleDislike}
                            className={`flex items-center space-x-1 ${disliked ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <ThumbsDown size={20} fill={disliked ? "currentColor" : "none"} />
                            <span className="text-sm font-medium">{dislikesCount > 0 ? dislikesCount : ''}</span>
                        </button>
                    </div>

                    <button
                        onClick={() => setShowComments(!showComments)}
                        className="flex items-center space-x-1 text-gray-500 hover:text-indigo-600"
                    >
                        <MessageCircle size={20} />
                        <span className="text-sm font-medium">{comments.length}</span>
                    </button>
                </div>

                {showComments && (
                    <div className="mt-4 border-t border-gray-100 pt-3">
                        <div className="space-y-3 max-h-48 overflow-y-auto mb-3">
                            {comments.map((comment, idx) => (
                                <div key={idx} className="text-sm">
                                    <span className="font-semibold text-gray-900 mr-2">{comment.username}</span>
                                    <span className="text-gray-700">{comment.text}</span>
                                </div>
                            ))}
                            {comments.length === 0 && <p className="text-xs text-gray-400 italic">No comments yet.</p>}
                        </div>
                        <form onSubmit={handleComment} className="flex gap-2">
                            <input
                                type="text"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Add a comment..."
                                className="flex-1 text-sm border border-gray-300 rounded-full px-3 py-1 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            <button type="submit" className="text-indigo-600 font-medium text-sm disabled:opacity-50" disabled={!newComment.trim()}>Post</button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommunityCard;
