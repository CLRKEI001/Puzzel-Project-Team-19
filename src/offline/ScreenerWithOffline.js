// Use this wherever the app currently renders <PuzzleBoxScreener ... />.
//
// Online it renders the normal screener, unchanged. With no signal (or when
// the teacher chooses "Screen offline", via `preferOffline`) it opens the
// offline screener: the downloaded, encrypted package inside
// OfflineScreenerShell, which handles expiry, watermarking and copy blocking.
//
// The choice is made once when the screener opens, so it never switches
// mode in the middle of a screening.

import React, { useState } from "react";
import PuzzleBoxScreener from "../components/PuzzleBoxScreener";
import OfflineScreenerShell from "./OfflineScreenerShell";

export default function ScreenerWithOffline({ preferOffline = false, ...props }) {
  const [offlineMode] = useState(() => preferOffline || !navigator.onLine);

  if (!offlineMode) return <PuzzleBoxScreener {...props} />;

  return (
    <OfflineScreenerShell>
      {(screener, licence) => (
        <PuzzleBoxScreener {...props} offline={{ screener, licence }} />
      )}
    </OfflineScreenerShell>
  );
}
