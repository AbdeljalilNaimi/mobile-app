import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

const APP_URL = 'https://id-preview--8d2e14ae-9780-495c-92ff-a09ea8668d86.lovable.app';

export function Popup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState<any>(null);
  const [bloodGroup, setBloodGroup] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchBloodGroup(session.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchBloodGroup(session.user.id);
    });

    // Also load cached blood group
    chrome.storage.local.get(['bloodGroup'], (result) => {
      if (result.bloodGroup) setBloodGroup(result.bloodGroup);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchBloodGroup(userId: string) {
    const { data } = await supabase
      .from('emergency_health_cards')
      .select('blood_group')
      .eq('user_id', userId)
      .maybeSingle();

    const bg = data?.blood_group || null;
    setBloodGroup(bg);
    chrome.storage.local.set({ bloodGroup: bg, userId });
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthError('');
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setAuthError(error.message);
    setLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
    setBloodGroup(null);
    chrome.storage.local.remove(['bloodGroup', 'userId']);
  }

  function openSearch() {
    const q = encodeURIComponent(searchQuery);
    chrome.tabs.create({ url: `${APP_URL}/recherche${q ? `?q=${q}` : ''}` });
  }

  function openTriage() {
    chrome.tabs.create({ url: `${APP_URL}/assistant-medical` });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[500px] w-[350px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // --- Login screen ---
  if (!user) {
    return (
      <div className="w-[350px] min-h-[500px] flex flex-col bg-white">
        <header className="bg-primary text-primary-foreground px-4 py-5 text-center">
          <h1 className="text-lg font-bold tracking-tight">🏥 CityHealth</h1>
          <p className="text-xs opacity-80 mt-1">Companion Extension</p>
        </header>

        <form onSubmit={handleLogin} className="flex-1 flex flex-col gap-3 p-5">
          <h2 className="text-sm font-semibold text-gray-700">Connexion</h2>

          {authError && (
            <p className="text-xs text-destructive bg-red-50 rounded p-2">{authError}</p>
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          />

          <button
            type="submit"
            className="bg-primary text-primary-foreground rounded-md py-2 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Se connecter
          </button>
        </form>
      </div>
    );
  }

  // --- Main screen ---
  return (
    <div className="w-[350px] min-h-[500px] flex flex-col bg-white">
      <header className="bg-primary text-primary-foreground px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold">🏥 CityHealth</h1>
          <p className="text-[11px] opacity-75 truncate max-w-[200px]">{user.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="text-[11px] bg-white/20 hover:bg-white/30 rounded px-2 py-1 transition-colors"
        >
          Déconnexion
        </button>
      </header>

      <div className="flex-1 flex flex-col gap-4 p-4">
        {/* Blood group badge */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-3">
          <span className="text-2xl">🩸</span>
          <div>
            <p className="text-[11px] text-muted-foreground">Groupe Sanguin</p>
            <p className="text-base font-bold text-red-600">
              {bloodGroup || '—'}
              <span className="text-[10px] font-normal text-muted-foreground ml-1">(Synchronisé)</span>
            </p>
          </div>
        </div>

        {/* Search */}
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">
            🔍 Trouver un professionnel
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Cardiologue, pharmacie…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && openSearch()}
              className="flex-1 border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <button
              onClick={openSearch}
              className="bg-primary text-primary-foreground rounded-md px-3 text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Go
            </button>
          </div>
        </div>

        {/* Triage button */}
        <button
          onClick={openTriage}
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg py-3 text-sm font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-md"
        >
          🤖 Assistant Triage IA
        </button>

        {/* Quick links */}
        <div className="grid grid-cols-2 gap-2 mt-auto">
          <button
            onClick={() => chrome.tabs.create({ url: `${APP_URL}/don-de-sang` })}
            className="bg-muted text-muted-foreground rounded-md py-2 text-xs font-medium hover:bg-gray-200 transition-colors"
          >
            🩸 Don de sang
          </button>
          <button
            onClick={() => chrome.tabs.create({ url: `${APP_URL}/urgences` })}
            className="bg-muted text-muted-foreground rounded-md py-2 text-xs font-medium hover:bg-gray-200 transition-colors"
          >
            🚨 Urgences
          </button>
        </div>
      </div>
    </div>
  );
}
