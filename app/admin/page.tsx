'use client';

import { useEffect, useMemo, useState } from 'react';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import { formatDateStr, formatHourRange } from '@/lib/format';

type Room = { id: string; name: string; slug: string };
type AdminBooking = {
    id: string;
    room: string;
    room_slug: string;
    student_name: string;
    student_email: string;
    booking_date: string;
    slot_hour: number;
    status: 'confirmed' | 'cancelled';
    created_at: string;
};

export default function AdminPage() {
    const [checkingSession, setCheckingSession] = useState(true);
    const [authed, setAuthed] = useState(false);

  const [pin, setPin] = useState('');
    const [loginError, setLoginError] = useState<string | null>(null);
    const [loggingIn, setLoggingIn] = useState(false);

  const [rooms, setRooms] = useState<Room[]>([]);
    const [bookings, setBookings] = useState<AdminBooking[] | null>(null);
    const [loadingBookings, setLoadingBookings] = useState(false);
    const [roomFilter, setRoomFilter] = useState('');
    const [dateFilter, setDateFilter] = useState('');

  async function loadBookings() {
        setLoadingBookings(true);
        const qs = new URLSearchParams();
        if (roomFilter) qs.set('room_slug', roomFilter);
        if (dateFilter) qs.set('date', dateFilter);
        try {
                const res = await fetch(`/api/admin/bookings?${qs.toString()}`);
                if (res.ok) {
                          setBookings(await res.json());
                } else if (res.status === 401) {
                          setAuthed(false);
                }
        } finally {
                setLoadingBookings(false);
        }
  }

  useEffect(() => {
                (async () => {
                       const res = await fetch('/api/admin/bookings');
                        if (res.ok) {
                                  setAuthed(true);
                                  setBookings(await res.json());
                        }
                        setCheckingSession(false);
                })();
        fetch('/api/rooms')
          .then((res) => res.json())
          .then(setRooms)
          .catch(() => {});
  }, []);

  useEffect(() => {
                if (authed) loadBookings();
        // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed, roomFilter, dateFilter]);

  async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setLoggingIn(true);
        setLoginError(null);
        try {
                const res = await fetch('/api/admin/login', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ pin }),
                });
                if (res.ok) {
                          setAuthed(true);
                          setPin('');
                } else {
                          setLoginError('Incorrect PIN. Please try again.');
                }
        } catch {
                setLoginError('Something went wrong. Please try again.');
        } finally {
                setLoggingIn(false);
        }
  }

  async function handleLogout() {
        await fetch('/api/admin/logout', { method: 'POST' });
        setAuthed(false);
        setBookings(null);
  }

  const stats = useMemo(() => {
                            if (!bookings) return { total: 0, confirmed: 0, cancelled: 0 };
        return {
                total: bookings.length,
                confirmed: bookings.filter((b) => b.status === 'confirmed').length,
                cancelled: bookings.filter((b) => b.status === 'cancelled').length,
        };
  }, [bookings]);

  return (
        <>
          <SiteHeader />
          <main className="flex-grow pt-24 pb-12 px-4 md:px-6 max-w-container-max mx-auto w-full">
  {checkingSession && <p className="text-center text-text-muted mt-20">Loading…</p>}

  {!checkingSession && !authed && (
              <section className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="bg-surface-container-lowest border border-surface-border rounded-xl p-8 w-full max-w-md shadow-sm">
                  <div className="text-center mb-6">
                    <svg className="w-10 h-10 text-primary mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                    <h1 className="font-headline text-2xl font-bold text-text-main">Admin Access</h1>
                    <p className="text-text-muted mt-2 text-sm">Enter the admin PIN to access the dashboard.</p>
                  </div>
                  <form className="space-y-4" onSubmit={handleLogin}>
                    <div>
                      <label className="block text-sm font-semibold text-text-main mb-2 text-center" htmlFor="pin-input">
                        Admin PIN
                     </label>
                                         <div className="flex justify-center">
                                           <input
                                             id="pin-input"
                         autoComplete="off"
                         className="w-40 text-center text-xl tracking-[0.4em] rounded-lg border border-surface-border focus:border-action focus:ring-2 focus:ring-action outline-none py-3"
                         maxLength={16}
                         placeholder="••••"
                         required
                         type="password"
                         value={pin}
                         onChange={(e) => {
                                                   setPin(e.target.value);
                           setLoginError(null);
  }}
                    />
                  </div>
                  {loginError && <p className="text-xs text-booking-error text-center mt-2">{loginError}</p>}
                                    </div>
                                    <button
                                      type="submit"
                                     disabled={loggingIn}
                                     className="w-full bg-action hover:bg-action-hover text-white text-sm font-semibold py-3 rounded-lg transition-colors disabled:opacity-60"
                                   >
                                   {loggingIn ? 'Checking…' : 'Authenticate'}
                                   </button>
                                                   </form>
                                                 </div>
                                               </section>
                                             )}

{!checkingSession && authed && (
            <section className="flex flex-col gap-8 mt-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h1 className="font-headline text-3xl font-bold text-text-main">Bookings Overview</h1>
                  <p className="text-text-muted mt-1 text-sm">All campus room reservations, confirmed and cancelled.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  <select
                    value={roomFilter}
                   onChange={(e) => setRoomFilter(e.target.value)}
                  className="w-full sm:w-44 px-3 py-2 rounded-lg border border-surface-border bg-surface-container-lowest focus:ring-2 focus:ring-action focus:border-action text-sm text-text-main"
                >
                                    <option value="">All Rooms</option>
                {rooms.map((room) => (
                                      <option key={room.slug} value={room.slug}>
                {room.name}
                    </option>
                                        ))}
                                      </select>
                                      <input
                                        type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full sm:w-44 px-3 py-2 rounded-lg border border-surface-border bg-surface-container-lowest focus:ring-2 focus:ring-action focus:border-action text-sm text-text-main"
                />
                                    <button
                                      type="button"
                  onClick={handleLogout}
                  className="bg-surface-container-low hover:bg-surface-container-high border border-surface-border text-text-main text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                >
                                    Log out
                </button>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-surface-container-lowest border border-surface-border rounded-xl p-5 flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-headline font-bold">
                                    #
                                  </div>
                                  <div>
                                    <p className="text-xs uppercase tracking-wider text-text-muted">Total Bookings</p>
                                    <p className="font-headline text-2xl text-text-main">{stats.total}</p>
                                  </div>
                                </div>
                                <div className="bg-surface-container-lowest border border-surface-border rounded-xl p-5 flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-full bg-success-container flex items-center justify-center text-success font-headline font-bold">
                                    ✓
                </div>
                                  <div>
                                    <p className="text-xs uppercase tracking-wider text-text-muted">Confirmed</p>
                                    <p className="font-headline text-2xl text-text-main">{stats.confirmed}</p>
                                  </div>
                                </div>
                                <div className="bg-surface-container-lowest border border-surface-border rounded-xl p-5 flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-text-muted font-headline font-bold">
                                    ✕
                </div>
                                  <div>
                                    <p className="text-xs uppercase tracking-wider text-text-muted">Cancelled</p>
                                    <p className="font-headline text-2xl text-text-main">{stats.cancelled}</p>
                                  </div>
                                </div>
                              </div>

                              <div className="bg-surface-container-lowest border border-surface-border rounded-xl overflow-hidden shadow-sm">
                                <div className="overflow-x-auto">
                                  <table className="w-full text-left border-collapse">
                                    <thead>
                                      <tr className="border-b border-surface-border bg-surface-bright">
                                        <th className="py-3 px-4 text-xs uppercase tracking-wider text-text-muted">Room</th>
                                        <th className="py-3 px-4 text-xs uppercase tracking-wider text-text-muted">Student</th>
                                        <th className="py-3 px-4 text-xs uppercase tracking-wider text-text-muted hidden md:table-cell">
                                          Email
                      </th>
                                              <th className="py-3 px-4 text-xs uppercase tracking-wider text-text-muted">Date</th>
                                              <th className="py-3 px-4 text-xs uppercase tracking-wider text-text-muted">Slot</th>
                                              <th className="py-3 px-4 text-xs uppercase tracking-wider text-text-muted">Status</th>
                                            </tr>
                                          </thead>
                                          <tbody className="text-sm text-text-main">
                      {loadingBookings && (
                                              <tr>
                                                <td colSpan={6} className="py-8 text-center text-text-muted">
                                                  Loading bookings…
                                               </td>
                                                                       </tr>
                                                                     )}
{!loadingBookings && bookings && bookings.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-text-muted">
                            No bookings found.
                          </td>
                        </tr>
                      )}
{!loadingBookings &&
                        bookings?.map((b, i) => (
                                                  <tr
                                                    key={b.id}
                          className={`border-b border-surface-border last:border-b-0 hover:bg-surface-container-low transition-colors ${
                                                        i % 2 === 1 ? 'bg-surface-container-low/40' : ''
                          }`}
                        >
                                                    <td className="py-3 px-4 font-medium">{b.room}</td>
                                                    <td className="py-3 px-4">{b.student_name}</td>
                                                    <td className="py-3 px-4 text-text-muted hidden md:table-cell">{b.student_email}</td>
                                                    <td className="py-3 px-4">{formatDateStr(b.booking_date)}</td>
                                                    <td className="py-3 px-4">{formatHourRange(b.slot_hour)}</td>
                                                    <td className="py-3 px-4">
                        {b.status === 'confirmed' ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-success-container text-success text-xs font-medium">
                                                          <span className="w-1.5 h-1.5 rounded-full bg-success" />
                                                          Confirmed
                                                        </span>
                                                      ) : (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-surface-container-high text-text-muted text-xs font-medium">
                                                          <span className="w-1.5 h-1.5 rounded-full bg-text-muted" />
                                                          Cancelled
                                                       </span>
                                                                                     )}
                          </td>
                                                    </tr>
                                                  ))}
                                              </tbody>
                                            </table>
                                          </div>
                                        </div>
                                      </section>
                                    )}
                                  </main>
                                  <SiteFooter />
                                </>
                              );
}
