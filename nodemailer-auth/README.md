# Full-Stack Auth - Express + Nodemailer + React

## Setup

### 1. Backend
```bash
cd server
npm install
cp .env.example .env   # then fill in Gmail + MongoDB settings
npm start              # http://localhost:5000
```

**MongoDB setup:**
- Local MongoDB: keep `MONGODB_URI=mongodb://127.0.0.1:27017/birthday-reminder`
- MongoDB Atlas: paste your Atlas connection string into `MONGODB_URI`

**Get a Gmail App Password:**
1. Enable 2-Step Verification: https://myaccount.google.com/security
2. Create an app password: https://myaccount.google.com/apppasswords
3. Paste the 16-char code into `.env` as `GMAIL_APP_PASSWORD`

### 2. Frontend
Run the React client from the `client` folder.

```bash
cd client
npm install
npm run dev
```

## Endpoints
- `POST /api/signup` -> `{ name, email, password }` -> sends welcome email
- `POST /api/login` -> `{ email, password }` -> returns JWT
- `GET /api/birthdays` -> returns saved birthdays for the logged-in user
- `POST /api/birthdays` -> saves a birthday in MongoDB
- `DELETE /api/birthdays/:id` -> deletes a birthday from MongoDB

## Notes
- Users and birthdays are stored in MongoDB.
- Passwords are stored as bcrypt hashes, not plain text.
- JWT is stored in `localStorage` (consider httpOnly cookies for production).
