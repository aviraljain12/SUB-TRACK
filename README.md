# SUB-TRACK — My First Full-Stack Project 

A subscription tracker I built as a fresher to solve a real problem I was facing — and to finally understand how a full-stack app actually works end to end.


## The Idea — Why I Built This

I noticed something embarrassing. I was paying for **Netflix, Spotify, and Amazon Prime simultaneously** — and I had no clue two of them were on auto-renewal. I found out only when my bank balance dropped unexpectedly.

I thought — why not build something that tracks this for me?

I know apps like this already exist, but:
1. I wanted to build something **myself from scratch**
2. I had recently learned Node.js and Express in theory — I had never built a real project with it
3. I needed something to put on my resume that wasn't just a to-do list

So I started building **SUB-TRACK** — a web app to track subscriptions, show upcoming renewals, and generate invoices.


## What This App Does

- **Login / Sign Up** — users can register and log in securely
- **Dashboard** — see all your subscriptions in one place, know what you're paying monthly
- **Subscribe to Plans** — choose from Netflix, Spotify, Amazon Prime, Disney+ plans
- **Mock Payment Flow** — simulates a checkout (not real money, just a demo of the full flow)
- **Invoice Generation** — after payment, a PDF invoice is generated and downloadable
- **Light / Dark Mode** — because I wanted to learn how theming works and it looks great


## Tech Stack

I kept it simple — no heavy frameworks, just things I was comfortable with:

| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, Vanilla JavaScript |
| Backend | Node.js + Express.js |
| Database | SQLite3|
| PDF | html-pdf (EJS template → PDF) |


## Database Design (SQLite)

One thing I actually spent a lot of time on was designing the database properly. I learned about **normalization** and applied it here.

### Tables

#### `users`
Stores who is registered on the app.
```
user_id        → Primary Key (auto-increment)
full_name      → The user's name
email_address  → Used for login (must be unique)
password_hash  → Password is NEVER stored as plain text, only the bcrypt hash
```

#### `subscriptions`
Tracks which service a user subscribed to.
```
subscription_id    → Primary Key
user_id            → Links to users table (Foreign Key)
service_name       → e.g. 'netflix', 'spotify'
plan_name          → e.g. 'premium', 'individual'
billing_amount     → Base price per month
subscription_status→ 'active' or 'cancelled'
start_date         → When they subscribed
next_renewal_date  → When it auto-renews
```

#### `payments`
Every time someone "pays", a payment record is created (which becomes the invoice).
```
payment_id    → Primary Key
user_id       → Links to users table (Foreign Key)
service_name  → What service was paid for
plan_name     → Which plan
paid_amount   → Total amount charged (including 18% GST)
payment_date  → When payment was made
```

### ER Diagram

```
USERS  ──────< SUBSCRIPTIONS
  |
  └──────────< PAYMENTS
```

I normalized the schema to **3NF** — every column depends only on the primary key, not on other non-key columns. This was something my professor had explained but I truly understood it only when I had to design this myself.

---

## Problems I Faced (And How I Solved Them)

### 1. "Why is my login not working?!" — The Duplicate ID Bug

This one wasted almost half a day. My login and signup forms were on the same HTML page and I had given both of them `id="email"` and `id="password"`.

JavaScript's `document.getElementById('email')` was always picking up the **first one on the page**, so signup was reading the login field's value and login was just breaking silently.

**Fix:** I renamed all signup fields to unique IDs — `signupEmail`, `signupPassword`, `signupName`, `signupConfirmPassword`. Lesson learned: **HTML IDs must be unique across the whole page**, not just within a form.


### 2. The PDF Download Was Downloading a Text File

When I clicked "Download Invoice", the browser was downloading a file but it was just showing the text `{"error":"No token provided"}` — not a PDF at all.

The problem was that a direct `<a href="/api/download-invoice/1">` link doesn't send the Authorization header that my backend was checking. So the server rejected the request and sent back an error JSON — which the browser saved as a file.

**Fix:** I updated the backend to also accept the JWT token as a URL query parameter (`?token=...`), and updated all download links to include the token in the URL. Now `window.open('/api/download-invoice/1?token=eyJ...')` works perfectly and the browser downloads a real PDF.


### 3. Passwords Were Being Stored as Plain Text (Early Version)

In my first version, I literally stored `password: req.body.password` directly in the database. I didn't think about it much until I watched a YouTube video on web security and realized this is one of the worst things you can do.

**Fix:** I added `bcryptjs`. Now during signup, the password gets hashed before saving:
```js
const passwordHash = await bcrypt.hash(password, 10);
```
And during login, it compares the entered password with the stored hash:
```js
const isValid = await bcrypt.compare(password, user.password_hash);
```
The actual password is never stored anywhere.


### 4. Sessions Were Being Lost on Page Refresh

After login, navigating to another page would log the user out. I was storing the token in a variable, which gets cleared when the page reloads.

**Fix:** I switched to `localStorage.setItem('token', token)` after login. Now the token survives page reloads and the user stays logged in across pages. On logout, I call `localStorage.removeItem('token')`.


### 5. Node.js Wasn't Installed on My System Globally

I was working on this project on a college laptop where I don't have admin rights to install software. npm install was failing.

**Fix:** I downloaded a **portable version of Node.js** (just a zip, no installation needed) and placed it in the project folder. I then set the PATH to point to this folder before running commands. This taught me how PATH environment variables work, which I had never understood before.


### 6. Invoice PDF Had ₹ Showing as "$null"

The payment success page was showing the amount as `$null` because I was reading a URL parameter that didn't exist. The redirect URL from the payment page wasn't including the amount.

**Fix:** I fixed the redirect to include `?amount=${amount}&invoiceId=${id}` and then on the success page read `new URLSearchParams(window.location.search).get('amount')`. Simple fix, but it took me a while to figure out where the value was getting lost.


## Limitations I Know About

I'm honest about what this project doesn't do:

- **No real payments** — The payment form is a mockup. It doesn't connect to Razorpay or Stripe. I wanted to show the full user flow (checkout → success → invoice) but didn't want to deal with real money handling for a demo project.
- **Single user environment** — The app works fine for one user at a time. I haven't tested it for concurrent users heavily.
- **No email notifications** — I wanted to add renewal reminders via email (using Nodemailer) but ran out of time. It's on my to-do list.
- **No deployment** — The app runs locally. I looked into deploying on Railway or Render but the SQLite file path handling gets complicated on cloud servers. I'll tackle this next.
- **No input sanitization against SQL injection** — I'm using parameterized queries which helps, but I haven't done a full security audit.

## Resources That Helped Me

I won't pretend I figured everything out on my own:

- **YouTube** — Traversy Media's Node.js + Express crash course was where I started
- **Stack Overflow** — Genuinely, for almost every bug above
- **MDN Web Docs** — For understanding fetch API, URLSearchParams, localStorage
- **ChatGPT / AI tools** — Used them to understand concepts faster and debug specific errors (like the JWT token in URL query parameter fix)
- **bcryptjs docs** — For understanding how password hashing actually works
- **My college notes** — For the normalization theory (1NF, 2NF, 3NF)


## How to Run This Locally

### Prerequisites
- [Node.js](https://nodejs.org) installed on your machine

### Steps

```bash
# 1. Clone the repo
git clone https://github.com/aviraljain12/SUB-TRACK.git
cd SUB-TRACK/SUBTRACK-main/SUBTRACK-main

# 2. Install backend dependencies
cd backend
npm install

# 3. Start the server
npm start

# 4. Open your browser
# Go to http://localhost:5000
```

### Default Login (for testing)
```
Email:    dev@test.com
Password: password123
```
*(This account is auto-created when the server starts for the first time)*

## What I Want to Add Next

- [ ] Email reminders before renewal date (Nodemailer)
- [ ] Real payment gateway integration (Razorpay — it's India-focused and free to test)
- [ ] Deploy on Render or Railway
- [ ] Mobile responsive design improvements
- [ ] Export all invoices as a single PDF report

## Final Note

This was my first time building something end-to-end — from the database schema to the frontend UI to the PDF generation. There are definitely things I'd do differently if I started over (like cloning the repo properly before pushing 😅), but I learned more from the bugs than from anything I read.

If you're a recruiter reading this — I built this because I genuinely wanted to. The code isn't perfect but it works, and I understand every line of it.
