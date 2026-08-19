// src/supabaseClient.js
// Client-side mock implementation of Supabase using browser localStorage.
// This completely replaces Supabase, preventing connections from pausing or shutting off.

export const safeStorage = {
    getItem: (key) => {
        try {
            return localStorage.getItem(key);
        } catch {
            return window._lunaMemoryStorage?.[key] ?? null;
        }
    },
    setItem: (key, value) => {
        try {
            localStorage.setItem(key, value);
        } catch {
            window._lunaMemoryStorage = window._lunaMemoryStorage || {};
            window._lunaMemoryStorage[key] = String(value);
        }
    },
    removeItem: (key) => {
        try {
            localStorage.removeItem(key);
        } catch {
            if (window._lunaMemoryStorage) {
                delete window._lunaMemoryStorage[key];
            }
        }
    }
};

class MockQueryBuilder {
    constructor(table) {
        this.table = table;
        this.filters = [];
        this.orderByField = null;
        this.orderByAsc = true;
        this.limitVal = null;
    }

    select(fields) {
        return this;
    }

    eq(column, value) {
        this.filters.push({ column, value });
        return this;
    }

    order(column, { ascending = true } = {}) {
        this.orderByField = column;
        this.orderByAsc = ascending;
        return this;
    }

    limit(n) {
        this.limitVal = n;
        return this;
    }

    async single() {
        const result = await this.execute();
        if (result.error) return result;
        if (!result.data || result.data.length === 0) {
            return { data: null, error: { code: 'PGRST116', message: 'No rows found' } };
        }
        return { data: result.data[0], error: null };
    }

    async execute() {
        let data = [];
        try {
            if (this.table === 'users_profile') {
                const profilesStr = safeStorage.getItem('luna-profiles');
                const profiles = JSON.parse(profilesStr || '{}');
                data = Object.values(profiles);
            } else if (this.table === 'cycle_entries') {
                const entriesStr = safeStorage.getItem('luna-cycle-entries');
                data = JSON.parse(entriesStr || '[]');
            }

            // Apply filters
            for (const filter of this.filters) {
                data = data.filter(item => item[filter.column] === filter.value);
            }

            // Apply ordering
            if (this.orderByField) {
                data.sort((a, b) => {
                    const valA = a[this.orderByField];
                    const valB = b[this.orderByField];
                    if (valA < valB) return this.orderByAsc ? -1 : 1;
                    if (valA > valB) return this.orderByAsc ? 1 : -1;
                    return 0;
                });
            }

            // Apply limit
            if (this.limitVal !== null) {
                data = data.slice(0, this.limitVal);
            }

            return { data, error: null };
        } catch (err) {
            console.error(`MockQueryBuilder error in execute for table ${this.table}:`, err);
            return { data: [], error: { message: err.message } };
        }
    }

    // Support direct thenable resolution (like await supabase.from('...'))
    then(onfulfilled, onrejected) {
        return this.execute().then(onfulfilled, onrejected);
    }

    async insert(row) {
        try {
            if (this.table === 'cycle_entries') {
                const entriesStr = safeStorage.getItem('luna-cycle-entries');
                const entries = JSON.parse(entriesStr || '[]');
                // Check if an entry with this date already exists for this user to avoid duplicates
                const existingIndex = entries.findIndex(e => e.user_id === row.user_id && e.period_start_date === row.period_start_date);
                
                const newRow = {
                    id: 'ent_' + Math.random().toString(36).slice(2, 11),
                    ...row
                };

                if (existingIndex !== -1) {
                    entries[existingIndex] = { ...entries[existingIndex], ...row };
                    safeStorage.setItem('luna-cycle-entries', JSON.stringify(entries));
                    return { data: [entries[existingIndex]], error: null };
                } else {
                    entries.push(newRow);
                    safeStorage.setItem('luna-cycle-entries', JSON.stringify(entries));
                    return { data: [newRow], error: null };
                }
            }
            return { data: null, error: null };
        } catch (err) {
            return { data: null, error: { message: err.message } };
        }
    }

    async update(updates) {
        try {
            if (this.table === 'users_profile') {
                const profilesStr = safeStorage.getItem('luna-profiles');
                const profiles = JSON.parse(profilesStr || '{}');
                const idFilter = this.filters.find(f => f.column === 'id');
                if (idFilter) {
                    const userId = idFilter.value;
                    profiles[userId] = {
                        id: userId,
                        ...profiles[userId],
                        ...updates
                    };
                    safeStorage.setItem('luna-profiles', JSON.stringify(profiles));
                    return { data: [profiles[userId]], error: null };
                }
            } else if (this.table === 'cycle_entries') {
                const entriesStr = safeStorage.getItem('luna-cycle-entries');
                const entries = JSON.parse(entriesStr || '[]');
                const idFilter = this.filters.find(f => f.column === 'id');
                const dateFilter = this.filters.find(f => f.column === 'period_start_date');
                const userFilter = this.filters.find(f => f.column === 'user_id');

                const newEntries = entries.map(entry => {
                    let matches = true;
                    if (idFilter && entry.id !== idFilter.value) matches = false;
                    if (dateFilter && entry.period_start_date !== dateFilter.value) matches = false;
                    if (userFilter && entry.user_id !== userFilter.value) matches = false;

                    if (matches) {
                        return { ...entry, ...updates };
                    }
                    return entry;
                });

                safeStorage.setItem('luna-cycle-entries', JSON.stringify(newEntries));
                return { data: newEntries, error: null };
            }
            return { data: null, error: null };
        } catch (err) {
            return { data: null, error: { message: err.message } };
        }
    }

    async delete() {
        try {
            if (this.table === 'cycle_entries') {
                const entriesStr = safeStorage.getItem('luna-cycle-entries');
                const entries = JSON.parse(entriesStr || '[]');
                const idFilter = this.filters.find(f => f.column === 'id');
                const userFilter = this.filters.find(f => f.column === 'user_id');

                const newEntries = entries.filter(entry => {
                    let matches = true;
                    if (idFilter && entry.id !== idFilter.value) matches = false;
                    if (userFilter && entry.user_id !== userFilter.value) matches = false;
                    return !matches;
                });

                safeStorage.setItem('luna-cycle-entries', JSON.stringify(newEntries));
            }
            return { data: null, error: null };
        } catch (err) {
            return { error: { message: err.message } };
        }
    }
}

class MockAuth {
    constructor() {
        this.listeners = new Set();
    }

    async getSession() {
        try {
            const sessionStr = safeStorage.getItem('luna-session');
            const session = sessionStr ? JSON.parse(sessionStr) : null;
            return { data: { session }, error: null };
        } catch (err) {
            return { data: { session: null }, error: { message: err.message } };
        }
    }

    onAuthStateChange(callback) {
        this.listeners.add(callback);
        this.getSession()
            .then(({ data: { session } }) => {
                callback(session ? 'SIGNED_IN' : 'SIGNED_OUT', session);
            })
            .catch(err => {
                console.error('onAuthStateChange getSession error:', err);
                callback('SIGNED_OUT', null);
            });

        return {
            data: {
                subscription: {
                    unsubscribe: () => {
                        this.listeners.delete(callback);
                    }
                }
            }
        };
    }

    async signUp({ email, password }) {
        try {
            const usersStr = safeStorage.getItem('luna-users');
            const users = JSON.parse(usersStr || '[]');
            if (users.some(u => u.email === email)) {
                return { data: null, error: { message: 'User already exists.' } };
            }

            const newUser = {
                id: 'usr_' + Math.random().toString(36).slice(2, 11),
                email
            };

            users.push({ ...newUser, password });
            safeStorage.setItem('luna-users', JSON.stringify(users));

            // Initialize profile, mimicking DB trigger
            const profilesStr = safeStorage.getItem('luna-profiles');
            const profiles = JSON.parse(profilesStr || '{}');
            profiles[newUser.id] = {
                id: newUser.id,
                full_name: email.split('@')[0],
                phone: '',
                email: email
            };
            safeStorage.setItem('luna-profiles', JSON.stringify(profiles));

            const session = {
                user: newUser,
                access_token: 'mock-access-token-' + newUser.id
            };
            safeStorage.setItem('luna-session', JSON.stringify(session));

            // Notify listeners
            this.listeners.forEach(cb => {
                try { cb('SIGNED_IN', session); } catch (e) { console.error(e); }
            });

            return { data: { user: newUser, session }, error: null };
        } catch (err) {
            return { data: null, error: { message: err.message } };
        }
    }

    async signInWithPassword({ email, password }) {
        try {
            const usersStr = safeStorage.getItem('luna-users');
            const users = JSON.parse(usersStr || '[]');
            const userMatch = users.find(u => u.email === email && u.password === password);

            if (!userMatch) {
                return { data: null, error: { message: 'Invalid login credentials.' } };
            }

            const user = {
                id: userMatch.id,
                email: userMatch.email
            };

            const session = {
                user,
                access_token: 'mock-access-token-' + user.id
            };
            safeStorage.setItem('luna-session', JSON.stringify(session));

            // Ensure profile exists just in case
            const profilesStr = safeStorage.getItem('luna-profiles');
            const profiles = JSON.parse(profilesStr || '{}');
            if (!profiles[user.id]) {
                profiles[user.id] = {
                    id: user.id,
                    full_name: email.split('@')[0],
                    phone: '',
                    email: email
                };
                safeStorage.setItem('luna-profiles', JSON.stringify(profiles));
            }

            // Notify listeners
            this.listeners.forEach(cb => {
                try { cb('SIGNED_IN', session); } catch (e) { console.error(e); }
            });

            return { data: { user, session }, error: null };
        } catch (err) {
            return { data: null, error: { message: err.message } };
        }
    }

    async signOut() {
        try {
            safeStorage.removeItem('luna-session');
            this.listeners.forEach(cb => {
                try { cb('SIGNED_OUT', null); } catch (e) { console.error(e); }
            });
            return { error: null };
        } catch (err) {
            return { error: { message: err.message } };
        }
    }
}

// Instantiate and export the client mockup
export const supabase = {
    auth: new MockAuth(),
    from: (table) => new MockQueryBuilder(table)
};

// Netlify build doesn't need actual env configs now
export const isSupabaseConfigured = true;

export const testSupabaseConnection = async () => {
    console.log('Mock Supabase connection successfully initialized.');
};
