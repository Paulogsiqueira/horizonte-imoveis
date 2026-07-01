# 🏠 Horizonte Imóveis — Site + Painel Admin (Fullstack)

Projeto **fullstack de demonstração** para portfólio: um site de imobiliária com **painel administrativo** para cadastrar, editar e remover imóveis (com upload de fotos e login).

- **Front-end:** HTML + CSS + JavaScript puro (sem build) — hospedado no **GitHub Pages**
- **Back-end:** **Supabase** (PostgreSQL + API REST automática + Auth + Storage) — plano gratuito
- **Demo:** _(GitHub Pages)_ · **Painel:** `/admin.html`

## Como funciona
| Camada | Tecnologia |
|--------|-----------|
| Banco de dados | Postgres (Supabase) com Row Level Security |
| API | REST/JS gerada pelo Supabase (`@supabase/supabase-js`) |
| Autenticação | Supabase Auth (e-mail + senha) — só o corretor edita |
| Fotos | Supabase Storage (bucket público `imoveis`) |
| Site + Painel | GitHub Pages (estático) |

## Configuração (uma vez, ~5 min)
1. Crie uma conta grátis em **[supabase.com](https://supabase.com)** e um **New project**.
2. Em **SQL Editor → New query**, cole o conteúdo de [`SETUP.sql`](SETUP.sql) e clique **Run**. Isso cria a tabela, as políticas de segurança, o bucket de fotos e alguns imóveis de exemplo.
3. Em **Authentication → Users → Add user**, crie o login do corretor (e-mail + senha, marque *Auto Confirm User*).
4. Em **Project Settings → API**, copie a **Project URL** e a **anon public key** e cole em [`config.js`](config.js).

Pronto — o site lista os imóveis e o `/admin.html` permite gerenciar.

## Segurança
- A **anon key** é pública por design (pode ficar no front). Quem controla o acesso é o **RLS**: qualquer um *lê*, mas só usuários *autenticados* podem inserir/editar/excluir.
- O painel (`admin.html`) exige login via Supabase Auth.

## Estrutura
```
index.html   · site público (busca + listagem + detalhe)
admin.html   · painel do corretor (login + CRUD)
app.js       · lógica do site público
admin.js     · autenticação, CRUD e upload de fotos
config.js    · URL e anon key do Supabase  ← preencher
styles.css   · estilos do site
admin.css    · estilos do painel
SETUP.sql    · script do banco (rode no Supabase)
```

## Observação sobre o plano gratuito
Projetos gratuitos do Supabase entram em pausa após ~1 semana sem uso e reativam no primeiro acesso (pode haver alguns segundos de espera na primeira carga). Suficiente para um demonstrativo de portfólio.

---
Imagens via [Unsplash](https://unsplash.com). Nomes, valores e contatos são fictícios.
