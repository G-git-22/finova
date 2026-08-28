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

    function showToast(msg) {
        let toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toast-container';
            toastContainer.className = 'toast-container';
            document.body.appendChild(toastContainer);
        }
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = msg;
        toastContainer.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 50);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, 3500);
    }

    async function renderMarketplace() {
        const req = db.getRequest(reqId);
        if (!req) return; // Wait for request

        // Update summary values
        const sumReqId = document.getElementById('sum-req-id');
        const sumInvoiceVal = document.getElementById('sum-invoice-val');
        const sumFundingReqd = document.getElementById('sum-funding-reqd');
        if (sumReqId) sumReqId.textContent = req.id;
        if (sumInvoiceVal) sumInvoiceVal.textContent = fmt.format(req.invoiceAmount || 850000);
        if (sumFundingReqd) sumFundingReqd.textContent = fmt.format(req.fundingRequired || 765000);

        let offers = db.getOffersForRequest(reqId);

        // Try fetching from Fastify API
        try {
            const apiRes = await fetch(`/api/bids/${reqId}`);
            if (apiRes.ok) {
                const apiData = await apiRes.json();
                if (apiData.bids && apiData.bids.length > 0) {
                    // Merge API bids into offers map
                    apiData.bids.forEach(b => {
                        if (!offers.find(o => o.id === b.id)) {
                            offers.push(b);
                        }
                    });
                }
            }
        } catch (e) {
            console.warn('Backend API offline, utilizing store data:', e.message);
        }
        
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
            const simBtn = document.getElementById('btn-auto-simulate');
            if (simBtn) simBtn.style.display = 'none';
            
            if(!document.getElementById('funded-alert')) {
                const financing = db.get().financings[reqId] || {};
                const provider = db.get().users[financing.providerId] || { name: 'Institutional Provider' };
                const alert = document.createElement('div');
                alert.id = 'funded-alert';
                alert.style.cssText = "background: rgba(16,185,129,0.05); border: 1px solid #10b981; padding: 2.5rem; border-radius: 16px; margin-top: 2rem;";
                alert.innerHTML = `
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 2rem;">
                        <h2 style="color: #10b981; letter-spacing:1px; margin:0;">FINANCING SMART CONTRACT EXECUTED</h2>
                        <button id="btn-view-cert" style="background:#10b981; color:#000; border:none; padding:8px 16px; border-radius:6px; font-weight:700; cursor:pointer; font-size:0.85rem;">VIEW SETTLEMENT PROOF</button>
                    </div>
                    <div style="display:flex; justify-content:space-between; text-align:center; font-size:0.8rem; color:var(--text-secondary); font-family:'JetBrains Mono', monospace; overflow-x:auto; padding-bottom:10px;">
                        <div><div style="color:#10b981; font-size:1.5rem; margin-bottom:8px;">✓</div>REQUEST<br>CREATED</div>
                        <div style="flex:1; min-width:20px; border-bottom: 2px dashed rgba(16,185,129,0.3); margin: 20px 10px;"></div>
                        <div><div style="color:#10b981; font-size:1.5rem; margin-bottom:8px;">✓</div>INVOICE<br>VERIFIED</div>
                        <div style="flex:1; min-width:20px; border-bottom: 2px dashed rgba(16,185,129,0.3); margin: 20px 10px;"></div>
                        <div><div style="color:#10b981; font-size:1.5rem; margin-bottom:8px;">✓</div>MARKET<br>OPENED</div>
                        <div style="flex:1; min-width:20px; border-bottom: 2px dashed rgba(16,185,129,0.3); margin: 20px 10px;"></div>
                        <div><div style="color:#10b981; font-size:1.5rem; margin-bottom:8px;">✓</div>BIDS<br>RECEIVED</div>
                        <div style="flex:1; min-width:20px; border-bottom: 2px dashed rgba(16,185,129,0.3); margin: 20px 10px;"></div>
                        <div><div style="color:#10b981; font-size:1.5rem; margin-bottom:8px;">✓</div>BEST MATCH<br>SELECTED</div>
                        <div style="flex:1; min-width:20px; border-bottom: 2px dashed rgba(16,185,129,0.3); margin: 20px 10px;"></div>
                        <div><div style="color:#10b981; font-size:1.5rem; margin-bottom:8px;">✓</div>FINANCING<br>CONFIRMED</div>
                        <div style="flex:1; min-width:20px; border-bottom: 2px dashed rgba(16,185,129,0.3); margin: 20px 10px;"></div>
                        <div><div style="color:#10b981; font-size:1.5rem; margin-bottom:8px; text-shadow: 0 0 10px rgba(16,185,129,0.5);">✓</div><strong style="color:#fff;">${provider.name.toUpperCase()}</strong></div>
                    </div>
                `;
                document.querySelector('.market-wrapper').appendChild(alert);

                document.getElementById('btn-view-cert')?.addEventListener('click', openCertificate);
            }
            return;
        }

        // We want to show the full market actively as offers arrive
        if (offers.length > 0) {
            document.getElementById('no-offers-msg').style.display = 'none';
            document.getElementById('offers-container').classList.remove('hidden');

            const state = db.get();

            // Run TOPSIS algorithm via Fastify /api/match
            let topsisAlgorithmUsed = false;
            try {
                const matchRes = await fetch('/api/match', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ invoiceId: reqId, minAdvance: req.minimumAdvance || 90 })
                });
                if (matchRes.ok) {
                    const matchData = await matchRes.json();
                    if (matchData.rankedOffers && matchData.rankedOffers.length > 0) {
                        offers = matchData.rankedOffers;
                        topsisAlgorithmUsed = true;
                    }
                }
            } catch (e) {
                // Fallback sort by score
                offers.sort((a, b) => b.score - a.score);
            }

            if (!topsisAlgorithmUsed) {
                offers.sort((a, b) => b.score - a.score);
            }

            const bestOffer = offers[0];
            const bestProviderName = state.users[bestOffer.providerId]?.name || bestOffer.providerName || 'Apex Institutional Bank';

            document.getElementById('rec-provider').textContent = bestProviderName;
            
            // Generate dynamic reasoning for the best offer
            const reasoning = [];
            if (topsisAlgorithmUsed) {
                reasoning.push(`✓ TOPSIS Relative Closeness Score: ${bestOffer.topsisScore || 0.95}`);
            }
            if (bestOffer.advance >= 90) reasoning.push(`✓ Provides optimal advance rate of ${bestOffer.advance}%`);
            if (bestOffer.tenor <= 45) reasoning.push(`✓ Rapid settlement tenor of ${bestOffer.tenor} days`);
            if (bestOffer.rate <= 9.5) reasoning.push(`✓ Highly competitive APR rate of ${bestOffer.rate}%`);
            if (bestOffer.score >= 80) reasoning.push('✓ Excellent counterparty liquidity & credit profile');
            
            document.getElementById('rec-reasoning').innerHTML = reasoning.map(r => `<li>${r}</li>`).join('');

            // Generate dynamic explanation based on comparison
            let explanation = '';
            if (offers.length > 1) {
                const worstOffer = offers[offers.length - 1];
                const worstName = state.users[worstOffer.providerId]?.name || worstOffer.providerName || 'Lender';
                
                if (worstOffer.advance < 90) {
                    explanation = `${worstName} offers a competitive rate of ${worstOffer.rate}%, but only provides ${worstOffer.advance}% advance, which fails the 90% liquidity threshold.`;
                } else if (worstOffer.rate > bestOffer.rate) {
                    explanation = `${worstName} offers ${worstOffer.advance}% advance at a ${worstOffer.rate}% rate, making ${bestProviderName} the financially superior match.`;
                } else {
                    explanation = `TOPSIS multi-criteria optimization evaluated all counterparty metrics (APR, Advance %, Tenor) and selected ${bestProviderName} as the optimal capital route.`;
                }
            } else {
                explanation = `Currently 1 institutional offer received. You can wait for additional bids from competing liquidity pools or execute financing immediately.`;
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
                        <div class="metric-row"><span>Processing Fee:</span> <strong>${fmt.format(offer.fee)}</strong></div>
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

    // Auto-Simulate Bids Handler
    document.getElementById('btn-auto-simulate')?.addEventListener('click', () => {
        const btn = document.getElementById('btn-auto-simulate');
        btn.disabled = true;
        btn.innerHTML = '<span>⚡</span> Simulating Bids...';

        const presets = [
            { providerId: 'bank', advance: 90, rate: 9.2, tenor: 45, fee: 2000, score: 93 },
            { providerId: 'nbfc', advance: 95, rate: 9.5, tenor: 30, fee: 1500, score: 97 },
            { providerId: 'fund', advance: 80, rate: 8.8, tenor: 60, fee: 1000, score: 82 }
        ];

        let index = 0;
        const interval = setInterval(() => {
            if (index < presets.length) {
                const item = presets[index];
                const existing = db.getOffersForRequest(reqId).find(o => o.providerId === item.providerId);
                if (!existing) {
                    const offerId = 'OFF-' + Math.random().toString(36).substr(2, 6).toUpperCase();
                    db.submitOffer(offerId, {
                        id: offerId,
                        requestId: reqId,
                        providerId: item.providerId,
                        advance: item.advance,
                        rate: item.rate,
                        tenor: item.tenor,
                        fee: item.fee,
                        score: item.score,
                        status: 'SUBMITTED',
                        createdAt: Date.now()
                    });
                    const pName = db.get().users[item.providerId].name;
                    showToast(`⚡ New Bid received from ${pName} (${item.advance}% @ ${item.rate}%)`);
                    renderMarketplace();
                }
                index++;
            } else {
                clearInterval(interval);
                btn.innerHTML = '<span>✓</span> All AI Bids Placed';
            }
        }, 1200);
    });

    function openCertificate() {
        const state = db.get();
        const req = db.getRequest(reqId);
        const financing = state.financings[reqId];
        const offer = state.offers[financing.offerId];
        const provider = state.users[financing.providerId];

        const certContent = document.getElementById('cert-content');
        certContent.innerHTML = `
            <div>CONTRACT ID: <span style="color:var(--accent);">FINOVA-SC-${reqId}-${Date.now().toString(36).toUpperCase()}</span></div>
            <div>STATUS: <span style="color:#10b981;">SETTLED & DISBURSED</span></div>
            <div>TIMESTAMP: <span>${new Date().toISOString()}</span></div>
            <div>SUPPLIER: <span>Alpha Precision Components Ltd</span></div>
            <div>BUYER: <span>${req.buyerName || 'Tata Motors Ltd'}</span></div>
            <div>CAPITAL PROVIDER: <span>${provider.name} (${provider.type})</span></div>
            <div>INVOICE VALUE: <span>${fmt.format(req.invoiceAmount)}</span></div>
            <div>FINANCED PRINCIPAL: <span style="color:#10b981;">${fmt.format(financing.amount)}</span></div>
            <div>ADVANCE: <span>${offer.advance}%</span> | RATE: <span>${offer.rate}% APR</span> | TENOR: <span>${offer.tenor}D</span></div>
            <div style="word-break:break-all; margin-top:8px; padding-top:8px; border-top:1px dashed rgba(255,255,255,0.1);">
                LEDGER SHA-256 HASH:<br><span style="color:var(--accent); font-size:0.75rem;">${req.hash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}</span>
            </div>
        `;
        document.getElementById('cert-modal').classList.add('active');
    }

    document.getElementById('btn-close-cert')?.addEventListener('click', () => {
        document.getElementById('cert-modal').classList.remove('active');
    });

    document.getElementById('btn-copy-proof')?.addEventListener('click', () => {
        const req = db.getRequest(reqId);
        const proof = `FINOVA-SETTLEMENT-PROOF | REQ: ${reqId} | HASH: ${req.hash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'} | TIMESTAMP: ${new Date().toISOString()}`;
        navigator.clipboard.writeText(proof).then(() => {
            const btn = document.getElementById('btn-copy-proof');
            btn.textContent = '✓ PROOF COPIED TO CLIPBOARD';
            setTimeout(() => btn.textContent = 'COPY CRYPTOGRAPHIC PROOF', 2000);
        });
    });

    // Modal actions
    document.getElementById('btn-cancel-modal').addEventListener('click', () => {
        document.getElementById('confirm-modal').classList.remove('active');
        selectedOffer = null;
    });

    document.getElementById('btn-confirm-finance').addEventListener('click', () => {
        if (!selectedOffer) return;
        const btn = document.getElementById('btn-confirm-finance');
        btn.textContent = 'EXECUTING SMART CONTRACT...';
        
        setTimeout(() => {
            db.acceptOffer(reqId, selectedOffer.id);
            document.getElementById('confirm-modal').classList.remove('active');
            showToast('✓ Financing executed! Capital deployed to supplier treasury.');
            renderMarketplace(); // Re-render to show funded state
        }, 1200);
    });

    // Poll for changes
    setInterval(renderMarketplace, 1000);
    renderMarketplace(); // initial call
});
