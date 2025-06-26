// server.js
const express        = require('express');
const mongoose       = require('mongoose');
const dotenv         = require('dotenv');
const cors           = require('cors');
const cookieParser   = require('cookie-parser');
const bcrypt         = require('bcryptjs');
const jwt            = require('jsonwebtoken');
const csrf           = require('csurf');
const rateLimit      = require('express-rate-limit');

const Talent         = require('./models/Talent');
const User           = require('./models/User');
const auth           = require('./auth');                 // ⬅︎ 役割チェック付き JWT 認可

// -------------------------------------------------------------
//  .env 読み込み & 必須環境変数チェック
// -------------------------------------------------------------
dotenv.config();

const requiredEnv = ['MONGODB_URI', 'JWT_SECRET', 'PORT'];
const missing = requiredEnv.filter((v) => !process.env[v]);
if (missing.length) {
  console.error(`Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

// -------------------------------------------------------------
//  Express 初期化 & 共通ミドルウェア
// -------------------------------------------------------------
const app  = express();
const PORT = process.env.PORT;

app.use(cors({ origin: true, credentials: true })); // Cookie 受け渡しも許可
app.use(express.json());
app.use(cookieParser());

// -------------------------------------------------------------
//  CSRF & レートリミット設定
// -------------------------------------------------------------
const csrfProtection = csrf({ cookie: true });

const authLimiter = rateLimit({
  windowMs       : 15 * 60 * 1000,   // 15 分
  max            : 5,                // 15 分以内に 5 回まで
  standardHeaders: true,
  legacyHeaders  : false
});

app.use(['/api/login', '/api/refresh', '/api/password-reset'], authLimiter);

// State‑changing メソッドのみ CSRF 保護を適用
app.use((req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  csrfProtection(req, res, next);
});

// -------------------------------------------------------------
//  MongoDB 接続
// -------------------------------------------------------------
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB に接続しました');
  } catch (err) {
    console.error('❌ MongoDB 接続エラー:', err);
    process.exit(1);
  }
}
connectDB();

// -------------------------------------------------------------
//  ルート
// -------------------------------------------------------------
app.get('/', (req, res) => {
  res.send('Talentify API 稼働中！');
});

app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// -------------------------------------------------------------
//  認証 & 認可エンドポイント
// -------------------------------------------------------------
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
      return res.status(401).json({ message: 'メールアドレスまたはパスワードが間違っています' });
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
      httpOnly : true,
      secure   : process.env.NODE_ENV === 'production',
      sameSite : 'strict'
    };

    res.cookie('access',  accessToken,  { ...cookieOpts, maxAge: 60 * 60 * 1000 });
    res.cookie('refresh', refreshToken, { ...cookieOpts, maxAge: 7  * 24 * 60 * 60 * 1000 });

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
      httpOnly : true,
      secure   : process.env.NODE_ENV === 'production',
      sameSite : 'strict',
      maxAge   : 60 * 60 * 1000
    });
    res.json({ accessToken });
  } catch {
    res.status(401).json({ message: 'invalid refresh token' });
  }
});

// -------------------------------------------------------------
//  Talent API（要 JWT 認可）
// -------------------------------------------------------------
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
    name            : req.body.name,
    email           : req.body.email,
    skills          : req.body.skills,
    experienceYears : req.body.experienceYears,
    avatarUrl       : req.body.avatarUrl,
    socialLinks     : req.body.socialLinks,
    bio             : req.body.bio,
    location        : req.body.location,
    rate            : req.body.rate,
    availability    : req.body.availability
  });

  try {
    const newTalent = await talent.save();
    res.status(201).json(newTalent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// -------------------------------------------------------------
//  サーバー起動
// -------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`🚀 サーバーがポート ${PORT} で起動しました`);
});
