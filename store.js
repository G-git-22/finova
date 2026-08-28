const STORE_KEY = 'FINOVA_STATE';
const CURRENT_USER_KEY = 'FINOVA_CURRENT_USER';

const initialData = {
    users: {
        'supplier': { id: 'supplier', role: 'supplier', name: 'Alpha Precision Components Ltd', email: 'supplier@finova.demo' },
        'bank': { id: 'bank', role: 'capital', name: 'Bank Alpha', type: 'Commercial Bank', liquidity: 4000000, email: 'bank@finova.demo' },
        'nbfc': { id: 'nbfc', role: 'capital', name: 'NBFC Beta', type: 'NBFC', liquidity: 2500000, email: 'nbfc@finova.demo' },
        'fund': { id: 'fund', role: 'capital', name: 'Fund Gamma', type: 'Private Credit Fund', liquidity: 3000000, email: 'fund@finova.demo' }
    },
    capitalProfiles: {
        'bank': { riskAppetite: 'Low-Medium', maxFinancing: 1000000, preferredTenor: '30-60 days', preferredAdvance: '85-95%' },
        'nbfc': { riskAppetite: 'Medium', maxFinancing: 1200000, preferredTenor: '30-60 days', preferredAdvance: '90-95%' },
        'fund': { riskAppetite: 'Medium-High', maxFinancing: 1500000, preferredTenor: '45-90 days', preferredAdvance: '75-90%' }
    },
    financingRequests: {},
    offers: {},
    financings: {}
};

// Initialize DB if empty
if (!localStorage.getItem(STORE_KEY)) {
    localStorage.setItem(STORE_KEY, JSON.stringify(initialData));
}

const db = {
    get: () => JSON.parse(localStorage.getItem(STORE_KEY)),
    set: (data) => localStorage.setItem(STORE_KEY, JSON.stringify(data)),
    
    // Auth
    login: (userId) => localStorage.setItem(CURRENT_USER_KEY, userId),
    logout: () => localStorage.removeItem(CURRENT_USER_KEY),
    getCurrentUser: () => {
        const uid = localStorage.getItem(CURRENT_USER_KEY);
        if (!uid) return null;
        return db.get().users[uid];
    },
    
    // Requests
    createRequest: (reqId, requestData) => {
        const state = db.get();
        state.financingRequests[reqId] = {
            id: reqId,
            status: 'OPEN FOR BIDS',
            ...requestData
        };
        db.set(state);
    },
    getRequest: (reqId) => db.get().financingRequests[reqId],
    getOpenRequests: () => {
        const state = db.get();
        return Object.values(state.financingRequests).filter(r => r.status === 'OPEN FOR BIDS');
    },
    
    // Offers
    submitOffer: (offerId, offerData) => {
        const state = db.get();
        state.offers[offerId] = offerData;
        db.set(state);
    },
    getOffersForRequest: (reqId) => {
        const state = db.get();
        return Object.values(state.offers).filter(o => o.requestId === reqId);
    },
    
    // Financing
    acceptOffer: (reqId, offerId) => {
        const state = db.get();
        // Update request status
        state.financingRequests[reqId].status = 'MATCHED';
        
        // Create financing record
        const offer = state.offers[offerId];
        state.financings[reqId] = {
            requestId: reqId,
            offerId: offerId,
            providerId: offer.providerId,
            amount: state.financingRequests[reqId].fundingRequired,
            status: 'FUNDED'
        };
        
        // Deduct liquidity
        state.users[offer.providerId].liquidity -= state.financingRequests[reqId].fundingRequired;
        
        db.set(state);
    },
    
    // Reset
    resetDemo: () => {
        localStorage.removeItem(STORE_KEY);
        localStorage.removeItem(CURRENT_USER_KEY);
        localStorage.setItem(STORE_KEY, JSON.stringify(initialData));
        window.location.href = 'index.html';
    }
};

// Global Reset Button Injection
document.addEventListener('DOMContentLoaded', () => {
    const resetBtn = document.createElement('button');
    resetBtn.innerHTML = '↺ Reset Demo';
    resetBtn.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: rgba(255, 50, 50, 0.1);
        border: 1px solid rgba(255, 50, 50, 0.3);
        color: #ff5f56;
        padding: 8px 16px;
        border-radius: 20px;
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.8rem;
        cursor: pointer;
        z-index: 9999;
        backdrop-filter: blur(5px);
        transition: all 0.3s ease;
    `;
    resetBtn.onmouseover = () => resetBtn.style.background = 'rgba(255, 50, 50, 0.2)';
    resetBtn.onmouseout = () => resetBtn.style.background = 'rgba(255, 50, 50, 0.1)';
    // Remove old reset button logic if any
    const oldBtn = document.querySelector('button[style*="position: fixed"]');
    if (oldBtn) oldBtn.remove();

    // Inject Permanent Navigation into Dashboard Headers
    const header = document.querySelector('.dash-header');
    if (header) {
        const currentUser = db.getCurrentUser();
        if (currentUser) {
            const navGroup = document.createElement('div');
            navGroup.style.cssText = `
                margin-left: auto;
                display: flex;
                align-items: center;
                gap: 15px;
                font-size: 0.85rem;
            `;
            
            navGroup.innerHTML = `
                <a href="index.html" onclick="db.logout()" style="color:var(--text-secondary); text-decoration:none; padding:4px 8px; border:1px solid transparent; border-radius:6px;">[← Home]</a>
                
                <div style="position:relative; display:inline-block;">
                    <select id="demo-role-select" style="appearance:none; background:rgba(87, 193, 255, 0.1); color:var(--accent); border:1px solid rgba(87, 193, 255, 0.3); padding:4px 12px; border-radius:6px; cursor:pointer; font-family:inherit; font-weight:600;">
                        <option value="" disabled selected>[⇄ Switch Role]</option>
                        <option style="background:#121212; color:#fff;" value="supplier">Supplier</option>
                        <option style="background:#121212; color:#fff;" value="bank">Bank Alpha</option>
                        <option style="background:#121212; color:#fff;" value="nbfc">NBFC Beta</option>
                        <option style="background:#121212; color:#fff;" value="fund">Fund Gamma</option>
                    </select>
                </div>
                
                ${currentUser.role === 'supplier' ? `<a href="market.html" style="color:var(--accent); text-decoration:none; padding:4px 8px; font-weight:600;">[↗ Capital Market]</a>` : ''}

                <button id="nav-reset-btn" style="background:rgba(255, 50, 50, 0.1); color:#ff5f56; border:1px solid rgba(255, 50, 50, 0.3); padding:4px 12px; border-radius:6px; cursor:pointer; font-family:inherit; font-weight:600;">[↻ Reset Demo]</button>
            `;
            
            // Re-route the logout link that might be natively in the header
            const nativeLogout = header.querySelector('a[href="index.html"]');
            if (nativeLogout && nativeLogout.parentElement !== navGroup) {
                nativeLogout.remove();
            }

            header.appendChild(navGroup);
            
            document.getElementById('demo-role-select').addEventListener('change', (e) => {
                const newRole = e.target.value;
                if (!newRole) return;
                db.login(newRole);
                if (newRole === 'supplier') {
                    const req = db.getRequest('REQ-001');
                    window.location.href = req ? 'market.html' : 'dashboard.html';
                } else {
                    window.location.href = 'capital-dashboard.html';
                }
            });

            document.getElementById('nav-reset-btn').addEventListener('click', () => {
                if(confirm('Reset FINOVA demo?')) {
                    db.resetDemo();
                }
            });
        }
    }
});
