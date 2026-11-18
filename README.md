# Watch MK1 phone settings page

A web page that sets up the Watch MK1 over Bluetooth: time and time zone, watch face, alarms,
sounds, display, the text lines and the boot welcome messages (40K / Titanfall 2). Open it at **https://talkinmuffin.github.io/watch/**.

- Works in Chrome / Edge on Android and desktop (Web Bluetooth). On iPhone/iPad use the free
  **Bluefy** browser; Safari has no Web Bluetooth.
- On the watch open `Menu > Phone > Pair`, scan the QR code, tap **Connect watch** and type the PIN.
- The PIN is only needed once per phone. Bluefy and Chrome (with its Bluetooth permission flags on) then reconnect
  to the same watch without the device list, and when the page opens (watch awake) it reconnects by itself, with no tap;
  otherwise you pick the watch each time, but still no PIN.
- The page footer shows its version; after an update a "New version ready: tap to reload" button appears.
- **Try demo** runs a pretend watch, no hardware needed.
- **Sound Lab** (Sounds section): hear every watch sound, and turn your own audio files into clips
  the watch can play (download them, or send them to the watch over Bluetooth). No watch needed.
- Install it from Chrome's menu (Install app / Add to Home screen); it then works offline.

`index.html` is the whole page; `sounds.js` holds the watch's built-in sounds (all original);
`manifest.webmanifest`, `sw.js` and `icons/` make it installable. Hosted with GitHub Pages from the
`main` branch root. Nothing is sent anywhere: the page talks only to the watch.

The **Heartbeat Scanner** settings page lives in the `scanner/` folder of this repo
(https://talkinmuffin.github.io/watch/scanner/), with its own installable app. `sw.js` here is
version `watchmk1-v8`: it ignores everything under `scanner/`, only deletes its own
`watchmk1-` caches, and keeps only its own start page (answered 200) as the offline copy, so the two
apps never overwrite each other offline.
