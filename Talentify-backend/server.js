// server.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors'); // CORSエラー回避のため
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Talent = require('./models/Talent'); // Talentモデルをインポート
const User = require('./models/User');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const rateLimit = require('express-rate-limit');

dotenv.config(); // .envファイルから環境変数を読み込む

const app = express();
const port = process.env.PORT || 5000;

// ミドルウェア
app.use(cors()); // CORSを許可
app.use(express.json()); // JSON形式のリクエストボディをパース
app.use(cookieParser());
const csrfProtection = csrf({ cookie: true });

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiting for authentication-related endpoints
app.use(['/api/login', '/api/refresh', '/api/password-reset'], authLimiter);

// CSRF protection for state-changing routes
app.use((req, res, next) => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next();
    }
    csrfProtection(req, res, next);
});

// MongoDB接続
const uri = process.env.MONGODB_URI; 

async function connectDB() {
    try {
        await mongoose.connect(uri, {
            // useNewUrlParser: true,    // MongoDBドライバーの新しいバージョンでは不要になる場合があります
            // useUnifiedTopology: true  // 同上
        });
        console.log('MongoDBに接続しました！');
    } catch (err) {
        console.error('MongoDB接続エラー:', err);
        // エラーの詳細を出力するために、エラーオブジェクト全体を表示
        console.error('エラー詳細:', err.message); 
        console.error('エラー名:', err.name);
        // MongoDB接続エラー時にプログラムを終了させることで、エラーが明確になります
        process.exit(1); 
    }
}
connectDB(); // 関数を実行

// ルートエンドポイント
app.get('/', (req, res) => {
    res.send('Talentify API稼働中！'); // パチンコプラットフォームAPI稼働中！から変更しました
});

// CSRF token endpoint
app.get('/api/csrf-token', (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
});

// ユーザー登録
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

// ログイン
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
        const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
        res.json({ token });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
// 人材情報をすべて取得するAPI
app.get('/api/talents', async (req, res) => {
    try {
        const talents = await Talent.find(); // すべての人材情報を取得
        res.json(talents); // JSON形式で返す
    } catch (err) {
        res.status(500).json({ message: err.message }); // エラーハンドリング
    }
});

// IDで特定の人材情報を取得するAPI
app.get('/api/talents/:id', async (req, res) => {
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

// 新しい人材情報を追加するAPI
app.post('/api/talents', async (req, res) => {
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
        const newTalent = await talent.save(); // データベースに保存
        res.status(201).json(newTalent); // 作成されたデータを201ステータスで返す
    } catch (err) {
        // バリデーションエラーなど、クライアント側の問題の場合は400 Bad Request
        res.status(400).json({ message: err.message }); 
    }
});

// サーバー起動
app.listen(port, () => {
    console.log(`サーバーがポート ${port} で起動しました`);
});
