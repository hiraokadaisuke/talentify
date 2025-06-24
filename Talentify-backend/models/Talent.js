// models/Talent.js
const mongoose = require('mongoose');

// 人材情報のスキーマを定義
const TalentSchema = new mongoose.Schema({
  name: { // 名前
    type: String,
    required: true, // 必須項目
    trim: true // 前後の空白を削除
  },
  email: { // メールアドレス
    type: String,
    required: true,
    unique: true, // ユニーク（重複不可）
    trim: true,
    lowercase: true, // 全て小文字に変換
    match: [/.+\@.+\..+/, '有効なメールアドレスを入力してください'] // メールアドレス形式のバリデーション
  },
  skills: { // スキル（配列として複数のスキルを保持）
    type: [String], // 文字列の配列
    default: [] // デフォルトは空の配列
  },
  experienceYears: { // 経験年数
    type: Number,
    min: 0, // 0以上の数値
    default: 0
  },
  avatarUrl: { // プロフィール画像のURL
    type: String,
    trim: true,
    default: '' // 既存ドキュメントへの影響を避けるため空文字をデフォルトに
  },
  socialLinks: { // SNSなどのリンク
    type: [String],
    default: []
  },
  bio: { // 自己紹介文
    type: String,
    default: ''
  },
  location: { // 居住地など
    type: String,
    default: ''
  },
  rate: { // 単価
    type: Number,
    min: 0,
    default: 0
  },
  availability: { // 稼働状況など
    type: String,
    default: ''
  },
  availabilities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Availability' }],
  // その他の追加したい項目があればここに追加
  createdAt: { // 作成日時
    type: Date,
    default: Date.now // デフォルトは現在時刻
  }
});

// スキーマからモデルを作成
const Talent = mongoose.model('Talent', TalentSchema);

module.exports = Talent;
