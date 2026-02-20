import { FormEvent, useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase";

const REQUEST_URL = window.location.origin + "/request";

interface SongRequest {
  id: string;
  song: string;
  note?: string;
  createdAt: Timestamp | null;
}

export default function DJScreen() {
  const [requests, setRequests] = useState<SongRequest[]>([]);

  // ── inline form state ──
  const [song, setSong] = useState("");
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [showUpNext, setShowUpNext] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, "requests"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      setRequests(
        snap.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<SongRequest, "id">),
        }))
      );
    });

    return unsub;
  }, []);

  const formatTime = (ts: Timestamp | null) => {
    if (!ts) return "--:--";
    const d = ts.toDate();
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmed = song.trim();
    if (!trimmed) {
      setError("Please enter a song + artist.");
      return;
    }

    setSending(true);
    try {
      await addDoc(collection(db, "requests"), {
        song: trimmed,
        note: note.trim() || null,
        createdAt: serverTimestamp(),
      });
      setSong("");
      setNote("");
      setSent(true);
      setTimeout(() => setSent(false), 3000);
    } catch {
      setError("Something went wrong, please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleUpNext = async () => {
    setError("");
    const trimmed = song.trim();
    if (!trimmed) {
      setError("Please enter a song + artist.");
      return;
    }

    setSending(true);
    try {
      await addDoc(collection(db, "requests"), {
        song: trimmed,
        note: note.trim() || null,
        createdAt: serverTimestamp(),
        priority: true,
      });
      setSong("");
      setNote("");
      setSent(true);
      setShowUpNext(true);
      setTimeout(() => setSent(false), 3000);
    } catch {
      setError("Something went wrong, please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="dj-screen">
      <h1>Request a Song RMBS 2026</h1>
      <p className="rate-limit-hint">Please limit to one request every 30 minutes ❤️<br>if its shit im not playing it</br></p>

      {/* ── Inline request form ── */}
      <div className="card inline-card">
        {sent ? (
          <p className="inline-success">Thanks, your request was sent!</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <label htmlFor="song">Song + Artist *</label>
            <input
              id="song"
              type="text"
              placeholder='e.g. "Blinding Lights – The Weeknd"'
              value={song}
              onChange={(e) => setSong(e.target.value)}
              autoFocus
            />

            <label htmlFor="note">Message / Dedication</label>
            <input
              id="note"
              type="text"
              placeholder="Optional"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />

            {error && <p className="error">{error}</p>}

            <div className="btn-row">
              <button type="submit" disabled={sending}>
                {sending ? "Sending…" : "Send Request"}
              </button>
              <button
                type="button"
                className="btn-upnext"
                disabled={sending}
                onClick={handleUpNext}
              >
                🔥Request & Play NOW
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ── Up-next popup ── */}
      {showUpNext && (
        <div className="modal-overlay" onClick={() => setShowUpNext(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <p>haha e-transfer <strong>$7</strong> to</p>
            <p className="email">9juanjuan7@gmail.com</p>
            <p>and i'll do it</p>
            <button onClick={() => setShowUpNext(false)}>Got it</button>
          </div>
        </div>
      )}

      {/* ── QR code ── */}
      <div className="qr-section">
        <p className="subtitle">Or scan to request</p>
        <div className="qr-wrapper">
          <QRCodeSVG
            value={REQUEST_URL}
            size={200}
            bgColor="#1a1a2e"
            fgColor="#e0e0e0"
            level="H"
          />
        </div>
        <p className="url-hint">{REQUEST_URL}</p>
      </div>

      {/* ── Live request list ── */}
      <div className="request-list">
        <h2>Live Requests</h2>
        {requests.length === 0 && (
          <p className="empty">No requests yet — waiting for songs…</p>
        )}
        {requests.map((r) => (
          <div key={r.id} className="request-item">
            <span className="time">{formatTime(r.createdAt)}</span>
            <span className="song">{r.song}</span>
            {r.note && <span className="note">— {r.note}</span>}
          </div>
        ))}
      </div>

      <footer className="connect-footer">
        <p>Connect with the DJ</p>
        <div className="social-links">
          <a href="https://www.instagram.com/9juanjuan7/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5A4.25 4.25 0 0 0 20.5 16.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm5.25-2a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5Z"/></svg>
          </a>
          <a href="https://www.linkedin.com/in/juan-rea7" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77Z"/></svg>
          </a>
        </div>
      </footer>
    </div>
  );
}
