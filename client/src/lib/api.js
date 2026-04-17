import { supabase, hasSupabase } from './supabase';
import { studyTracks as localTracks, contentMap as localContentMap } from '../data/content';
import { quizzes as localQuizzes, quizCategories as localQuizCategories } from '../data/quizzes';

function toNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function sortByOrder(a, b) {
  return toNumber(a.sort_order) - toNumber(b.sort_order);
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function mapTrack(row, sections = []) {
  return {
    slug: row.slug,
    title: row.title,
    shortTitle: row.short_title || row.shortTitle || row.title,
    subtitle: row.subtitle || '',
    description: row.description || row.subtitle || '',
    image: row.image,
    accent: row.accent || 'emerald',
    intro: row.intro || '',
    summary: asArray(row.summary),
    highlights: asArray(row.highlights),
    sections: sections
      .slice()
      .sort(sortByOrder)
      .map((section) => ({
        title: section.title,
        text: section.content,
      })),
  };
}

function mapQuizCategory(track) {
  return {
    slug: track.slug,
    title: track.title,
    description: track.description || track.subtitle || '',
    color: track.accent || 'emerald',
  };
}

function localGuestRanking(category = '') {
  try {
    const raw = JSON.parse(localStorage.getItem('guestScores') || '[]');
    return raw
      .filter((item) => !category || item.category === category)
      .map((item) => ({
        username: 'Visitante',
        score: toNumber(item.score),
        quizzes: 1,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);
  } catch {
    return [];
  }
}

async function readTracksFromSupabase() {
  const { data: tracks, error } = await supabase
    .from('study_tracks')
    .select('*')
    .order('sort_order');

  if (error) throw error;

  const { data: sections } = await supabase
    .from('study_sections')
    .select('*')
    .order('sort_order');

  const grouped = new Map();
  for (const s of sections || []) {
    const list = grouped.get(s.track_slug) || [];
    list.push(s);
    grouped.set(s.track_slug, list);
  }

  return (tracks || []).map((t) => mapTrack(t, grouped.get(t.slug) || []));
}

async function readQuizFromSupabase(slug) {
  const { data: questions } = await supabase
    .from('quiz_questions')
    .select('*')
    .eq('track_slug', slug)
    .order('sort_order');

  const ids = questions?.map((q) => q.id) || [];

  const { data: options } = await supabase
    .from('quiz_options')
    .select('*')
    .in('question_id', ids);

  const map = new Map();
  for (const o of options || []) {
    const list = map.get(o.question_id) || [];
    list.push(o);
    map.set(o.question_id, list);
  }

  return {
    slug,
    questions: (questions || []).map((q) => {
      const opts = (map.get(q.id) || []).sort(sortByOrder);
      const answer = opts.findIndex((o) => o.is_correct);
      return {
        question: q.question,
        options: opts.map((o) => o.label),
        answer: answer >= 0 ? answer : 0,
        explanation: q.explanation,
      };
    }),
  };
}

export const api = {
  hasSupabase,

  async getTracks() {
    if (!supabase) return localTracks;
    try {
      return await readTracksFromSupabase();
    } catch {
      return localTracks;
    }
  },

  async getQuizCatalog() {
    const tracks = await this.getTracks();
    return tracks.map(mapQuizCategory);
  },

  async getTrackBySlug(slug) {
    const tracks = await this.getTracks();
    return tracks.find((t) => t.slug === slug) || null;
  },

  async getQuizBySlug(slug) {
    if (!supabase) return localQuizzes[slug];
    return await readQuizFromSupabase(slug);
  },

  // =========================
  // AUTH
  // =========================

  async signIn(email, password) {
    if (!supabase) throw new Error('Supabase não configurado.');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return true;
  },

  async signUp({ email, password, username }) {
    if (!supabase) throw new Error('Supabase não configurado.');

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
      },
    });

    if (signUpError) throw signUpError;

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) throw loginError;

    return true;
  },

  async signOut() {
    await supabase.auth.signOut();
  },

  async getCurrentProfile() {
    const { data } = await supabase.auth.getUser();
    const user = data?.user;

    if (!user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    return (
      profile || {
        id: user.id,
        username: user.user_metadata?.username || user.email,
        email: user.email,
      }
    );
  },

  // =========================
  // 🔥 CORREÇÃO PRINCIPAL
  // =========================

  async meScores() {
    if (!supabase) return [];

    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;

    const user = authData.user;
    if (!user) return [];

    const { data, error } = await supabase
      .from('quiz_attempts')
      .select('track_slug, score, total_questions, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(12);

    if (error) throw error;

    return (data || []).map((item) => ({
      category: item.track_slug,
      score: item.score,
      total_questions: item.total_questions,
      created_at: item.created_at,
    }));
  },

  async saveScore(payload) {
    const { data } = await supabase.auth.getUser();
    const user = data?.user;

    if (!user) throw new Error('Você precisa estar logado.');

    const { error } = await supabase.from('quiz_attempts').insert({
      user_id: user.id,
      track_slug: payload.category,
      score: payload.score,
      total_questions: payload.totalQuestions,
    });

    if (error) throw error;
  },

  async ranking(category = '') {
    if (!supabase) return localGuestRanking(category);

    const { data } = await supabase.rpc('get_ranking', {
      p_category: category || null,
    });

    return data || [];
  },
};