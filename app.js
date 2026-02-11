// ========================================
// CONFIGURAÇÃO SPOTIFY
// ========================================

const SPOTIFY_CLIENT_ID = '205ef91bb291485ea4b22444a199e32c';
const SPOTIFY_REDIRECT_URI = window.location.origin + window.location.pathname; // ex: https://100ratings.github.io/spotifai/
const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize';
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

const SPOTIFY_SCOPES = [
    'playlist-modify-public',
    'playlist-modify-private',
    'user-read-private',
    'user-read-email'
];

// ========================================
// ESTADO DA APLICAÇÃO
// ========================================

const state = {
    currentLetter: 'A',
    songs: {},
    accessToken: null,
    refreshToken: null,
    tokenExpiresAt: 0,
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

document.addEventListener('DOMContentLoaded', async () => {
    state.init();

    // 1) Trata callback do Spotify (PKCE)
    await handleSpotifyCallbackPKCE();

    // 2) Restaura dados
    restoreFromLocalStorage();

    // 3) Listeners + UI
    setupEventListeners();
    updateSpotifyButton();
    renderLetterSection();
});

// ========================================
// SPOTIFY AUTH (PKCE)
// ========================================

function randomString(length = 64) {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    const bytes = crypto.getRandomValues(new Uint8Array(length));
    let text = '';
    for (let i = 0; i < length; i++) text += possible[bytes[i] % possible.length];
    return text;
}

async function sha256(plain) {
    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    return await crypto.subtle.digest('SHA-256', data);
}

function base64UrlEncode(arrayBuffer) {
    return btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

async function startSpotifyLoginPKCE() {
    const verifier = randomString(96);
    const challenge = base64UrlEncode(await sha256(verifier));

    localStorage.setItem('pkce_verifier', verifier);

    const params = new URLSearchParams({
        client_id: SPOTIFY_CLIENT_ID,
        response_type: 'code',
        redirect_uri: SPOTIFY_REDIRECT_URI,
        code_challenge_method: 'S256',
        code_challenge: challenge,
        scope: SPOTIFY_SCOPES.join(' ')
    });

    window.location.href = `${SPOTIFY_AUTH_URL}?${params.toString()}`;
}

async function exchangeCodeForToken(code) {
    const verifier = localStorage.getItem('pkce_verifier');
    if (!verifier) throw new Error('PKCE verifier ausente');

    const body = new URLSearchParams({
        client_id: SPOTIFY_CLIENT_ID,
        grant_type: 'authorization_code',
        code,
        redirect_uri: SPOTIFY_REDIRECT_URI,
        code_verifier: verifier
    });

    const resp = await fetch(SPOTIFY_TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body
    });

    if (!resp.ok) {
        const text = await resp.text().catch(() => '');
        throw new Error(`Falha no token exchange (${resp.status}): ${text}`);
    }

    const data = await resp.json();

    state.accessToken = data.access_token;
    state.refreshToken = data.refresh_token || null;
    state.tokenExpiresAt = Date.now() + (data.expires_in * 1000);

    localStorage.setItem('spotify_access_token', state.accessToken);
    localStorage.setItem('spotify_refresh_token', state.refreshToken || '');
    localStorage.setItem('spotify_token_expires_at', String(state.tokenExpiresAt));

    localStorage.removeItem('pkce_verifier');
}

async function refreshAccessToken() {
    if (!state.refreshToken) return false;

    const body = new URLSearchParams({
        client_id: SPOTIFY_CLIENT_ID,
        grant_type: 'refresh_token',
        refresh_token: state.refreshToken
    });

    const resp = await fetch(SPOTIFY_TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body
    });

    if (!resp.ok) return false;

    const data = await resp.json();
    state.accessToken = data.access_token;
    state.tokenExpiresAt = Date.now() + (data.expires_in * 1000);

    localStorage.setItem('spotify_access_token', state.accessToken);
    localStorage.setItem('spotify_token_expires_at', String(state.tokenExpiresAt));

    // às vezes vem refresh_token novo, às vezes não
    if (data.refresh_token) {
        state.refreshToken = data.refresh_token;
        localStorage.setItem('spotify_refresh_token', state.refreshToken);
    }

    return true;
}

function loadTokensFromStorage() {
    const at = localStorage.getItem('spotify_access_token');
    const rt = localStorage.getItem('spotify_refresh_token') || '';
    const exp = Number(localStorage.getItem('spotify_token_expires_at') || '0');

    state.accessToken = at || null;
    state.refreshToken = rt || null;
    state.tokenExpiresAt = exp || 0;
}

async function ensureValidToken() {
    // sem token
    if (!state.accessToken) return false;

    // ainda válido (com folga de 30s)
    if (Date.now() < (state.tokenExpiresAt - 30000)) return true;

    // tenta refresh
    const ok = await refreshAccessToken();
    if (!ok) {
        // limpa se falhar
        logoutSpotify();
        return false;
    }
    return true;
}

async function handleSpotifyCallbackPKCE() {
    // 1) Se veio erro no hash (ex: #error=...)
    if (window.location.hash && window.location.hash.includes('error=')) {
        showToast('Erro ao conectar com Spotify. Verifique Redirect URI e tente de novo.', 'error');
        // limpa hash
        window.history.replaceState({}, document.title, window.location.pathname);
        loadTokensFromStorage();
        return;
    }

    // 2) Se voltou com ?code=
    const url = new URL(window.location.href);
    const code = url.searchParams.get('code');

    if (code) {
        showLoading(true, 'Conectando ao Spotify...');
        try {
            await exchangeCodeForToken(code);
            showToast('Conectado com sucesso! ✅', 'success');
        } catch (e) {
            console.error(e);
            showToast('Falha ao autenticar. Confirme a Redirect URI no Dashboard.', 'error');
        } finally {
            showLoading(false);
            // remove ?code=... da URL
            url.searchParams.delete('code');
            url.searchParams.delete('state');
            window.history.replaceState({}, document.title, url.pathname);
        }
        return;
    }

    // 3) Caso normal: tenta restaurar
    loadTokensFromStorage();
    // se tiver token, ok
    if (state.accessToken) {
        // tenta refresh se estiver vencido
        await ensureValidToken();
    }
}

function logoutSpotify() {
    state.accessToken = null;
    state.refreshToken = null;
    state.tokenExpiresAt = 0;
    state.user = null;

    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('spotify_refresh_token');
    localStorage.removeItem('spotify_token_expires_at');
    localStorage.removeItem('user_data');

    updateSpotifyButton();
}

// ========================================
// BOTÃO SPOTIFY
// ========================================

async function spotifyLogin() {
    if (state.accessToken) {
        logoutSpotify();
        showToast('Desconectado do Spotify', 'info');
        return;
    }
    await startSpotifyLoginPKCE();
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

    document.querySelectorAll('.letter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.letter === letter) btn.classList.add('active');
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

    elements.addSongBtn.disabled = songs.length >= 5;
    elements.addSongBtn.textContent = songs.length >= 5 ? '✓ Completo (5/5)' : '+ Adicionar Música';
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

    const ok = await ensureValidToken();
    if (!ok) {
        showToast('Conecte ao Spotify primeiro!', 'error');
        return;
    }

    showLoading(true, 'Buscando músicas...');

    try {
        const response = await fetch(
            `${SPOTIFY_API_BASE}/search?q=${encodeURIComponent(query)}&type=track&limit=10`,
            { headers: { 'Authorization': `Bearer ${state.accessToken}` } }
        );

        if (!response.ok) {
            if (response.status === 401) {
                // tenta refresh e repete 1x
                const refreshed = await refreshAccessToken();
                if (refreshed) return searchSongs(query);
                logoutSpotify();
                showToast('Sessão expirada. Reconecte ao Spotify.', 'error');
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
    const ok = await ensureValidToken();
    if (!ok) {
        showToast('Conecte ao Spotify primeiro!', 'error');
        return;
    }

    if (!state.playlistName.trim()) {
        showToast('Digite um nome para a playlist!', 'error');
        return;
    }

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
            if (userResponse.status === 401) {
                const refreshed = await refreshAccessToken();
                if (refreshed) return createPlaylist();
                logoutSpotify();
                showToast('Sessão expirada. Reconecte ao Spotify.', 'error');
                return;
            }
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

        if (!playlistResponse.ok) throw new Error('Erro ao criar playlist');

        const playlist = await playlistResponse.json();

        // 3. Adicionar músicas
        const trackUris = [];
        for (const letter in state.songs) {
            for (const song of state.songs[letter]) {
                trackUris.push(`spotify:track:${song.id}`);
            }
        }

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
    setTimeout(() => elements.toast.classList.remove('show'), 3000);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => { clearTimeout(timeout); func(...args); };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function escapeHtml(text) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(text).replace(/[&<>"']/g, m => map[m]);
}

// ========================================
// LOCAL STORAGE
// ========================================

function saveToLocalStorage() {
    const data = { songs: state.songs, playlistName: state.playlistName };
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
