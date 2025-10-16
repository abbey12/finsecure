import { VerificationMethod, VerificationResult, TransactionDecision } from '../types';

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

export class VerificationService {
  private sessions: Map<string, VerificationSession> = new Map();
  private attempts: Map<string, VerificationAttempt> = new Map();

  // Determine required verification methods based on risk score
  getRequiredVerificationMethods(riskScore: number): {
    methods: VerificationMethod[];
    priority: number[];
    timeout: number;
  } {
    let methods: VerificationMethod[] = [];
    let priority: number[] = [];
    let timeout = 300; // 5 minutes default

    if (riskScore >= 80) {
      // Critical risk - require multiple high-security methods
      methods = [
        VerificationMethod.BIOMETRIC,
        VerificationMethod.FACE_RECOGNITION,
        VerificationMethod.SECURITY_QUESTIONS,
        VerificationMethod.SMS_CODE
      ];
      priority = [1, 2, 3, 4];
      timeout = 600; // 10 minutes
    } else if (riskScore >= 60) {
      // High risk - require biometric + additional verification
      methods = [
        VerificationMethod.BIOMETRIC,
        VerificationMethod.SMS_CODE,
        VerificationMethod.SECURITY_QUESTIONS
      ];
      priority = [1, 2, 3];
      timeout = 480; // 8 minutes
    } else if (riskScore >= 40) {
      // Medium risk - require 2-factor authentication
      methods = [
        VerificationMethod.SMS_CODE,
        VerificationMethod.SECURITY_QUESTIONS
      ];
      priority = [1, 2];
      timeout = 360; // 6 minutes
    } else {
      // Low risk - basic verification
      methods = [
        VerificationMethod.SMS_CODE
      ];
      priority = [1];
      timeout = 180; // 3 minutes
    }

    return { methods, priority, timeout };
  }

  // Create new verification session
  createVerificationSession(
    transactionId: string,
    userId: string,
    riskScore: number
  ): VerificationSession {
    const { methods, priority, timeout } = this.getRequiredVerificationMethods(riskScore);
    
    const sessionId = `verification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const expiresAt = new Date(Date.now() + timeout * 1000).toISOString();
    
    const steps: VerificationStep[] = methods.map((method, index) => ({
      method,
      required: true,
      priority: priority[index],
      timeout,
      completed: false
    }));

    const session: VerificationSession = {
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

  // Get verification session
  getVerificationSession(sessionId: string): VerificationSession | null {
    return this.sessions.get(sessionId) || null;
  }

  // Complete verification step
  async completeVerificationStep(
    sessionId: string,
    method: VerificationMethod,
    data: any
  ): Promise<{ success: boolean; result: VerificationResult; reasons: string[] }> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return { success: false, result: VerificationResult.FAILED, reasons: ['Session not found'] };
    }

    if (session.status !== 'active') {
      return { success: false, result: VerificationResult.FAILED, reasons: ['Session not active'] };
    }

    // Check if session has expired
    if (new Date() > new Date(session.expiresAt)) {
      session.status = 'expired';
      return { success: false, result: VerificationResult.EXPIRED, reasons: ['Session expired'] };
    }

    // Find the step for this method
    const stepIndex = session.steps.findIndex(step => step.method === method);
    if (stepIndex === -1) {
      return { success: false, result: VerificationResult.FAILED, reasons: ['Method not required'] };
    }

    const step = session.steps[stepIndex];
    
    // Validate verification data based on method
    const validationResult = await this.validateVerificationData(method, data);
    if (!validationResult.success) {
      return { success: false, result: VerificationResult.FAILED, reasons: validationResult.reasons };
    }

    // Mark step as completed
    step.completed = true;
    step.data = data;

    // Create verification attempt record
    const attemptId = `attempt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const attempt: VerificationAttempt = {
      id: attemptId,
      userId: session.userId,
      transactionId: session.transactionId,
      method,
      result: VerificationResult.SUCCESS,
      reasons: ['Verification successful'],
      attemptsCount: 1,
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      data
    };

    this.attempts.set(attemptId, attempt);

    // Check if all required steps are completed
    const allRequiredCompleted = session.steps.every(step => !step.required || step.completed);
    
    if (allRequiredCompleted) {
      session.status = 'completed';
      return { success: true, result: VerificationResult.SUCCESS, reasons: ['All verification steps completed'] };
    } else {
      // Move to next step
      session.currentStep = session.steps.findIndex(step => !step.completed);
      return { success: true, result: VerificationResult.SUCCESS, reasons: ['Step completed, more steps required'] };
    }
  }

  // Validate verification data based on method
  private async validateVerificationData(
    method: VerificationMethod,
    data: any
  ): Promise<{ success: boolean; reasons: string[] }> {
    const reasons: string[] = [];

    switch (method) {
      case VerificationMethod.BIOMETRIC:
      case VerificationMethod.FINGERPRINT:
      case VerificationMethod.FACE_RECOGNITION:
        if (!data.biometricData) {
          reasons.push('Biometric data is required');
        }
        if (data.confidence && data.confidence < 0.8) {
          reasons.push('Biometric confidence too low');
        }
        break;

      case VerificationMethod.SMS_CODE:
      case VerificationMethod.EMAIL_CODE:
        if (!data.code || data.code.length !== 6) {
          reasons.push('Invalid verification code format');
        }
        // In real implementation, verify code against sent code
        break;

      case VerificationMethod.SECURITY_QUESTIONS:
        if (!data.answers || !Array.isArray(data.answers)) {
          reasons.push('Security answers are required');
        }
        // In real implementation, verify answers against stored answers
        break;

      case VerificationMethod.PIN_VERIFICATION:
        if (!data.pin || data.pin.length !== 4) {
          reasons.push('PIN must be 4 digits');
        }
        // In real implementation, verify PIN against stored PIN
        break;

      case VerificationMethod.OTP:
        if (!data.otp || !data.otpId) {
          reasons.push('OTP and OTP ID are required');
        }
        // In real implementation, verify OTP against generated OTP
        break;

      case VerificationMethod.VOICE_VERIFICATION:
        if (!data.audioBlob || !data.duration) {
          reasons.push('Voice data is required');
        }
        if (data.duration < 2) {
          reasons.push('Voice sample too short');
        }
        break;

      case VerificationMethod.LIVENESS:
        if (!data.videoBlob || !data.challengeType) {
          reasons.push('Liveness data is required');
        }
        break;

      case VerificationMethod.ID_SCAN:
      case VerificationMethod.DOCUMENT_SCAN:
        if (!data.documentImage || !data.documentType) {
          reasons.push('Document image and type are required');
        }
        break;

      default:
        reasons.push('Unsupported verification method');
    }

    return { success: reasons.length === 0, reasons };
  }

  // Get risk level from risk score
  private getRiskLevel(riskScore: number): 'low' | 'medium' | 'high' | 'critical' {
    if (riskScore >= 80) return 'critical';
    if (riskScore >= 60) return 'high';
    if (riskScore >= 40) return 'medium';
    return 'low';
  }

  // Get verification progress
  getVerificationProgress(sessionId: string): {
    completedMethods: VerificationMethod[];
    remainingMethods: VerificationMethod[];
    progress: number;
    canProceed: boolean;
  } | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

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

  // Cancel verification session
  cancelVerificationSession(sessionId: string, reason?: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    session.status = 'failed';
    return true;
  }

  // Get verification attempts for user
  getVerificationAttempts(userId: string, filters?: {
    method?: VerificationMethod;
    result?: VerificationResult;
  }): VerificationAttempt[] {
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

  // Clean up expired sessions
  cleanupExpiredSessions(): void {
    const now = new Date();
    for (const [sessionId, session] of this.sessions.entries()) {
      if (now > new Date(session.expiresAt)) {
        session.status = 'expired';
      }
    }
  }
}

export const verificationService = new VerificationService();
