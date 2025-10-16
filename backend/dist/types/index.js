"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerificationResult = exports.VerificationMethod = exports.RuleType = exports.AlertStatus = exports.AlertType = exports.AlertSeverity = exports.LocationSource = exports.TransactionStatus = exports.TransactionDecision = exports.TransactionChannel = exports.UserStatus = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "admin";
    UserRole["ANALYST"] = "analyst";
    UserRole["REGULAR"] = "regular";
})(UserRole || (exports.UserRole = UserRole = {}));
var UserStatus;
(function (UserStatus) {
    UserStatus["ACTIVE"] = "active";
    UserStatus["INACTIVE"] = "inactive";
    UserStatus["SUSPENDED"] = "suspended";
})(UserStatus || (exports.UserStatus = UserStatus = {}));
var TransactionChannel;
(function (TransactionChannel) {
    TransactionChannel["MOBILE_APP"] = "mobile_app";
    TransactionChannel["WEB"] = "web";
    TransactionChannel["API"] = "api";
    TransactionChannel["ATM"] = "atm";
    TransactionChannel["POS"] = "pos";
})(TransactionChannel || (exports.TransactionChannel = TransactionChannel = {}));
var TransactionDecision;
(function (TransactionDecision) {
    TransactionDecision["ALLOW"] = "allow";
    TransactionDecision["CHALLENGE"] = "challenge";
    TransactionDecision["DENY"] = "deny";
})(TransactionDecision || (exports.TransactionDecision = TransactionDecision = {}));
var TransactionStatus;
(function (TransactionStatus) {
    TransactionStatus["PENDING"] = "pending";
    TransactionStatus["COMPLETED"] = "completed";
    TransactionStatus["FAILED"] = "failed";
    TransactionStatus["CANCELLED"] = "cancelled";
})(TransactionStatus || (exports.TransactionStatus = TransactionStatus = {}));
var LocationSource;
(function (LocationSource) {
    LocationSource["GPS"] = "gps";
    LocationSource["IP"] = "ip";
    LocationSource["MANUAL"] = "manual";
})(LocationSource || (exports.LocationSource = LocationSource = {}));
var AlertSeverity;
(function (AlertSeverity) {
    AlertSeverity["LOW"] = "low";
    AlertSeverity["MEDIUM"] = "medium";
    AlertSeverity["HIGH"] = "high";
    AlertSeverity["CRITICAL"] = "critical";
})(AlertSeverity || (exports.AlertSeverity = AlertSeverity = {}));
var AlertType;
(function (AlertType) {
    AlertType["SUSPICIOUS_TRANSACTION"] = "suspicious_transaction";
    AlertType["LOCATION_ANOMALY"] = "location_anomaly";
    AlertType["AMOUNT_ANOMALY"] = "amount_anomaly";
    AlertType["VELOCITY_EXCEEDED"] = "velocity_exceeded";
    AlertType["NEW_DEVICE"] = "new_device";
    AlertType["UNUSUAL_TIME"] = "unusual_time";
})(AlertType || (exports.AlertType = AlertType = {}));
var AlertStatus;
(function (AlertStatus) {
    AlertStatus["OPEN"] = "open";
    AlertStatus["IN_PROGRESS"] = "in_progress";
    AlertStatus["RESOLVED"] = "resolved";
    AlertStatus["CLOSED"] = "closed";
})(AlertStatus || (exports.AlertStatus = AlertStatus = {}));
var RuleType;
(function (RuleType) {
    RuleType["AMOUNT_THRESHOLD"] = "amount_threshold";
    RuleType["VELOCITY_LIMIT"] = "velocity_limit";
    RuleType["LOCATION_ANOMALY"] = "location_anomaly";
    RuleType["DEVICE_CHANGE"] = "device_change";
    RuleType["NEW_PAYEE"] = "new_payee";
    RuleType["TIME_ANOMALY"] = "time_anomaly";
})(RuleType || (exports.RuleType = RuleType = {}));
var VerificationMethod;
(function (VerificationMethod) {
    VerificationMethod["ID_SCAN"] = "id_scan";
    VerificationMethod["LIVENESS"] = "liveness";
    VerificationMethod["SELFIE"] = "selfie";
    VerificationMethod["FINGERPRINT"] = "fingerprint";
    VerificationMethod["FACE_RECOGNITION"] = "face_recognition";
    VerificationMethod["SMS_CODE"] = "sms_code";
    VerificationMethod["EMAIL_CODE"] = "email_code";
    VerificationMethod["SECURITY_QUESTIONS"] = "security_questions";
    VerificationMethod["VOICE_VERIFICATION"] = "voice_verification";
    VerificationMethod["DOCUMENT_SCAN"] = "document_scan";
    VerificationMethod["BIOMETRIC"] = "biometric";
    VerificationMethod["PIN_VERIFICATION"] = "pin_verification";
    VerificationMethod["OTP"] = "otp";
})(VerificationMethod || (exports.VerificationMethod = VerificationMethod = {}));
var VerificationResult;
(function (VerificationResult) {
    VerificationResult["SUCCESS"] = "success";
    VerificationResult["PENDING"] = "pending";
    VerificationResult["FAILED"] = "failed";
    VerificationResult["EXPIRED"] = "expired";
})(VerificationResult || (exports.VerificationResult = VerificationResult = {}));
//# sourceMappingURL=index.js.map