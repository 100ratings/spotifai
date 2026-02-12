# 🔧 Guia de Configuração - Song Alphabet

Este guia detalha passo a passo como configurar o Song Alphabet para funcionar corretamente.

## 📋 Checklist de Configuração

- [ ] Criar aplicação no Spotify Developer Dashboard
- [ ] Copiar Client ID
- [ ] Configurar Redirect URI
- [ ] Adicionar usuário no User Management
- [ ] Atualizar Client ID no código
- [ ] Testar conexão

## 🎯 Passo 1: Criar Aplicação no Spotify

1. Acesse: https://developer.spotify.com/dashboard
2. Faça login com sua conta Spotify
3. Clique em **"Create app"**
4. Preencha os campos:

```
App name: Song Alphabet
App description: Aplicativo para criar playlists alfabéticas
Redirect URI: http://localhost:8000/
Which API/SDKs: Web API
```

5. Aceite os termos e clique em **"Save"**

## 🔑 Passo 2: Obter Client ID

1. Após criar a app, você verá a tela de detalhes
2. Copie o **Client ID** (uma string longa tipo: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`)
3. **NÃO compartilhe** o Client Secret (não é necessário para este app)

## 🔗 Passo 3: Configurar Redirect URI

### Para Desenvolvimento Local:

1. No Dashboard, clique em **"Settings"**
2. Em **"Redirect URIs"**, adicione:
   ```
   http://localhost:8000/
   ```
3. Clique em **"Add"**
4. Clique em **"Save"** no final da página

### Para Produção (GitHub Pages, Netlify, etc.):

1. Após fazer deploy, copie a URL completa
2. Adicione a URL nas Redirect URIs:
   ```
   https://seu-usuario.github.io/song-alphabet/
   ```
3. **Importante:** A URL deve ser EXATAMENTE igual, incluindo:
   - Protocolo (http:// ou https://)
   - Domínio completo
   - Barra final (/)

## 👥 Passo 4: Adicionar Usuários (CRÍTICO!)

⚠️ **Este é o passo mais importante para evitar erro 403!**

Durante o desenvolvimento, o Spotify só permite que usuários cadastrados usem a aplicação.

1. No Dashboard, selecione sua aplicação
2. No menu lateral, clique em **"User Management"**
3. Clique em **"Add new user"**
4. Digite o **e-mail completo** da conta Spotify que você vai usar
   - Exemplo: `seu.email@gmail.com`
5. Clique em **"Add"**
6. Repita para cada usuário que vai testar

**Nota:** Você pode adicionar até 25 usuários no modo Development.

## 💻 Passo 5: Configurar o Código

1. Abra o arquivo `app.js`
2. Localize a linha 7:
   ```javascript
   const SPOTIFY_CLIENT_ID = '205ef91bb291485ea4b22444a199e32c';
   ```
3. Substitua pelo seu Client ID:
   ```javascript
   const SPOTIFY_CLIENT_ID = 'SEU_CLIENT_ID_AQUI';
   ```

### Configuração da Redirect URI (Opcional)

Se você estiver usando uma URL diferente de `http://localhost:8000/`:

1. Localize a linha 10 em `app.js`:
   ```javascript
   const SPOTIFY_REDIRECT_URI = window.location.origin + '/';
   ```

2. **Opção A:** Deixar dinâmico (recomendado)
   - Funciona automaticamente em qualquer domínio
   - Certifique-se de cadastrar todas as URLs no Dashboard

3. **Opção B:** Fixar URL específica
   ```javascript
   const SPOTIFY_REDIRECT_URI = 'https://seu-site.com/';
   ```

## ✅ Passo 6: Testar

1. Inicie um servidor local:
   ```bash
   python3 -m http.server 8000
   ```

2. Acesse: `http://localhost:8000`

3. Clique em **"Conectar com Spotify"**

4. Você será redirecionado para a página de autorização do Spotify

5. Clique em **"Aceitar"**

6. Você será redirecionado de volta para o app

7. O botão deve mudar para **"✓ Conectado"**

## 🐛 Resolução de Problemas

### Erro: "Invalid client"

**Causa:** Client ID incorreto

**Solução:**
- Verifique se copiou o Client ID completo
- Certifique-se de não ter espaços extras
- Confirme que está usando o Client ID (não o Client Secret)

### Erro: "Invalid redirect URI"

**Causa:** Redirect URI não cadastrada ou diferente

**Solução:**
1. Verifique a URL exata que está usando
2. Abra o Console do navegador (F12)
3. Procure por: `📍 Redirect URI: ...`
4. Copie essa URL exata
5. Adicione no Spotify Dashboard
6. Salve e tente novamente

### Erro 403: "User not registered in the Developer Dashboard"

**Causa:** Seu e-mail não está no User Management

**Solução:**
1. Acesse o Spotify Dashboard
2. Vá em User Management
3. Adicione o e-mail da conta que está usando
4. Aguarde alguns segundos
5. Clique em "Resetar Conexão" no app
6. Conecte novamente

### Erro: "Insufficient client scope"

**Causa:** Faltam permissões

**Solução:**
- O app vai reconectar automaticamente
- Autorize todas as permissões solicitadas
- Se persistir, limpe o cache e reconecte

## 🚀 Configuração para Produção

### 1. Fazer Deploy

Escolha uma plataforma:
- **GitHub Pages:** Gratuito, fácil
- **Netlify:** Gratuito, rápido
- **Vercel:** Gratuito, moderno
- **Seu próprio servidor:** Controle total

### 2. Atualizar Redirect URI

1. Copie a URL final do seu site
2. Adicione no Spotify Dashboard
3. Exemplo: `https://seu-usuario.github.io/song-alphabet/`

### 3. Solicitar Quota Extension (Opcional)

Para remover a limitação de 25 usuários:

1. No Dashboard, vá em **"Quota Extension"**
2. Preencha:
   - **App description:** Descreva o propósito do app
   - **Commercial use:** Não (se for gratuito)
   - **Privacy policy:** URL da sua política (ou use template)
3. Envie para revisão
4. Aguarde aprovação (3-7 dias)

Após aprovado, qualquer pessoa poderá usar seu app!

## 📊 Configurações Avançadas

### Alterar Escopos de Permissão

Se quiser adicionar mais funcionalidades, edite em `app.js`:

```javascript
const SPOTIFY_SCOPES = [
    'playlist-modify-public',      // Criar playlists públicas
    'playlist-modify-private',     // Criar playlists privadas
    'user-read-private',           // Ler dados do perfil
    'user-read-email',             // Ler e-mail do usuário
    // Adicione mais conforme necessário:
    // 'user-library-read',        // Ler biblioteca
    // 'user-top-read',            // Ler top músicas
];
```

### Alterar Limite de Músicas por Letra

Em `app.js`, localize a função `addSong` (linha ~400):

```javascript
if (state.songs[letter].length >= 5) {  // Altere 5 para o número desejado
    showToast('Máximo de 5 músicas por letra!', 'error');
    return;
}
```

### Personalizar Mensagens

Todas as mensagens de toast podem ser personalizadas na função `showToast` e nas chamadas em todo o código.

## 📚 Recursos Úteis

- [Spotify Web API Documentation](https://developer.spotify.com/documentation/web-api)
- [Spotify Authorization Guide](https://developer.spotify.com/documentation/web-api/concepts/authorization)
- [PKCE Flow Explanation](https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow)

## 💡 Dicas

1. **Sempre use HTTPS em produção** para segurança
2. **Adicione todos os domínios** que você vai usar nas Redirect URIs
3. **Teste com diferentes usuários** antes de publicar
4. **Monitore o Console** (F12) para debug
5. **Mantenha o Client ID privado** (não compartilhe publicamente)

---

✅ **Configuração concluída!** Agora você está pronto para usar o Song Alphabet.

Se tiver problemas, consulte a seção de Troubleshooting no README.md
