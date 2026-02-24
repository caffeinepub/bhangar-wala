import { useState } from 'react';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { ArrowLeft, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useSubmitRating, useGetBookingById } from '../hooks/useQueries';

export default function RateService() {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const bookingIdStr = (routerState.location.state as any)?.bookingId || '';
  const bookingId = bookingIdStr ? BigInt(bookingIdStr) : null;

  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');

  const { data: booking } = useGetBookingById(bookingId);
  const submitRating = useSubmitRating();

  const partnerId = booking?.partnerId ?? BigInt(1);

  const handleSubmit = async () => {
    if (!bookingId || rating === 0) return;
    await submitRating.mutateAsync({
      bookingId,
      partnerId,
      stars: BigInt(rating),
      comment: comment.trim() || null,
    });
    navigate({ to: '/home' });
  };

  const handleSkip = () => navigate({ to: '/home' });

  const LABELS = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div
        className="px-4 pt-4 pb-8"
        style={{ background: 'linear-gradient(135deg, oklch(0.527 0.154 150) 0%, oklch(0.42 0.14 150) 100%)' }}
      >
        <button
          onClick={handleSkip}
          className="p-2 rounded-full bg-white/20 text-white min-w-[44px] min-h-[44px] flex items-center justify-center mb-3"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center text-white">
          <div className="text-4xl mb-2">⭐</div>
          <h1 className="font-heading text-2xl font-bold">Rate Your Experience</h1>
          <p className="text-white/80 text-sm mt-1">How was your pickup service?</p>
        </div>
      </div>

      <div className="flex-1 px-6 py-8 space-y-8">
        {/* Star Rating */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-3">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(0)}
                className="transition-transform hover:scale-110 active:scale-95 min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label={`Rate ${star} stars`}
              >
                <Star
                  className={`w-10 h-10 transition-colors ${
                    star <= (hovered || rating)
                      ? 'text-accent fill-accent'
                      : 'text-muted-foreground'
                  }`}
                />
              </button>
            ))}
          </div>
          {(hovered || rating) > 0 && (
            <p className="font-heading font-bold text-lg text-foreground animate-fade-in-up">
              {LABELS[hovered || rating]}
            </p>
          )}
        </div>

        {/* Comment */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Share your experience <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <Textarea
            placeholder="Tell us about your pickup experience..."
            value={comment}
            onChange={e => setComment(e.target.value)}
            rows={4}
            className="resize-none"
          />
        </div>

        {submitRating.isError && (
          <p className="text-destructive text-sm text-center">Failed to submit rating. Please try again.</p>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <Button
            onClick={handleSubmit}
            disabled={rating === 0 || submitRating.isPending}
            className="w-full min-h-[52px] text-base font-semibold rounded-xl"
            style={{ background: 'oklch(0.527 0.154 150)' }}
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
            onClick={handleSkip}
            className="w-full min-h-[48px] rounded-xl text-muted-foreground"
          >
            Skip for now
          </Button>
        </div>
      </div>
    </div>
  );
}
