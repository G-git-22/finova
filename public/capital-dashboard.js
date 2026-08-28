document.addEventListener('DOMContentLoaded', () => {

    // 1. Auth & Context Setup
    const currentUser = db.getCurrentUser();
    if (!currentUser || currentUser.role !== 'capital') {
        window.location.href = 'capital-login.html';
        return;
    }

    const state = db.get();
    const profile = state.capitalProfiles[currentUser.id];
    
    // UI Elements
    const fmt = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
    
    document.getElementById('nav-initials').textContent = currentUser.name.split(' ').map(n=>n[0]).join('').substring(0,2);
    document.getElementById('nav-name').textContent = currentUser.name;
    document.getElementById('kpi-liquidity').textContent = fmt.format(currentUser.liquidity);
    
    // Count bids
    const myOffers = Object.values(state.offers).filter(o => o.providerId === currentUser.id);
    document.getElementById('kpi-bids').textContent = myOffers.length;

    // Active Financings
    const myFinancings = Object.values(state.financings).filter(f => f.providerId === currentUser.id);
    
    // Check if we have an active financing
    if (myFinancings.length > 0) {
        document.getElementById('funded-view').classList.remove('hidden');
        document.getElementById('funded-req-id').textContent = myFinancings[0].requestId;
        document.getElementById('funded-amount').textContent = fmt.format(myFinancings[0].amount);
        document.getElementById('no-opps').style.display = 'none';
        // Keep feed hidden if we just want to show the funded state (simplification for demo)
    }

    // 2. Fetch Opportunities from Fastify API
    async function loadOpportunities() {
        let req = null;
        try {
            const res = await fetch('/api/invoices');
            if (res.ok) {
                const data = await res.json();
                if (data.invoices && data.invoices.length > 0) {
                    req = data.invoices[0];
                }
            }
        } catch (e) {
            console.warn('Fastify API offline, checking local store:', e);
        }

        if (!req) {
            const openReqs = db.getOpenRequests();
            req = openReqs.length > 0 ? openReqs[0] : null;
        }
        
        if (req && !myOffers.find(o => o.requestId === req.id)) {
            document.getElementById('no-opps').style.display = 'none';
            document.getElementById('opp-feed').style.display = 'block';
            document.getElementById('feed-req-id').textContent = req.id;
            document.getElementById('feed-supplier').textContent = req.supplierName || 'Alpha Precision Components Ltd';
            document.getElementById('feed-funding').textContent = fmt.format(req.fundingRequired || req.amount || 765000);
            
            const currentBids = db.getOffersForRequest(req.id).length;
            document.getElementById('feed-bids-count').textContent = `${currentBids} / 3`;
            document.getElementById('kpi-opps').textContent = '1';

            const modalReqId = document.getElementById('modal-req-id');
            if (modalReqId) modalReqId.textContent = req.id;
        } else if (myFinancings.length === 0) {
            document.getElementById('no-opps').style.display = 'block';
        }

        // 3. Navigation to Full Bid Page
        document.getElementById('btn-review')?.addEventListener('click', () => {
            if (req) window.location.href = 'bid.html?requestId=' + req.id;
        });

        // 4. Quick Bid Broadcast Wiring
        const qbModal = document.getElementById('quick-bid-modal');
        document.getElementById('btn-quick-bid')?.addEventListener('click', () => {
            if (qbModal) qbModal.classList.add('active');
        });

        document.getElementById('btn-cancel-quick-bid')?.addEventListener('click', () => {
            if (qbModal) qbModal.classList.remove('active');
        });

        document.getElementById('quick-bid-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const advance = Number(document.getElementById('qb-advance').value);
            const apr = Number(document.getElementById('qb-apr').value);
            const speed = Number(document.getElementById('qb-speed').value);
            const btn = document.getElementById('btn-submit-quick-bid');
            btn.textContent = 'Broadcasting...';
            btn.disabled = true;

            const bidPayload = {
                invoiceId: req ? req.id : 'REQ-001',
                providerId: currentUser.id,
                providerName: currentUser.name,
                advance,
                apr,
                speed,
                rate: apr,
                tenor: speed,
                fee: 1500
            };

            try {
                const res = await fetch('/api/bids/submit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(bidPayload)
                });
                const data = await res.json();
                if (data.success) {
                    showToast(`⚡ Offer broadcasted successfully: ${advance}% Advance @ ${apr}% APR!`);
                }
            } catch (err) {
                showToast(`⚡ Bid saved locally: ${advance}% Advance @ ${apr}% APR!`);
            }

            const offerId = 'OFF-' + Math.random().toString(36).substr(2, 6).toUpperCase();
            db.submitOffer(offerId, {
                id: offerId,
                requestId: req ? req.id : 'REQ-001',
                providerId: currentUser.id,
                advance,
                rate: apr,
                tenor: speed,
                fee: 1500,
                score: 92,
                status: 'SUBMITTED',
                createdAt: Date.now()
            });

            if (qbModal) qbModal.classList.remove('active');
            setTimeout(() => {
                window.location.reload();
            }, 1200);
        });
    }

    loadOpportunities();

    function showToast(msg) {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = msg;
        container.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 50);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, 3500);
    }

    // 5. Liquidity Shock Demo
    document.getElementById('btn-shock')?.addEventListener('click', () => {
        alert('⚠ LIQUIDITY CHANGE DETECTED\n\nFINOVA has detected a change in capital availability.');
        currentUser.liquidity = 1000000;
        
        // Update DB
        const st = db.get();
        st.users[currentUser.id].liquidity = 1000000;
        db.set(st);
        
        document.getElementById('kpi-liquidity').textContent = fmt.format(1000000);
        document.getElementById('kpi-liquidity').style.color = '#ff5f56';
    });

});
