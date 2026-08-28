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
    const terminal = document.getElementById('verification-terminal');
    const terminalOutput = document.getElementById('terminal-output');
    const hashProgress = document.getElementById('hash-progress');
    const progressFill = document.getElementById('progress-fill');
    const verificationResult = document.getElementById('verification-result');
    const actionTrigger = document.getElementById('action-trigger');
    const btnBidding = document.getElementById('btn-bidding');

    const terminalLines = [
        "> Extracting invoice data...",
        "> Computing SHA-256 Cryptographic Hash..."
    ];

    btnDemo.addEventListener('click', () => {
        // Hide upload zone, show terminal
        uploadZone.classList.add('hidden');
        terminal.classList.remove('hidden');

        // Sequence of events
        let delay = 500;

        // 1. Initial extraction line
        setTimeout(() => {
            const p = document.createElement('div');
            p.className = 'term-line';
            p.textContent = "> Extracting invoice data...";
            terminalOutput.appendChild(p);
        }, delay);
        
        delay += 1000;

        // 2. Start SHA-256 Progress
        setTimeout(() => {
            const p = document.createElement('div');
            p.className = 'term-line';
            p.textContent = "> Computing SHA-256 Cryptographic Hash...";
            terminalOutput.appendChild(p);

            hashProgress.classList.remove('hidden');
            
            // Animate progress bar
            let width = 0;
            const interval = setInterval(() => {
                width += Math.random() * 15;
                if (width > 100) width = 100;
                progressFill.style.width = `${width}%`;
                
                if (width === 100) {
                    clearInterval(interval);
                    
                    // Finish progress
                    setTimeout(() => {
                        hashProgress.classList.add('hidden');
                        
                        // Output hash
                        const hashP = document.createElement('div');
                        hashP.className = 'term-line highlight';
                        hashP.innerHTML = "> Hash: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
                        terminalOutput.appendChild(hashP);

                        // Checking cross-lender
                        setTimeout(() => {
                            const checkP = document.createElement('div');
                            checkP.className = 'term-line';
                            checkP.textContent = "> Checking cross-lender registry for duplicates...";
                            terminalOutput.appendChild(checkP);

                            // Final Verification
                            setTimeout(() => {
                                verificationResult.classList.remove('hidden');
                                
                                // Show Bidding button
                                setTimeout(() => {
                                    actionTrigger.classList.remove('hidden');
                                }, 1000);

                            }, 1500);

                        }, 1000);

                    }, 500);
                }
            }, 100);

        }, delay);
    });

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
                // Create the request
                db.createRequest('REQ-001', {
                    supplierId: 'supplier',
                    buyerName: 'Tata Motors Ltd',
                    invoiceAmount: 850000,
                    fundingRequired: 765000,
                    minimumAdvance: 90,
                    maximumTenor: 60,
                    settlementUrgency: 'Within 24 hours',
                    risk: 'Low',
                    verificationStatus: 'Verified',
                    trustScore: 94
                });
                window.location.href = 'market.html';
            }
        }, 800);
    });

});
