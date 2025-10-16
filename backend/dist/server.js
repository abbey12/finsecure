"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const PORT = process.env.PORT || 5001;
app_1.default.listen(PORT, () => {
    console.log(`🚀 Finsecure Backend Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`💰 Currency: ${process.env.DEFAULT_CURRENCY || 'GHS'}`);
    console.log(`🇬🇭 Country: ${process.env.DEFAULT_COUNTRY || 'GH'}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
});
//# sourceMappingURL=server.js.map