---
name: youtube-transcript
description: Get the transcript of a YouTube video so Claude can read it as working context. Use when the user shares a YouTube link and wants it understood, summarized, compared, or worked into something else ("get the transcript", "watch this video", "what does he say in this video"). Output is scratch context only; never filed into a wiki, repo or knowledge base unless the user asks.
---

# YouTube transcript

The transcript is **context for this session**, not a deliverable. Save it to the
session scratchpad, read it, and work from it. Do not put it in `wiki/raw/`, the
repo, or any shared store unless the user explicitly asks for that.

Work down the chain. Stop at the first step that returns text. Do not retry a
step that has already failed twice in this session: YouTube's blocks are per IP
and last hours, so retrying burns time and makes the block worse.

## 1. yt-dlp (fast, no browser)

Ask for the original-language track only. Requesting every language (`en.*`)
fans out into dozens of requests and triggers a 429 on its own.

```bash
yt-dlp --no-update --skip-download --write-subs --write-auto-subs \
  --sub-langs "en,en-orig" --sub-format vtt --sleep-subtitles 2 \
  --print "%(title)s | %(channel)s | %(upload_date)s | %(duration_string)s" --no-simulate \
  -o "<scratchpad>/yt/%(id)s.%(ext)s" "<url>"
node "<this skill dir>/vtt-to-text.mjs" "<scratchpad>/yt/<id>.en.vtt" > "<scratchpad>/yt/<id>.md"
```

`HTTP Error 429` or `PO token` warnings mean YouTube has flagged this machine as
a bot. Go to step 2. If yt-dlp warns it is older than 90 days, tell the user and
offer `winget upgrade --id yt-dlp.yt-dlp` (Windows) before going on.

## 2. Claude in Chrome (reliable, uses the user's real browser)

Needs the Claude in Chrome extension connected. Load the `chrome-browser` skill
first and follow it (tab context, new tab, close it after).

1. Navigate a new tab to the video URL. A pre-roll ad and a reload can happen
   in the first seconds, so screenshot before acting.
2. Bring the button into view and get its position. **A scripted `.click()`
   does not open the panel; it only spins.** It needs a real click.

```js
document.querySelector('ytd-player video')?.pause();
document.querySelector('#description-inline-expander #expand, tp-yt-paper-button#expand')?.click();
await new Promise(r => setTimeout(r, 1000));
const b = [...document.querySelectorAll('button')].find(b => /show transcript/i.test(b.innerText));
b.scrollIntoView({ block: 'center' });
await new Promise(r => setTimeout(r, 500));
const r = b.getBoundingClientRect();
[Math.round(r.x + r.width / 2), Math.round(r.y + r.height / 2), window.innerWidth]
```

3. Take a screenshot, then `left_click` the "Show transcript" button with the
   computer tool. Screenshot coordinates differ from CSS pixels, so use the
   screenshot, not the numbers above.
4. Read the panel (target id `engagement-panel-searchable-transcript`), keeping
   chapter headings:

```js
await new Promise(r => setTimeout(r, 3000));
const list = document.querySelector('[target-id="engagement-panel-searchable-transcript"] ytd-transcript-segment-list-renderer');
window.__yt = [...list.querySelectorAll('ytd-transcript-section-header-renderer, ytd-transcript-segment-renderer')]
  .map(e => e.tagName === 'YTD-TRANSCRIPT-SECTION-HEADER-RENDERER'
    ? '\n\n## ' + e.innerText.trim() + '\n'
    : (e.querySelector('.segment-text')?.innerText.trim() || ''))
  .join(' ').replace(/[ \t]+/g, ' ');
[window.__yt.length, list.querySelectorAll('ytd-transcript-segment-renderer').length]
```

5. The javascript tool truncates output at about 1,000 characters. Read
   `window.__yt.slice(i, i + 900)` for every 900-character window, all inside
   **one `browser_batch` call** (8 to 10 slices per batch), not one call each.
   **Do not try the clipboard**: `navigator.clipboard.writeText` hangs the tab
   for 45 seconds and writes nothing.

If zero segments come back, take a screenshot: the video may have no captions,
or the button label may have moved. Do not click around hunting for it more than
twice. Close the tab when done.

## 3. Ask the user to paste it

If Chrome is not connected and yt-dlp is blocked, say so in one line and ask
the user to either reconnect the extension or paste the transcript (on YouTube:
description → **Show transcript** → select all in the panel → copy).

## After you have it

- Say which step produced it, plus title, channel, date and length.
- Auto-captions have no punctuation and mangle names and jargon. Correct obvious
  mis-hearings from context, and flag any you are unsure of instead of guessing.
- Then do what the user actually asked for with it.
