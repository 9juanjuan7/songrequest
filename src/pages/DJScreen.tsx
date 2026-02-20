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
      setShowUpNext(true);
    } catch {
      setError("Something went wrong, please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="dj-screen">
      <h1>Request a Song RMBS 2026</h1>

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
                🔥 Play Up Next
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ── Up-next popup ── */}
      {showUpNext && (
        <div className="modal-overlay" onClick={() => setShowUpNext(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <p>😂 E-transfer <strong>$7</strong> to</p>
            <p className="email">9juanjuan7@gmail.com</p>
            <p>and I'll play it next!</p>
            <button onClick={() => setShowUpNext(false)}>Got it</button>
          </div>
        </div>
      )}

      {/* ── QR code ── */}
      <div className="qr-section">
        <p className="subtitle">Or scan to request from your phone</p>
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
    </div>
  );
}
