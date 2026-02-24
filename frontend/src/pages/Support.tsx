import { useState } from 'react';
import { Phone, MessageCircle, Mail, ChevronDown, ChevronUp, Send, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useSubmitSupportTicket } from '../hooks/useQueries';

const FAQS = [
  {
    q: 'How do I schedule a scrap pickup?',
    a: 'Tap "Book Pickup" on the home screen, select your address, choose the scrap type and weight, pick a date and time slot, and confirm your booking. A partner will be assigned to you shortly.',
  },
  {
    q: 'What types of scrap do you accept?',
    a: 'We accept Paper (newspaper, cardboard), Metal (iron, copper), Plastic (PET bottles, hard plastic), and Electronics (mobiles, laptops). More categories are being added regularly.',
  },
  {
    q: 'How is the price calculated?',
    a: 'The price is calculated based on the type of scrap and its weight. We show you the current rate per kg for each category. The final amount is calculated after the partner weighs your scrap on-site.',
  },
  {
    q: 'Can I cancel my booking?',
    a: 'Yes, you can cancel your booking before the partner arrives. Go to your booking details and tap "Cancel Booking". Cancellations after the partner has arrived may not be possible.',
  },
  {
    q: 'How do I receive payment?',
    a: 'You can choose to receive payment via Cash (given directly by the partner) or UPI (instant bank transfer). Select your preferred method during the payment step after pickup.',
  },
  {
    q: 'What if the partner doesn\'t show up?',
    a: 'If your partner doesn\'t arrive within the scheduled time slot, please contact our support team via call or WhatsApp. We will reassign a partner or reschedule your pickup at no extra charge.',
  },
  {
    q: 'How do I add a new address?',
    a: 'Go to Profile → Manage Addresses → tap the "+" button. Fill in your address details and save. You can add multiple addresses for different locations.',
  },
  {
    q: 'Is there a minimum weight requirement?',
    a: 'There is no strict minimum, but we recommend scheduling a pickup for at least 2-3 kg of scrap to make it worthwhile for both you and the partner.',
  },
];

export default function Support() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const submitTicket = useSubmitSupportTicket();

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) return;
    await submitTicket.mutateAsync({ subject: subject.trim(), message: message.trim() });
    setSubmitted(true);
    setSubject('');
    setMessage('');
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div
        className="px-4 pt-4 pb-6"
        style={{ background: 'linear-gradient(135deg, oklch(0.527 0.154 150) 0%, oklch(0.42 0.14 150) 100%)' }}
      >
        <h1 className="font-heading text-xl font-bold text-white">Support</h1>
        <p className="text-white/80 text-sm mt-1">We're here to help you</p>
      </div>

      <div className="flex-1 px-4 py-5 space-y-5 pb-8">
        {/* Contact Buttons */}
        <div className="grid grid-cols-3 gap-3">
          <a
            href="tel:+918888888888"
            className="flex flex-col items-center gap-2 p-4 bg-card rounded-2xl border border-border hover:border-primary/50 transition-all"
          >
            <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center">
              <Phone className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xs font-medium text-foreground">Call Us</span>
          </a>
          <a
            href="https://wa.me/918888888888"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-2 p-4 bg-card rounded-2xl border border-border hover:border-green-400 transition-all"
          >
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-xs font-medium text-foreground">WhatsApp</span>
          </a>
          <a
            href="mailto:support@bhangarwala.in"
            className="flex flex-col items-center gap-2 p-4 bg-card rounded-2xl border border-border hover:border-blue-400 transition-all"
          >
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <Mail className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-xs font-medium text-foreground">Email</span>
          </a>
        </div>

        {/* FAQ */}
        <div>
          <h2 className="font-heading font-bold text-foreground text-base mb-3">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="space-y-2">
            {FAQS.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="bg-card border border-border rounded-xl overflow-hidden px-4"
              >
                <AccordionTrigger className="text-sm font-medium text-foreground text-left py-4 hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground pb-4 leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Support Ticket Form */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border bg-primary-light">
            <p className="font-heading font-bold text-primary text-sm">Send us a message</p>
          </div>
          <div className="p-4 space-y-3">
            {submitted ? (
              <div className="flex flex-col items-center py-6 gap-3">
                <CheckCircle className="w-12 h-12 text-primary" />
                <p className="font-semibold text-foreground">Message sent!</p>
                <p className="text-sm text-muted-foreground text-center">We'll get back to you within 24 hours.</p>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Input
                    placeholder="e.g. Issue with my booking"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    className="min-h-[44px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Message</Label>
                  <Textarea
                    placeholder="Describe your issue in detail..."
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                </div>
                {submitTicket.isError && (
                  <p className="text-destructive text-sm">Failed to send. Please try again.</p>
                )}
                <Button
                  onClick={handleSubmit}
                  disabled={!subject.trim() || !message.trim() || submitTicket.isPending}
                  className="w-full min-h-[48px] rounded-xl"
                  style={{ background: 'oklch(0.527 0.154 150)' }}
                >
                  {submitTicket.isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      Send Message
                    </span>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
