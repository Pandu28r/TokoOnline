document.addEventListener('DOMContentLoaded', () => {
  // Ambil currentUserId dari localStorage
  const currentUserId = localStorage.getItem('currentUserId');
  if (!currentUserId) {
      alert('Anda belum login. Silakan login terlebih dahulu.');
      window.location.href = 'index.html'; // Redirect kembali ke halaman login
      return;
  }

  // Tampilkan ID user di console untuk debug
  console.log('User ID yang login:', currentUserId);

  // Gunakan currentUserId untuk memuat data (contoh: memuat keranjang)
  id_user = Number(currentUserId);
});


async function loadProduk(kategori) {
  const res = await fetch(`http://localhost:3000/api/produk${kategori ? '?kategori=' + kategori : ''}`);
  const data = await res.json();
  const konten = document.getElementById('konten');
  konten.innerHTML = data.map(item => `
    <div>
      <h3>${item.nama_produk}</h3>
      <img src="${item.foto_link}" alt="${item.nama_produk}" width="100">
      <p>Harga: ${item.harga}</p>
      <p>Rating: ${item.rating}</p>
      <p>Stok: ${item.stok}</p>
      <button onclick="tambahKeKeranjang(${id_user},${item.id_produk}, 1, ${item.id_kategori})">Tambah ke Keranjang</button>
    </div>
  `).join('');
}

async function loadKeranjang() {
  console.log(id_user);
  const res = await fetch(`http://localhost:3000/api/keranjang?id_user=${id_user}`);
  const data = await res.json();
  console.log('Data dari API:', data); // Log data untuk debug

  const konten = document.getElementById('konten');
  konten.innerHTML = data.map(item => `
    <div>
      <h3>${item.nama_produk}</h3>
      <img src="${item.foto_link}" alt="${item.nama_produk}" width="100">
      <p>Jumlah: ${item.jumlah}</p>
      <button onclick="hapusProduk(${id_user}, ${item.id_produk}, ${item.jumlah})">Hapus</button>
    </div>
  `).join('');
}


async function tambahKeKeranjang(id_user ,id_produk, jumlah, id_kategori) {
  const res = await fetch('http://localhost:3000/api/keranjang', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_produk, jumlah, id_kategori, id_user })
  });
  alert(await res.text());
  loadKeranjang();
}

async function hapusProduk(id_user, id_produk, jumlahMaks) {
  const jumlah = parseInt(prompt(`Masukkan jumlah yang ingin dihapus (1 - ${jumlahMaks}):`), 10);
  if (!jumlah || jumlah <= 0 || jumlah > jumlahMaks) {
    alert('Jumlah yang dimasukkan tidak valid');
    return;
  }

  const res = await fetch('http://localhost:3000/api/keranjang/hapus', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_user, id_produk, jumlah })
  });

  alert(await res.text());
  loadKeranjang();
}

async function loadProdukDisukai() {
  const res = await fetch(`http://localhost:3000/api/produk-disukai?id_user=${id_user}`);
  const data = await res.json();

  const konten = document.getElementById('konten');
  konten.innerHTML = data.map(item => `
      <div class="produk">
          <h3>${item.nama_produk}</h3>
          <img src="${item.foto_link}" alt="${item.nama_produk}" width="100">
          <p>Harga: ${item.harga}</p>
          <p>Rating: ${item.rating}</p>
          <p>Stok: ${item.stok}</p>
          <button onclick="tambahKeKeranjang(${id_user}, ${item.id_produk}, 1, ${item.id_kategori})">Tambah ke Keranjang</button>
      </div>
  `).join('');
}

async function loadFavoritTeman() {
  console.log(id_user);
  const res = await fetch(`http://localhost:3000/api/favorit-teman?id_user=${id_user}`);
  const data = await res.json();

  const konten = document.getElementById('konten');
  konten.innerHTML = data.map(item => `
      <div class="produk">
          <h3>${item.nama_produk}</h3>
          <img src="${item.foto_link}" alt="${item.nama_produk}" width="100">
          <p>Harga: ${item.harga}</p>
          <p>Rating: ${item.rating}</p>
          <p>Stok: ${item.stok}</p>
          <button onclick="tambahKeKeranjang(${id_user}, ${item.id_produk}, 1, null)">Tambah ke Keranjang</button>
      </div>
  `).join('');
}


function logout() {
  localStorage.removeItem('currentUserId'); // Hapus user dari localStorage
  document.getElementById('main-app').style.display = 'none';
  document.getElementById('welcome-page').style.display = 'block';
  localStorage.removeItem('currentUserId'); // Hapus ID user dari localStorage
    alert('Anda telah logout.');
    window.location.href = 'index.html'; // Redirect ke halaman login
}
