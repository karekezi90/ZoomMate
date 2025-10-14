const LS_KEY = 'zoommate_auth'


function readStore() {
    try { 
        return JSON.parse(localStorage.getItem(LS_KEY)) || { users: {}, session: null } 
    }
    catch { 
        return { users: {}, session: null } 
    }
}

function writeStore(data) { 
    localStorage.setItem(LS_KEY, JSON.stringify(data)) 
}

export async function signup(email, password) {
    const store = readStore()
    
    if (store.users[email]) throw new Error('An account with this email already exists.')
    
        // Simulate sending a 6-digit code
    const code = String(Math.floor(100000 + Math.random() * 900000))
    store.users[email] = { password, verified: false, code }
    writeStore(store)
    
    return { code } // In real life, code is emailed here we return it for dev UX.
}


export async function verify(email, code) {
    const store = readStore()
    const user = store.users[email]
    
    if (!user) throw new Error('Account not found.')
    if (user.verified) return { ok: true }
    if (user.code !== String(code)) throw new Error('Invalid verification code.')
    
        user.verified = true
    user.code = null
    writeStore(store)

    return { ok: true }
}


export async function login(email, password) {
    const store = readStore()
    const user = store.users[email]
    
    if (!user) throw new Error('Invalid credentials.')
    if (!user.verified) throw new Error('Please verify your email before logging in.')
    if (user.password !== password) throw new Error('Invalid credentials.')
    
    store.session = { email }
    writeStore(store)
    
    return { email }
}


export async function loginWithProvider(provider) {
    // Mock OAuth: immediately "logs in" with a faux provider identity
    const store = readStore()
    const email = `${provider}_user@example.com`
    if (!store.users[email]) {
        store.users[email] = { password: null, verified: true, code: null }
    }
    store.session = { email, provider }
    writeStore(store)
    
    return { email, provider }
}


export function logout() {
    const store = readStore()
    store.session = null
    writeStore(store)
}


export function getSession() {
    return readStore().session
}


// === Profile helpers ===


export function getUserProfile() {
  const store = readStore();
  const email = store.session?.email;
  if (!email) return null;
  const user = store.users[email] || {};
  const p = user.profile || {};
  return {
    email,
    firstName: p.firstName || '',
    lastName: p.lastName || '',
    displayName: p.displayName || (email?.split('@')[0] || 'User'),
    jobTitle: p.jobTitle || '',
    company: p.company || '',
    industry: p.industry || '',
    yearsExperience: p.yearsExperience ?? '',
    country: p.country || 'PH',
    language: p.language || 'en',
    timezone: p.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    bio: p.bio || '',
    hobbies: p.hobbies || [],
    sports: p.sports || [],
    interests: p.interests || [],
    preferredMeetingTimes: p.preferredMeetingTimes || 'business-hours',
    gender: p.gender || 'unspecified',
    pronouns: p.pronouns || '',
    maritalStatus: p.maritalStatus || 'unspecified',
    website: p.website || '',
    linkedin: p.linkedin || '',
    twitter: p.twitter || '',
    avatarUrl: p.avatarUrl || '',
    providers: p.providers || (user.provider ? [user.provider] : []),
  };
}

export function updateUserProfile(patch) {
  const store = readStore();
  const email = store.session?.email;
  if (!email) throw new Error('Not signed in');
  const user = store.users[email] || (store.users[email] = {});
  user.profile = { ...(user.profile || {}), ...patch };
  writeStore(store);
  return user.profile;
}

// === Connections (very simple mock) ===
export function getConnections() {
  const store = readStore();
  const email = store.session?.email;
  if (!email) return [];
  const user = store.users[email] || (store.users[email] = {});
  if (!user.connections) {
    user.connections = [
      { id: 'c1', name: 'Alex Reyes', title: 'Product Manager', company: 'Orbit Co', status: 'connected', avatar: '' },
      { id: 'c2', name: 'Mina Santos', title: 'Design Lead', company: 'Bright Studio', status: 'invited', avatar: '' },
    ];
    writeStore(store);
  }
  return user.connections;
}

export function addConnection(conn) {
  const store = readStore();
  const email = store.session?.email;
  if (!email) throw new Error('Not signed in');
  const user = store.users[email] || (store.users[email] = {});
  user.connections = user.connections || [];
  user.connections.push({ id: crypto.randomUUID?.() || String(Date.now()), ...conn });
  writeStore(store);
  return user.connections;
}

export function removeConnection(id) {
  const store = readStore();
  const email = store.session?.email;
  if (!email) throw new Error('Not signed in');
  const user = store.users[email] || (store.users[email] = {});
  user.connections = (user.connections || []).filter(c => c.id !== id);
  writeStore(store);
  return user.connections;
}
