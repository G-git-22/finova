document.addEventListener('DOMContentLoaded', () => {

    // Parallax Setup (reusing from script.js, simplified)
    const parallaxContainer = document.getElementById('parallax-container');
    if (parallaxContainer) {
        for (let i = 0; i < 30; i++) {
            const node = document.createElement('div');
            node.classList.add('node');
            const size = Math.random() * 4 + 2;
            const x = Math.random() * 100;
            const y = Math.random() * 150;
            node.style.width = `${size}px`;
            node.style.height = `${size}px`;
            node.style.left = `${x}vw`;
            node.style.top = `${y}vh`;
            
            // Reusing speed and styling from main parallax logic
            const speed = Math.random() * 0.5 + 0.1;
            parallaxContainer.appendChild(node);

            // Simple parallax effect
            window.addEventListener('scroll', () => {
                const scrollY = window.scrollY;
                const yOffset = scrollY * speed;
                node.style.transform = `translateY(-${yOffset}px)`;
            });
        }
    }

    // Interaction Elements
    const btnDemo = document.getElementById('btn-demo-invoice');
    const uploadZone = document.getElementById('upload-zone');
    const fileInput = document.getElementById('invoice-file-input');
    const terminal = document.getElementById('verification-terminal');
    const terminalOutput = document.getElementById('terminal-output');
    const hashProgress = document.getElementById('hash-progress');
    const progressFill = document.getElementById('progress-fill');
    const verificationResult = document.getElementById('verification-result');
    const actionTrigger = document.getElementById('action-trigger');
    const btnBidding = document.getElementById('btn-bidding');

    let currentInvoice = {
        id: 'REQ-001',
        buyerName: 'Tata Motors Ltd',
        invoiceAmount: 850000,
        fundingRequired: 765000,
        minimumAdvance: 90,
        maximumTenor: 60,
        settlementUrgency: 'Within 24 hours',
        risk: 'Low',
        verificationStatus: 'Verified',
        trustScore: 94,
        hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
    };

    // Helper: Compute real SHA-256 using Web Crypto API
    async function calculateSHA256(arrayBuffer) {
        try {
            const hashBuffer = await window.crypto.subtle.digest('SHA-256', arrayBuffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hexHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            return hexHash;
        } catch (e) {
            console.error('Crypto error:', e);
            return 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
        }
    }

    async function startVerificationSequence(fileName, computedHash, invoiceDetails) {
        const storedUserStr = localStorage.getItem('FINOVA_USER_DATA');
        let currentUser = { identifier: '27AABCA1234F1Z9', role: 'SUPPLIER' };
        if (storedUserStr) {
            try { currentUser = JSON.parse(storedUserStr); } catch (e) {}
        }

        currentInvoice = { ...currentInvoice, ...invoiceDetails, hash: computedHash };

        // Hide upload zone, show terminal
        uploadZone.classList.add('hidden');
        terminal.classList.remove('hidden');

        // Reset terminal UI state
        verificationResult.className = 'verification-result hidden';
        actionTrigger.classList.add('hidden');

        // Sequence of events
        let delay = 300;

        // 1. Initial extraction line
        setTimeout(() => {
            const p = document.createElement('div');
            p.className = 'term-line';
            p.textContent = `> Ingested document: "${fileName}"`;
            terminalOutput.appendChild(p);

            const p2 = document.createElement('div');
            p2.className = 'term-line';
            p2.textContent = `> Buyer: ${currentInvoice.buyerName} | Invoice Value: ₹${(currentInvoice.invoiceAmount).toLocaleString('en-IN')}`;
            terminalOutput.appendChild(p2);
        }, delay);
        
        delay += 800;

        // 2. Start SHA-256 Progress
        setTimeout(() => {
            const p = document.createElement('div');
            p.className = 'term-line';
            p.textContent = "> Computing SHA-256 Cryptographic Hash via Web Crypto API...";
            terminalOutput.appendChild(p);

            hashProgress.classList.remove('hidden');
            
            let width = 0;
            const interval = setInterval(async () => {
                width += Math.random() * 25 + 10;
                if (width > 100) width = 100;
                progressFill.style.width = `${width}%`;
                
                if (width === 100) {
                    clearInterval(interval);
                    
                    setTimeout(async () => {
                        hashProgress.classList.add('hidden');
                        
                        // Display generated hash dynamically in terminal
                        const hashP = document.createElement('div');
                        hashP.className = 'term-line highlight';
                        hashP.innerHTML = `> SHA-256: ${computedHash}`;
                        terminalOutput.appendChild(hashP);

                        // Call Fastify /api/verify endpoint
                        const checkP = document.createElement('div');
                        checkP.className = 'term-line';
                        checkP.textContent = "> Querying VeriShield Verification Engine `/api/verify`...";
                        terminalOutput.appendChild(checkP);

                        try {
                            const verifyPayload = {
                                invoiceId: currentInvoice.id || 'INV-1042',
                                amount: currentInvoice.invoiceAmount || 850000,
                                hash: computedHash,
                                supplierId: currentUser.identifier || '27AABCA1234F1Z9',
                                buyerName: currentInvoice.buyerName
                            };

                            const res = await fetch('/api/verify', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(verifyPayload)
                            });

                            const apiResult = await res.json();

                            setTimeout(() => {
                                if (apiResult.status === 'REVIEW_REQUIRED') {
                                    const errP = document.createElement('div');
                                    errP.className = 'term-line';
                                    errP.style.color = '#ff5f56';
                                    errP.innerHTML = `> [REJECTED] ${apiResult.reason || 'Duplicate hash detected'}: ${apiResult.message}`;
                                    terminalOutput.appendChild(errP);

                                    // Ensure Start Market Bidding button is strictly HIDDEN
                                    actionTrigger.classList.add('hidden');

                                    verificationResult.innerHTML = `
                                        <div class="verified-badge" style="background:rgba(255,95,86,0.15); border-color:#ff5f56; color:#ff5f56; box-shadow:0 0 20px rgba(255,95,86,0.2);">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                                            <span>REVIEW REQUIRED: ${apiResult.reason || 'Duplicate Hash Detected'}</span>
                                        </div>
                                        <div class="explainability-panel" style="border-left-color:#ff5f56; background:rgba(255,95,86,0.05);">
                                            <strong style="color:#ff5f56;">Fraud Flag:</strong> ${apiResult.message || 'Duplicate invoice hash detected in cross-lender registry.'} Double financing blocked.
                                        </div>
                                    `;
                                    verificationResult.classList.remove('hidden');

                                } else {
                                    verificationResult.innerHTML = `
                                        <div class="verified-badge">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                            <span>VERIFIED</span>
                                        </div>
                                        <div class="explainability-panel">
                                            <strong>Why it passed:</strong> Invoice integrity confirmed by VeriShield backend. SHA-256 hash is unique (no double-financing detected) and linked to verified Tier-1 buyer.
                                        </div>
                                    `;
                                    verificationResult.classList.remove('hidden');
                                    // Reveal the "Start Market Bidding" button only on VERIFIED
                                    setTimeout(() => actionTrigger.classList.remove('hidden'), 500);
                                }
                            }, 800);

                        } catch (err) {
                            verificationResult.classList.remove('hidden');
                            setTimeout(() => actionTrigger.classList.remove('hidden'), 500);
                        }

                    }, 400);
                }
            }, 70);

        }, delay);
    }

    // Demo Invoice Click
    btnDemo?.addEventListener('click', (e) => {
        e.stopPropagation();
        startVerificationSequence(
            'TataMotors_Invoice_TM89201.pdf',
            '7d8a9f2e3c4b5a67890123456789abcdef0123456789abcdef0123456789abcdef',
            {
                buyerName: 'Tata Motors Ltd',
                invoiceAmount: 850000,
                fundingRequired: 765000
            }
        );
    });

    // Duplicate Attack Click
    const btnDuplicateAttack = document.getElementById('btn-duplicate-attack');
    btnDuplicateAttack?.addEventListener('click', (e) => {
        e.stopPropagation();
        startVerificationSequence(
            'DUPLICATE_FORGED_INVOICE.pdf',
            'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
            {
                buyerName: 'Tata Motors Ltd',
                invoiceAmount: 850000,
                fundingRequired: 765000
            }
        );
    });

    // File Picker Trigger
    uploadZone.addEventListener('click', (e) => {
        if (e.target !== btnDemo) {
            fileInput.click();
        }
    });

    // Drag and Drop
    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.style.borderColor = 'var(--accent)';
        uploadZone.style.background = 'rgba(87, 193, 255, 0.08)';
    });

    uploadZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadZone.style.borderColor = '';
        uploadZone.style.background = '';
    });

    uploadZone.addEventListener('drop', async (e) => {
        e.preventDefault();
        uploadZone.style.borderColor = '';
        uploadZone.style.background = '';
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            await handleFile(files[0]);
        }
    });

    fileInput.addEventListener('change', async (e) => {
        if (e.target.files.length > 0) {
            await handleFile(e.target.files[0]);
        }
    });

    function handleFile(file) {
        const reader = new FileReader();
        reader.onload = async (e) => {
            const arrayBuffer = e.target.result;
            const hash = await calculateSHA256(arrayBuffer);
            let customDetails = {
                id: 'INV-1042',
                buyerName: 'Tata Motors Ltd',
                invoiceAmount: 850000,
                fundingRequired: 765000
            };

            if (file.name.endsWith('.json')) {
                try {
                    const text = new TextDecoder().decode(arrayBuffer);
                    const json = JSON.parse(text);
                    if (json.invoiceId) customDetails.id = json.invoiceId;
                    if (json.buyerName) customDetails.buyerName = json.buyerName;
                    if (json.invoiceAmount) {
                        customDetails.invoiceAmount = Number(json.invoiceAmount);
                        customDetails.fundingRequired = Math.round(customDetails.invoiceAmount * 0.9);
                    }
                } catch (err) {
                    console.warn('Could not parse JSON invoice, using defaults');
                }
            }
            startVerificationSequence(file.name, hash, customDetails);
        };
        reader.readAsArrayBuffer(file);
    }

    btnBidding.addEventListener('click', () => {
        btnBidding.disabled = true;
        
        const steps = [
            'Connecting to Capital Market...',
            'Creating Financing Request...',
            'Notifying Capital Providers...',
            'Market Open'
        ];
        
        let stepIndex = 0;
        btnBidding.innerHTML = steps[stepIndex];
        
        const intv = setInterval(() => {
            stepIndex++;
            if (stepIndex < steps.length) {
                btnBidding.innerHTML = steps[stepIndex];
            } else {
                clearInterval(intv);
                // Create the request in db
                db.createRequest('REQ-001', {
                    supplierId: 'supplier',
                    buyerName: currentInvoice.buyerName,
                    invoiceAmount: currentInvoice.invoiceAmount,
                    fundingRequired: currentInvoice.fundingRequired,
                    minimumAdvance: currentInvoice.minimumAdvance,
                    maximumTenor: currentInvoice.maximumTenor,
                    settlementUrgency: currentInvoice.settlementUrgency,
                    risk: currentInvoice.risk,
                    verificationStatus: currentInvoice.verificationStatus,
                    trustScore: currentInvoice.trustScore,
                    hash: currentInvoice.hash
                });
                window.location.href = 'market.html';
            }
        }, 700);
    });

});
