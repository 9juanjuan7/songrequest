import { FormEvent, useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export default function RequestScreen() {
  const [song, setSong] = useState("");
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [showUpNext, setShowUpNext] = useState(false);

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
    } catch {
      setError("Something went wrong, please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="request-screen">
      <div className="card">
        <h1>Request a Song 🎵</h1>

        {sent ? (
          <div className="success">
            <p>Thanks, your request was sent!</p>
            <button onClick={() => setSent(false)}>Request another</button>
          </div>
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
                🔥 Request & Play NOW
              </button>
            </div>
          </form>
        )}
      </div>

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
    </div>
  );
}
