import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SUPABASE_URL, SUPABASE_ANON_KEY, isConfigured } from './config.js';

const el = (id) => document.getElementById(id);

if (!isConfigured()) {
  el('loginError').textContent = 'Configure o Supabase em config.js.';
  el('loginBtn').disabled = true;
} else {
  const supa = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // Já logado? vai direto pro painel
  supa.auth.getSession().then(({ data: { session } }) => {
    if (session) location.replace('admin.html');
  });

  el('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    el('loginError').textContent = '';
    el('loginBtn').disabled = true;
    el('loginBtn').textContent = 'Entrando…';
    const { error } = await supa.auth.signInWithPassword({
      email: el('email').value.trim(),
      password: el('senha').value,
    });
    if (error) {
      el('loginError').textContent = 'E-mail ou senha inválidos.';
      el('loginBtn').disabled = false;
      el('loginBtn').textContent = 'Entrar';
    } else {
      location.replace('admin.html');
    }
  });
}
