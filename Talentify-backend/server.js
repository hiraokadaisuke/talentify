// server.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors'); // CORSエラー回避のため
const Talent = require('./models/Talent'); // Talentモデルをインポート
const Payment = require('./models/Payment');
const BankAccount = require('./models/BankAccount');

dotenv.config(); // .envファイルから環境変数を読み込む

const app = express();
const port = process.env.PORT || 5000;

// ミドルウェア
app.use(cors()); // CORSを許可
app.use(express.json()); // JSON形式のリクエストボディをパース

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

// ギャラ受取履歴取得
app.get('/api/payments', async (req, res) => {
    try {
        const payments = await Payment.find().sort({ eventDate: -1 });
        res.json(payments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 銀行口座情報取得
app.get('/api/bank-account', async (req, res) => {
    try {
        const account = await BankAccount.findOne();
        res.json(account || {});
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 銀行口座情報登録・更新
app.post('/api/bank-account', async (req, res) => {
    try {
        let account = await BankAccount.findOne();
        if (account) {
            account.set(req.body);
        } else {
            account = new BankAccount(req.body);
        }
        const saved = await account.save();
        res.json(saved);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// サーバー起動
app.listen(port, () => {
    console.log(`サーバーがポート ${port} で起動しました`);
});
