'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import SiteHeader from '../../components/SiteHeader';
import SiteFooter from '../../components/SiteFooter';
import { formatDateStr, formatHourRange } from '@/lib/format';

type BookingInfo = {
    room: { name: string; slug: string };
    booking_date: string;
    slot_hour: number;
    status: 'confirmed' | 'cancelled';
    student_name: string;
};

export default function CancelPage() {
    const params = useParams<{ token: string }>();
    const token = params?.token as string;

  const [loading, setLoading] = useState(true);
    const [booking, setBooking] = useState<BookingInfo | null>(null);
    const [notFound, setNotFound] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);

  const [cancelling, setCancelling] = useState(false);
    const [cancelled, setCancelled] = useState(false);
    const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
        if (!token) return;
        (async () => {
                try {
                          const res = await fetch(`/api/bookings/by-token/${token}`);
                          if (res.status === 404) {
                                      setNotFound(true);
                                      return;
                          }
                          if (!res.ok) {
                                      setLoadError('Something went wrong loading this booking.');
                                      return;
                          }
                          const data: BookingInfo = await res.json();
                          setBooking(data);
                          if (data.status === 'cancelled') setCancelled(true);
                } catch {
                          setLoadError('Something went wrong loading this booking.');
                } finally {
                          setLoading(false);
                }
        })();
  }, [token]);

  async function handleCancel() {
        setCancelling(true);
        setActionError(null);
        try {
                const res = await fetch('/api/bookings/cancel', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ token }),
                });
                if (res.ok || res.status === 409) {
                          setCancelled(true);
                } else if (res.status === 404) {
                          setNotFound(true);
                } else {
                          setActionError('Could not cancel this booking. Please try again.');
                }
        } catch {
                setActionError('Could not cancel this booking. Please check your connection and try again.');
        } finally {
                setCancelling(false);
        }
  }

  return (
        <>
              <SiteHeader />
              <main className="flex-grow flex items-center justify-center p-4 md:p-6 pt-28 pb-12">
                      <div className="w-full max-w-lg">
                        {loading && (
                      <div className="bg-surface-container-lowest border border-surface-border rounded-xl shadow-sm p-10 text-center text-text-muted">
                                    Loading booking details…
                      </div>
                    )}
                      
                        {!loading && loadError && (
                      <div className="bg-surface-container-lowest border border-surface-border rounded-xl shadow-sm p-10 text-center">
                                    <h1 className="font-headline text-2xl text-text-main mb-2">Something went wrong</h1>
                                    <p className="text-text-muted">{loadError}</p>
                      </div>
                    )}
                      
                        {!loading && !loadError && notFound && (
                      <div className="bg-surface-container-lowest border border-surface-border rounded-xl shadow-sm p-10 text-center">
                                    <h1 className="font-headline text-2xl text-text-main mb-2">Booking not found</h1>
                                    <p className="text-text-muted">
                                                    This cancellation link is invalid or the booking no longer exists.
                                    </p>
                      </div>
                    )}
                      
                                          {!loading && !loadError && !notFound && cancelled && (
                      <div className="bg-surface-container-lowest border border-surface-border rounded-xl shadow-sm p-10 text-center animate-fade-in">
                                    <div className="w-16 h-16 bg-error-container rounded-full flex items-center justify-center mx-auto mb-6">
                                                    <svg className="w-8 h-8 text-on-error-container" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                    </div>
                                    <h2 className="font-headline text-2xl text-text-main mb-2">Booking Cancelled</h2>
                                    <p className="text-text-muted mb-8">
                                      {booking
                                                          ? `Your reservation for ${booking.room.name} has been cancelled. A confirmation email has been sent.`
                                                          : 'This booking has already been cancelled.'}
                                    </p>
                                    <a
                                                      href="/"
                                                      className="inline-block bg-surface-container-low border border-surface-border text-text-main text-sm font-semibold py-3 px-6 rounded-lg hover:bg-surface-container transition-colors"
                                                    >
                                                    Book Another Room
                                    </a>
                      </div>
                    )}
              
                                  {!loading && !loadError && !notFound && !cancelled && booking && (
                      <div className="bg-surface-container-lowest border border-surface-border rounded-xl shadow-sm p-6 md:p-10">
                                    <div className="text-center mb-8">
                                                    <h1 className="font-headline text-3xl text-text-main mb-2">Cancel Booking</h1>
                                                    <p className="text-text-muted">Are you sure you want to cancel this reservation?</p>
                                    </div>
                      
                                    <div className="bg-surface-container-low rounded-lg p-6 mb-8 border border-surface-border space-y-3">
                                                    <div className="flex items-center justify-between">
                                                                      <span className="text-xs uppercase tracking-wider text-text-muted">Room</span>
                                                                      <span className="font-semibold text-text-main">{booking.room.name}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                                      <span className="text-xs uppercase tracking-wider text-text-muted">Date</span>
                                                                      <span className="font-semibold text-text-main">{formatDateStr(booking.booking_date)}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                                      <span className="text-xs uppercase tracking-wider text-text-muted">Time</span>
                                                                      <span className="font-semibold text-text-main">{formatHourRange(booking.slot_hour)}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                                      <span className="text-xs uppercase tracking-wider text-text-muted">Name</span>
                                                                      <span className="font-semibold text-text-main">{booking.student_name}</span>
                                                    </div>
                                    </div>
                      
                                    
                        {actionError && <p className="text-sm text-booking-error mb-4 text-center">{actionError}</p>}
                      
                                    <div className="flex flex-col space-y-3">
                                                    <button
                                                                        type="button"
                                                                        onClick={handleCancel}
                                                                        disabled={cancelling}
                                                                        className="w-full bg-error text-white text-sm font-semibold py-4 rounded-lg hover:bg-on-error-container transition-colors disabled:opacity-60"
                                                                      >
                                                      {cancelling ? 'Cancelling…' : 'Cancel this booking'}
                                                    </button>
                                                    <a
                                                                        href="/"
                                                                        className="w-full bg-transparent border border-surface-border text-text-main text-sm font-semibold py-4 rounded-lg hover:bg-surface-container-low transition-colors text-center"
                                                                      >
                                                                      Keep Booking
                                                    </a>
                                    </div>
                      </div>
                        )}
              </main>
          <SiteFooter />
    </>
      );
      }
