# rifatadnan — personal website

Plain HTML/CSS/JS. No build tools. Hosted on Netlify.

## What's where
| File | What it is |
|---|---|
| `index.html` | The main page (all sections) |
| `blog.html` / `post.html` | Blog list / one blog post |
| `css/style.css` | All styling. Brand colour = `--brand` at the top |
| `js/config.js` | **Your links** (email, LinkedIn, GitHub, CV) and the site address |
| `js/faq.js` | **Chatbot questions and answers** |
| `posts/` | **Blog posts** (one `.md` file each) + `posts.json` (the list) |
| `assets/` | Images, video, CV, icon |

## Preview on your Mac
Open Terminal and run:
```bash
cd ~/Desktop/Office/portfolio-website && python3 -m http.server 8000
```
Then open http://localhost:8000. (Double-clicking `index.html` works too, but the blog
needs this preview to load.) Press `Ctrl + C` in Terminal to stop.

## Add a blog post (3 steps)
1. In `posts/`, create a new file named like `my-new-post.md`
   (lowercase, dashes instead of spaces; this name is the post's "slug").
2. Write the post in Markdown:
   - `## Heading` for a heading
   - `**bold**`, `*italic*`
   - `- item` for a bullet list
   - `[link text](https://...)` for a link
   - `![description](assets/picture.jpg)` for an image (put the image in `assets/`)
3. Open `posts/posts.json` and add an entry at the top, keeping the commas:
   ```json
   [
     {
       "slug": "my-new-post",
       "title": "My new post",
       "date": "2026-11-01",
       "summary": "One sentence shown on the blog card."
     },
     { ...older posts stay below... }
   ]
   ```
   Add `"draft": true` to hide a post without deleting it.

Upload (push) the changes; Netlify updates the site in about a minute.

## Edit the chatbot
Open `js/faq.js`, copy one `{ q: ..., keywords: [...], a: ... },` block, and edit it.
More keywords make matching better. Test it in the preview.

## Add your photo, video or CV
- **Photo:** save as `assets/photo.jpg` and follow the note in `index.html` (search "photo").
- **Break Scheduler video:** save as `assets/break-scheduler-demo.mp4` (keep it under ~20 MB)
  and follow the note in `index.html` (search "demo video").
- **CV:** save as `assets/Rifat-Adnan-CV.pdf` and set `cv:` in `js/config.js`.

## When you buy rifatadnan.com
Update the address in three places: `js/config.js` (`siteUrl`), `robots.txt`, `sitemap.xml`.
Then in Netlify, go to Domain management → Add a domain.

## Contact form
Netlify Forms catches messages automatically. Turn on email alerts in Netlify:
Site configuration → Forms → Form notifications → Email notification.

## Never commit
Workbooks or real data (`.xlsm`, `.xlsx`, `.csv`, `.accdb`). Demo media must use fictional data.
