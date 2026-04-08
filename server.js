// server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// === PHỤC VỤ FILE TĨNH (HTML, CSS, JS) ===
app.use(express.static(__dirname)); // ← Dòng quan trọng này

// API Routes
app.post('/api/location', (req, res) => {
    const { lat, lng, address, speed, accuracy } = req.body;

    if (!lat || !lng) {
        return res.status(400).json({ error: 'Thiếu lat hoặc lng' });
    }

    const locations = readData();

    const newLoc = {
        id: Date.now(),
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        address: address || `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        speed: speed || null,
        accuracy: accuracy || null,
        time: new Date().toLocaleString('vi-VN'),
        timestamp: Date.now()
    };

    locations.unshift(newLoc);
    if (locations.length > 1000) locations.pop();

    writeData(locations);
    console.log(`📍 Nhận vị trí mới: ${newLoc.time}`);
    res.json({ success: true });
});

app.get('/api/locations', (req, res) => {
    res.json(readData());
});

app.delete('/api/locations', (req, res) => {
    writeData([]);
    res.json({ success: true });
});

// Đọc/Ghi dữ liệu
function readData() {
    try {
        if (fs.existsSync(DATA_FILE)) {
            return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        }
    } catch (e) {}
    return [];
}

function writeData(data) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    } catch (e) {
        console.error('Lỗi ghi file:', e);
    }
}

// Route mặc định
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`\n✅ Server GPS đang chạy tại: http://localhost:${PORT}`);
    console.log(`🌍 Truy cập ngay:`);
    console.log(`   → Client : http://localhost:${PORT}`);
    console.log(`   → Admin  : http://localhost:${PORT}/admin.html\n`);
});