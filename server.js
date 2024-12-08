const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Koneksi ke database
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'db_tokoonlinemirja'
});
db.connect(err => {
  if (err) throw err;
  console.log('Database connected');
});

app.get('/api/daftar-user', (req, res) => {
  const query = `SELECT id_user, nama_user FROM user`;

  db.query(query, (err, results) => {
      if (err) throw err;
      res.json(results);
  });
});


// Endpoint: Ambil semua produk atau berdasarkan kategori
app.get('/api/produk', (req, res) => {
  const kategori = req.query.kategori;
  let query = `SELECT * FROM produk`;
  if (kategori) query += ` WHERE id_kategori = ?`;

  db.query(query, [kategori], (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});


// Endpoint: Tambahkan produk ke keranjang
app.post('/api/keranjang', (req, res) => {
  const { id_user, id_produk, jumlah, id_kategori  } = req.body;

  const checkQuery = `SELECT jumlah FROM keranjang WHERE id_user = ? AND id_produk = ?`;
  db.query(checkQuery, [id_user, id_produk], (err, results) => {
    if (err) throw err;

    if (results.length > 0) {
      const updateQuery = `UPDATE keranjang SET jumlah = jumlah + ? WHERE id_user = ? AND id_produk = ?`;
      db.query(updateQuery, [jumlah, id_user, id_produk], (err) => {
        if (err) throw err;
        res.send('Jumlah produk di keranjang diperbarui');
      });
    } else {
      const insertQuery = `INSERT INTO keranjang (id_user, id_produk, jumlah, id_kategori) VALUES (?, ?, ?, ?)`;
      db.query(insertQuery, [id_user, id_produk, jumlah, id_kategori], (err) => {
        if (err) throw err;
        res.send('Produk ditambahkan ke keranjang');
      });
    }
  });
});

// Endpoint: Ambil data keranjang
app.get('/api/keranjang', (req, res) => {
    const id_user = req.query.id_user;
    const query = `
      SELECT k.id_produk, p.nama_produk, p.foto_link, k.jumlah, p.stok, p.harga, p.rating
      FROM keranjang k
      JOIN produk p ON k.id_produk = p.id_produk
      WHERE k.id_user = ?
    `;
    db.query(query, [id_user], (err, results) => {
      if (err) throw err;
      res.json(results);
    });
  });
  

// Endpoint: Hapus produk dari keranjang
app.post('/api/keranjang/hapus', (req, res) => {
  const { id_user, id_produk, jumlah } = req.body;

  const checkQuery = `SELECT jumlah FROM keranjang WHERE id_user = ? AND id_produk = ?`;
  db.query(checkQuery, [id_user, id_produk], (err, results) => {
    if (err) throw err;

    if (results.length === 0) {
      res.status(404).send('Produk tidak ditemukan di keranjang');
    } else if (jumlah >= results[0].jumlah) {
      const deleteQuery = `DELETE FROM keranjang WHERE id_user = ? AND id_produk = ?`;
      db.query(deleteQuery, [id_user, id_produk], (err) => {
        if (err) throw err;
        res.send('Produk dihapus dari keranjang');
      });
    } else {
      const updateQuery = `UPDATE keranjang SET jumlah = jumlah - ? WHERE id_user = ? AND id_produk = ?`;
      db.query(updateQuery, [jumlah, id_user, id_produk], (err) => {
        if (err) throw err;
        res.send('Jumlah produk dikurangi di keranjang');
      });
    }
  });
});

// Produk Disukai
app.get('/api/produk-disukai', (req, res) => {
  const id_user = req.query.id_user;

  const query = `
      SELECT DISTINCT p.id_produk, p.nama_produk, p.harga, p.foto_link, p.rating, p.stok, p.id_kategori
      FROM produk p
      INNER JOIN keranjang k ON p.id_kategori = k.id_kategori
      WHERE k.id_user = ?;
  `;

  db.query(query, [id_user], (err, results) => {
      if (err) throw err;
      res.json(results);
  });
});

// Endpoint: Produk Favorit Gabungan (User dan Teman)
app.get('/api/favorit-teman', (req, res) => {
  const id_user = req.query.id_user;

  const query = `
      SELECT DISTINCT p.id_produk, p.nama_produk, p.harga, p.foto_link, p.rating, p.stok
      FROM produk p
      INNER JOIN keranjang k ON p.id_produk = k.id_produk
      WHERE k.id_user = ?

      UNION

      SELECT DISTINCT p.id_produk, p.nama_produk, p.harga, p.foto_link, p.rating, p.stok
      FROM produk p
      INNER JOIN keranjang k ON p.id_kategori = k.id_kategori
      INNER JOIN teman t ON t.id_teman = k.id_user
      WHERE t.id_user = ?;
  `;

  db.query(query, [id_user, id_user], (err, results) => {
      if (err) throw err;
      res.json(results);
  });
});

// Jalankan server
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});