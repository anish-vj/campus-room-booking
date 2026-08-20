'use client';

import { useEffect, useMemo, useState } from 'react';
import SiteHeader from './components/SiteHeader';
import SiteFooter from './components/SiteFooter';
import { formatDateStr, formatHourRange } from '@/lib/format';
import { isValidEmail } from '@/lib/validation';

type Room = { id: string; name: string; slug: string };
type Slot = { hour: number; booked: boolean };
type Step = 'details' | 'time' | 'confirm' | 'success';

type ConfirmedBooking = {
    room: string;
    booking_date: string;
    slot_hour: number;
    status: string;
};

function getDateOptions(): { value: string; dow: string; day: number }[] {
    const opts = [];
    const now = new Date();
    for (let i = 0; i < 7; i++) {
          const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
          const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
          const dow = d.toLocaleDateString('en-US', { weekday: 'short' });
          opts.push({ value, dow, day: d.getDate() });
    }
    return opts;
}

const STEPS: { key: Step; label: string }[] = [
  { key: 'details', label: 'Details' },
  { key: 'time', label: 'Time' },
  { key: 'confirm', label: 'Confirm' },
  ];

function ProgressBar({ step }: { step: Step }) {
    const activeIndex = STEPS.findIndex((s) => s.key === step);
    return (
          <div className="flex justify-between w-full max-w-md mx-auto mb-10">
    {STEPS.map((s, i) => {
                       const active = i <= activeIndex && step !== 'success';
              return (
                          <div key={s.key} className="w-1/3 relative text-center">
              {i < STEPS.length - 1 && (
                              <div
                                className={`absolute top-3 left-1/2 w-full h-0.5 ${
                                  i < activeIndex ? 'bg-action' : 'bg-surface-border'
                }`}
                             />
                           )}
                  <div
                                  className={`relative z-10 mx-auto w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                                    active ? 'bg-action text-white' : 'bg-surface-border text-text-muted'
                  }`}
                           >
    {i + 1}
                 </div>
                               <div className={`mt-2 text-xs ${active ? 'text-primary font-medium' : 'text-text-muted'}`}>
                 {s.label}
                 </div>
                             </div>
                           );
    })}
    </div>
        );
}

export default function Home() {
    const [step, setStep] = useState<Step>('details');
    const [rooms, setRooms] = useState<Room[]>([]);

  const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [roomSlug, setRoomSlug] = useState('');
    const [detailsError, setDetailsError] = useState<string | null>(null);

  const dateOptions = useMemo(() => getDateOptions(), []);
    const [date, setDate] = useState('');
    const [slots, setSlots] = useState<Slot[] | null>(null);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [slotsError, setSlotsError] = useState<string | null>(null);
    const [selectedHour, setSelectedHour] = useState<number | null>(null);

  const [submitting, setSubmitting] = useState(false);
    const [confirmError, setConfirmError] = useState<string | null>(null);
    const [confirmedBooking, setConfirmedBooking] = useState<ConfirmedBooking | null>(null);

  useEffect(() => {
                fetch('/api/rooms')
          .then((res) => res.json())
          .then((data: Room[]) => {
                        setRooms(data);
                    if (data.length > 0) setRoomSlug((prev) => prev || data[0].slug);
  })
        .catch(() => setDetailsError('Could not load rooms. Please refresh the page.'));
}, []);

  return (
        <>
          <SiteHeader />
      <main className="flex-grow pt-24 pb-12 px-4 md:px-6 max-w-container-max mx-auto w-full flex justify-center items-start">
            <div className="bg-surface-container-lowest w-full max-w-3xl rounded-xl border border-surface-border shadow-sm p-6 md:p-10 mt-6">
  {step !== 'success' && (
                <>
                  <h1 className="font-headline text-3xl md:text-4xl font-bold text-primary text-center mb-6">
                    Reserve a Room
                 </h1>
                                 <ProgressBar step={step} />
               </>
                           )}

{step === 'details' && (
              <form className="space-y-6" onSubmit={handleDetailsSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-on-surface-variant mb-2" htmlFor="fullName">
                      Full Name
                   </label>
                                       <input
                                         id="fullName"
                     type="text"
                     placeholder="e.g. Jane Doe"
                     value={name}
                     onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-surface-border focus:ring-2 focus:ring-action focus:border-action outline-none transition-all bg-surface-bright"
                  />
                                      </div>
                                      <div>
                                        <label className="block text-sm font-semibold text-on-surface-variant mb-2" htmlFor="email">
                                          University Email
                  </label>
                                      <input
                                        id="email"
                    type="email"
                    placeholder="jane.doe@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-surface-border focus:ring-2 focus:ring-action focus:border-action outline-none transition-all bg-surface-bright"
                  />
                                      </div>
                                    </div>

                                    <div>
                                      <label className="block text-sm font-semibold text-on-surface-variant mb-3">Select Room</label>
                                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {rooms.map((room) => {
                                                   const checked = roomSlug === room.slug;
                                          return (
                                                                  <button
                                                                    type="button"
                                              key={room.id}
                                                       onClick={() => setRoomSlug(room.slug)}
                        className={`block w-full p-4 rounded-xl border-2 text-left transition-all ${
                                                    checked
                                                      ? 'border-action bg-primary-fixed'
                                                      : 'border-surface-border bg-surface-bright hover:border-action'
                        }`}
                      >
                                                <span className="font-headline text-xl text-primary">{room.name}</span>
                                              </button>
                                            );
})}
{rooms.length === 0 && (
                      <p className="text-sm text-text-muted col-span-3">Loading rooms…</p>
                    )}
                </div>
                                </div>

                {detailsError && <p className="text-sm text-booking-error">{detailsError}</p>}

                                <div className="pt-6 mt-6 border-t border-surface-border flex justify-end">
                                  <button
                                    type="submit"
                                   className="px-8 py-3 rounded-lg bg-action text-white text-sm font-semibold hover:bg-action-hover transition-colors shadow-sm flex justify-center items-center gap-2"
                                 >
                                                     Find Slots
                                 </button>
                                                 </div>
                                               </form>
                                             )}

{step === 'time' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-on-surface-variant mb-3">Select Date</label>
                  <div className="flex overflow-x-auto pb-2 gap-3 no-scrollbar">
{dateOptions.map((opt) => {
                                     const active = date === opt.value;
                      return (
                                              <button
                                                type="button"
                          key={opt.value}
                                         onClick={() => handleSelectDate(opt.value)}
                         className={`flex-none w-20 py-3 rounded-lg border-2 flex flex-col items-center justify-center transition-colors ${
                                                     active
                                                       ? 'border-action bg-primary-fixed text-primary'
                                                       : 'border-surface-border bg-surface-bright text-on-surface-variant hover:border-action'
                         }`}
                      >
                                                <span className="text-xs uppercase tracking-wider">{opt.dow}</span>
                                                <span className="font-headline text-xl">{opt.day}</span>
                                              </button>
                                            );
})}
                </div>
                                </div>

                                <div>
                                  <div className="flex justify-between items-end mb-3">
                                    <label className="block text-sm font-semibold text-on-surface-variant">Select a Time Slot</label>
                                    <div className="flex gap-4 text-xs">
                                      <span className="flex items-center gap-1">
                                        <span className="w-3 h-3 rounded-full border border-surface-border bg-white inline-block" /> Available
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <span className="w-3 h-3 rounded-full bg-surface-container-low border border-surface-border inline-block" /> Booked
                                      </span>
                                    </div>
                                  </div>

                {slotsLoading && <p className="text-sm text-text-muted">Loading availability…</p>}
                {slotsError && <p className="text-sm text-booking-error">{slotsError}</p>}
                {confirmError && <p className="text-sm text-booking-error mb-3">{confirmError}</p>}

                {!slotsLoading && grouped && slots && slots.every((s) => s.booked) && (
                                    <p className="text-sm text-text-muted">No slots available for this date, try another date.</p>
                                  )}

                 {!slotsLoading && grouped && !(slots && slots.every((s) => s.booked)) && (
                                     <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-64 overflow-y-auto pr-2 no-scrollbar">
                                       <div className="col-span-full text-xs text-text-muted mt-2 mb-1 border-b border-surface-border pb-1">
                                         Morning
                                      </div>
                                      {grouped.morning.map(renderSlotButton)}
                                      <div className="col-span-full text-xs text-text-muted mt-4 mb-1 border-b border-surface-border pb-1">
                                                              Afternoon
                                      </div>
                                      {grouped.afternoon.map(renderSlotButton)}
                                      <div className="col-span-full text-xs text-text-muted mt-4 mb-1 border-b border-surface-border pb-1">
                                                              Evening
                                      </div>
                                      {grouped.evening.map(renderSlotButton)}
                                    </div>
                                                      )}
                               </div>

                                               <div className="pt-6 mt-6 border-t border-surface-border flex flex-col-reverse sm:flex-row justify-between gap-4">
                                                 <button
                                                   type="button"
                                   onClick={() => setStep('details')}
                  className="px-6 py-3 rounded-lg border border-surface-border text-on-surface-variant text-sm font-semibold hover:bg-surface-container-low transition-colors w-full sm:w-auto"
                >
                                    Back
                </button>
                                  <button
                                    type="button"
                  disabled={selectedHour === null}
                  onClick={goToConfirm}
                  className="px-8 py-3 rounded-lg bg-action text-white text-sm font-semibold hover:bg-action-hover transition-colors shadow-sm w-full sm:w-auto disabled:opacity-40 disabled:cursor-not-allowed"
                >
                                    Continue
                </button>
                                </div>
                              </div>
                            )}

                {step === 'confirm' && selectedHour !== null && (
                              <div className="space-y-6">
                                <div className="bg-surface-container-low p-6 rounded-lg border border-surface-border space-y-3">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs uppercase tracking-wider text-text-muted">Room</span>
                                    <span className="font-semibold text-text-main">{selectedRoom?.name}</span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs uppercase tracking-wider text-text-muted">Date</span>
                                    <span className="font-semibold text-text-main">{formatDateStr(date)}</span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs uppercase tracking-wider text-text-muted">Time</span>
                                    <span className="font-semibold text-text-main">{formatHourRange(selectedHour)}</span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs uppercase tracking-wider text-text-muted">Name</span>
                                    <span className="font-semibold text-text-main">{name}</span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs uppercase tracking-wider text-text-muted">Email</span>
                                    <span className="font-semibold text-text-main">{email}</span>
                                  </div>
                                </div>

                {confirmError && <p className="text-sm text-booking-error">{confirmError}</p>}

                                <div className="pt-6 mt-6 border-t border-surface-border flex flex-col-reverse sm:flex-row justify-between gap-4">
                                  <button
                                                      type="button"
                  onClick={() => setStep('time')}
                  disabled={submitting}
                  className="px-6 py-3 rounded-lg border border-surface-border text-on-surface-variant text-sm font-semibold hover:bg-surface-container-low transition-colors w-full sm:w-auto disabled:opacity-40"
                >
                                    Back
                </button>
                                  <button
                                    type="button"
                  onClick={handleConfirmBooking}
                  disabled={submitting}
                  className="px-8 py-3 rounded-lg bg-action text-white text-sm font-semibold hover:bg-action-hover transition-colors shadow-sm w-full sm:w-auto disabled:opacity-60"
                >
                {submitting ? 'Confirming…' : 'Confirm Booking'}
                </button>
                                </div>
                              </div>
                            )}

                {step === 'success' && confirmedBooking && (
                              <div className="flex flex-col items-center text-center">
                                <div className="w-20 h-20 bg-success-container rounded-full flex items-center justify-center mb-6">
                                  <svg className="w-10 h-10 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                                <h1 className="font-headline text-3xl md:text-4xl font-bold text-primary mb-3">Booking Confirmed</h1>
                                <p className="text-on-surface-variant mb-8 max-w-md">
                                  Your room has been successfully reserved. A confirmation email with a cancellation link has been
                                 sent to your email.
                                                 </p>

                                                 <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 text-left mb-8">
                                                   <div className="bg-surface-container-low p-4 rounded-lg border border-surface-border">
                                                     <span className="text-xs uppercase tracking-wider text-text-muted block mb-1">Room</span>
                                                     <p className="text-lg text-text-main font-semibold">{confirmedBooking.room}</p>
                                                   </div>
                                                   <div className="bg-surface-container-low p-4 rounded-lg border border-surface-border">
                                                     <span className="text-xs uppercase tracking-wider text-text-muted block mb-1">Date &amp; Time</span>
                                                     <p className="text-lg text-text-main font-semibold">{formatDateStr(confirmedBooking.booking_date)}</p>
                                                     <p className="text-text-muted">{formatHourRange(confirmedBooking.slot_hour)}</p>
                                                   </div>
                                                   <div className="bg-surface-container-low p-4 rounded-lg border border-surface-border md:col-span-2 flex flex-col md:flex-row md:items-center justify-between gap-3">
                                                     <div>
                                                       <span className="text-xs uppercase tracking-wider text-text-muted block mb-1">
                                                         Student Details
                    </span>
                                          <p className="text-text-main font-semibold">{name}</p>
                                          <p className="text-text-muted">{email}</p>
                                        </div>
                                        <div className="inline-flex items-center bg-surface-container-lowest border border-surface-border px-3 py-1 rounded-full self-start md:self-center">
                                          <span className="w-2 h-2 rounded-full bg-success mr-2" />
                                          <span className="text-xs text-text-main">Confirmed</span>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                                      <button
                                        type="button"
                  onClick={() => resetWizard(false)}
                  className="bg-action hover:bg-action-hover text-white text-sm font-semibold px-6 py-3 rounded-lg transition-colors flex-1 sm:flex-none"
                >
                                    Return to Home
                </button>
                                  <button
                                    type="button"
                  onClick={() => resetWizard(true)}
                  className="bg-transparent border border-surface-border hover:bg-surface-container-low text-on-surface-variant text-sm font-semibold px-6 py-3 rounded-lg transition-colors flex-1 sm:flex-none"
                >
                                    Book Another Room
                </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </main>
                        <SiteFooter />
                      </>
                    );
}
