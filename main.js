/* ================= FIREBASE IMPORTS ================= */

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy,
  where,
  doc,
  getDoc,
  updateDoc,
  increment,
  setDoc,
  serverTimestamp,
  addDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";


/* ================= FIREBASE CONFIG ================= */

const firebaseConfig = {
  apiKey: "AIzaSyAnJ1s2o-YkD4Wg3VvxEPB_5kKYDoTJy9o",
  authDomain: "cmbeats-fb401.firebaseapp.com",
  projectId: "cmbeats-fb401",
  storageBucket: "cmbeats-fb401.firebasestorage.app",
  messagingSenderId: "843495626346",
  appId: "1:843495626346:web:715ef5d9767953698c1c13"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


/* ================= ELEMENTOS ================= */

const songsDiv = document.getElementById("songs");
const loader = document.getElementById("loader");

const btnLogout = document.getElementById("btnLogout");
const loginOpenBtn = document.getElementById("loginOpenBtn");
const registerOpenBtn = document.getElementById("registerOpenBtn");

const searchInput = document.getElementById("searchInput");
const themeToggle = document.getElementById("themeToggle");

const createPlaylistBtn = document.getElementById("createPlaylistBtn");
const viewAllBtn = document.getElementById("viewAllBtn");
const viewLikedBtn = document.getElementById("viewLikedBtn");
const viewPlaylistsBtn = document.getElementById("viewPlaylistsBtn");
const repeatBtn = document.getElementById("repeatBtn");
const shuffleBtn = document.getElementById("shuffleBtn");


/* ================= PLAYER ================= */

const musicPlayer = document.getElementById("musicPlayer");
const audio = document.getElementById("audio");
const playPauseBtn = document.getElementById("playPauseBtn");
const progressBar = document.getElementById("progressBar");
const volumeControl = document.getElementById("volumeControl");
const playerTitle = document.getElementById("playerTitle");
const playerArtist = document.getElementById("playerArtist");
const playerCover = document.getElementById("playerCover");
const currentTimeEl = document.getElementById("currentTime");
const durationEl = document.getElementById("duration");


/* ================= ESTADO ================= */

let currentUser = null;
let allSongs = [];
let currentSongId = null;
let currentQueue = [];
let currentIndex = 0;
let isShuffle = false;
let currentView = "all"; // all | liked | playlist
let openedPlaylistId = null;
let repeatMode = 0;
// 0 = desativado
// 1 = repetir playlist
// 2 = repetir música atual


/* ================= AUTH ================= */


btnLogout?.addEventListener("click", () => signOut(auth));


onAuthStateChanged(auth, async (user) => {

  currentUser = user;

  const menuBtn = document.getElementById("menuBtn");

  if (user) {

    const snap = await getDoc(doc(db, "users", user.uid));
    const data = snap.data();

    menuBtn.innerText = data?.name || user.email;

  } else {

    menuBtn.innerText = "Conta ▾";

  }

  loadSongs();

  if (user) {

    loginOpenBtn.style.display = "none";
    registerOpenBtn.style.display = "none";
    btnLogout.style.display = "block";

  } else {

    loginOpenBtn.style.display = "block";
    registerOpenBtn.style.display = "block";
    btnLogout.style.display = "none";

  }

});

// Botão sair
btnLogout.addEventListener("click", async () => {
  await signOut(auth);

});



/* ================= LOAD SONGS ================= */

async function loadSongs() {

  loader.style.display = "block";

  const q = query(collection(db, "songs"), orderBy("title"));
  const snapshot = await getDocs(q);

  allSongs = snapshot.docs.map(docSnap => ({
    id: docSnap.id,
    ...docSnap.data()
  }));

  loader.style.display = "none";

  renderSongs(allSongs);
}

function renderSongs(songList) {

  songsDiv.innerHTML = "";

  songList.forEach(song => {

    const liked = song.likedBy?.includes(currentUser?.uid);
    const isActive = currentQueue[currentIndex] === song.id;

    const div = document.createElement("div");
    div.classList.add("song");

    if (isActive) div.classList.add("active-song");

    div.innerHTML = `
      <img src="${song.coverUrl}">
      <h3>${song.title}</h3>
      <p>${song.artist}</p>
      <div>▶ ${song.plays || 0} | ❤️ ${song.likes || 0}</div>
      <button data-play="${song.id}">Play</button>
      <button data-like="${song.id}">
        ${liked ? "Curtido 💚" : "Curtir"}
      </button>
      <button data-add="${song.id}">+ Playlist</button>
      ${currentView === "playlist" ? `<button data-remove="${song.id}">❌ Remover</button>` : ""}
    `;

    songsDiv.appendChild(div);
  });
}



/* ================= AÇÕES DAS MÚSICAS ================= */

songsDiv.addEventListener("click", async (e) => {

  const playId = e.target.dataset.play;
  const likeId = e.target.dataset.like;
  const addId = e.target.dataset.add;

  if (playId) {

    currentView = "all";
    openedPlaylistId = null;

    currentQueue = allSongs.map(song => song.id);
    currentIndex = currentQueue.indexOf(playId);

    playSongByIndex(currentIndex);
  }


  if (likeId) {

    if (!currentUser) return alert("Faça login.");

    const ref = doc(db, "songs", likeId);
    const snap = await getDoc(ref);
    const data = snap.data();

    if (data.likedBy?.includes(currentUser.uid))
      return alert("Você já curtiu.");

    await updateDoc(ref, {
      likes: increment(1),
      likedBy: [...(data.likedBy || []), currentUser.uid]
    });

    loadSongs();
  }

  if (addId) {

    if (!currentUser) return alert("Faça login.");

    const name = prompt("Nome da playlist:");
    if (!name) return;

    const q = query(
      collection(db, "playlists"),
      where("userId", "==", currentUser.uid),
      where("name", "==", name)
    );

    const snapshot = await getDocs(q);

    let playlistId;

    if (snapshot.empty) {

      const newPlaylist = await addDoc(collection(db, "playlists"), {
        name,
        userId: currentUser.uid,
        songs: [],
        createdAt: serverTimestamp()
      });

      playlistId = newPlaylist.id;

    } else {
      playlistId = snapshot.docs[0].id;
    }

    const playlistRef = doc(db, "playlists", playlistId);
    const playlistSnap = await getDoc(playlistRef);
    const playlistData = playlistSnap.data();

    if (playlistData.songs?.includes(addId))
      return alert("Já está na playlist.");

    await updateDoc(playlistRef, {
      songs: [...(playlistData.songs || []), addId]
    });

    alert("Adicionado!");
  }

  const removeId = e.target.dataset.remove;

if (removeId && openedPlaylistId) {

  const playlistRef = doc(db, "playlists", openedPlaylistId);
  const snap = await getDoc(playlistRef);
  const data = snap.data();

  const updatedSongs = data.songs.filter(id => id !== removeId);

  await updateDoc(playlistRef, {
    songs: updatedSongs
  });

  alert("Removido!");

  // Recarrega playlist aberta
  const updatedPlaylist = { ...data, songs: updatedSongs };

  const songsSnapshot = await getDocs(collection(db, "songs"));
  const playlistSongs = songsSnapshot.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(song => updatedSongs.includes(song.id));

  renderSongs(playlistSongs);
}

});

async function playSongByIndex(index) {

  audio.preload = "auto";

  if (!currentQueue.length) return;

  if (index < 0) index = currentQueue.length - 1;
  if (index >= currentQueue.length) index = 0;

  currentIndex = index;

  const songId = currentQueue[currentIndex];

  const snap = await getDoc(doc(db, "songs", songId));
  const song = snap.data();

  // 🔥 PAUSA antes de trocar
  audio.pause();
  audio.currentTime = 0;

  // 🔥 Troca a música
  audio.src = song.audioUrl;
  audio.load();

  // 🔥 Espera carregar antes de tocar
  audio.onloadedmetadata = async () => {
    try {
      await audio.play();
      playPauseBtn.innerText = "⏸";
    } catch (err) {
      console.log("Play interrompido:", err);
    }
  };

  playerTitle.innerText = song.title;
  playerArtist.innerText = song.artist;
  playerCover.src = song.coverUrl;

  musicPlayer.classList.remove("hidden");

  // 🔥 Atualiza plays (sem travar o áudio)
  updateDoc(doc(db, "songs", songId), {
    plays: increment(1)
  });

  // 🔥 Atualiza destaque visual
  renderSongs(
    currentView === "liked"
      ? allSongs.filter(s => s.likedBy?.includes(currentUser?.uid))
      : currentView === "playlist"
      ? allSongs.filter(s => currentQueue.includes(s.id))
      : allSongs
  );
}


document.getElementById("nextBtn").onclick = () => {
  playSongByIndex(currentIndex + 1);
};

document.getElementById("prevBtn").onclick = () => {
  playSongByIndex(currentIndex - 1);
};

audio.addEventListener("ended", () => {

  // 🔂 Repetir música
  if (repeatMode === 2) {
    playSongByIndex(currentIndex);
    return;
  }

  // 🔀 Shuffle
  if (isShuffle) {
    playRandom();
    return;
  }

  // 🔁 Repetir playlist
  if (repeatMode === 1 && currentIndex === currentQueue.length - 1) {
    playSongByIndex(0);
    return;
  }

  playSongByIndex(currentIndex + 1);
});



repeatBtn.onclick = () => {

  repeatMode++;
  repeatBtn.classList.toggle("control-active", repeatMode !== 0);

  if (repeatMode > 2) repeatMode = 0;

  if (repeatMode === 0) {
    repeatBtn.style.opacity = "0.5";
    repeatBtn.innerText = "🔁";
  }

  if (repeatMode === 1) {
    repeatBtn.style.opacity = "1";
    repeatBtn.innerText = "🔁";
  }

  if (repeatMode === 2) {
    repeatBtn.style.opacity = "1";
    repeatBtn.innerText = "🔂";
  }

};


shuffleBtn.onclick = () => {
  isShuffle = !isShuffle;
  shuffleBtn.classList.toggle("control-active", isShuffle);
};

function playRandom() {

  if (currentQueue.length <= 1) return;

  let randomIndex;

  do {
    randomIndex = Math.floor(Math.random() * currentQueue.length);
  } while (randomIndex === currentIndex);

  playSongByIndex(randomIndex);
}



/* ================= PLAYER CONTROLES ================= */

playPauseBtn?.addEventListener("click", () => {

  if (audio.paused) {
    audio.play();
    playPauseBtn.innerText = "⏸";
  } else {
    audio.pause();
    playPauseBtn.innerText = "▶";
  }
});

audio.addEventListener("timeupdate", () => {

  const progress = (audio.currentTime / audio.duration) * 100;
  progressBar.value = progress || 0;

  currentTimeEl.innerText = formatTime(audio.currentTime);
  durationEl.innerText = formatTime(audio.duration);
});

progressBar.addEventListener("input", () => {
  audio.currentTime = (progressBar.value / 100) * audio.duration;
});

volumeControl.addEventListener("input", () => {
  audio.volume = volumeControl.value;
});

function formatTime(time) {
  if (!time) return "0:00";
  const m = Math.floor(time / 60);
  const s = Math.floor(time % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}


/* ================= BUSCA ================= */

searchInput?.addEventListener("input", () => {

  const value = searchInput.value.toLowerCase();

  const filtered = allSongs.filter(song =>
    song.title.toLowerCase().includes(value) ||
    song.artist.toLowerCase().includes(value)
  );

  renderSongs(filtered);
});


/* ================= TEMA ================= */

themeToggle?.addEventListener("click", () => {
  document.body.classList.toggle("light");
});


/* ================= VIEW ================= */

viewAllBtn?.addEventListener("click", () => {
  currentView = "all";
  openedPlaylistId = null;
  renderSongs(allSongs);
});


viewLikedBtn?.addEventListener("click", () => {

  if (!currentUser) return alert("Faça login.");

  currentView = "liked";

  const likedSongs = allSongs.filter(song =>
    song.likedBy?.includes(currentUser.uid)
  );

  currentQueue = likedSongs.map(song => song.id);
  currentIndex = 0;

  renderSongs(likedSongs);
});


viewPlaylistsBtn?.addEventListener("click", async () => {

  if (!currentUser) return alert("Faça login.");

  const q = query(
    collection(db, "playlists"),
    where("userId", "==", currentUser.uid),
    orderBy("name")
  );

  const snapshot = await getDocs(q);

  songsDiv.innerHTML = "<h2>📂 Minhas Playlists</h2>";

  if (snapshot.empty) {
    songsDiv.innerHTML += "<p>Você ainda não criou playlists.</p>";
    return;
  }

  snapshot.forEach(docSnap => {

    const data = docSnap.data();
    const playlistId = docSnap.id;

    const div = document.createElement("div");
    div.classList.add("song");

    div.innerHTML = `
      <h3>${data.name}</h3>
      <p>${data.songs?.length || 0} músicas</p>
      <button data-open="${playlistId}">Abrir</button>
      <button data-delete="${playlistId}">🗑 Excluir</button>
    `;


    songsDiv.appendChild(div);
  });

});

document.addEventListener("click", async (e) => {

  const openId = e.target.dataset.open;
  const deleteId = e.target.dataset.delete;

  // 🔓 ABRIR PLAYLIST
  if (openId) {

    const snap = await getDoc(doc(db, "playlists", openId));
    const playlist = snap.data();

    if (!playlist.songs || !playlist.songs.length) {
      alert("Playlist vazia.");
      return;
    }

    openedPlaylistId = openId;
    currentView = "playlist";

    const songsSnapshot = await getDocs(collection(db, "songs"));
    const playlistSongs = songsSnapshot.docs
      .map(docSnap => ({ id: docSnap.id, ...docSnap.data() }))
      .filter(song => playlist.songs.includes(song.id));

    currentQueue = playlist.songs;
    currentIndex = 0;

    renderSongs(playlistSongs);
    playSongByIndex(currentIndex);
  }

  // 🗑 EXCLUIR PLAYLIST
  if (deleteId) {

    if (!confirm("Excluir playlist?")) return;

    await deleteDoc(doc(db, "playlists", deleteId));

    viewPlaylistsBtn.click();
  }

});

/* ================= NOVO LOGIN MODAL ================= */

const menuBtn = document.getElementById("menuBtn");
const dropdown = document.getElementById("dropdownMenu");
const modal = document.getElementById("authModal");

const authBtn = document.getElementById("authBtn");
const toggleAuth = document.getElementById("toggleAuth");

const modalUsername = document.getElementById("modalUsername");
const modalEmail = document.getElementById("modalEmail");
const modalPassword = document.getElementById("modalPassword");

let isLogin = true;

function updateAuthUI() {

  const authTitle = document.getElementById("authTitle");

  if (isLogin) {

    authTitle.innerText = "Entrar";
    authBtn.innerText = "Entrar";

    modalUsername.style.display = "none";
    toggleAuth.innerText = "Não tem conta? Criar";

  } else {

    authTitle.innerText = "Criar Conta";
    authBtn.innerText = "Criar Conta";

    modalUsername.style.display = "block";
    toggleAuth.innerText = "Já tem conta? Entrar";

  }

}


/* Dropdown */
menuBtn?.addEventListener("click", () => {
  dropdown.classList.toggle("show");
});

/* Abrir login */
loginOpenBtn?.addEventListener("click", () => {
  isLogin = true;
  modal.style.display = "flex";
  updateAuthUI();
  document.getElementById("authTitle").innerText = "Entrar";
  authBtn.innerText = "Entrar";
  modalUsername.style.display = "none";
});

/* Abrir cadastro */
registerOpenBtn?.addEventListener("click", () => {
  isLogin = false;
  modal.style.display = "flex";
  updateAuthUI();
  document.getElementById("authTitle").innerText = "Criar Conta";
  authBtn.innerText = "Criar Conta";
  modalUsername.style.display = "block";
});

/* Alternar dentro do modal */
toggleAuth?.addEventListener("click", () => {
  isLogin = !isLogin;
  updateAuthUI();
  document.getElementById("authTitle").innerText = isLogin ? "Entrar" : "Criar Conta";
  authBtn.innerText = isLogin ? "Entrar" : "Criar Conta";
  modalUsername.style.display = isLogin ? "none" : "block";
});

/* Login / Cadastro Firebase */
authBtn?.addEventListener("click", async () => {

  try {

    if (isLogin) {

      await signInWithEmailAndPassword(
        auth,
        modalEmail.value,
        modalPassword.value
      );

    } else {

      const cred = await createUserWithEmailAndPassword(
        auth,
        modalEmail.value,
        modalPassword.value
      );

      await setDoc(doc(db, "users", cred.user.uid), {
        name: modalUsername.value,
        createdAt: serverTimestamp()
      });
    }

    modal.style.display = "none";
    dropdown.classList.remove("show");

    modalEmail.value = "";
    modalPassword.value = "";
    modalUsername.value = "";

  } catch (error) {
    alert(error.message);
  }

});

/* Fecha modal clicando fora */
modal?.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
  }
});
