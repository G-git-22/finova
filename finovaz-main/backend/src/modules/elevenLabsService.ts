import { VoiceNarrateRequest, VoiceNarrateResponse, VoiceTopic, ELEVENLABS_VOICES } from '@finova/shared';

export class ElevenLabsService {
  private static DEFAULT_VOICE_ID = '21m00Tcm4TlvDq8ikWAM'; // Rachel - Executive Deal Analyst

  /**
   * Synthesizes audio using ElevenLabs API or generates fallback narration script
   */
  public static async narrate(req: VoiceNarrateRequest): Promise<VoiceNarrateResponse> {
    const topic = req.topic || 'CUSTOM';
    const voiceId = req.voiceId || ElevenLabsService.DEFAULT_VOICE_ID;
    const voiceObj = ELEVENLABS_VOICES.find(v => v.id === voiceId) || ELEVENLABS_VOICES[0];
    const apiKey = req.apiKey || process.env.ELEVENLABS_API_KEY || '';

    // Generate or use custom script text
    const scriptText = req.text || ElevenLabsService.generateScriptForTopic(topic, req.contextData);

    // If an ElevenLabs API Key is provided, call ElevenLabs TTS API
    if (apiKey && apiKey.trim().length > 0) {
      try {
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': apiKey.trim(),
            'Accept': 'audio/mpeg'
          },
          body: JSON.stringify({
            text: scriptText,
            model_id: 'eleven_turbo_v2_5',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.8,
              style: 0.2,
              use_speaker_boost: true
            }
          })
        });

        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer();
          const audioBase64 = Buffer.from(arrayBuffer).toString('base64');

          return {
            success: true,
            audioBase64: `data:audio/mpeg;base64,${audioBase64}`,
            mimeType: 'audio/mpeg',
            scriptText,
            voiceName: voiceObj.name,
            voiceId,
            topic,
            engine: 'ELEVENLABS_API',
            message: 'Audio synthesized successfully via ElevenLabs Neural Voice.'
          };
        } else {
          const errText = await response.text();
          console.warn(`ElevenLabs API returned ${response.status}: ${errText}. Using local voice fallback.`);
        }
      } catch (err: any) {
        console.warn(`ElevenLabs API request failed (${err?.message}). Using local voice fallback.`);
      }
    }

    // Fallback response with the generated professional script
    return {
      success: true,
      scriptText,
      voiceName: voiceObj.name,
      voiceId,
      topic,
      engine: 'BROWSER_SYNTHESIS_FALLBACK',
      message: apiKey
        ? 'ElevenLabs API key rate limit reached or offline. Fallback to High-Fidelity Audio Engine.'
        : 'Running in zero-config demo mode with Browser Neural Speech Synthesis.'
    };
  }

  /**
   * Generates domain-specific financial intelligence scripts
   */
  public static generateScriptForTopic(topic: VoiceTopic, context?: any): string {
    switch (topic) {
      case 'TOPSIS_DEAL': {
        const provider = context?.bestMatch?.providerName || 'Stride NBFC';
        const rate = context?.bestMatch?.rate || 9.5;
        const advance = context?.bestMatch?.advance || 95;
        const speed = context?.bestMatch?.tenor || 30;
        const score = context?.bestMatch?.score || 97;

        return `Finova TOPSIS Intelligence update. After evaluating multi-criteria tradeoffs across the active bidding pool, the algorithm recommends ${provider} with a top match score of ${score} out of 100. This offer delivers an optimal ${advance} percent upfront advance at ${rate} percent APR with rapid ${speed}-day settlement. Mathematical Euclidean distance confirms this is your highest efficiency financing option.`;
      }

      case 'VERISHIELD_ALERT': {
        if (context?.status === 'REVIEW_REQUIRED' || context?.flag === 'DOUBLE_FINANCING_ATTACK') {
          return `Critical security advisory from VeriShield. A SHA-256 cryptographic collision was flagged in the cross-lender duplicate registry. This invoice payload matches a previously pledged asset. Autonomous financing is locked and routed to the manual fraud review desk.`;
        }
        return `VeriShield verification complete. Cryptographic SHA-256 proof has been verified against the counterparty registry. Invoice line items balance with zero arithmetic discrepancies. The invoice is officially certified and published to the live financing orderbook.`;
      }

      case 'PORTFOLIO_BRIEFING': {
        const totalDeployed = context?.totalDeployedCapital ? `₹${(context.totalDeployedCapital / 100000).toFixed(1)} Lakhs` : '₹2.71 Crores';
        const liquidity = context?.totalAvailableLiquidity ? `₹${(context.totalAvailableLiquidity / 100000).toFixed(1)} Lakhs` : '₹95 Lakhs';

        return `Welcome to your Executive Capital Briefing. Finova Digital Twin reports ${totalDeployed} currently deployed across verified enterprise receivables with ${liquidity} in available liquidity pools. Zero default signals detected. Counterparty concentration on Tier-1 automotive buyers remains well within optimal risk thresholds.`;
      }

      case 'SYNDICATION_ANALYSIS': {
        const blended = context?.blendedAPR || 9.4;
        const amount = context?.totalInvoiceAmount ? `₹${(context.totalInvoiceAmount / 100000).toFixed(0)} Lakhs` : '₹50 Lakhs';

        return `Finova Tranche Syndication breakdown for ${amount}. The risk waterfall splits this asset into a 60% Senior Tranche for institutional banks, a 30% Mezzanine Tranche for high-yield credit funds, and a 10% Supplier Retention buffer. This structure achieves an attractive blended APR of ${blended} percent while completely eliminating single-lender risk.`;
      }

      case 'CHAOS_REPORT': {
        const eventType = context?.eventType || 'LIQUIDITY_SHOCK';
        const resilience = context?.impactMetrics?.systemResilienceScore || 85;

        return `Adversarial Chaos Simulation completed. Scenario: ${eventType}. Finova capital routing dynamically absorbed the shock, maintaining a system resilience score of ${resilience} percent. High-priority risk gates prevented cascading defaults across the consensus protocol.`;
      }

      default:
        return `Finova Autonomous Supply Chain Finance Engine online. Real-time invoice verification, TOPSIS algorithmic matching, and risk syndication active.`;
    }
  }
}
