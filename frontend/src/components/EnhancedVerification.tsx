import React, { useState, useEffect } from 'react';
import { VerificationMethod, VerificationResult } from '../types';
import { verificationAPI } from '../services/api';

interface EnhancedVerificationProps {
  transactionId: string;
  riskScore: number;
  onVerificationComplete: (result: VerificationResult) => void;
  onVerificationCancel: () => void;
}

interface VerificationStep {
  method: VerificationMethod;
  completed: boolean;
  required: boolean;
  data?: any;
}

const EnhancedVerification: React.FC<EnhancedVerificationProps> = ({
  transactionId,
  riskScore,
  onVerificationComplete,
  onVerificationCancel
}) => {
  const [verificationSteps, setVerificationSteps] = useState<VerificationStep[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [attemptId, setAttemptId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);

  // Initialize verification based on risk score
  useEffect(() => {
    const initializeVerification = async () => {
      try {
        setLoading(true);
        
        // Get required verification methods based on risk score
        const methodsResponse = await verificationAPI.getRequiredVerificationMethods(transactionId, riskScore);
        const requiredMethods = methodsResponse.data.methods;
        
        // Start verification process
        const startResponse = await verificationAPI.startVerification(transactionId, requiredMethods);
        setAttemptId(startResponse.data.attemptId);
        
        // Initialize steps
        const steps: VerificationStep[] = requiredMethods.map(method => ({
          method,
          completed: false,
          required: true
        }));
        
        setVerificationSteps(steps);
        setCurrentStep(0);
        
      } catch (err) {
        setError('Failed to initialize verification process');
        console.error('Verification initialization error:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeVerification();
  }, [transactionId, riskScore]);

  const getMethodDisplayName = (method: VerificationMethod): string => {
    return method.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getMethodIcon = (method: VerificationMethod): string => {
    const icons: Record<VerificationMethod, string> = {
      [VerificationMethod.ID_SCAN]: '🆔',
      [VerificationMethod.LIVENESS]: '👁️',
      [VerificationMethod.SELFIE]: '📸',
      [VerificationMethod.FINGERPRINT]: '👆',
      [VerificationMethod.FACE_RECOGNITION]: '👤',
      [VerificationMethod.SMS_CODE]: '📱',
      [VerificationMethod.EMAIL_CODE]: '📧',
      [VerificationMethod.SECURITY_QUESTIONS]: '❓',
      [VerificationMethod.VOICE_VERIFICATION]: '🎤',
      [VerificationMethod.DOCUMENT_SCAN]: '📄',
      [VerificationMethod.BIOMETRIC]: '🔐',
      [VerificationMethod.PIN_VERIFICATION]: '🔢',
      [VerificationMethod.OTP]: '🔑'
    };
    return icons[method] || '✅';
  };

  const handleMethodCompletion = async (method: VerificationMethod, data: any) => {
    try {
      setLoading(true);
      setError(null);

      let response;
      
      switch (method) {
        case VerificationMethod.BIOMETRIC:
        case VerificationMethod.FINGERPRINT:
        case VerificationMethod.FACE_RECOGNITION:
          response = await verificationAPI.submitBiometricVerification(attemptId, {
            type: method === VerificationMethod.FINGERPRINT ? 'fingerprint' : 
                  method === VerificationMethod.FACE_RECOGNITION ? 'face' : 'fingerprint',
            data: data.biometricData,
            confidence: data.confidence
          });
          break;

        case VerificationMethod.ID_SCAN:
        case VerificationMethod.DOCUMENT_SCAN:
          response = await verificationAPI.submitDocumentVerification(attemptId, {
            type: method === VerificationMethod.ID_SCAN ? 'id_scan' : 'document_scan',
            documentImage: data.documentImage,
            documentType: data.documentType,
            extractedData: data.extractedData
          });
          break;

        case VerificationMethod.SMS_CODE:
          response = await verificationAPI.verifySMSCode(attemptId, data.code);
          break;

        case VerificationMethod.EMAIL_CODE:
          response = await verificationAPI.verifyEmailCode(attemptId, data.code);
          break;

        case VerificationMethod.SECURITY_QUESTIONS:
          response = await verificationAPI.submitSecurityAnswers(attemptId, data.answers);
          break;

        case VerificationMethod.PIN_VERIFICATION:
          response = await verificationAPI.verifyPIN(attemptId, data.pin);
          break;

        case VerificationMethod.OTP:
          response = await verificationAPI.verifyOTP(attemptId, data.otp, data.otpId);
          break;

        case VerificationMethod.VOICE_VERIFICATION:
          response = await verificationAPI.submitVoiceVerification(attemptId, {
            audioBlob: data.audioBlob,
            duration: data.duration,
            language: data.language
          });
          break;

        case VerificationMethod.LIVENESS:
          response = await verificationAPI.submitLivenessCheck(attemptId, {
            videoBlob: data.videoBlob,
            challengeType: data.challengeType,
            response: data.response
          });
          break;

        default:
          response = await verificationAPI.submitVerification(attemptId, data);
      }

      if (response.data.result === VerificationResult.SUCCESS) {
        // Mark step as completed
        const updatedSteps = verificationSteps.map((step, index) => 
          index === currentStep ? { ...step, completed: true, data } : step
        );
        setVerificationSteps(updatedSteps);

        // Move to next step or complete verification
        if (currentStep < verificationSteps.length - 1) {
          setCurrentStep(currentStep + 1);
        } else {
          // All steps completed
          onVerificationComplete(VerificationResult.SUCCESS);
        }
      } else {
        setError(`Verification failed: ${response.data.result}`);
      }

    } catch (err) {
      setError(`Failed to complete ${getMethodDisplayName(method)} verification`);
      console.error('Verification error:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderVerificationStep = (step: VerificationStep, index: number) => {
    const isActive = index === currentStep;
    const isCompleted = step.completed;
    const isUpcoming = index > currentStep;

    return (
      <div
        key={step.method}
        className={`p-4 border rounded-lg ${
          isActive ? 'border-blue-500 bg-blue-50' :
          isCompleted ? 'border-green-500 bg-green-50' :
          isUpcoming ? 'border-gray-300 bg-gray-50' :
          'border-gray-300'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getMethodIcon(step.method)}</span>
            <div>
              <h3 className="font-medium text-gray-900">
                {getMethodDisplayName(step.method)}
              </h3>
              <p className="text-sm text-gray-500">
                {step.required ? 'Required' : 'Optional'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isCompleted && (
              <span className="text-green-600 text-sm font-medium">✓ Completed</span>
            )}
            {isActive && (
              <span className="text-blue-600 text-sm font-medium">Current Step</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderCurrentStepInterface = () => {
    if (currentStep >= verificationSteps.length) return null;

    const currentMethod = verificationSteps[currentStep].method;

    switch (currentMethod) {
      case VerificationMethod.BIOMETRIC:
      case VerificationMethod.FINGERPRINT:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Biometric Verification</h3>
            <p className="text-gray-600">Please place your finger on the sensor</p>
            <button
              onClick={() => handleMethodCompletion(currentMethod, {
                biometricData: 'mock_fingerprint_data',
                confidence: 0.95
              })}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            >
              Scan Fingerprint
            </button>
          </div>
        );

      case VerificationMethod.FACE_RECOGNITION:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Face Recognition</h3>
            <p className="text-gray-600">Please look at the camera</p>
            <button
              onClick={() => handleMethodCompletion(currentMethod, {
                biometricData: 'mock_face_data',
                confidence: 0.92
              })}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            >
              Scan Face
            </button>
          </div>
        );

      case VerificationMethod.SMS_CODE:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">SMS Verification</h3>
            <p className="text-gray-600">We've sent a code to your phone</p>
            <input
              type="text"
              placeholder="Enter SMS code"
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              onChange={(e) => {
                if (e.target.value.length === 6) {
                  handleMethodCompletion(currentMethod, { code: e.target.value });
                }
              }}
            />
          </div>
        );

      case VerificationMethod.EMAIL_CODE:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Email Verification</h3>
            <p className="text-gray-600">We've sent a code to your email</p>
            <input
              type="text"
              placeholder="Enter email code"
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              onChange={(e) => {
                if (e.target.value.length === 6) {
                  handleMethodCompletion(currentMethod, { code: e.target.value });
                }
              }}
            />
          </div>
        );

      case VerificationMethod.PIN_VERIFICATION:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">PIN Verification</h3>
            <p className="text-gray-600">Enter your PIN</p>
            <input
              type="password"
              placeholder="Enter PIN"
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              onChange={(e) => {
                if (e.target.value.length === 4) {
                  handleMethodCompletion(currentMethod, { pin: e.target.value });
                }
              }}
            />
          </div>
        );

      case VerificationMethod.SECURITY_QUESTIONS:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Security Questions</h3>
            <p className="text-gray-600">Answer the security questions</p>
            <div className="space-y-2">
              <label className="block text-sm font-medium">What is your mother's maiden name?</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                onChange={(e) => {
                  if (e.target.value) {
                    handleMethodCompletion(currentMethod, {
                      answers: [{ questionId: '1', answer: e.target.value }]
                    });
                  }
                }}
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{getMethodDisplayName(currentMethod)}</h3>
            <p className="text-gray-600">Complete this verification step</p>
            <button
              onClick={() => handleMethodCompletion(currentMethod, {})}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            >
              Complete {getMethodDisplayName(currentMethod)}
            </button>
          </div>
        );
    }
  };

  if (loading && !attemptId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Enhanced Verification</h2>
        <p className="text-gray-600 mt-2">
          Complete the required verification steps to proceed with your transaction
        </p>
        <div className="mt-4">
          <div className="bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / verificationSteps.length) * 100}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Step {currentStep + 1} of {verificationSteps.length}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Verification Steps</h3>
          {verificationSteps.map((step, index) => renderVerificationStep(step, index))}
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Current Step</h3>
          {renderCurrentStepInterface()}
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <button
          onClick={onVerificationCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel Verification
        </button>
        <div className="text-sm text-gray-500">
          Risk Score: {riskScore}/100
        </div>
      </div>
    </div>
  );
};

export default EnhancedVerification;
