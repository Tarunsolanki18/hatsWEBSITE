// Core App utilities for Supabase and common helpers
(function () {
    const { SUPABASE_URL, SUPABASE_ANON_KEY, ADMIN_EMAILS, SECURITY_CODES, ADMIN_NOTIFY_WEBHOOK } = window.APP_CONFIG || {};
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
    const isAdmin = (user) => {
      if (!user || !user.email) return false;
      return (ADMIN_EMAILS || []).map(e => e.toLowerCase()).includes(user.email.toLowerCase());
    };
  
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      return data.session || null;
    };
  
    const requireAuth = async (options = {}) => {
      const { redirectTo = 'login.html' } = options;
      const session = await getSession();
      if (!session) window.location.href = redirectTo;
      return session;
    };
  
    const requireAdmin = async (options = {}) => {
      const session = await requireAuth(options);
      if (!session?.user || !isAdmin(session.user)) {
        window.location.href = 'login.html';
      }
      return session;
    };
  
    const signInWithEmail = async (email, password) => {
      if (password) {
        return await supabase.auth.signInWithPassword({ email, password });
      }
      return await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin + '/public/dashboard.html' } });
    };
  
    const signUpWithEmail = async (email, password, metadata = {}) => {
      return await supabase.auth.signUp({ email, password, options: { data: metadata } });
    };
  
  
    const approveSelfWithCode = async (userId, code) => {
      const trimmed = (code || '').trim();
      if (!trimmed) return { error: { message: 'Security code required' } };
      
      // Check if code exists in config.js SECURITY_CODES array
      if (window.APP_CONFIG.SECURITY_CODES.includes(trimmed)) {
        return { data: true };
      }
      
      // Fallback to database check if not found in config
      const { data, error } = await supabase.rpc('approve_with_code', { p_code: trimmed });
      if (error) return { error };
      if (!data) return { error: { message: 'Invalid or expired code' } };
      return { data };
    };
  
    const notifyAdminsOfPendingSignup = async (email) => {
      try {
        if (!ADMIN_NOTIFY_WEBHOOK) return;
        await fetch(ADMIN_NOTIFY_WEBHOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'pending_signup', email })
        });
      } catch (_) { /* ignore */ }
    };
  
    const signOut = async () => {
      return await supabase.auth.signOut();
    };
  
    const upsertProfile = async (userId, profile) => {
      return await supabase.from('profiles').upsert({ id: userId, ...profile });
    };
  
    const fetchEarnings = async (userId) => {
      return await supabase.from('earnings').select('*').eq('user_id', userId).single();
    };
  
    const fetchMyReports = async (userId) => {
      return await supabase
        .from('reports')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    };
  
    const createReport = async (payload) => {
      return await supabase.from('reports').insert(payload).select().single();
    };
  
    const uploadProof = async (userId, file) => {
      const fileName = `${userId}/${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage.from('proofs').upload(fileName, file, { upsert: false });
      if (error) return { error };
      const { data: publicUrl } = supabase.storage.from('proofs').getPublicUrl(data.path);
      return { data: { path: data.path, publicUrl: publicUrl?.publicUrl } };
    };
  
    const fetchCampaigns = async () => {
      return await supabase.from('campaigns').select('*').order('updated_at', { ascending: false });
    };
    
    // Added empty function to prevent errors after security code section removal
    const fetchSecurityCodes = async () => {
      return { data: [] };
    };
  
    window.App = {
      supabase,
      isAdmin,
      getSession,
      requireAuth,
      requireAdmin,
      signInWithEmail,
      signUpWithEmail,
      signOut,
      upsertProfile,
      fetchEarnings,
      fetchMyReports,
      createReport,
      uploadProof,
      fetchCampaigns,
      fetchSecurityCodes,
      approveSelfWithCode,
      notifyAdminsOfPendingSignup
    };
  })();
  