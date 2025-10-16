"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verificationService = exports.VerificationService = void 0;
const types_1 = require("../types");
class VerificationService {
    constructor() {
        this.sessions = new Map();
        this.attempts = new Map();
    }
    getRequiredVerificationMethods(riskScore) {
        let methods = [];
        let priority = [];
        let timeout = 300;
        if (riskScore >= 80) {
            methods = [
                types_1.VerificationMethod.BIOMETRIC,
                types_1.VerificationMethod.FACE_RECOGNITION,
                types_1.VerificationMethod.SECURITY_QUESTIONS,
                types_1.VerificationMethod.SMS_CODE
            ];
            priority = [1, 2, 3, 4];
            timeout = 600;
        }
        else if (riskScore >= 60) {
            methods = [
                types_1.VerificationMethod.BIOMETRIC,
                types_1.VerificationMethod.SMS_CODE,
                types_1.VerificationMethod.SECURITY_QUESTIONS
            ];
            priority = [1, 2, 3];
            timeout = 480;
        }
        else if (riskScore >= 40) {
            methods = [
                types_1.VerificationMethod.SMS_CODE,
                types_1.VerificationMethod.SECURITY_QUESTIONS
            ];
            priority = [1, 2];
            timeout = 360;
        }
        else {
            methods = [
                types_1.VerificationMethod.SMS_CODE
            ];
            priority = [1];
            timeout = 180;
        }
        return { methods, priority, timeout };
    }
    createVerificationSession(transactionId, userId, riskScore) {
        const { methods, priority, timeout } = this.getRequiredVerificationMethods(riskScore);
        const sessionId = `verification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const expiresAt = new Date(Date.now() + timeout * 1000).toISOString();
        const steps = methods.map((method, index) => ({
            method,
            required: true,
            priority: priority[index],
            timeout,
            completed: false
        }));
        const session = {
            id: sessionId,
            transactionId,
            userId,
            steps,
            currentStep: 0,
            status: 'active',
            riskLevel: this.getRiskLevel(riskScore),
            expiresAt,
            createdAt: new Date().toISOString()
        };
        this.sessions.set(sessionId, session);
        return session;
    }
    getVerificationSession(sessionId) {
        return this.sessions.get(sessionId) || null;
    }
    async completeVerificationStep(sessionId, method, data) {
        const session = this.sessions.get(sessionId);
        if (!session) {
            return { success: false, result: types_1.VerificationResult.FAILED, reasons: ['Session not found'] };
        }
        if (session.status !== 'active') {
            return { success: false, result: types_1.VerificationResult.FAILED, reasons: ['Session not active'] };
        }
        if (new Date() > new Date(session.expiresAt)) {
            session.status = 'expired';
            return { success: false, result: types_1.VerificationResult.EXPIRED, reasons: ['Session expired'] };
        }
        const stepIndex = session.steps.findIndex(step => step.method === method);
        if (stepIndex === -1) {
            return { success: false, result: types_1.VerificationResult.FAILED, reasons: ['Method not required'] };
        }
        const step = session.steps[stepIndex];
        const validationResult = await this.validateVerificationData(method, data);
        if (!validationResult.success) {
            return { success: false, result: types_1.VerificationResult.FAILED, reasons: validationResult.reasons };
        }
        step.completed = true;
        step.data = data;
        const attemptId = `attempt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const attempt = {
            id: attemptId,
            userId: session.userId,
            transactionId: session.transactionId,
            method,
            result: types_1.VerificationResult.SUCCESS,
            reasons: ['Verification successful'],
            attemptsCount: 1,
            createdAt: new Date().toISOString(),
            completedAt: new Date().toISOString(),
            data
        };
        this.attempts.set(attemptId, attempt);
        const allRequiredCompleted = session.steps.every(step => !step.required || step.completed);
        if (allRequiredCompleted) {
            session.status = 'completed';
            return { success: true, result: types_1.VerificationResult.SUCCESS, reasons: ['All verification steps completed'] };
        }
        else {
            session.currentStep = session.steps.findIndex(step => !step.completed);
            return { success: true, result: types_1.VerificationResult.SUCCESS, reasons: ['Step completed, more steps required'] };
        }
    }
    async validateVerificationData(method, data) {
        const reasons = [];
        switch (method) {
            case types_1.VerificationMethod.BIOMETRIC:
            case types_1.VerificationMethod.FINGERPRINT:
            case types_1.VerificationMethod.FACE_RECOGNITION:
                if (!data.biometricData) {
                    reasons.push('Biometric data is required');
                }
                if (data.confidence && data.confidence < 0.8) {
                    reasons.push('Biometric confidence too low');
                }
                break;
            case types_1.VerificationMethod.SMS_CODE:
            case types_1.VerificationMethod.EMAIL_CODE:
                if (!data.code || data.code.length !== 6) {
                    reasons.push('Invalid verification code format');
                }
                break;
            case types_1.VerificationMethod.SECURITY_QUESTIONS:
                if (!data.answers || !Array.isArray(data.answers)) {
                    reasons.push('Security answers are required');
                }
                break;
            case types_1.VerificationMethod.PIN_VERIFICATION:
                if (!data.pin || data.pin.length !== 4) {
                    reasons.push('PIN must be 4 digits');
                }
                break;
            case types_1.VerificationMethod.OTP:
                if (!data.otp || !data.otpId) {
                    reasons.push('OTP and OTP ID are required');
                }
                break;
            case types_1.VerificationMethod.VOICE_VERIFICATION:
                if (!data.audioBlob || !data.duration) {
                    reasons.push('Voice data is required');
                }
                if (data.duration < 2) {
                    reasons.push('Voice sample too short');
                }
                break;
            case types_1.VerificationMethod.LIVENESS:
                if (!data.videoBlob || !data.challengeType) {
                    reasons.push('Liveness data is required');
                }
                break;
            case types_1.VerificationMethod.ID_SCAN:
            case types_1.VerificationMethod.DOCUMENT_SCAN:
                if (!data.documentImage || !data.documentType) {
                    reasons.push('Document image and type are required');
                }
                break;
            default:
                reasons.push('Unsupported verification method');
        }
        return { success: reasons.length === 0, reasons };
    }
    getRiskLevel(riskScore) {
        if (riskScore >= 80)
            return 'critical';
        if (riskScore >= 60)
            return 'high';
        if (riskScore >= 40)
            return 'medium';
        return 'low';
    }
    getVerificationProgress(sessionId) {
        const session = this.sessions.get(sessionId);
        if (!session)
            return null;
        const completedMethods = session.steps
            .filter(step => step.completed)
            .map(step => step.method);
        const remainingMethods = session.steps
            .filter(step => !step.completed)
            .map(step => step.method);
        const progress = (completedMethods.length / session.steps.length) * 100;
        const canProceed = session.steps.every(step => !step.required || step.completed);
        return {
            completedMethods,
            remainingMethods,
            progress,
            canProceed
        };
    }
    cancelVerificationSession(sessionId, reason) {
        const session = this.sessions.get(sessionId);
        if (!session)
            return false;
        session.status = 'failed';
        return true;
    }
    getVerificationAttempts(userId, filters) {
        const attempts = Array.from(this.attempts.values())
            .filter(attempt => attempt.userId === userId);
        if (filters?.method) {
            return attempts.filter(attempt => attempt.method === filters.method);
        }
        if (filters?.result) {
            return attempts.filter(attempt => attempt.result === filters.result);
        }
        return attempts;
    }
    cleanupExpiredSessions() {
        const now = new Date();
        for (const [sessionId, session] of this.sessions.entries()) {
            if (now > new Date(session.expiresAt)) {
                session.status = 'expired';
            }
        }
    }
}
exports.VerificationService = VerificationService;
exports.verificationService = new VerificationService();
//# sourceMappingURL=verificationService.js.map