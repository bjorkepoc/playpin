# PlayPin Chrome Web Store Listing

## Name

PlayPin

## Short Description

Start YouTube videos at your chosen speed and highest available quality.

## Detailed Description

PlayPin starts YouTube playback the way you prefer.

Choose a speed once, such as 1.25x, 1.5x, or 2x. PlayPin applies that speed when a video starts or when you move to another video. When max quality is enabled, it asks YouTube for the highest non-auto quality level available for the current video.

Useful for lectures, tutorials, podcasts, reviews, and long videos where YouTube keeps falling back to Auto or normal speed.

PlayPin is intentionally small:

- Pick a fixed playback speed
- Use quick presets or a custom value
- Ask for the highest available YouTube quality
- Runs only on YouTube pages
- No account required
- No tracking, analytics, or remote server

YouTube may still limit available quality based on the video, device, codec, account, viewport, or network conditions. PlayPin can request the highest quality level YouTube exposes, but it cannot force a quality that is unavailable.

After PlayPin applies your saved preference at the start of a video, you can still change speed or quality manually in YouTube for that video.

PlayPin is an independent extension and is not affiliated with YouTube or Google.

## Single Purpose

PlayPin has one purpose: apply the user's selected YouTube playback speed and quality preference when YouTube videos start.

## Permission Justifications

### storage

Used to save the user's selected playback speed and max-quality preference.

### Host permission: `*://*.youtube.com/*`

Used to read and control the YouTube video player on YouTube pages so PlayPin can apply the selected playback speed and request the highest available quality when videos start. The extension does not run on unrelated websites.

## Privacy Summary

No tracking. No analytics. No remote server requests from the extension. PlayPin stores only playback speed and max-quality settings in Chrome extension storage.

## Category

Productivity

## Suggested Store Assets

- Icon: `assets/icon-128.png`
- Screenshot: `store-assets/playpin-hero-1280x800.jpg`
- Package: `dist/playpin-0.1.1.zip`
- Privacy policy: https://bjorkepoc.github.io/playpin/site/privacy.html
- Homepage: https://bjorkepoc.github.io/playpin/site/
- Support: https://github.com/bjorkepoc/playpin/issues
