import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SUPABASE_URL, SUPABASE_ANON_KEY, isConfigured } from './config.js';

const supa = isConfigured() ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// ===== utilidades =====
const brl = (n) => Number(n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
const TIPOS = { apartamento: 'Apartamento', casa: 'Casa', terreno: 'Terreno', comercial: 'Comercial' };
const el = (id) => document.getElementById(id);
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const icnBed = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M3 17v-5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5M3 17h18M3 17v2M21 17v2M6 10V8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2"/></svg>';
const icnBath = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3zM6 12V6a2 2 0 0 1 2-2 2 2 0 0 1 2 2"/></svg>';
const icnCar = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M5 13l1.5-4.5A2 2 0 0 1 8.4 7h7.2a2 2 0 0 1 1.9 1.5L19 13m-14 0h14m-14 0v4m14-4v4M7 17h.01M17 17h.01"/></svg>';
const icnArea = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 4h16v16H4zM4 9h5M15 20v-5"/></svg>';

let todos = [];

// ===== render =====
function cardHTML(p) {
  const capa = (p.fotos && p.fotos[0]) || 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=600&q=80';
  const sufixo = p.finalidade === 'aluguel' ? '<small>/mês</small>' : '';
  const feats = [];
  if (p.quartos) feats.push(`<span>${icnBed}${p.quartos}</span>`);
  if (p.banheiros) feats.push(`<span>${icnBath}${p.banheiros}</span>`);
  if (p.vagas) feats.push(`<span>${icnCar}${p.vagas}</span>`);
  if (p.area) feats.push(`<span>${icnArea}${p.area} m²</span>`);
  return `<article class="card" data-id="${p.id}">
    <div class="card-media">
      <img src="${esc(capa)}" alt="${esc(p.titulo)}" loading="lazy" />
      <span class="card-tag tag-${p.finalidade}">${p.finalidade === 'venda' ? 'Venda' : 'Aluguel'}</span>
    </div>
    <div class="card-body">
      <div class="card-price">${brl(p.preco)}${sufixo}</div>
      <h3>${esc(p.titulo)}</h3>
      <div class="card-loc">${esc([p.bairro, p.cidade].filter(Boolean).join(', ') || TIPOS[p.tipo] || '')}</div>
      <div class="card-features">${feats.join('')}</div>
    </div>
  </article>`;
}

function render(list) {
  const grid = el('grid');
  el('resultsCount').textContent = list.length ? `${list.length} imóvel(is)` : '';
  grid.innerHTML = list.map(cardHTML).join('');
  el('stateMsg').innerHTML = list.length ? '' : '<div class="state">Nenhum imóvel encontrado com esses filtros.</div>';
  grid.querySelectorAll('.card').forEach((c) =>
    c.addEventListener('click', () => openDetail(c.dataset.id))
  );
}

function applyFilters() {
  const fin = el('fFinalidade').value;
  const tipo = el('fTipo').value;
  const cidade = el('fCidade').value.trim().toLowerCase();
  const preco = parseFloat(el('fPreco').value);
  const filtrados = todos.filter((p) => {
    if (fin && p.finalidade !== fin) return false;
    if (tipo && p.tipo !== tipo) return false;
    if (cidade && !String(p.cidade || '').toLowerCase().includes(cidade)) return false;
    if (!isNaN(preco) && Number(p.preco) > preco) return false;
    return true;
  });
  el('resultsTitle').textContent =
    fin === 'venda' ? 'Imóveis à venda' : fin === 'aluguel' ? 'Imóveis para alugar' : 'Todos os imóveis';
  render(filtrados);
}

// ===== detalhe (modal) =====
function openDetail(id) {
  const p = todos.find((x) => String(x.id) === String(id));
  if (!p) return;
  const fotos = (p.fotos && p.fotos.length ? p.fotos : ['https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1000&q=80']).slice(0, 6);
  const thumbs = fotos.length > 1
    ? `<div class="gallery-thumbs">${fotos.map((f, i) => `<button type="button" class="gthumb${i === 0 ? ' active' : ''}" data-src="${esc(f)}"><img src="${esc(f)}" alt="" loading="lazy" /></button>`).join('')}</div>`
    : '';
  const feats = [];
  if (p.quartos) feats.push(`<span>${icnBed}${p.quartos} quarto(s)</span>`);
  if (p.banheiros) feats.push(`<span>${icnBath}${p.banheiros} banheiro(s)</span>`);
  if (p.vagas) feats.push(`<span>${icnCar}${p.vagas} vaga(s)</span>`);
  if (p.area) feats.push(`<span>${icnArea}${p.area} m²</span>`);
  const wpp = `https://wa.me/5511900000000?text=${encodeURIComponent('Olá! Tenho interesse no imóvel: ' + p.titulo)}`;
  el('modalBody').innerHTML = `
    <div class="detail-gallery">
      <div class="gallery-main"><img id="galMain" src="${esc(fotos[0])}" alt="${esc(p.titulo)}" /></div>
      ${thumbs}
    </div>
    <div class="modal-content">
      <span class="card-tag tag-${p.finalidade}" style="position:static;display:inline-block;margin-bottom:.6rem">${p.finalidade === 'venda' ? 'Venda' : 'Aluguel'}</span>
      <div class="card-price">${brl(p.preco)}${p.finalidade === 'aluguel' ? '<small>/mês</small>' : ''}</div>
      <h2>${esc(p.titulo)}</h2>
      <div class="card-loc">${esc([p.bairro, p.cidade].filter(Boolean).join(', '))} · ${TIPOS[p.tipo] || ''}</div>
      <div class="modal-features">${feats.join('')}</div>
      <p class="modal-desc">${esc(p.descricao) || 'Sem descrição.'}</p>
      <a class="btn btn-gold" href="${wpp}" target="_blank" rel="noopener">Falar com o corretor no WhatsApp</a>
    </div>`;
  const main = document.getElementById('galMain');
  document.querySelectorAll('#modalBody .gthumb').forEach((btn) =>
    btn.addEventListener('click', () => {
      if (main) main.src = btn.dataset.src;
      document.querySelectorAll('#modalBody .gthumb').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
    })
  );
  el('detailModal').hidden = false;
  document.body.style.overflow = 'hidden';
}
function closeModal() { el('detailModal').hidden = true; document.body.style.overflow = ''; }
document.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', closeModal));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

// ===== carregar dados =====
async function load() {
  const msg = el('stateMsg');
  if (!supa) {
    msg.innerHTML = '<div class="state error">⚙️ Configure o Supabase em <b>config.js</b> (URL e anon key) para carregar os imóveis.</div>';
    return;
  }
  msg.innerHTML = '<div class="state"><div class="spinner"></div>Carregando imóveis…</div>';
  const { data, error } = await supa.from('properties').select('*').order('destaque', { ascending: false }).order('created_at', { ascending: false });
  if (error) {
    msg.innerHTML = `<div class="state error">Erro ao carregar: ${esc(error.message)}</div>`;
    return;
  }
  todos = data || [];
  applyFilters();
}

// ===== eventos =====
el('searchForm').addEventListener('submit', (e) => { e.preventDefault(); applyFilters(); });
['fFinalidade', 'fTipo'].forEach((id) => el(id).addEventListener('change', applyFilters));
document.querySelectorAll('.nav-links a[data-fin]').forEach((a) =>
  a.addEventListener('click', () => { el('fFinalidade').value = a.dataset.fin; applyFilters(); })
);

// menu mobile + ano
const toggle = document.querySelector('.nav-toggle');
const links = document.querySelector('.nav-links');
toggle?.addEventListener('click', () => { const o = links.classList.toggle('open'); toggle.setAttribute('aria-expanded', String(o)); });
links?.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => links.classList.remove('open')));
el('year').textContent = new Date().getFullYear();

load();
