import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase";

// ──────────────────────────────────────────────────────────
// ⬇️  Change this to your deployed /request URL before the gig.
//     During local dev you can leave it as-is.
// ──────────────────────────────────────────────────────────
const REQUEST_URL = window.location.origin + "/request";

interface SongRequest {
  id: string;
  song: string;
  note?: string;
  createdAt: Timestamp | null;
}

export default function DJScreen() {
  const [requests, setRequests] = useState<SongRequest[]>([]);

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

  return (
    <div className="dj-screen">
      <h1>DJ Requests</h1>
      <p className="subtitle">Scan to request a song</p>

      <div className="qr-wrapper">
        <QRCodeSVG
          value={REQUEST_URL}
          size={250}
          bgColor="#1a1a2e"
          fgColor="#e0e0e0"
          level="H"
        />
      </div>

      <p className="url-hint">{REQUEST_URL}</p>

      <div className="request-list">
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
