const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'notes.json');
const ADMIN_PASSWORD = 'vv22birthday';

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 初始化数据文件
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, '[]', 'utf-8');
}

function readNotes() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  } catch { return []; }
}

function writeNotes(notes) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(notes, null, 2), 'utf-8');
}

// POST /api/notes — 提交便签
app.post('/api/notes', (req, res) => {
  const { card_id, text } = req.body;
  if (!card_id || !text) return res.status(400).json({ error: '缺少参数' });
  const notes = readNotes();
  const note = { card_id, text, time: new Date().toISOString() };
  notes.push(note);
  writeNotes(notes);
  res.json({ ok: true, note });
});

// GET /api/notes — 读取便签
app.get('/api/notes', (req, res) => {
  res.json(readNotes());
});

// GET /admin — 查看留言（简单密码）
app.get('/admin', (req, res) => {
  const pw = req.query.pw;
  if (pw !== ADMIN_PASSWORD) {
    return res.send(`<html><body style="font-family:sans-serif;text-align:center;padding:40px;"><h2>🔐 输入密码</h2><form><input name="pw" placeholder="密码" autofocus><button>进入</button></form></body></html>`);
  }
  const notes = readNotes();
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>VV 的留言</title>
<style>body{font-family:'M PLUS Rounded 1c',sans-serif;max-width:600px;margin:40px auto;padding:20px;background:#fff5f5}
.note{background:#fff;border-radius:12px;padding:16px;margin:12px 0;box-shadow:0 2px 8px rgba(0,0,0,0.06)}
.note .id{color:#e8877a;font-size:12px}.note .time{color:#aaa;font-size:11px;margin-top:4px}
.note .text{font-size:16px;margin-top:6px;color:#5d4037}
h2{color:#e05a6f}</style></head><body>
<h2>💌 VV 的便签留言 (${notes.length} 条)</h2>
${notes.map(n => `<div class="note"><div class="id">卡片 #${n.card_id}</div><div class="text">${n.text}</div><div class="time">${new Date(n.time).toLocaleString('zh-CN')}</div></div>`).join('')}
</body></html>`;
  res.send(html);
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'birthday.html'));
});

app.listen(PORT, () => {
  console.log(`🎂 VV 生日服务器已启动: http://localhost:${PORT}`);
  console.log(`💌 查看留言: http://localhost:${PORT}/admin?pw=${ADMIN_PASSWORD}`);
});
