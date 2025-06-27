const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const csrf = require('csurf');
const rateLimit = require('express-rate-limit');

const Talent = require('./models/Talent');
const User = require('./models/User');
const Profile = require('./models/Profile');
const Schedule = require('./models/Schedule');
const auth = require('./auth');

dotenv.config();

// Support legacy environment variable names
if (!process.env.MONGODB_URI && process.env.MONGO_URI) {
  process.env.MONGODB_URI = process.env.MONGO_URI;
}
if (!process.env.JWT_SECRET && process.env.SESSION_SECRET) {
  process.env.JWT_SECRET = process.env.SESSION_SECRET;
}
const requiredEnv = [
  ['MONGODB_URI', 'MONGO_URI'],
  ['JWT_SECRET', 'SESSION_SECRET'],
  'PORT'
];
const missing = requiredEnv.filter(v =>
  Array.isArray(v) ? v.every(n => !process.env[n]) : !process.env[v]
);
if (missing.length) {
  const names = missing
    .map(v => (Array.isArray(v) ? v.join(' or ') : v))
    .join(', ');
  console.error(`Missing required environment variables: ${names}`);
  process.exit(1);
}

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false
});

app.use(['/api/login', '/api/refresh', '/api/password-reset'], authLimiter);

app.use((req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  csrfProtection(req, res, next);
});

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    if (process.env.NODE_ENV !== 'test') {
      console.log('✅ MongoDB に接続しました');
    }
  } catch (err) {
    console.error('❌ MongoDB 接続エラー:', err);
    process.exit(1);
  }
}
connectDB();

app.get('/', (req, res) => {
  res.send('Talentify API 稼働中！');
});

app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

app.post('/api/register', async (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password || !role) {
    return res.status(400).json({ message: '必要な項目が不足しています' });
  }

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: '既に登録されています' });
    }

    await User.create({ email, passwordHash: password, role });
    res.status(201).json({ message: 'ユーザーを作成しました' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'メールアレスまたはパスワードが間違っています' });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: 'メールアドレスまたはパスワードが間違っています' });
    }

    const accessToken = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    const refreshToken = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const cookieOpts = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    };

    res.cookie('access', accessToken, { ...cookieOpts, maxAge: 60 * 60 * 1000 });
    res.cookie('refresh', refreshToken, { ...cookieOpts, maxAge: 7 * 24 * 60 * 60 * 1000 });

    res.json({ message: 'logged in' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/refresh', (req, res) => {
  const token = req.cookies.refresh;
  if (!token) {
    return res.status(401).json({ message: 'refresh token missing' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const accessToken = jwt.sign(
      { userId: payload.userId, role: payload.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.cookie('access', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 60 * 60 * 1000
    });
    res.json({ accessToken });
  } catch {
    res.status(401).json({ message: 'invalid refresh token' });
  }
});

app.get('/api/talents', auth(), async (req, res) => {
  try {
    const talents = await Talent.find();
    res.json(talents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/talents/:id', auth(), async (req, res) => {
  try {
    const talent = await Talent.findById(req.params.id);
    if (!talent) {
      return res.status(404).json({ message: 'Talent not found' });
    }
    res.json(talent);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/talents', auth(['store']), async (req, res) => {
  const talent = new Talent({
    name: req.body.name,
    email: req.body.email,
    skills: req.body.skills,
    experienceYears: req.body.experienceYears,
    avatarUrl: req.body.avatarUrl,
    socialLinks: req.body.socialLinks,
    bio: req.body.bio,
    location: req.body.location,
    rate: req.body.rate,
    availability: req.body.availability
  });

  try {
    const newTalent = await talent.save();
    res.status(201).json(newTalent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.get('/api/profile', auth(), async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/profile', auth(), async (req, res) => {
  try {
    const data = {
      displayName: req.body.displayName,
      bio: req.body.bio,
      avatarUrl: req.body.avatarUrl,
    };
    const profile = await Profile.findOneAndUpdate(
      { user: req.user.id },
      data,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.json(profile);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.get('/api/schedule', auth(), async (req, res) => {
  try {
    const schedules = await Schedule.find({ user: req.user.id });
    res.json(schedules);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/schedule', auth(), async (req, res) => {
  try {
    const schedule = await Schedule.create({
      user: req.user.id,
      date: req.body.date,
      description: req.body.description,
    });
    res.status(201).json(schedule);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = app;
