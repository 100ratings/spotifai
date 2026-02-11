// ========================================
// CONFIGURAÇÃO SPOTIFY
// ========================================

const SPOTIFY_CLIENT_ID = '205ef91bb291485ea4b22444a199e32c';
const SPOTIFY_REDIRECT_URI = window.location.origin + window.location.pathname;
const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize';
const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

// ========================================
// ESTADO DA APLICAÇÃO
// ========================================

const state = {
    currentLetter: 'A',
    songs: {},
    accessToken: null,
    user: null,
    playlistName: '',
    
    // Inicializar estrutura de letras
    init() {
        for (let i = 65; i <= 90; i++) {
            const letter = String.fromCharCode(i);
            this.songs[letter] = [];
        }
    }
};

// ========================================
// ELEMENTOS DO DOM
// ========================================

const elements = {
    spotifyBtn: document.getElementById('spotifyBtn'),
    playlistInput: document.getElementById('playlistName'),
    charCount: document.getElementById('charCount'),
    currentLetter: document.getElementById('currentLetter'),
    songCount: document.getElementById('songCount'),
    songsList: document.getElementById('songsList'),
    addSongBtn: document.getElementById('addSongBtn'),
    createPlaylistBtn: document.getElementById('createPlaylistBtn'),
    searchModal: document.getElementById('searchModal'),
    closeModal: document.getElementById('closeModal'),
    searchInput: document.getElementById('searchInput'),
    searchResults: document.getElementById('searchResults'),
    loadingOverlay: document.getElementById('loadingOverlay'),
    loadingText: document.getElementById('loadingText'),
    toast: document.getElementById('toast')
};

// ========================================
// INICIALIZAÇÃO
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    state.init();
    
    // Verificar se há token de acesso na URL
    handleSpotifyCallback();
    
    // Restaurar dados do localStorage
    restoreFromLocalStorage();
    
    // Event listeners
    setupEventListeners();
    
    // Renderizar interface inicial
    renderLetterSection();
});

// ========================================
// SPOTIFY AUTHENTICATION
// ========================================

function handleSpotifyCallback() {
    const params = new URLSearchParams(window.location.hash.substring(1));
    const token = params.get('access_token');
    
    if (token) {
        state.accessToken = token;
        localStorage.setItem('spotify_token', token);
        updateSpotifyButton();
        window.history.replaceState({}, document.title, window.location.pathname);
    } else {
        // Tentar restaurar token do localStorage
        const savedToken = localStorage.getItem('spotify_token');
        if (savedToken) {
            state.accessToken = savedToken;
            updateSpotifyButton();
        }
    }
}

function spotifyLogin() {
    if (state.accessToken) {
        // Logout
        state.accessToken = null;
        localStorage.removeItem('spotify_token');
        localStorage.removeItem('user_data');
        state.user = null;
        updateSpotifyButton();
        showToast('Desconectado do Spotify', 'info');
        return;
    }
    
    // Login
    const scopes = [
        'playlist-modify-public',
        'playlist-modify-private',
        'user-read-private',
        'user-read-email'
    ].join('%20');
    
    const authUrl = `${SPOTIFY_AUTH_URL}?client_id=${SPOTIFY_CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(SPOTIFY_REDIRECT_URI)}&scope=${scopes}`;
    
    window.location.href = authUrl;
}

function updateSpotifyButton() {
    if (state.accessToken) {
        elements.spotifyBtn.textContent = '✓ Conectado';
        elements.spotifyBtn.classList.add('connected');
        elements.createPlaylistBtn.disabled = false;
    } else {
        elements.spotifyBtn.textContent = 'Conectar com Spotify';
        elements.spotifyBtn.classList.remove('connected');
        elements.createPlaylistBtn.disabled = true;
    }
}

// ========================================
// EVENT LISTENERS
// ========================================

function setupEventListeners() {
    // Spotify button
    elements.spotifyBtn.addEventListener('click', spotifyLogin);
    
    // Playlist name input
    elements.playlistInput.addEventListener('input', (e) => {
        state.playlistName = e.target.value;
        elements.charCount.textContent = e.target.value.length;
        saveToLocalStorage();
    });
    
    // Letter buttons
    document.querySelectorAll('.letter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            changeLetter(e.target.dataset.letter);
        });
    });
    
    // Add song button
    elements.addSongBtn.addEventListener('click', openSearchModal);
    
    // Modal close
    elements.closeModal.addEventListener('click', closeSearchModal);
    elements.searchModal.addEventListener('click', (e) => {
        if (e.target === elements.searchModal) closeSearchModal();
    });
    
    // Search input
    elements.searchInput.addEventListener('input', debounce(searchSongs, 300));
    
    // Create playlist button
    elements.createPlaylistBtn.addEventListener('click', createPlaylist);
}

// ========================================
// NAVEGAÇÃO DE LETRAS
// ========================================

function changeLetter(letter) {
    state.currentLetter = letter;
    
    // Atualizar botões
    document.querySelectorAll('.letter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.letter === letter) {
            btn.classList.add('active');
        }
    });
    
    renderLetterSection();
}

// ========================================
// RENDERIZAÇÃO
// ========================================

function renderLetterSection() {
    const letter = state.currentLetter;
    const songs = state.songs[letter];
    
    elements.currentLetter.textContent = `Letra ${letter}`;
    elements.songCount.textContent = songs.length;
    
    // Renderizar lista de músicas
    if (songs.length === 0) {
        elements.songsList.innerHTML = '<div class="empty-state"><p>Nenhuma música adicionada ainda</p></div>';
    } else {
        elements.songsList.innerHTML = songs.map((song, index) => `
            <div class="song-item">
                <div class="song-number">${index + 1}</div>
                <div class="song-info">
                    <div class="song-title">${escapeHtml(song.name)}</div>
                    <div class="song-artist">${escapeHtml(song.artist)}</div>
                </div>
                <button class="song-remove-btn" onclick="removeSong('${letter}', ${index})">×</button>
            </div>
        `).join('');
    }
    
    // Desabilitar botão de adicionar se já tem 5 músicas
    elements.addSongBtn.disabled = songs.length >= 5;
    if (songs.length >= 5) {
        elements.addSongBtn.textContent = '✓ Completo (5/5)';
    } else {
        elements.addSongBtn.textContent = '+ Adicionar Música';
    }
}

// ========================================
// GERENCIAMENTO DE MÚSICAS
// ========================================

function addSong(song) {
    const letter = state.currentLetter;
    
    if (state.songs[letter].length >= 5) {
        showToast('Máximo de 5 músicas por letra!', 'error');
        return;
    }
    
    state.songs[letter].push({
        name: song.name,
        artist: song.artist,
        id: song.id
    });
    
    saveToLocalStorage();
    renderLetterSection();
    closeSearchModal();
    showToast(`"${song.name}" adicionada!`, 'success');
}

function removeSong(letter, index) {
    state.songs[letter].splice(index, 1);
    saveToLocalStorage();
    renderLetterSection();
    showToast('Música removida', 'info');
}

// ========================================
// BUSCA DE MÚSICAS
// ========================================

function openSearchModal() {
    elements.searchModal.classList.add('active');
    elements.searchInput.focus();
    elements.searchResults.innerHTML = '';
}

function closeSearchModal() {
    elements.searchModal.classList.remove('active');
    elements.searchInput.value = '';
    elements.searchResults.innerHTML = '';
}

async function searchSongs(query) {
    if (!query.trim()) {
        elements.searchResults.innerHTML = '';
        return;
    }
    
    if (!state.accessToken) {
        showToast('Conecte ao Spotify primeiro!', 'error');
        return;
    }
    
    showLoading(true, 'Buscando músicas...');
    
    try {
        const response = await fetch(
            `${SPOTIFY_API_BASE}/search?q=${encodeURIComponent(query)}&type=track&limit=10`,
            {
                headers: {
                    'Authorization': `Bearer ${state.accessToken}`
                }
            }
        );
        
        if (!response.ok) {
            if (response.status === 401) {
                // Token expirado
                state.accessToken = null;
                localStorage.removeItem('spotify_token');
                updateSpotifyButton();
                showToast('Token expirado. Reconecte ao Spotify.', 'error');
                return;
            }
            throw new Error('Erro na busca');
        }
        
        const data = await response.json();
        displaySearchResults(data.tracks.items);
    } catch (error) {
        console.error('Erro ao buscar músicas:', error);
        showToast('Erro ao buscar músicas', 'error');
    } finally {
        showLoading(false);
    }
}

function displaySearchResults(tracks) {
    if (tracks.length === 0) {
        elements.searchResults.innerHTML = '<div class="empty-state"><p>Nenhuma música encontrada</p></div>';
        return;
    }
    
    elements.searchResults.innerHTML = tracks.map(track => `
        <div class="search-result-item" onclick="addSong({name: '${escapeHtml(track.name)}', artist: '${escapeHtml(track.artists[0].name)}', id: '${track.id}'})">
            <div class="result-title">${escapeHtml(track.name)}</div>
            <div class="result-artist">${escapeHtml(track.artists[0].name)}</div>
        </div>
    `).join('');
}

// ========================================
// CRIAR PLAYLIST
// ========================================

async function createPlaylist() {
    if (!state.accessToken) {
        showToast('Conecte ao Spotify primeiro!', 'error');
        return;
    }
    
    if (!state.playlistName.trim()) {
        showToast('Digite um nome para a playlist!', 'error');
        return;
    }
    
    // Verificar se tem pelo menos uma música
    const totalSongs = Object.values(state.songs).reduce((sum, songs) => sum + songs.length, 0);
    if (totalSongs === 0) {
        showToast('Adicione pelo menos uma música!', 'error');
        return;
    }
    
    showLoading(true, 'Criando playlist...');
    
    try {
        // 1. Obter dados do usuário
        if (!state.user) {
            const userResponse = await fetch(`${SPOTIFY_API_BASE}/me`, {
                headers: { 'Authorization': `Bearer ${state.accessToken}` }
            });
            state.user = await userResponse.json();
        }
        
        // 2. Criar playlist
        const playlistResponse = await fetch(
            `${SPOTIFY_API_BASE}/users/${state.user.id}/playlists`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${state.accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: state.playlistName,
                    description: 'Criada com Song Alphabet',
                    public: false
                })
            }
        );
        
        if (!playlistResponse.ok) {
            throw new Error('Erro ao criar playlist');
        }
        
        const playlist = await playlistResponse.json();
        
        // 3. Adicionar músicas à playlist
        const trackUris = [];
        for (const letter in state.songs) {
            for (const song of state.songs[letter]) {
                trackUris.push(`spotify:track:${song.id}`);
            }
        }
        
        // Adicionar em lotes de 100 (limite do Spotify)
        for (let i = 0; i < trackUris.length; i += 100) {
            const batch = trackUris.slice(i, i + 100);
            await fetch(
                `${SPOTIFY_API_BASE}/playlists/${playlist.id}/tracks`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${state.accessToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ uris: batch })
                }
            );
        }
        
        showLoading(false);
        showToast(`Playlist "${state.playlistName}" criada com sucesso! 🎉`, 'success');
        
        // Limpar dados
        setTimeout(() => {
            state.songs = {};
            state.init();
            state.playlistName = '';
            elements.playlistInput.value = '';
            elements.charCount.textContent = '0';
            localStorage.removeItem('song_alphabet_data');
            renderLetterSection();
        }, 2000);
        
    } catch (error) {
        console.error('Erro ao criar playlist:', error);
        showToast('Erro ao criar playlist. Tente novamente.', 'error');
        showLoading(false);
    }
}

// ========================================
// UTILITÁRIOS
// ========================================

function showLoading(show, text = 'Carregando...') {
    if (show) {
        elements.loadingOverlay.classList.add('active');
        elements.loadingText.textContent = text;
    } else {
        elements.loadingOverlay.classList.remove('active');
    }
}

function showToast(message, type = 'info') {
    elements.toast.textContent = message;
    elements.toast.className = `toast show ${type}`;
    
    setTimeout(() => {
        elements.toast.classList.remove('show');
    }, 3000);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// ========================================
// LOCAL STORAGE
// ========================================

function saveToLocalStorage() {
    const data = {
        songs: state.songs,
        playlistName: state.playlistName
    };
    localStorage.setItem('song_alphabet_data', JSON.stringify(data));
}

function restoreFromLocalStorage() {
    const saved = localStorage.getItem('song_alphabet_data');
    if (saved) {
        const data = JSON.parse(saved);
        state.songs = data.songs || state.songs;
        state.playlistName = data.playlistName || '';
        elements.playlistInput.value = state.playlistName;
        elements.charCount.textContent = state.playlistName.length;
    }
}
