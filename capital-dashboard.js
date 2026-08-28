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

    // 2. Fetch Opportunities
    const openReqs = db.getOpenRequests();
    
    // For demo, we just look at the first one
    const req = openReqs.length > 0 ? openReqs[0] : null;
    
    if (req && !myOffers.find(o => o.requestId === req.id)) {
        document.getElementById('no-opps').style.display = 'none';
        document.getElementById('opp-feed').style.display = 'block';
        document.getElementById('feed-req-id').textContent = req.id;
        document.getElementById('feed-supplier').textContent = req.supplierName || 'Alpha Precision Components Ltd';
        document.getElementById('feed-funding').textContent = fmt.format(req.fundingRequired);
        
        const currentBids = db.getOffersForRequest(req.id).length;
        document.getElementById('feed-bids-count').textContent = `${currentBids} / 3`;
        document.getElementById('kpi-opps').textContent = '1';
    } else if (myFinancings.length === 0) {
        document.getElementById('no-opps').style.display = 'block';
    }

    // 3. Navigation to Bid Page
    document.getElementById('btn-review')?.addEventListener('click', () => {
        window.location.href = 'bid.html?requestId=' + req.id;
    });

    // 4. Liquidity Shock Demo
    document.getElementById('btn-shock').addEventListener('click', () => {
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
