# DATAQUEST

> **EN:** A personal learning platform that tracks my path to becoming a Data Scientist. It measures three independent dimensions (consistency, verified knowledge and hands-on application) instead of a single score. Vanilla JavaScript PWA, hosted on GitHub Pages, with Supabase (Postgres + Auth + Row Level Security) for cross-device sync and full offline support.

Plataforma pessoal de aprendizado para a minha formação em Ciência de Dados. Em vez de medir só horas estudadas, o DATAQUEST acompanha três dimensões separadas: **consistência** (quanto eu estudo), **conhecimento** (o que eu comprovo saber, com evidências) e **aplicação prática** (o que eu construo).

## Funcionalidades

- **Pomodoro** medido por timestamps (continua certo se a aba ficar em segundo plano), modo foco com som ambiente e registro manual com validações
- **Calendário de contribuições** dos últimos 365 dias, no estilo do GitHub
- **XP, níveis, sequência e conquistas**, sempre recalculados a partir dos registros, sem recompensa duplicada
- **Árvore de habilidades** com 81 competências, pré-requisitos e escala de domínio de 1 a 6; avanços significativos exigem evidência
- **Flashcards** com repetição espaçada e **revisão de conceitos** em 1, 3, 7, 14 e 30 dias
- **Trilhas de estudo**, planejador semanal e mensal e o assistente “Planejar minha próxima semana”
- **Motor de recomendação** que escolhe a próxima atividade pelo tempo disponível, revisões atrasadas, pré-requisitos e lacunas
- **Relatórios** semanal e mensal (“Seu mês em dados”) com diagnóstico baseado só nos dados reais
- **Projetos práticos** com modelos por nível e portfólio
- **Funciona offline** e sincroniza entre aparelhos quando a conexão volta

## Tecnologias

HTML, CSS e JavaScript puro (sem framework), PWA com service worker, Supabase (PostgreSQL, Auth e Row Level Security) e GitHub Pages.

## Como publicar (passo a passo)

### 1. Criar o banco no Supabase

1. Crie uma conta em [supabase.com](https://supabase.com) e clique em **New project**. Uma região próxima (como São Paulo) deixa tudo mais rápido.
2. Com o projeto pronto, abra o **SQL Editor**, cole o conteúdo de [`schema.sql`](schema.sql) e clique em **Run**.
3. Copie dois dados do projeto: a **Project URL** e a **chave publicável** (*publishable key*, começa com `sb_publishable_`; em projetos antigos, a *anon key*). Elas aparecem no botão **Connect**, no topo do painel, e nas configurações de API do projeto.
4. Cole os dois no arquivo [`config.js`](config.js):

   ```js
   window.DATAQUEST_CONFIG = {
     supabaseUrl: 'https://SEU-PROJETO.supabase.co',
     supabaseKey: 'sb_publishable_...',
   };
   ```

   Nunca use a chave secreta (*secret* ou *service_role*). Se isso acontecer, o app se recusa a iniciar a sincronização e avisa.

### 2. Publicar no GitHub Pages

1. Crie um repositório público chamado `dataquest`.
2. Em **Add file → Upload files**, envie todos os arquivos desta pasta (inclusive a pasta `icons`) e confirme o commit.
3. Vá em **Settings → Pages**, escolha **Deploy from a branch**, branch `main`, pasta `/ (root)`, e salve.
4. Em cerca de um minuto o endereço aparece no topo da página, no formato `https://SEU-USUARIO.github.io/dataquest/`.

### 3. Ligar o login ao seu endereço

No Supabase, em **Authentication → URL Configuration**, coloque o endereço do GitHub Pages em **Site URL** e também em **Redirect URLs**. É para lá que os links de confirmação de e-mail e de nova senha vão levar.

### 4. Criar a sua conta e fechar as portas

1. Abra o seu DATAQUEST, clique em **Criar conta** e confirme pelo e-mail que chegar.
2. Depois de criar a sua conta, desative novos cadastros em **Authentication → Sign In / Providers** (opção que permite novos usuários). Ninguém conseguiria ver seus dados de qualquer forma, por causa do RLS, mas assim ninguém usa o seu banco.

Se preferir não confirmar e-mail, desative a confirmação nas configurações do provedor **Email**, no mesmo lugar.

### 5. Trazer os dados da versão do Claude

1. No DATAQUEST do Claude: **Configurações → Exportar backup (JSON)**.
2. Aqui, já com a conta conectada: **Configurações → Importar backup → Substituir tudo**.

Os dados vão para a sua conta e aparecem em todos os aparelhos.

### 6. Instalar no celular e no computador

Abra o endereço e use **Instalar app** (Chrome e Android) ou **Compartilhar → Adicionar à Tela de Início** (Safari no iPhone). Instalado, ele abre como aplicativo e funciona sem internet.

## Segurança

- A chave publicável e a URL ficam visíveis no código, e isso é esperado: o que protege os dados é o **Row Level Security**. Cada linha da tabela pertence a um `user_id`, e as políticas só permitem ler e gravar quando ele é o usuário logado.
- A tabela só é liberada para usuários autenticados; visitantes anônimos não têm acesso a nada.
- No plano gratuito do Supabase, projetos sem uso por um período podem ser pausados. Se acontecer, reative pelo painel; os dados continuam lá e o app segue funcionando offline enquanto isso.

## Arquitetura da sincronização

O estado do app é dividido em fatias (configurações, habilidades, biblioteca, projetos, conceitos, flashcards, tarefas e sessões por ano), cada uma com um carimbo de tempo da última alteração. O navegador é a fonte imediata (o app abre e funciona sem rede) e a nuvem é sincronizada em segundo plano:

- o remoto mudou e o local não: o aparelho adota o remoto;
- aparelho novo, que nunca sincronizou: adota o remoto;
- os dois mudaram: sessões de estudo são mescladas por id (nenhuma se perde); nas demais fatias vence a alteração mais recente.

O mesmo módulo também funciona com o armazenamento do claude.ai, onde a primeira versão do app foi criada; só muda o *backend* de leitura e gravação.

## Desenvolvimento local

Não há etapa de build: basta servir a pasta, por exemplo com `python -m http.server 8000`, e abrir `http://localhost:8000`. O service worker funciona em `localhost` e em HTTPS.

## Licença

MIT. Veja [LICENSE](LICENSE).
