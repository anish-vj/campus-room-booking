import { formatDateStr, formatHourRange } from './format';

const RESEND_API_URL = 'https://api.resend.com/emails';

function getFromAddress(): string {
    return process.env.RESEND_FROM_EMAIL || 'CampusReserve <onboarding@resend.dev>';
}

function escapeHtml(input: string): string {
    return input.replace(/[&<>"']/g, (c) => {
          switch (c) {
            case '&':
                      return '&amp;';
            case '<':
                      return '&lt;';
            case '>':
                      return '&gt;';
            case '"':
                      return '&quot;';
            default:
                      return '&#39;';
          }
    });
}

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
          console.error('RESEND_API_KEY not configured; skipping email send to', to);
          return;
    }
    try {
          const res = await fetch(RESEND_API_URL, {
                  method: 'POST',
                  headers: {
                            Authorization: `Bearer ${apiKey}`,
                            'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ from: getFromAddress(), to, subject, html }),
          });
          if (!res.ok) {
                  const body = await res.text();
                  console.error('Resend email failed', res.status, body);
          }
    } catch (err) {
          console.error('Resend email error', err);
    }
}

export async function sendBookingConfirmationEmail(params: {
    to: string;
    studentName: string;
    roomName: string;
    date: string;
    hour: number;
    cancellationToken: string;
    baseUrl: string;
}): Promise<void> {
    const { to, studentName, roomName, date, hour, cancellationToken, baseUrl } = params;
    const cancelUrl = `${baseUrl}/cancel/${cancellationToken}`;
    const subject = `Your room booking is confirmed — ${roomName} on ${formatDateStr(date)}`;
    const html = `
        <p>Hi ${escapeHtml(studentName)},</p>
            <p>Your room booking is confirmed. Here are the details:</p>
                <ul>
                      <li><strong>Room:</strong> ${escapeHtml(roomName)}</li>
                            <li><strong>Date:</strong> ${formatDateStr(date)}</li>
                                  <li><strong>Time:</strong> ${formatHourRange(hour)}</li>
                                      </ul>
                                          <p>Need to cancel? Use this link: <a href="${cancelUrl}">${cancelUrl}</a></p>
                                              <p>&mdash; CampusReserve</p>
                                                `;
    await sendEmail(to, subject, html);
}

export async function sendCancellationEmail(params: {
    to: string;
    studentName: string;
    roomName: string;
    date: string;
    hour: number;
}): Promise<void> {
    const { to, studentName, roomName, date, hour } = params;
    const subject = `Your booking for ${roomName} on ${formatDateStr(date)} has been cancelled`;
    const html = `
        <p>Hi ${escapeHtml(studentName)},</p>
            <p>Your booking has been cancelled:</p>
                <ul>
                      <li><strong>Room:</strong> ${escapeHtml(roomName)}</li>
                            <li><strong>Date:</strong> ${formatDateStr(date)}</li>
                                  <li><strong>Time:</strong> ${formatHourRange(hour)}</li>
                                      </ul>
                                          <p>This slot is now available for others to book.</p>
                                              <p>&mdash; CampusReserve</p>
                                                `;
    await sendEmail(to, subject, html);
}
