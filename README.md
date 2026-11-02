# PlayPin

Start YouTube videos at your chosen playback speed and highest available quality.

PlayPin is a small Chrome extension that remembers your preferred playback speed and asks YouTube for the highest available non-auto quality when each video starts.

## Install

PlayPin is not in the Chrome Web Store yet, so you install it yourself.

1. Download the zip from the [latest release](https://github.com/bjorkepoc/playpin/releases/latest) and unpack it.
2. Keep the folder somewhere permanent. Chrome loads the extension from it.
3. Open `chrome://extensions`.
4. Enable Developer mode.
5. Click Load unpacked and select the folder.

## Use

Click the PlayPin icon, choose a speed and leave Max quality on. PlayPin applies your settings when a video starts. It leaves ads alone and applies your settings when the video itself begins. You can still change speed or quality in YouTube for that video.

## Development

```bash
npm test
npm run icons
npm run package
```

The upload zip is written to `dist/playpin-0.1.1.zip`.

## Privacy

No tracking, analytics, account, or remote server. PlayPin stores only speed and max-quality preferences in Chrome extension storage. See the [privacy policy](https://bjorkepoc.github.io/playpin/site/privacy.html).

## License

MIT
