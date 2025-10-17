import React, { useState, useEffect } from 'react';
import { VerificationMethod, VerificationResult } from '../types';
import { verificationAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { 
  ShieldCheckIcon,
  FingerPrintIcon,
  FaceSmileIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon,
  KeyIcon,
  QuestionMarkCircleIcon,
  MicrophoneIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

const UserVerification: React.FC = () => {
  const { user } = useAuth();
  const [availableMethods, setAvailableMethods] = useState<{
    available: VerificationMethod[];
    preferred: VerificationMethod[];
    setupRequired: VerificationMethod[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [setupInProgress, setSetupInProgress] = useState<string | null>(null);
  const [securityQuestions, setSecurityQuestions] = useState<Array<{
    id: string;
    question: string;
    answer: string;
    createdAt: string;
  }>>([]);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null);

  useEffect(() => {
    const fetchAvailableMethods = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const response = await verificationAPI.getAvailableMethods(user.id);
        setAvailableMethods(response.data);
      } catch (err) {
        console.error('Error fetching verification methods:', err);
        setError('Failed to fetch verification methods. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableMethods();
  }, [user]);

  const getMethodIcon = (method: VerificationMethod) => {
    const icons: Record<VerificationMethod, React.ReactNode> = {
      [VerificationMethod.BIOMETRIC]: <FingerPrintIcon className="h-6 w-6" />,
      [VerificationMethod.FINGERPRINT]: <FingerPrintIcon className="h-6 w-6" />,
      [VerificationMethod.FACE_RECOGNITION]: <FaceSmileIcon className="h-6 w-6" />,
      [VerificationMethod.SMS_CODE]: <DevicePhoneMobileIcon className="h-6 w-6" />,
      [VerificationMethod.EMAIL_CODE]: <EnvelopeIcon className="h-6 w-6" />,
      [VerificationMethod.SECURITY_QUESTIONS]: <QuestionMarkCircleIcon className="h-6 w-6" />,
      [VerificationMethod.VOICE_VERIFICATION]: <MicrophoneIcon className="h-6 w-6" />,
      [VerificationMethod.DOCUMENT_SCAN]: <DocumentTextIcon className="h-6 w-6" />,
      [VerificationMethod.ID_SCAN]: <DocumentTextIcon className="h-6 w-6" />,
      [VerificationMethod.PIN_VERIFICATION]: <KeyIcon className="h-6 w-6" />,
      [VerificationMethod.OTP]: <KeyIcon className="h-6 w-6" />,
      [VerificationMethod.LIVENESS]: <FaceSmileIcon className="h-6 w-6" />,
      [VerificationMethod.SELFIE]: <FaceSmileIcon className="h-6 w-6" />
    };
    return icons[method] || <ShieldCheckIcon className="h-6 w-6" />;
  };

  const getMethodDisplayName = (method: VerificationMethod): string => {
    return method.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getMethodDescription = (method: VerificationMethod): string => {
    const descriptions: Record<VerificationMethod, string> = {
      [VerificationMethod.BIOMETRIC]: 'Use your fingerprint or face for secure authentication',
      [VerificationMethod.FINGERPRINT]: 'Scan your fingerprint for quick verification',
      [VerificationMethod.FACE_RECOGNITION]: 'Use facial recognition for secure access',
      [VerificationMethod.SMS_CODE]: 'Receive verification codes via SMS',
      [VerificationMethod.EMAIL_CODE]: 'Receive verification codes via email',
      [VerificationMethod.SECURITY_QUESTIONS]: 'Answer personal security questions',
      [VerificationMethod.VOICE_VERIFICATION]: 'Use your voice for authentication',
      [VerificationMethod.DOCUMENT_SCAN]: 'Scan documents for identity verification',
      [VerificationMethod.ID_SCAN]: 'Scan your ID document for verification',
      [VerificationMethod.PIN_VERIFICATION]: 'Enter your personal identification number',
      [VerificationMethod.OTP]: 'Use one-time passwords for authentication',
      [VerificationMethod.LIVENESS]: 'Prove you are a real person with liveness detection',
      [VerificationMethod.SELFIE]: 'Take a selfie for identity verification'
    };
    return descriptions[method] || 'Secure verification method';
  };

  const handleSetupMethod = async (method: VerificationMethod) => {
    if (!user?.id) return;

    try {
      setSetupInProgress(method);
      const response = await verificationAPI.setupVerificationMethod(user.id, method, {});
      
      // In a real implementation, you would show setup instructions
      alert(`Setup instructions for ${getMethodDisplayName(method)}:\n${response.data.instructions}`);
      
    } catch (err) {
      console.error('Error setting up verification method:', err);
      alert('Failed to setup verification method. Please try again.');
    } finally {
      setSetupInProgress(null);
    }
  };

  const handleAddSecurityQuestion = async () => {
    if (!newQuestion.trim() || !newAnswer.trim()) {
      alert('Please enter both question and answer.');
      return;
    }

    try {
      const newQuestionData = {
        id: Date.now().toString(),
        question: newQuestion.trim(),
        answer: newAnswer.trim(),
        createdAt: new Date().toISOString()
      };

      setSecurityQuestions(prev => [...prev, newQuestionData]);
      setNewQuestion('');
      setNewAnswer('');
      setShowAddQuestion(false);
      
      // In a real implementation, save to backend
      console.log('Adding security question:', newQuestionData);
      
    } catch (err) {
      console.error('Error adding security question:', err);
      alert('Failed to add security question. Please try again.');
    }
  };

  const handleEditSecurityQuestion = (questionId: string, updatedQuestion: string, updatedAnswer: string) => {
    setSecurityQuestions(prev => 
      prev.map(q => 
        q.id === questionId 
          ? { ...q, question: updatedQuestion, answer: updatedAnswer }
          : q
      )
    );
    setEditingQuestion(null);
  };

  const handleDeleteSecurityQuestion = (questionId: string) => {
    if (window.confirm('Are you sure you want to delete this security question?')) {
      setSecurityQuestions(prev => prev.filter(q => q.id !== questionId));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Verification Methods</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your verification methods for secure transactions.
        </p>
      </div>

      {/* Security Overview */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center">
          <ShieldCheckIcon className="h-8 w-8 text-blue-600 mr-3" />
          <div>
            <h3 className="text-lg font-medium text-blue-900">Enhanced Security</h3>
            <p className="text-blue-700 mt-1">
              Multiple verification methods provide additional security for your transactions. 
              The more methods you have set up, the more secure your account becomes.
            </p>
          </div>
        </div>
      </div>

      {/* Available Methods */}
      {availableMethods && (
        <div className="space-y-6">
          {/* Currently Available */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Available Methods</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableMethods.available.map((method) => (
                <div key={method} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 text-blue-600">
                      {getMethodIcon(method)}
                    </div>
                    <div className="ml-3 flex-1">
                      <h3 className="text-sm font-medium text-gray-900">
                        {getMethodDisplayName(method)}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {getMethodDescription(method)}
                      </p>
                      <div className="mt-3 flex items-center">
                        <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-xs text-green-600 font-medium">Ready to use</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Setup Required */}
          {availableMethods.setupRequired.length > 0 && (
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Additional Security Methods</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableMethods.setupRequired.map((method) => (
                  <div key={method} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 text-gray-400">
                        {getMethodIcon(method)}
                      </div>
                      <div className="ml-3 flex-1">
                        <h3 className="text-sm font-medium text-gray-900">
                          {getMethodDisplayName(method)}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {getMethodDescription(method)}
                        </p>
                        <div className="mt-3">
                          <button
                            onClick={() => handleSetupMethod(method)}
                            disabled={setupInProgress === method}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {setupInProgress === method ? (
                              <>
                                <ClockIcon className="h-3 w-3 mr-1 animate-spin" />
                                Setting up...
                              </>
                            ) : (
                              'Setup'
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preferred Methods */}
          {availableMethods.preferred.length > 0 && (
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Your Preferred Methods</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableMethods.preferred.map((method) => (
                  <div key={method} className="border border-green-200 bg-green-50 rounded-lg p-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 text-green-600">
                        {getMethodIcon(method)}
                      </div>
                      <div className="ml-3 flex-1">
                        <h3 className="text-sm font-medium text-green-900">
                          {getMethodDisplayName(method)}
                        </h3>
                        <p className="text-sm text-green-700 mt-1">
                          {getMethodDescription(method)}
                        </p>
                        <div className="mt-3 flex items-center">
                          <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />
                          <span className="text-xs text-green-600 font-medium">Preferred method</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Security Questions Management */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Security Questions</h3>
            <p className="text-sm text-gray-500 mt-1">
              Set up personal security questions for additional verification during transactions.
            </p>
          </div>
          <button
            onClick={() => setShowAddQuestion(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Question
          </button>
        </div>

        {/* Add New Question Form */}
        {showAddQuestion && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <h4 className="text-md font-medium text-gray-900 mb-4">Add New Security Question</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Security Question
                </label>
                <input
                  type="text"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="e.g., What was the name of your first pet?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Answer
                </label>
                <input
                  type="text"
                  value={newAnswer}
                  onChange={(e) => setNewAnswer(e.target.value)}
                  placeholder="Your answer to the question"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowAddQuestion(false);
                    setNewQuestion('');
                    setNewAnswer('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddSecurityQuestion}
                  className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Add Question
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Security Questions List */}
        {securityQuestions.length > 0 ? (
          <div className="space-y-4">
            {securityQuestions.map((question) => (
              <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                {editingQuestion === question.id ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Security Question
                      </label>
                      <input
                        type="text"
                        defaultValue={question.question}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        id={`edit-question-${question.id}`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Answer
                      </label>
                      <input
                        type="text"
                        defaultValue={question.answer}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        id={`edit-answer-${question.id}`}
                      />
                    </div>
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => setEditingQuestion(null)}
                        className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          const updatedQuestion = (document.getElementById(`edit-question-${question.id}`) as HTMLInputElement)?.value || question.question;
                          const updatedAnswer = (document.getElementById(`edit-answer-${question.id}`) as HTMLInputElement)?.value || question.answer;
                          handleEditSecurityQuestion(question.id, updatedQuestion, updatedAnswer);
                        }}
                        className="px-3 py-1.5 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <QuestionMarkCircleIcon className="h-5 w-5 text-blue-600 mr-2" />
                        <h4 className="text-sm font-medium text-gray-900">Question</h4>
                      </div>
                      <p className="text-sm text-gray-700 mt-1">{question.question}</p>
                      <div className="mt-2">
                        <span className="text-xs text-gray-500">Answer: </span>
                        <span className="text-xs text-gray-700">••••••••</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        Added on {new Date(question.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => setEditingQuestion(question.id)}
                        className="p-1 text-gray-400 hover:text-blue-600"
                        title="Edit question"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSecurityQuestion(question.id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                        title="Delete question"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <QuestionMarkCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-sm font-medium text-gray-900 mb-2">No security questions set up</h3>
            <p className="text-sm text-gray-500 mb-4">
              Add security questions to enhance your account security.
            </p>
            <button
              onClick={() => setShowAddQuestion(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Your First Question
            </button>
          </div>
        )}

        {/* Security Questions Tips */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Security Question Tips</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Choose questions only you know the answer to</li>
            <li>• Use questions with answers that won't change over time</li>
            <li>• Avoid questions with answers that can be found on social media</li>
            <li>• Keep your answers private and don't share them with anyone</li>
          </ul>
        </div>
      </div>

      {/* Security Tips */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-yellow-900 mb-3">Security Tips</h3>
        <ul className="text-yellow-800 space-y-2">
          <li className="flex items-start">
            <CheckCircleIcon className="h-4 w-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
            <span className="text-sm">Set up multiple verification methods for maximum security</span>
          </li>
          <li className="flex items-start">
            <CheckCircleIcon className="h-4 w-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
            <span className="text-sm">Keep your verification methods up to date</span>
          </li>
          <li className="flex items-start">
            <CheckCircleIcon className="h-4 w-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
            <span className="text-sm">Never share your verification codes with anyone</span>
          </li>
          <li className="flex items-start">
            <CheckCircleIcon className="h-4 w-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
            <span className="text-sm">Report any suspicious verification attempts immediately</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default UserVerification;
