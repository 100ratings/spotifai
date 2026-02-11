# 🎵 Song Alphabet

Um aplicativo web simples que permite criar playlists no Spotify organizadas alfabeticamente. Selecione 5 músicas para cada letra (A-Z), nomeie sua playlist e crie-a automaticamente na sua conta Spotify.

## ✨ Funcionalidades

- 🔐 Autenticação com Spotify
- 🔤 Organização de músicas por letra (A-Z)
- 🎵 Busca de músicas em tempo real
- 📝 Nomeação personalizada de playlists
- 💾 Salvamento automático no navegador
- 📱 Design responsivo (desktop, tablet, mobile)
- ⚡ Sem dependências externas (HTML/CSS/JavaScript puro)

## 🚀 Como Usar

### 1. Configurar Spotify Developer

1. Acesse [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Faça login ou crie uma conta
3. Crie uma nova aplicação
4. Copie o **Client ID**
5. Vá em "Edit Settings" e adicione a URL do seu app em "Redirect URIs"
   - Para desenvolvimento local: `http://localhost:8000`
   - Para produção: sua URL completa (ex: `https://seu-site.com`)

### 2. Configurar o Projeto

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/song-alphabet.git
cd song-alphabet
```

2. Abra `app.js` e substitua `YOUR_CLIENT_ID_HERE` pelo seu Client ID do Spotify:
```javascript
const SPOTIFY_CLIENT_ID = 'seu-client-id-aqui';
```

3. Se estiver testando localmente, ajuste a `SPOTIFY_REDIRECT_URI` conforme necessário.

### 3. Executar Localmente

Você pode usar qualquer servidor HTTP local. Aqui estão algumas opções:

**Com Python 3:**
```bash
python -m http.server 8000
```

**Com Python 2:**
```bash
python -m SimpleHTTPServer 8000
```

**Com Node.js (http-server):**
```bash
npx http-server -p 8000
```

**Com Live Server (VS Code):**
- Instale a extensão "Live Server"
- Clique com botão direito em `index.html` e selecione "Open with Live Server"

Depois, acesse `http://localhost:8000` no seu navegador.

### 4. Usar o Aplicativo

1. Clique em "Conectar com Spotify" e autorize o acesso
2. Digite um nome para sua playlist
3. Selecione uma letra (A-Z) na barra lateral
4. Clique em "+ Adicionar Música" para buscar e adicionar músicas
5. Repita para as letras que desejar
6. Clique em "Criar Playlist no Spotify" para finalizar

## 📁 Estrutura de Arquivos

```
song-alphabet/
├── index.html          # Estrutura HTML
├── styles.css          # Estilos CSS
├── app.js              # Lógica JavaScript
├── README.md           # Este arquivo
└── LICENSE             # Licença MIT
```

## 🔧 Tecnologias

- **HTML5** - Estrutura
- **CSS3** - Estilos com variáveis CSS
- **JavaScript ES6+** - Lógica e integração com Spotify API
- **Spotify Web API** - Autenticação e criação de playlists

## 🎨 Design

O aplicativo utiliza um design minimalista moderno com:
- Paleta de cores: Branco, Verde Spotify (#1DB954), Cinza
- Tipografia: Poppins (títulos), Inter (corpo)
- Responsivo para todos os tamanhos de tela
- Animações suaves e feedback visual

## 🔐 Segurança

- **Tokens**: O token de acesso é armazenado apenas no navegador (localStorage)
- **Escopo**: Apenas permissões necessárias são solicitadas
- **Sem backend**: Tudo é processado no cliente
- **HTTPS recomendado**: Para produção, use HTTPS

## 📱 Compatibilidade

- ✅ Chrome/Edge (versão 90+)
- ✅ Firefox (versão 88+)
- ✅ Safari (versão 14+)
- ✅ Mobile (iOS Safari, Chrome Mobile)

## 🐛 Troubleshooting

### "Erro ao conectar com Spotify"
- Verifique se o Client ID está correto em `app.js`
- Confirme que a Redirect URI está registrada no Spotify Developer Dashboard
- Limpe o cache do navegador

### "Token expirado"
- O token expira após 1 hora
- Desconecte e reconecte ao Spotify
- Os dados das músicas são salvos localmente

### "Erro ao criar playlist"
- Certifique-se de ter autorizado todas as permissões
- Verifique se tem pelo menos uma música adicionada
- Tente novamente ou reconecte ao Spotify

## 📝 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se livre para:
- Reportar bugs
- Sugerir melhorias
- Fazer pull requests

## 📧 Contato

Se tiver dúvidas ou sugestões, abra uma issue no repositório.

---

**Desenvolvido com ❤️ para amantes de música e Spotify**
