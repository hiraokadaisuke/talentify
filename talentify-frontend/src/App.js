// src/App.js
import React, { useState, useEffect } from 'react';
import './App.css'; // スタイルシートをインポート（必要に応じて）

function App() {
  const [talents, setTalents] = useState([]); // 人材情報を保持するstate
  const [name, setName] = useState(''); // フォーム入力用state: 名前
  const [email, setEmail] = useState(''); // フォーム入力用state: メールアドレス
  const [skills, setSkills] = useState(''); // フォーム入力用state: スキル (カンマ区切り)
  const [experienceYears, setExperienceYears] = useState(0); // フォーム入力用state: 経験年数

  // ページ読み込み時に人材情報を取得
  useEffect(() => {
    fetchTalents();
  }, []); // 空の依存配列は、コンポーネントのマウント時に一度だけ実行されることを意味します

  // バックエンドから人材情報を取得する関数
  const fetchTalents = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/talents'); // GETリクエスト
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setTalents(data);
    } catch (error) {
      console.error("人材情報の取得に失敗しました:", error);
    }
  };

  // 新しい人材を追加する関数
  const addTalent = async (e) => {
    e.preventDefault(); // フォームのデフォルト送信を防ぐ

    // スキルをカンマ区切り文字列から配列に変換
    const skillsArray = skills.split(',').map(skill => skill.trim()).filter(skill => skill !== '');

    try {
      const response = await fetch('http://localhost:5000/api/talents', {
        method: 'POST', // POSTリクエスト
        headers: {
          'Content-Type': 'application/json', // JSON形式で送信
        },
        body: JSON.stringify({ name, email, skills: skillsArray, experienceYears: Number(experienceYears) }), // JSON文字列に変換して送信
      });

      if (!response.ok) {
        // エラーレスポンスをJSONとしてパースしてメッセージを表示
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      // 成功したら、フォームをリセットして人材リストを再取得
      setName('');
      setEmail('');
      setSkills('');
      setExperienceYears(0);
      fetchTalents(); // 新しいデータを取得し直す
    } catch (error) {
      console.error("人材の追加に失敗しました:", error);
      alert(`人材の追加に失敗しました: ${error.message}`); // ユーザーにエラーメッセージを表示
    }
  };

  return (
    <div className="App">
      <h1>Talentify - 人材管理</h1>

      {/* 人材追加フォーム */}
      <form onSubmit={addTalent}>
        <h2>新しい人材を追加</h2>
        <div>
          <label>名前:</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
          />
        </div>
        <div>
          <label>メール:</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
        </div>
        <div>
          <label>スキル (カンマ区切り):</label>
          <input 
            type="text" 
            value={skills} 
            onChange={(e) => setSkills(e.target.value)} 
          />
        </div>
        <div>
          <label>経験年数:</label>
          <input 
            type="number" 
            value={experienceYears} 
            onChange={(e) => setExperienceYears(e.target.value)} 
            min="0" 
          />
        </div>
        <button type="submit">人材を追加</button>
      </form>

      <hr />

      {/* 人材リスト表示 */}
      <h2>登録されている人材</h2>
      {talents.length === 0 ? (
        <p>まだ人材が登録されていません。</p>
      ) : (
        <ul>
          {talents.map(talent => (
            <li key={talent._id}>
              <h3>{talent.name}</h3>
              <p>メール: {talent.email}</p>
              <p>スキル: {talent.skills.join(', ')}</p>
              <p>経験年数: {talent.experienceYears}年</p>
              <p>登録日: {new Date(talent.createdAt).toLocaleDateString()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;