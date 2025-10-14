// LocalStorage-backed profile & connections helpers used by Profile.jsx
const LS_KEY = 'zoommate_auth'
function readStore() {
try { return JSON.parse(localStorage.getItem(LS_KEY)) || { users: {}, session: null }; }
catch { return { users: {}, session: null }; }
}
function writeStore(data) { localStorage.setItem(LS_KEY, JSON.stringify(data)); }


export function getUserProfile() {
const store = readStore();
const email = store.session?.email;
if (!email) return null;
const user = store.users[email] || {};
return { email, ...(user.profile || {}) };
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
const id = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now());
user.connections.push({ id, ...conn });
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