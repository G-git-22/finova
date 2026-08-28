document.addEventListener('DOMContentLoaded', () => {
    
    // Parallax
    const parallaxContainer = document.getElementById('parallax-container');
    if (parallaxContainer) {
        for (let i = 0; i < 30; i++) {
            const node = document.createElement('div');
            node.classList.add('node');
            const size = Math.random() * 4 + 2;
            node.style.width = `${size}px`;
            node.style.height = `${size}px`;
            node.style.left = `${Math.random() * 100}vw`;
            node.style.top = `${Math.random() * 150}vh`;
            const speed = Math.random() * 0.5 + 0.1;
            parallaxContainer.appendChild(node);
            window.addEventListener('scroll', () => {
                node.style.transform = `translateY(-${window.scrollY * speed}px)`;
            });
        }
    }

    const fmt = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

    const reqId = 'REQ-001';
    let selectedOffer = null;

    function renderMarketplace() {
        const req = db.getRequest(reqId);
        if (!req) return; // Wait for request

        const offers = db.getOffersForRequest(reqId);
        
        if (offers.length > 0) {
            document.getElementById('market-status').textContent = `${offers.length} OFFER(S) RECEIVED`;
            document.getElementById('market-status').style.color = '#57C1FF';
        }

        if (req.status === 'MATCHED' || req.status === 'FUNDED') {
            document.getElementById('market-status').textContent = `✓ ${req.status}`;
            document.getElementById('market-status').style.color = '#10b981';
            
            // If already funded, don't show the matching logic, just the funded state
            document.getElementById('no-offers-msg').style.display = 'none';
            document.getElementById('offers-container').classList.add('hidden');
            
            if(!document.getElementById('funded-alert')) {
                const alert = document.createElement('div');
                alert.id = 'funded-alert';
                alert.style.cssText = "background: rgba(16,185,129,0.05); border: 1px solid #10b981; padding: 2.5rem; border-radius: 16px; margin-top: 2rem;";
                alert.innerHTML = `
                    <h2 style="text-align:center; margin-bottom: 2rem; color: #10b981; letter-spacing:1px;">FINANCING SMART CONTRACT EXECUTED</h2>
                    <div style="display:flex; justify-content:space-between; text-align:center; font-size:0.8rem; color:var(--text-secondary); font-family:'JetBrains Mono', monospace;">
                        <div><div style="color:#10b981; font-size:1.5rem; margin-bottom:8px;">✓</div>REQUEST<br>CREATED</div>
                        <div style="flex:1; border-bottom: 2px dashed rgba(16,185,129,0.3); margin: 20px 10px;"></div>
                        <div><div style="color:#10b981; font-size:1.5rem; margin-bottom:8px;">✓</div>INVOICE<br>VERIFIED</div>
                        <div style="flex:1; border-bottom: 2px dashed rgba(16,185,129,0.3); margin: 20px 10px;"></div>
                        <div><div style="color:#10b981; font-size:1.5rem; margin-bottom:8px;">✓</div>MARKET<br>OPENED</div>
                        <div style="flex:1; border-bottom: 2px dashed rgba(16,185,129,0.3); margin: 20px 10px;"></div>
                        <div><div style="color:#10b981; font-size:1.5rem; margin-bottom:8px;">✓</div>BIDS<br>RECEIVED</div>
                        <div style="flex:1; border-bottom: 2px dashed rgba(16,185,129,0.3); margin: 20px 10px;"></div>
                        <div><div style="color:#10b981; font-size:1.5rem; margin-bottom:8px;">✓</div>BEST MATCH<br>SELECTED</div>
                        <div style="flex:1; border-bottom: 2px dashed rgba(16,185,129,0.3); margin: 20px 10px;"></div>
                        <div><div style="color:#10b981; font-size:1.5rem; margin-bottom:8px;">✓</div>FINANCING<br>CONFIRMED</div>
                        <div style="flex:1; border-bottom: 2px dashed rgba(16,185,129,0.3); margin: 20px 10px;"></div>
                        <div><div style="color:#10b981; font-size:1.5rem; margin-bottom:8px; text-shadow: 0 0 10px rgba(16,185,129,0.5);">✓</div><strong style="color:#fff;">FUNDED</strong></div>
                    </div>
                `;
                document.querySelector('.market-wrapper').appendChild(alert);
            }
            return;
        }

        // We want to show the full market actively as offers arrive
        if (offers.length > 0) {
            document.getElementById('no-offers-msg').style.display = 'none';
            document.getElementById('offers-container').classList.remove('hidden');

            const state = db.get();
            
            // Sort by score
            offers.sort((a, b) => b.score - a.score);
            const bestOffer = offers[0];

            document.getElementById('rec-provider').textContent = state.users[bestOffer.providerId].name;
            
            // Generate dynamic reasoning for the best offer
            const reasoning = [];
            if (bestOffer.advance >= 90) reasoning.push('✓ Meets the required 90%+ advance');
            if (bestOffer.tenor <= 45) reasoning.push('✓ Meets urgency requirements');
            if (bestOffer.score >= 80) reasoning.push('✓ Strong risk compatibility');
            if (reasoning.length === 0) reasoning.push('✓ Best available offer in the current market');
            
            document.getElementById('rec-reasoning').innerHTML = reasoning.map(r => `<li>${r}</li>`).join('');

            // Generate dynamic explanation based on comparison
            let explanation = '';
            if (offers.length > 1) {
                const worstOffer = offers[offers.length - 1];
                const worstName = state.users[worstOffer.providerId].name;
                
                if (worstOffer.advance < 90) {
                    explanation = `${worstName} offers a competitive rate, but only provides ${worstOffer.advance}% advance and therefore does not satisfy your 90% financing requirement.`;
                } else if (worstOffer.rate > bestOffer.rate) {
                    explanation = `${worstName} offers a higher rate of ${worstOffer.rate}%, making it less competitive compared to the recommended offer.`;
                } else {
                    explanation = `The recommended offer has the best overall balance of rate and advance requirements.`;
                }
            } else {
                explanation = `This is currently the best available offer. We recommend waiting for more bids or accepting if it meets your requirements.`;
            }
            document.getElementById('rec-explanation').textContent = explanation;
            
            const grid = document.getElementById('offers-grid');
            grid.innerHTML = ''; // Clear

            offers.forEach((offer, idx) => {
                const provider = state.users[offer.providerId];
                const isBest = offer.id === bestOffer.id;
                
                const card = document.createElement('div');
                card.className = `offer-card ${isBest ? 'recommended' : ''}`;
                
                card.innerHTML = `
                    <div class="provider-name">${provider.name}</div>
                    <div class="provider-type">${provider.type}</div>
                    
                    <div class="offer-metrics">
                        <div class="metric-row"><span>Advance:</span> <strong>${offer.advance}%</strong></div>
                        <div class="metric-row"><span>Rate:</span> <strong>${offer.rate}%</strong></div>
                        <div class="metric-row"><span>Tenor:</span> <strong>${offer.tenor} days</strong></div>
                        <div class="metric-row"><span>Fee:</span> <strong>${fmt.format(offer.fee)}</strong></div>
                    </div>
                    
                    <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.5rem; display: flex; justify-content: space-between;">
                        <span>MATCH SCORE</span>
                        <strong>${offer.score} / 100</strong>
                    </div>
                    <div class="score-bar" style="margin-top: 0; margin-bottom: 2rem;">
                        <div class="score-fill" style="width: ${offer.score}%;"></div>
                    </div>
                    
                    <button class="accept-btn" data-offer-id="${offer.id}">ACCEPT OFFER</button>
                `;
                
                grid.appendChild(card);
            });

            // Bind accept buttons
            document.querySelectorAll('.accept-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const oId = e.target.getAttribute('data-offer-id');
                    selectedOffer = offers.find(o => o.id === oId);
                    
                    const provider = state.users[selectedOffer.providerId];
                    document.getElementById('mod-provider').textContent = provider.name;
                    document.getElementById('mod-advance').textContent = selectedOffer.advance + '%';
                    document.getElementById('mod-rate').textContent = selectedOffer.rate + '%';
                    document.getElementById('mod-tenor').textContent = selectedOffer.tenor + ' days';
                    
                    document.getElementById('confirm-modal').classList.add('active');
                });
            });
        }
    }

    // Modal actions
    document.getElementById('btn-cancel-modal').addEventListener('click', () => {
        document.getElementById('confirm-modal').classList.remove('active');
        selectedOffer = null;
    });

    document.getElementById('btn-confirm-finance').addEventListener('click', () => {
        if (!selectedOffer) return;
        const btn = document.getElementById('btn-confirm-finance');
        btn.textContent = 'EXECUTING...';
        
        setTimeout(() => {
            db.acceptOffer(reqId, selectedOffer.id);
            document.getElementById('confirm-modal').classList.remove('active');
            renderMarketplace(); // Re-render to show funded state
        }, 1500);
    });

    // Poll for changes
    setInterval(renderMarketplace, 1000);
    renderMarketplace(); // initial call
});
