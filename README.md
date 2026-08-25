# Aditya Adhikari — Personal Website

This is my personal website, built around an interactive Linux/Bash-style terminal. If you don't want to use the terminal, there's also a normal point-and-click version of the site.

The site is intentionally lightweight. It uses plain HTML, CSS, and JavaScript, with no build process or external dependencies.

## Project structure

```text
index.html        Main page for both the terminal and normal views
projects.html     Dedicated page listing every project
blogs.html        Dedicated page listing every post, grouped by year
post.html         Page used to read individual blog posts
css/style.css     Styles for the website
js/content.js     Main content for the site — edit this file
js/site.js        Handles the normal website view
js/pages.js       Handles the projects.html and blogs.html pages
js/terminal.js    Handles the interactive terminal
js/mailer.js      Delivers messages from the contact form to my inbox
js/markdown.js    Small Markdown renderer for blog posts
posts/*.md        Blog posts and CTF writeups
assets/           Profile picture, resume, and favicon
```

The home page shows a short preview of the projects and posts (3 and 5 by
default — change `HOME_PROJECTS` / `HOME_BLOGS` in `js/site.js`). The full lists
live on `projects.html` and `blogs.html`, which read the same arrays in
`js/content.js`, so adding an entry there makes it appear everywhere at once.

## Adding a blog post

To add a new post, create a Markdown file inside `posts/`. For example:

```markdown
---
title: "CTF: Some Box"
date: "2026-08-10"
tag: "ctf"
---

## Recon

Write the post here. Markdown supports headings, lists, **bold text**, `code`,
fenced code blocks, quotes, tables, links, and images.
```

Then add the post to the `BLOGS` list in `js/content.js`:

```js
{ date: "2026-08-10", title: "CTF: Some Box", tag: "ctf", slug: "my-post" }
```

The post will then appear in the normal website and when you run:

```bash
ls blogs/
```

You can also open it directly at:

```text
post.html?p=my-post
```

Inside the terminal, you can read it with:

```bash
cat blogs/my-post.md
```

For a post hosted somewhere else, use an `href` instead of a `slug`:

```js
{ title: "Some Post", href: "https://example.com/post" }
```

## Editing the site

Most of the content can be changed from one place:

```text
js/content.js
```

This includes the bio, education, experience, certifications, skills, projects, blogs, and contact information.

Both the terminal and normal versions use the same content, so you don't have to update the same information twice.

Any entry can carry an optional `show` field to limit where it appears:

```js
{ title: "Shell only", desc: "hidden from the website", show: "term" }
{ title: "Website only", desc: "hidden from the terminal", show: "web" }
```

Leave it out (or use `"both"`) and the entry appears in both. Hiding a blog post
only removes it from the listings — `post.html?p=slug` still opens it, which is
useful for unlisted drafts.

Experience and project entries can also carry a `learned` array, rendered as a
"skills gained/" row at the bottom of the card:

```js
learned: ["Python", "hashlib", "pathlib"]
```

Omit it or leave it empty and nothing renders.

Add your own files to the `assets/` folder:

```text
assets/profile.jpg
assets/resume.pdf
assets/favicon.png
```

The favicon is inlined as a data URI in each page's `<head>`, so there is no
icon file to fetch. `favicon.ico` at the root and `assets/favicon.png` cover
bookmark bars, link previewers, and phone home screens.

## The contact form

The "Get in touch" section on the home page lets anyone type a message that is
emailed to me. GitHub Pages cannot send email on its own, so the form hands the
message to [Formspree](https://formspree.io). The endpoint is an opaque form ID,
so no email address is committed to this repo.

The endpoint lives in `js/content.js`:

```js
const CONTACT_FORM = {
  endpoint: "https://formspree.io/f/mjybqazj",
  subject:  "New message from adhikariaditya.github.io"
};
```

Formspree's dashboard logs every submission, and its API returns real errors, so
a failed send reports the reason instead of failing silently. Swapping in a
different service is just a matter of changing `endpoint` — anything that accepts
a JSON `POST` of `{ name, email, message }` will work.

The same message can be sent from inside the terminal with `mail`, which walks
through name, reply address, and body (finish the body with a single `.` on its
own line, or type `cancel` to abort).

## Terminal commands

The terminal currently supports:

```text
help
whoami
grep "education" Aditya_Adhikari
find . -name "certifications"
cat skills.txt
ls blogs/
cat blogs/<name>.md
ls projects/
grep "experience" Aditya_Adhikari
mail
wget contact.sh
curl download_resume.sh
clear
normal
```

It also supports:

- Tab completion
- ↑ / ↓ command history
- Ctrl+L to clear the terminal

## To-do list

- [x] As my writeups and projects increase in volume I need to dedicate 2 separate pages to projects and writeups
- [ ] Get a better profile picture
- [x] Replace the placeholder projects with real ones
- [x] Add `assets/resume.pdf`
- [ ] Add website analytics
