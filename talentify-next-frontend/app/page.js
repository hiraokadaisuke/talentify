// app/page.js
'use client'; // クライアントコンポーネントとしてマーク (React Hooksを使うため必須)

import React, { useState, useEffect } from 'react';

export default function Home() {
  const [talents, setTalents] = useState([]); // 人材情報を保持するstate
  const [name, setName] = useState(''); // フォーム入力用state: 名前
  const [email, setEmail] = useState(''); // フォーム入力用state: メールアドレス
  const [skills, setSkills] = useState(''); // フォーム入力用state: スキル (カンマ区切り)
  const [experienceYears, setExperienceYears] = useState(0); // フォーム入力用state: 経験年数
  const [loading, setLoading] = useState(true); // ローディング状態
  const [error, setError] = useState(null); // エラーメッセージ

  const API_BASE_URL = 'http://localhost:5000/api/talents'; // バックエンドAPIのURL

  // ページ読み込み時に人材情報を取得
  useEffect(() => {
    fetchTalents();
  }, []); 

  // バックエンドから人材情報を取得する関数
  const fetchTalents = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_BASE_URL); // GETリクエスト
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setTalents(data);
    } catch (err) {
      console.error("人材情報の取得に失敗しました:", err);
      setError(`人材情報の取得に失敗しました: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 新しい人材を追加する関数
  const addTalent = async (e) => {
    e.preventDefault(); // フォームのデフォルト送信を防ぐ
    setError(null); // エラーをリセット

    // スキルをカンマ区切り文字列から配列に変換
    const skillsArray = skills.split(',').map(skill => skill.trim()).filter(skill => skill !== '');

    try {
      const response = await fetch(API_BASE_URL, {
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
      alert("人材が正常に追加されました！"); // 成功メッセージ
    } catch (err) {
      console.error("人材の追加に失敗しました:", err);
      setError(`人材の追加に失敗しました: ${err.message}`);
      alert(`人材の追加に失敗しました: ${err.message}`); // ユーザーにエラーメッセージを表示
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Talentify - 人材管理 (Next.js)</h1>

      {error && <p style={styles.errorText}>エラー: {error}</p>}

      {/* 人材追加フォーム */}
      <form onSubmit={addTalent} style={styles.form}>
        <h2 style={styles.subHeading}>新しい人材を追加</h2>
        <div style={styles.formGroup}>
          <label style={styles.label}>名前:</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
            style={styles.input}
          />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>メール:</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            style={styles.input}
          />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>スキル (カンマ区切り):</label>
          <input 
            type="text" 
            value={skills} 
            onChange={(e) => setSkills(e.target.value)} 
            style={styles.input}
            placeholder="例: JavaScript, React, Node.js"
          />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>経験年数:</label>
          <input 
            type="number" 
            value={experienceYears} 
            onChange={(e) => setExperienceYears(e.target.value)} 
            min="0" 
            style={styles.input}
          />
        </div>
        <button type="submit" style={styles.button}>人材を追加</button>
      </form>

      <hr style={styles.hr} />

      {/* 人材リスト表示 */}
      <h2 style={styles.subHeading}>登録されている人材</h2>
      {loading ? (
        <p style={styles.loadingText}>人材情報を読み込み中...</p>
      ) : talents.length === 0 ? (
        <p>まだ人材が登録されていません。</p>
      ) : (
        <ul style={styles.list}>
          {talents.map(talent => (
            <li key={talent._id} style={styles.listItem}>
              <h3 style={styles.listItemHeading}>{talent.name}</h3>
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

// 簡単なインラインスタイル (Tailwind CSSを使う場合は不要)
const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    padding: '20px',
    maxWidth: '800px',
    margin: '20px auto',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
  },
  heading: {
    textAlign: 'center',
    color: '#2c3e50',
    marginBottom: '30px',
  },
  subHeading: {
    color: '#34495e',
    borderBottom: '1px solid #eee',
    paddingBottom: '10px',
    marginBottom: '20px',
  },
  form: {
    backgroundColor: '#ffffff',
    padding: '25px',
    borderRadius: '8px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
    marginBottom: '30px',
  },
  formGroup: {
    marginBottom: '15px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: 'bold',
    color: '#555',
  },
  input: {
    width: 'calc(100% - 20px)',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '16px',
  },
  button: {
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '12px 20px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    marginTop: '10px',
    transition: 'background-color 0.3s ease',
  },
  buttonHover: { // ホバー効果はCSSクラスで指定するのが一般的
    backgroundColor: '#45a049',
  },
  hr: {
    border: '0',
    borderTop: '1px solid #eee',
    margin: '40px 0',
  },
  list: {
    listStyle: 'none',
    padding: '0',
  },
  listItem: {
    backgroundColor: '#ffffff',
    padding: '15px',
    marginBottom: '10px',
    borderRadius: '8px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
  },
  listItemHeading: {
    margin: '0 0 10px 0',
    color: '#2980b9',
  },
  loadingText: {
    textAlign: 'center',
    color: '#777',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: '15px',
  }
};