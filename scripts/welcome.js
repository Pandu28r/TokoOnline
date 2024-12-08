  let currentUserId = null;

  // Fungsi untuk memuat daftar user
  async function loadDaftarUser() {
      const res = await fetch('http://localhost:3000/api/daftar-user');
      const users = await res.json();
  
      const daftarUser = document.getElementById('daftar-user');
      daftarUser.innerHTML = users.map(user => `
          <li>
              <button onclick="login(${user.id_user})">${user.nama_user}</button>
          </li>
      `).join('');
  }
  
  function login(id_user) {
    // Simpan id_user ke localStorage
    localStorage.setItem('currentUserId', id_user);

    // Redirect ke main.html
    window.location.href = 'main.html';
}
  
  // Panggil fungsi untuk load daftar user saat pertama kali
  loadDaftarUser();
  