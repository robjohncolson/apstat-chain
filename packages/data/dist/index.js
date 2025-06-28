"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ALL_QUESTIONS = exports.ALL_LESSONS = void 0;
const lessons_export_json_1 = __importDefault(require("./lessons_export.json"));
const questions_export_json_1 = __importDefault(require("./questions_export.json"));
/**
 * All lessons data typed as Lesson array
 */
exports.ALL_LESSONS = lessons_export_json_1.default;
/**
 * All questions data typed as QuizQuestion array
 */
exports.ALL_QUESTIONS = questions_export_json_1.default;
// Re-export all types
__exportStar(require("./types"), exports);
