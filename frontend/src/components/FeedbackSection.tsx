import { useState, useEffect } from 'react';
import { Star, Send, X, MessageSquare, Loader, Clock, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { feedbackService } from '../services/api';

interface FeedbackItem {
    feedbackId: number;
    eventId: number;
    userId: number;
    userName: string;
    rating: number;
    comments: string;
    submittedAt: string;
}

interface FeedbackSectionProps {
    eventId: number;
    startDate?: string; // ISO date string of event start
    isEnrolled?: boolean; // Whether the current user is enrolled
}

const FeedbackSection = ({ eventId, startDate, isEnrolled = false }: FeedbackSectionProps) => {
    const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [averageRating, setAverageRating] = useState(0);

    // Form state
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comments, setComments] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Check if event has started
    const eventHasStarted = !startDate || new Date() >= new Date(startDate);

    useEffect(() => {
        loadFeedbackData();
    }, [eventId]);

    const loadFeedbackData = async () => {
        try {
            setLoading(true);
            const [feedbackData, checkData, ratingData] = await Promise.all([
                feedbackService.getPublicFeedback(eventId),
                feedbackService.checkSubmitted(eventId),
                feedbackService.getEventRating(eventId)
            ]);
            setFeedbacks(feedbackData);
            setHasSubmitted(checkData.hasSubmitted);
            setAverageRating(ratingData || 0);
        } catch (error) {
            console.error('Failed to load feedback', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (rating === 0) {
            toast.error('Please select a star rating');
            return;
        }
        if (!comments.trim()) {
            toast.error('Please enter your feedback');
            return;
        }

        try {
            setSubmitting(true);
            await feedbackService.submitFeedback({
                eventId,
                rating,
                comments: comments.trim()
            });
            toast.success('Feedback submitted successfully!');
            setHasSubmitted(true);
            setRating(0);
            setComments('');
            loadFeedbackData(); // Refresh list
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to submit feedback');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        setRating(0);
        setComments('');
    };

    const handleKeyDown = () => {
        // Allow Enter for newline naturally in textarea
    };

    if (loading) {
        return (
            <div className="glass-card p-8 mt-8">
                <div className="flex items-center justify-center gap-2 text-slate-400">
                    <Loader className="animate-spin" size={20} />
                    <span>Loading feedback...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="glass-card p-8 mt-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg">
                    <MessageSquare size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-slate-100">Event Feedback</h3>
                    <div className="flex items-center gap-2 mt-1">
                        <div className="flex text-amber-400">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    size={16}
                                    fill={star <= Math.round(averageRating) ? 'currentColor' : 'none'}
                                />
                            ))}
                        </div>
                        <span className="text-sm text-slate-400">
                            {averageRating > 0 ? `${averageRating.toFixed(1)} average` : 'No ratings yet'}
                        </span>
                        <span className="text-sm text-slate-500">
                            ({feedbacks.length} {feedbacks.length === 1 ? 'review' : 'reviews'})
                        </span>
                    </div>
                </div>
            </div>

            {/* Submit Feedback Section */}
            {!isEnrolled ? (
                <div className="bg-slate-500/10 border border-slate-500/30 rounded-xl p-4 mb-6 flex items-center gap-3">
                    <div className="p-2 bg-slate-500/20 text-slate-400 rounded-full">
                        <Lock size={20} />
                    </div>
                    <p className="text-slate-400 text-sm">Enroll in this event to share your feedback</p>
                </div>
            ) : !eventHasStarted ? (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6 flex items-center gap-3">
                    <div className="p-2 bg-yellow-500/20 text-yellow-400 rounded-full">
                        <Clock size={20} />
                    </div>
                    <div>
                        <p className="text-yellow-300 text-sm font-medium">Feedback opens after event starts</p>
                        {startDate && (
                            <p className="text-yellow-400/70 text-xs">Event starts: {new Date(startDate).toLocaleString()}</p>
                        )}
                    </div>
                </div>
            ) : hasSubmitted ? (
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-6 flex items-center gap-3">
                    <div className="p-2 bg-green-500/20 text-green-400 rounded-full">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <p className="text-green-300 text-sm">Thank you! You have already submitted feedback for this event.</p>
                </div>
            ) : (
                <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
                    <h4 className="text-sm font-medium text-slate-300 mb-4">Share Your Experience</h4>

                    {/* Star Rating */}
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-sm text-slate-400 mr-2">Your Rating:</span>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    className="p-1 transition-transform hover:scale-110 focus:outline-none"
                                >
                                    <Star
                                        size={28}
                                        className={`transition-colors ${star <= (hoverRating || rating)
                                            ? 'text-amber-400 fill-amber-400'
                                            : 'text-slate-500'
                                            }`}
                                    />
                                </button>
                            ))}
                        </div>
                        {rating > 0 && (
                            <span className="text-sm text-amber-400 ml-2">
                                {rating === 1 && 'Poor'}
                                {rating === 2 && 'Fair'}
                                {rating === 3 && 'Good'}
                                {rating === 4 && 'Very Good'}
                                {rating === 5 && 'Excellent'}
                            </span>
                        )}
                    </div>

                    {/* Feedback Text */}
                    <textarea
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Write your feedback here... (Press Enter for new line)"
                        rows={3}
                        className="w-full glass-input resize-none text-sm"
                        style={{ minHeight: '80px' }}
                    />

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 mt-4">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="px-4 py-2 text-slate-400 hover:text-white transition-colors flex items-center gap-2"
                        >
                            <X size={16} />
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="btn-glow px-6 py-2 flex items-center gap-2 disabled:opacity-50"
                        >
                            {submitting ? (
                                <Loader className="animate-spin" size={16} />
                            ) : (
                                <Send size={16} />
                            )}
                            Submit Feedback
                        </button>
                    </div>
                </div>
            )}

            {/* Feedback List */}
            <div className="space-y-4">
                <h4 className="text-sm font-medium text-slate-400 border-b border-white/10 pb-2">
                    All Reviews ({feedbacks.length})
                </h4>

                {feedbacks.length === 0 ? (
                    <p className="text-center text-slate-500 py-6">No feedback yet. Be the first to share your experience!</p>
                ) : (
                    feedbacks.map((item) => (
                        <div
                            key={item.feedbackId}
                            className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/[0.07] transition-colors"
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                                        {item.userName ? item.userName.charAt(0).toUpperCase() : '?'}
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-100">{item.userName}</p>
                                        <p className="text-xs text-slate-500">
                                            {new Date(item.submittedAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex text-amber-400">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            size={16}
                                            fill={star <= item.rating ? 'currentColor' : 'none'}
                                        />
                                    ))}
                                </div>
                            </div>
                            <p className="text-slate-300 text-sm leading-relaxed pl-13">{item.comments}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default FeedbackSection;
