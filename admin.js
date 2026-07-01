import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SUPABASE_URL, SUPABASE_ANON_KEY, BUCKET, isConfigured } from './config.js';

const el = (id) => document.getElementById(id);
const brl = (n) => Number(n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const TIPOS = { apartamento: 'Apartamento', casa: 'Casa', terreno: 'Terreno', comercial: 'Comercial' };
const MAX_FOTOS = 6;

function toast(msg, err = false) {
  const t = el('toast');
  t.textContent = msg; t.classList.toggle('err', err); t.hidden = false;
  clearTimeout(t._t); t._t = setTimeout(() => (t.hidden = true), 3200);
}

if (!isConfigured()) {
  document.body.innerHTML = '<div style="max-width:520px;margin:12vh auto;padding:2rem;text-align:center;font-family:Inter,sans-serif;color:#12263a">' +
    '<h1 style="font-family:Sora,sans-serif">Configuração pendente</h1>' +
    '<p style="color:#5f7183">Preencha <b>SUPABASE_URL</b> e <b>SUPABASE_ANON_KEY</b> no arquivo <code>config.js</code>.</p>' +
    '<a href="index.html" style="color:#1f4e79">← Voltar ao site</a></div>';
  throw new Error('Supabase não configurado');
}

const supa = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// estado do formulário
let existingPhotos = [];
let newFiles = [];

// ===== guarda de sessão (redireciona se não logado) =====
(async () => {
  const { data: { session } } = await supa.auth.getSession();
  if (!session) { location.replace('login.html'); return; }
  el('whoami').textContent = session.user.email;
  el('panelView').hidden = false;
  loadList();
})();
supa.auth.onAuthStateChange((_e, s) => { if (!s) location.replace('login.html'); });
el('logoutBtn').addEventListener('click', () => supa.auth.signOut());

// ===== listagem + estatísticas =====
async function loadList() {
  const box = el('adminList');
  box.innerHTML = '<div class="state"><div class="spinner"></div>Carregando…</div>';
  const { data, error } = await supa.from('properties').select('*').order('created_at', { ascending: false });
  if (error) { box.innerHTML = `<div class="admin-empty">Erro: ${esc(error.message)}</div>`; return; }

  el('stTotal').textContent = data.length;
  el('stVenda').textContent = data.filter((p) => p.finalidade === 'venda').length;
  el('stAluguel').textContent = data.filter((p) => p.finalidade === 'aluguel').length;
  el('stDestaque').textContent = data.filter((p) => p.destaque).length;
  el('adminCount').textContent = `${data.length} imóvel(is) cadastrado(s)`;

  if (!data.length) { box.innerHTML = '<div class="admin-empty">Nenhum imóvel ainda. Clique em <b>+ Novo imóvel</b> para começar.</div>'; return; }
  box.innerHTML = data.map(rowHTML).join('');
  box.querySelectorAll('[data-edit]').forEach((b) => b.addEventListener('click', () => openForm(data.find((p) => String(p.id) === b.dataset.edit))));
  box.querySelectorAll('[data-del]').forEach((b) => b.addEventListener('click', () => remove(data.find((p) => String(p.id) === b.dataset.del))));
}
function rowHTML(p) {
  const capa = (p.fotos && p.fotos[0]) || 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=300&q=70';
  const cor = p.finalidade === 'venda' ? 'var(--venda)' : 'var(--aluguel)';
  return `<div class="row">
    <img class="row-thumb" src="${esc(capa)}" alt="" />
    <div class="row-info">
      <h3>${esc(p.titulo)} ${p.destaque ? '⭐' : ''}</h3>
      <div class="row-meta">
        <span class="row-badge" style="background:${cor}">${p.finalidade === 'venda' ? 'Venda' : 'Aluguel'}</span>
        <span class="row-price">${brl(p.preco)}</span>
        <span>${TIPOS[p.tipo] || p.tipo}</span>
        <span>${esc([p.bairro, p.cidade].filter(Boolean).join(', '))}</span>
      </div>
    </div>
    <div class="row-actions">
      <button class="icon-btn" data-edit="${p.id}" title="Editar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg></button>
      <button class="icon-btn danger" data-del="${p.id}" title="Excluir"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg></button>
    </div>
  </div>`;
}

// ===== formulário =====
function openForm(p) {
  el('propForm').reset();
  existingPhotos = []; newFiles = [];
  el('formError').textContent = '';
  if (p) {
    el('formTitle').textContent = 'Editar imóvel';
    el('pid').value = p.id;
    el('pTitulo').value = p.titulo || '';
    el('pFinalidade').value = p.finalidade || 'venda';
    el('pTipo').value = p.tipo || 'apartamento';
    el('pPreco').value = p.preco ?? '';
    el('pArea').value = p.area ?? '';
    el('pCidade').value = p.cidade || '';
    el('pBairro').value = p.bairro || '';
    el('pQuartos').value = p.quartos ?? 0;
    el('pBanheiros').value = p.banheiros ?? 0;
    el('pVagas').value = p.vagas ?? 0;
    el('pDestaque').checked = !!p.destaque;
    el('pDescricao').value = p.descricao || '';
    existingPhotos = [...(p.fotos || [])];
  } else {
    el('formTitle').textContent = 'Novo imóvel';
    el('pid').value = '';
  }
  renderThumbs();
  el('formModal').hidden = false;
  document.body.style.overflow = 'hidden';
}
function closeForm() { el('formModal').hidden = true; document.body.style.overflow = ''; }
document.querySelectorAll('[data-close-form]').forEach((b) => b.addEventListener('click', closeForm));
el('newBtn').addEventListener('click', () => openForm(null));

el('pFotos').addEventListener('change', (e) => {
  const restantes = MAX_FOTOS - (existingPhotos.length + newFiles.length);
  const arquivos = Array.from(e.target.files);
  if (restantes <= 0) {
    toast(`Limite de ${MAX_FOTOS} fotos por imóvel atingido.`, true);
  } else {
    if (arquivos.length > restantes) toast(`Máximo de ${MAX_FOTOS} fotos — adicionadas apenas ${restantes}.`, true);
    newFiles.push(...arquivos.slice(0, restantes));
  }
  e.target.value = '';
  renderThumbs();
});
function renderThumbs() {
  const box = el('thumbs');
  const ex = existingPhotos.map((url, i) => `<div class="thumb" data-ex="${i}"><img src="${esc(url)}" alt="" /></div>`);
  const nv = newFiles.map((f, i) => `<div class="thumb new" data-nv="${i}"><img src="${URL.createObjectURL(f)}" alt="" /></div>`);
  box.innerHTML = ex.concat(nv).join('');
  box.querySelectorAll('[data-ex]').forEach((t) => t.addEventListener('click', () => { existingPhotos.splice(+t.dataset.ex, 1); renderThumbs(); }));
  box.querySelectorAll('[data-nv]').forEach((t) => t.addEventListener('click', () => { newFiles.splice(+t.dataset.nv, 1); renderThumbs(); }));
  el('pFotos').disabled = (existingPhotos.length + newFiles.length) >= MAX_FOTOS;
}

async function uploadNew() {
  const urls = [];
  for (const file of newFiles) {
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supa.storage.from(BUCKET).upload(path, file, { cacheControl: '3600', upsert: false });
    if (error) throw error;
    const { data } = supa.storage.from(BUCKET).getPublicUrl(path);
    urls.push(data.publicUrl);
  }
  return urls;
}

el('propForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  el('formError').textContent = '';
  el('saveBtn').disabled = true; el('saveBtn').textContent = 'Salvando…';
  try {
    const novasUrls = await uploadNew();
    const fotos = [...existingPhotos, ...novasUrls];
    const payload = {
      titulo: el('pTitulo').value.trim(),
      finalidade: el('pFinalidade').value,
      tipo: el('pTipo').value,
      preco: parseFloat(el('pPreco').value) || 0,
      area: el('pArea').value ? parseFloat(el('pArea').value) : null,
      cidade: el('pCidade').value.trim() || null,
      bairro: el('pBairro').value.trim() || null,
      quartos: parseInt(el('pQuartos').value) || 0,
      banheiros: parseInt(el('pBanheiros').value) || 0,
      vagas: parseInt(el('pVagas').value) || 0,
      destaque: el('pDestaque').checked,
      descricao: el('pDescricao').value.trim() || null,
      fotos,
    };
    const id = el('pid').value;
    const res = id
      ? await supa.from('properties').update(payload).eq('id', id)
      : await supa.from('properties').insert(payload);
    if (res.error) throw res.error;
    closeForm();
    toast(id ? 'Imóvel atualizado!' : 'Imóvel cadastrado!');
    loadList();
  } catch (err) {
    el('formError').textContent = 'Erro ao salvar: ' + (err.message || err);
  } finally {
    el('saveBtn').disabled = false; el('saveBtn').textContent = 'Salvar imóvel';
  }
});

// ===== excluir =====
async function remove(p) {
  if (!confirm(`Excluir o imóvel "${p.titulo}"? Essa ação não pode ser desfeita.`)) return;
  try {
    const marker = `/storage/v1/object/public/${BUCKET}/`;
    const paths = (p.fotos || []).filter((u) => u.includes(marker)).map((u) => decodeURIComponent(u.split(marker)[1]));
    if (paths.length) await supa.storage.from(BUCKET).remove(paths);
  } catch (_) { /* ignora */ }
  const { error } = await supa.from('properties').delete().eq('id', p.id);
  if (error) { toast('Erro ao excluir: ' + error.message, true); return; }
  toast('Imóvel excluído.');
  loadList();
}

document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeForm(); });
