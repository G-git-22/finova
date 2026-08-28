document.addEventListener('DOMContentLoaded', () => {

    const currentUser = db.getCurrentUser();
    if (!currentUser || currentUser.role !== 'capital') {
        window.location.href = 'capital-login.html';
        return;
    }

    const state = db.get();
    const profile = state.capitalProfiles[currentUser.id];
    const fmt = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

    const urlParams = new URLSearchParams(window.location.search);
    const reqId = urlParams.get('requestId');
    
    if (!reqId) {
        window.location.href = 'capital-dashboard.html';
        return;
    }

    const req = db.getRequest(reqId);
    if (!req) {
        window.location.href = 'capital-dashboard.html';
        return;
    }

    document.getElementById('req-id-display').textContent = req.id;
    
    // Check if duplicate
    const myOffers = db.getOffersForRequest(reqId).filter(o => o.providerId === currentUser.id);
    if (myOffers.length > 0) {
        document.getElementById('bidding-panels').style.display = 'none';
        document.getElementById('already-bid-msg').classList.remove('hidden');
    }

    // Populate Provider Profile constraints
    document.getElementById('provider-constraints').innerHTML = `
        Available Liquidity: <strong style="color:#fff;">${fmt.format(currentUser.liquidity)}</strong><br>
        Risk Appetite: <strong style="color:#fff;">${profile.riskAppetite}</strong><br>
        Max Per Invoice: <strong style="color:#fff;">${fmt.format(profile.maxFinancing)}</strong><br>
        Preferred Tenor: <strong style="color:#fff;">${profile.preferredTenor}</strong>
    `;

    // Generate AI Suggestion based on user defaults per prompt requirements
    let suggestAdvance, suggestRate, suggestTenor, suggestFee;
    let reasoning = [];
    
    if (currentUser.id === 'bank') {
        suggestAdvance = 90; suggestRate = 9.2; suggestTenor = 45; suggestFee = 2000;
        reasoning = ['Verified buyer', 'Verified invoice', 'Supplier Trust Score 94', 'Sufficient provider liquidity', 'Risk profile compatible'];
    } else if (currentUser.id === 'nbfc') {
        suggestAdvance = 95; suggestRate = 9.5; suggestTenor = 30; suggestFee = 1500;
        reasoning = ['Verified buyer', 'Verified invoice', 'Supplier Trust Score 94', 'Sufficient provider liquidity', 'Risk profile compatible'];
    } else {
        suggestAdvance = 80; suggestRate = 8.8; suggestTenor = 60; suggestFee = 1000;
        reasoning = ['Verified buyer', 'Verified invoice', 'Supplier Trust Score 94', 'Sufficient provider liquidity', 'Risk profile compatible'];
    }

    document.getElementById('ai-suggested-offer').innerHTML = `
        Advance: <span style="color:#fff;">${suggestAdvance}%</span><br>
        Rate: <span style="color:#fff;">${suggestRate}%</span><br>
        Tenor: <span style="color:#fff;">${suggestTenor} days</span><br>
        Fee: <span style="color:#fff;">₹${suggestFee}</span>
    `;
    
    document.getElementById('ai-reasoning').innerHTML = reasoning.map(r => `<li>${r}</li>`).join('');

    // Pre-fill the form with default values
    document.getElementById('inp-advance').value = suggestAdvance;
    document.getElementById('inp-rate').value = suggestRate;
    document.getElementById('inp-tenor').value = suggestTenor;
    document.getElementById('inp-fee').value = suggestFee;

    // Use AI button explicitly overrides any user edits back to suggestion
    document.getElementById('btn-use-ai').onclick = () => {
        document.getElementById('inp-advance').value = suggestAdvance;
        document.getElementById('inp-rate').value = suggestRate;
        document.getElementById('inp-tenor').value = suggestTenor;
        document.getElementById('inp-fee').value = suggestFee;
    };

    // Submit Bid
    document.getElementById('bid-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const advance = parseFloat(document.getElementById('inp-advance').value);
        const rate = parseFloat(document.getElementById('inp-rate').value);
        const tenor = parseInt(document.getElementById('inp-tenor').value);
        const fee = parseFloat(document.getElementById('inp-fee').value);
        
        const btn = document.getElementById('btn-submit-bid');
        btn.innerHTML = 'Submitting...';
        btn.disabled = true;
        
        setTimeout(() => {
            const offerId = 'OFF-' + Math.random().toString(36).substr(2, 6).toUpperCase();
            
            // Calculate deterministic score
            let score = 0;
            if (advance >= 95) score += 30;
            else if (advance >= 90) score += 25;
            else score += 5; 
            
            if (rate <= 8.8) score += 20;
            else if (rate <= 9.2) score += 18;
            else score += 15;
            
            if (tenor <= 30) score += 20;
            else if (tenor <= 45) score += 18;
            else score += 15;
            
            score += 30; // base padding for liquidity and risk
            
            db.submitOffer(offerId, {
                id: offerId,
                requestId: req.id,
                providerId: currentUser.id,
                advance,
                rate,
                tenor,
                fee,
                score,
                status: "SUBMITTED",
                createdAt: Date.now()
            });
            
            document.getElementById('opp-detail').style.display = 'none';
            document.getElementById('bid-success').classList.remove('hidden');
            
        }, 1000);
    });
});
