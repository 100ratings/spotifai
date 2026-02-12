# 🎵 Song Alphabet

Um aplicativo web simples que permite criar playlists no Spotify organizadas alfabeticamente. Selecione 5 músicas para cada letra (A-Z), nomeie sua playlist e crie-a automaticamente na sua conta Spotify.

## ✨ Funcionalidades

- 🔐 Autenticação segura com Spotify (PKCE)
- 🔤 Organização de músicas por letra (A-Z)
- 🎵 Busca de músicas em tempo real
- 📝 Nomeação personalizada de playlists
- 💾 Salvamento automático no navegador
- 📱 Design responsivo (desktop, tablet, mobile)
- ⚡ Sem dependências externas (HTML/CSS/JavaScript puro)

## 🚀 Como Usar

### 1. Configurar Spotify Developer Dashboard

#### a) Criar Aplicação

1. Acesse [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Faça login com sua conta Spotify
3. Clique em **"Create app"**
4. Preencha:
   - **App name:** Song Alphabet (ou nome de sua escolha)
   - **App description:** Criador de playlists alfabéticas
   - **Redirect URI:** 
     - Para desenvolvimento local: `http://localhost:8000/`
     - Para produção: `https://seu-dominio.com/`
   - **Which API/SDKs are you planning to use?** Web API
5. Aceite os termos e clique em **"Save"**
6. Copie o **Client ID** que aparece na tela

#### b) Adicionar Usuários (IMPORTANTE!)

⚠️ **Durante o desenvolvimento, o Spotify exige que você adicione manualmente cada usuário que vai testar o app:**

1. No Dashboard, selecione sua aplicação
2. Clique em **"User Management"** no menu lateral
3. Clique em **"Add new user"**
4. Digite o **e-mail da conta Spotify** que você vai usar para testar
5. Clique em **"Add"**

**Nota:** Se você não fizer isso, receberá erro 403 "User not registered in the Developer Dashboard" ao tentar criar playlists.

#### c) Configurar Redirect URI

1. No Dashboard, clique em **"Settings"**
2. Em **"Redirect URIs"**, adicione:
   - `http://localhost:8000/` (para desenvolvimento)
   - Sua URL de produção (quando fizer deploy)
3. Clique em **"Save"**

### 2. Configurar o Projeto

1. Clone ou baixe o repositório:
```bash
git clone https://github.com/seu-usuario/song-alphabet.git
cd song-alphabet
```

2. Abra o arquivo `app.js` e substitua o Client ID na linha 7:
```javascript
const SPOTIFY_CLIENT_ID = 'SEU_CLIENT_ID_AQUI';
```

3. **Opcional:** Se sua URL for diferente de `http://localhost:8000/`, ajuste a linha 10:
```javascript
const SPOTIFY_REDIRECT_URI = 'http://localhost:8000/';
```

### 3. Executar Localmente

Você pode usar qualquer servidor HTTP local. Aqui estão algumas opções:

**Com Python 3:**
```bash
python3 -m http.server 8000
```

**Com Python 2:**
```bash
python -m SimpleHTTPServer 8000
```

**Com Node.js (http-server):**
```bash
npx http-server -p 8000
```

**Com PHP:**
```bash
php -S localhost:8000
```

**Com Live Server (VS Code):**
- Instale a extensão "Live Server"
- Clique com botão direito em `index.html` e selecione "Open with Live Server"

Depois, acesse `http://localhost:8000` no seu navegador.

### 4. Usar o Aplicativo

1. Clique em **"Conectar com Spotify"** e autorize o acesso
2. Digite um nome para sua playlist
3. Selecione uma letra (A-Z) na barra lateral
4. Clique em **"+ Adicionar Música"** para buscar e adicionar músicas
5. Adicione até 5 músicas por letra
6. Repita para as letras que desejar
7. Clique em **"Criar Playlist no Spotify"** para finalizar

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

- **HTML5** - Estrutura semântica
- **CSS3** - Estilos modernos com variáveis CSS
- **JavaScript ES6+** - Lógica e integração com Spotify API
- **Spotify Web API** - Autenticação PKCE e gerenciamento de playlists

## 🎨 Design

O aplicativo utiliza um design minimalista moderno com:
- Paleta de cores: Branco, Verde Spotify (#1DB954), Cinza
- Tipografia: Poppins (títulos), Inter (corpo)
- Responsivo para todos os tamanhos de tela
- Animações suaves e feedback visual
- Toast notifications para feedback ao usuário

## 🔐 Segurança

- **PKCE (Proof Key for Code Exchange)**: Autenticação segura sem Client Secret
- **Tokens**: Armazenados apenas no navegador (localStorage)
- **Escopo mínimo**: Apenas permissões necessárias são solicitadas
- **Sem backend**: Tudo é processado no cliente
- **HTTPS recomendado**: Para produção, sempre use HTTPS

## 📱 Compatibilidade

- ✅ Chrome/Edge (versão 90+)
- ✅ Firefox (versão 88+)
- ✅ Safari (versão 14+)
- ✅ Mobile (iOS Safari, Chrome Mobile)

## 🐛 Troubleshooting

### ❌ Erro 403: "User not registered in the Developer Dashboard"

**Causa:** Seu e-mail não está cadastrado no User Management.

**Solução:**
1. Acesse [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Selecione sua aplicação
3. Vá em **"User Management"**
4. Adicione o e-mail da sua conta Spotify
5. Salve e reconecte no app

### ❌ "Erro ao conectar com Spotify"

**Possíveis causas:**
- Client ID incorreto
- Redirect URI não cadastrada
- Redirect URI diferente da configurada

**Solução:**
1. Verifique se o Client ID em `app.js` está correto
2. Confirme que a Redirect URI está registrada no Dashboard
3. Certifique-se que a URI é **exatamente** igual (incluindo `/` no final)
4. Limpe o cache do navegador e tente novamente

### ❌ "Token expirado"

**Causa:** O token do Spotify expira após 1 hora.

**Solução:**
- O app tenta renovar automaticamente
- Se falhar, clique em "Resetar Conexão" e reconecte
- Seus dados de músicas são salvos localmente

### ❌ "Erro ao criar playlist"

**Possíveis causas:**
- Permissões insuficientes
- Token expirado
- Problemas de rede

**Solução:**
1. Certifique-se de ter autorizado todas as permissões
2. Verifique se tem pelo menos uma música adicionada
3. Tente reconectar ao Spotify
4. Verifique o console do navegador (F12) para mais detalhes

### ❌ "Insufficient client scope"

**Causa:** Faltam permissões necessárias.

**Solução:**
- O app vai reconectar automaticamente
- Autorize todas as permissões solicitadas

## 🚀 Deploy para Produção

### GitHub Pages

1. Faça push do código para um repositório GitHub
2. Vá em Settings > Pages
3. Selecione a branch `main` e pasta `/root`
4. Sua URL será: `https://seu-usuario.github.io/song-alphabet/`
5. **Importante:** Adicione essa URL exata nas Redirect URIs do Spotify Dashboard

### Netlify

1. Conecte seu repositório ao Netlify
2. Configure:
   - Build command: (deixe vazio)
   - Publish directory: `/`
3. Após deploy, copie a URL fornecida
4. Adicione a URL nas Redirect URIs do Spotify Dashboard

### Vercel

1. Importe o repositório no Vercel
2. Configure:
   - Framework Preset: Other
   - Build Command: (deixe vazio)
   - Output Directory: (deixe vazio)
3. Após deploy, copie a URL fornecida
4. Adicione a URL nas Redirect URIs do Spotify Dashboard

**⚠️ Lembre-se:** Sempre que mudar a URL, atualize as Redirect URIs no Spotify Dashboard!

## 📊 Modo Produção (Quota Extension)

Para disponibilizar o app publicamente sem restrições:

1. No Spotify Dashboard, vá em **"Quota Extension"**
2. Preencha o formulário de revisão
3. Aguarde aprovação (pode levar alguns dias)
4. Após aprovado, qualquer usuário poderá usar seu app

**Nota:** Até a aprovação, apenas usuários cadastrados no User Management poderão usar.

## 📝 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se livre para:
- 🐛 Reportar bugs
- 💡 Sugerir melhorias
- 🔧 Fazer pull requests
- ⭐ Dar uma estrela no repositório

## 📧 Suporte

Se tiver dúvidas ou problemas:
1. Verifique a seção **Troubleshooting** acima
2. Abra uma issue no repositório
3. Consulte a [documentação oficial do Spotify](https://developer.spotify.com/documentation/web-api)

## 🎯 Roadmap

- [ ] Suporte a mais de 5 músicas por letra
- [ ] Edição de playlists existentes
- [ ] Temas personalizáveis
- [ ] Exportar/importar configurações
- [ ] Compartilhar playlists com amigos
- [ ] Estatísticas de músicas adicionadas

---

**Desenvolvido com ❤️ para amantes de música e Spotify**

🎵 Aproveite criando suas playlists alfabéticas!
