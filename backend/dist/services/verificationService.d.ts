import { VerificationMethod, VerificationResult } from '../types';
export interface VerificationAttempt {
    id: string;
    userId: string;
    transactionId: string;
    method: VerificationMethod;
    result: VerificationResult;
    reasons: string[];
    attemptsCount: number;
    createdAt: string;
    completedAt?: string;
    data?: any;
}
export interface VerificationStep {
    method: VerificationMethod;
    required: boolean;
    priority: number;
    timeout: number;
    completed: boolean;
    data?: any;
}
export interface VerificationSession {
    id: string;
    transactionId: string;
    userId: string;
    steps: VerificationStep[];
    currentStep: number;
    status: 'active' | 'completed' | 'failed' | 'expired';
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    expiresAt: string;
    createdAt: string;
}
export declare class VerificationService {
    private sessions;
    private attempts;
    getRequiredVerificationMethods(riskScore: number): {
        methods: VerificationMethod[];
        priority: number[];
        timeout: number;
    };
    createVerificationSession(transactionId: string, userId: string, riskScore: number): VerificationSession;
    getVerificationSession(sessionId: string): VerificationSession | null;
    completeVerificationStep(sessionId: string, method: VerificationMethod, data: any): Promise<{
        success: boolean;
        result: VerificationResult;
        reasons: string[];
    }>;
    private validateVerificationData;
    private getRiskLevel;
    getVerificationProgress(sessionId: string): {
        completedMethods: VerificationMethod[];
        remainingMethods: VerificationMethod[];
        progress: number;
        canProceed: boolean;
    } | null;
    cancelVerificationSession(sessionId: string, reason?: string): boolean;
    getVerificationAttempts(userId: string, filters?: {
        method?: VerificationMethod;
        result?: VerificationResult;
    }): VerificationAttempt[];
    cleanupExpiredSessions(): void;
}
export declare const verificationService: VerificationService;
//# sourceMappingURL=verificationService.d.ts.map