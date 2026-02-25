import React, { useState } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { ArrowLeft, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useGetBookingById, useSubmitRating } from '../hooks/useQueries';

export default function RateService() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { bookingId?: number };
  const bookingId = search.bookingId ? Number(search.bookingId) : 0;

  const { data: booking } = useGetBookingById(bookingId);
  const submitRating = useSubmitRating();

  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    await submitRating.mutateAsync({
      bookingId,
      stars: rating,
      comment: comment.trim() || undefined,
    });
    setSubmitted(true);
    setTimeout(() => navigate({ to: '/home' }), 2000);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-4">
        <div className="text-6xl">⭐</div>
        <h2 className="font-heading text-xl font-bold text-foreground">Thank You!</h2>
        <p className="text-muted-foreground text-center">Your feedback helps us improve our service.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div
        className="px-4 pt-4 pb-6"
        style={{ background: 'linear-gradient(135deg, oklch(0.527 0.154 150) 0%, oklch(0.42 0.14 150) 100%)' }}
      >
        <button
          onClick={() => navigate({ to: '/home' })}
          className="p-2 rounded-full bg-white/20 text-white min-w-[44px] min-h-[44px] flex items-center justify-center mb-3"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-heading text-xl font-bold text-white">Rate Service</h1>
        <p className="text-white/80 text-sm">Booking #{bookingId}</p>
      </div>

      <div className="flex-1 px-4 py-6 space-y-6">
        {/* Stars */}
        <div className="bg-card rounded-2xl border border-border p-6 text-center space-y-4">
          <p className="font-heading font-bold text-foreground">How was your experience?</p>
          <div className="flex justify-center gap-3">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(0)}
                onClick={() => setRating(star)}
                className="transition-transform hover:scale-110 active:scale-95"
              >
                <Star
                  className={`w-10 h-10 transition-colors ${
                    star <= (hovered || rating)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-muted-foreground'
                  }`}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-sm font-medium text-primary">
              {rating === 1 ? 'Poor' : rating === 2 ? 'Fair' : rating === 3 ? 'Good' : rating === 4 ? 'Very Good' : 'Excellent!'}
            </p>
          )}
        </div>

        {/* Comment */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Additional Comments (optional)</label>
          <Textarea
            placeholder="Tell us about your experience..."
            value={comment}
            onChange={e => setComment(e.target.value)}
            rows={4}
            className="resize-none"
          />
        </div>
      </div>

      <div className="px-4 pb-6 pt-2 border-t border-border bg-card space-y-3">
        <Button
          onClick={handleSubmit}
          disabled={rating === 0 || submitRating.isPending}
          className="w-full min-h-[52px] text-base font-semibold rounded-xl"
        >
          {submitRating.isPending ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Submitting...
            </span>
          ) : (
            'Submit Rating'
          )}
        </Button>
        <Button
          variant="ghost"
          onClick={() => navigate({ to: '/home' })}
          className="w-full"
        >
          Skip
        </Button>
      </div>
    </div>
  );
}
