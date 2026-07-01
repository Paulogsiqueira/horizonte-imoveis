// ============================================================
//  CONFIGURAÇÃO DO SUPABASE
//  Substitua os dois valores abaixo pelos do seu projeto:
//  Supabase → Project Settings → API
//  (A "anon key" é pública e pode ficar aqui com segurança.)
// ============================================================
export const SUPABASE_URL = 'https://SEU-PROJETO.supabase.co';
export const SUPABASE_ANON_KEY = 'SUA-ANON-KEY';

// Nome do bucket de Storage onde ficam as fotos dos imóveis
export const BUCKET = 'imoveis';

export const isConfigured = () =>
  !SUPABASE_URL.includes('SEU-PROJETO') && !SUPABASE_ANON_KEY.includes('SUA-ANON-KEY');
