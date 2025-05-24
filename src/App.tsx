// --- src/App.tsx ---
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';

// Component to hold all CSS styles
const AppStyles = () => (
    <style>{`
    /* Reset and Global Styles */
    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
        'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
        sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      line-height: 1.5;
    }

    * {
      box-sizing: border-box;
    }

    /* Base App Styles */
    .app-container {
      padding: 1rem; /* p-4 */
      background-color: #f1f5f9; /* bg-slate-100 */
      min-height: 100vh;
      color: #1e293b; /* text-slate-800 */
    }
    @media (prefers-color-scheme: dark) {
      .app-container {
        background-color: #020617; /* dark:bg-slate-950 */
        color: #e2e8f0; /* dark:text-slate-200 */
      }
    }
    @media (min-width: 640px) { /* sm: */
      .app-container { padding: 1.5rem; } /* sm:p-6 */
    }
    @media (min-width: 768px) { /* md: */
      .app-container { padding: 2rem; } /* md:p-8 */
    }
    @media (min-width: 1024px) { /* lg: */
      .app-container { padding: 2.5rem; } /* lg:p-10 */
    }

    .sticky-header {
      position: sticky;
      top: 0;
      z-index: 40;
      padding-top: 0.75rem;
      padding-bottom: 0.75rem;
      margin-left: -1rem; margin-right: -1rem; /* -mx-4 */
      padding-left: 1rem; padding-right: 1rem; /* px-4 */
      margin-bottom: 1.5rem; /* mb-6 */
      background-color: rgba(241, 245, 249, 0.8); /* bg-slate-100/80 */
      backdrop-filter: blur(8px); /* backdrop-blur-md */
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); /* shadow-sm */
    }
    @media (prefers-color-scheme: dark) {
      .sticky-header {
        background-color: rgba(2, 6, 23, 0.8); /* dark:bg-slate-950/80 */
      }
    }
    @media (min-width: 640px) { /* sm: */
      .sticky-header { margin-left: -1.5rem; margin-right: -1.5rem; padding-left: 1.5rem; padding-right: 1.5rem; }
    }
    @media (min-width: 768px) { /* md: */
      .sticky-header { margin-left: -2rem; margin-right: -2rem; padding-left: 2rem; padding-right: 2rem; }
    }
    @media (min-width: 1024px) { /* lg: */
      .sticky-header { margin-left: -2.5rem; margin-right: -2.5rem; padding-left: 2.5rem; padding-right: 2.5rem; }
    }
    
    .header-content {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem; /* gap-3 */
    }
    .header-left, .header-right {
      display: flex;
      align-items: center;
      gap: 0.5rem; /* gap-2 */
    }
    @media (min-width: 640px) { /* sm: */
      .header-right { gap: 0.75rem; } /* sm:gap-3 */
    }
    .app-title {
      font-size: 1.25rem; /* text-xl */
      font-weight: 700; /* font-bold */
      color: #0f172a; /* text-slate-900 */
    }
    @media (prefers-color-scheme: dark) {
      .app-title { color: #f1f5f9; } /* dark:text-slate-100 */
    }
    @media (min-width: 640px) { /* sm: */
      .app-title { font-size: 1.5rem; } /* sm:text-2xl */
    }

    .save-status {
      font-size: 0.75rem; /* text-xs */
      width: 7rem; /* w-28 */
      text-align: right;
      transition-property: opacity;
      transition-duration: 300ms;
    }
    .save-status-visible { opacity: 1; }
    .save-status-hidden { opacity: 0; }
    .status-unsaved { color: #d97706; } /* text-amber-600 */
    .status-saving { color: #64748b; } /* text-slate-500 */
    .status-saved { color: #16a34a; } /* text-green-600 */
    .status-error { color: #ef4444; } /* text-red-500 */
    @media (prefers-color-scheme: dark) {
      .status-unsaved { color: #fbbf24; } /* dark:text-amber-400 */
      .status-saving { color: #94a3b8; } /* dark:text-slate-400 */
      .status-saved { color: #4ade80; } /* dark:text-green-400 */
      .status-error { color: #f87171; } /* dark:text-red-400 */
    }

    /* Button Styles */
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 0.375rem; /* rounded-md */
      font-size: 0.875rem; /* text-sm */
      font-weight: 500; /* font-medium */
      transition: background-color 0.2s, color 0.2s, border-color 0.2s, box-shadow 0.2s;
      border: 1px solid transparent;
      cursor: pointer;
      padding: 0.5rem 1rem; /* h-10 px-4 py-2 */
      height: 2.5rem;
    }
    .btn:focus-visible {
      outline: 2px solid #0f172a; /* focus-visible:ring-slate-950 */
      outline-offset: 2px;
    }
    .btn:disabled {
      pointer-events: none;
      opacity: 0.5;
    }

    .btn-default {
      background-color: #0f172a; /* bg-slate-900 */
      color: #f8fafc; /* text-slate-50 */
    }
    .btn-default:hover {
      background-color: #1e293b; /* hover:bg-slate-900/90 (approx) */
    }
    @media (prefers-color-scheme: dark) {
      .btn-default {
        background-color: #f8fafc; /* dark:bg-slate-50 */
        color: #0f172a; /* dark:text-slate-900 */
      }
      .btn-default:hover {
        background-color: #e2e8f0; /* dark:hover:bg-slate-50/90 (approx) */
      }
    }
    
    .btn-ghost {
      background-color: transparent;
      border-color: transparent;
      color: #475569; /* text-slate-600 (example) */
    }
    .btn-ghost:hover {
      background-color: #f1f5f9; /* hover:bg-slate-100 */
      color: #0f172a; /* hover:text-slate-900 */
    }
    @media (prefers-color-scheme: dark) {
      .btn-ghost { color: #94a3b8; } /* dark:text-slate-300 (example) */
      .btn-ghost:hover {
        background-color: #1e293b; /* dark:hover:bg-slate-800 */
        color: #f8fafc; /* dark:hover:text-slate-50 */
      }
    }
    
    .btn-link {
      color: #0f172a; /* text-slate-900 */
      text-decoration-line: underline;
      text-underline-offset: 4px;
      background-color: transparent;
      border: none;
    }
    .btn-link:hover {
      /* text-decoration: underline; (already there) */
    }
    @media (prefers-color-scheme: dark) {
      .btn-link { color: #f8fafc; } /* dark:text-slate-50 */
    }

    .btn-size-icon {
      height: 2.5rem; /* h-10 */
      width: 2.5rem; /* w-10 */
      padding: 0;
    }
    .btn-size-sm {
      height: 2.25rem; /* h-9 */
      padding-left: 0.75rem; /* px-3 */
      padding-right: 0.75rem;
    }
    .btn-size-xs { /* Custom for header buttons */
        font-size: 0.75rem; /* text-xs */
        padding: 0.5rem 0.75rem; /* py-2 px-3 */
        height: auto;
    }
    @media (min-width: 640px) { /* sm: */
      .btn-size-xs-sm { font-size: 0.875rem; } /* sm:text-sm */
    }

    .btn-loadall {
      background-color: #64748b; /* bg-slate-500 */
      color: white;
    }
    .btn-loadall:hover { background-color: #475569; } /* hover:bg-slate-600 */

    .btn-manualsave {
      background-color: #2563eb; /* bg-blue-600 */
      color: white;
    }
    .btn-manualsave:hover { background-color: #1d4ed8; } /* hover:bg-blue-700 */
    .btn-manualsave svg { margin-right: 0.375rem; } /* mr-1.5 */
    
    .btn-open-menu {
      color: #475569; /* text-slate-600 */
    }
    .btn-open-menu:hover {
      background-color: #e2e8f0; /* hover:bg-slate-200 */
    }
    @media (prefers-color-scheme: dark) {
      .btn-open-menu { color: #cbd5e1; } /* dark:text-slate-300 */
      .btn-open-menu:hover {
        background-color: #1e293b; /* dark:hover:bg-slate-800 */
      }
    }

    /* Input Styles */
    .input-base {
      display: flex;
      height: 2.5rem; /* h-10 */
      width: 100%;
      border-radius: 0.375rem; /* rounded-md */
      border: 1px solid #cbd5e1; /* border-slate-300 */
      background-color: white;
      padding: 0.5rem 0.75rem; /* px-3 py-2 */
      font-size: 0.875rem; /* text-sm */
      color: #334155; /* text-slate-700 */
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .input-base::placeholder {
      color: #64748b; /* placeholder:text-slate-500 */
    }
    .input-base:focus-visible {
      outline: 2px solid #0f172a; /* focus-visible:ring-slate-950 */
      outline-offset: 2px;
      border-color: #0f172a; /* To match ring color */
    }
    .input-base:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }
    @media (prefers-color-scheme: dark) {
      .input-base {
        border-color: #334155; /* dark:border-slate-700 */
        background-color: #0f172a; /* dark:bg-slate-900 */
        color: #cbd5e1; /* dark:text-slate-300 */
      }
      .input-base::placeholder {
        color: #475569; /* dark:placeholder:text-slate-600 */
      }
    }
    
    .input-readonly {
      margin-top: 0.25rem;
      background-color: #f1f5f9; /* bg-slate-100 */
      color: #475569; /* text-slate-600 */
      cursor: not-allowed;
    }
    .input-readonly:focus-visible {
      outline: none;
      border-color: #cbd5e1;
    }
    @media (prefers-color-scheme: dark) {
      .input-readonly {
        background-color: #1e293b; /* dark:bg-slate-800 */
        color: #94a3b8; /* dark:text-slate-400 */
      }
       .input-readonly:focus-visible {
        border-color: #334155;
      }
    }

    .input-project-name {
      font-size: 1.5rem; /* text-2xl */
      font-weight: 600; /* font-semibold */
      color: #1e293b; /* text-slate-800 */
      border-width: 0 0 2px 0;
      border-color: transparent;
      padding: 0.25rem; /* p-1 */
      flex-grow: 1;
      background-color: transparent;
    }
    .input-project-name:hover {
      border-color: #cbd5e1; /* hover:border-slate-300 */
    }
    .input-project-name:focus {
      border-color: #2563eb; /* focus:border-blue-500 */
      outline: none;
    }
    @media (prefers-color-scheme: dark) {
      .input-project-name {
        color: #f1f5f9; /* dark:text-slate-100 */
      }
      .input-project-name:hover {
        border-color: #334155; /* dark:hover:border-slate-700 */
      }
      .input-project-name:focus {
        border-color: #60a5fa; /* dark:focus:border-blue-500 */
      }
    }
    
    .input-wall-name { /* Used in WallInputCard */
        font-size: 1.125rem; /* text-lg */
        font-weight: 500; /* font-medium */
        color: #1d4ed8; /* text-blue-700 */
        border-width: 0;
        padding: 0;
        background-color: transparent;
        flex-grow: 1;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
    }
    .input-wall-name:focus { outline: none; }
    @media (prefers-color-scheme: dark) {
        .input-wall-name { color: #60a5fa; } /* dark:text-blue-400 */
    }

    .input-room-name { /* Used in Room section */
        font-size: 1.125rem; /* text-lg */
        font-weight: 500; /* font-medium */
        color: #0f766e; /* text-teal-700 */
        border-width: 0;
        padding: 0;
        background-color: transparent;
        flex-grow: 1;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
    }
    .input-room-name:focus { outline: none; }
    @media (prefers-color-scheme: dark) {
        .input-room-name { color: #2dd4bf; } /* dark:text-teal-400 */
    }


    /* Textarea Styles */
    .textarea-base {
      display: flex;
      min-height: 80px;
      width: 100%;
      border-radius: 0.375rem;
      border: 1px solid #cbd5e1;
      background-color: white;
      padding: 0.5rem 0.75rem;
      font-size: 0.875rem;
      color: #334155;
    }
    .textarea-base::placeholder { color: #64748b; }
    .textarea-base:focus-visible {
      outline: 2px solid #0f172a;
      outline-offset: 2px;
    }
    .textarea-base:disabled { cursor: not-allowed; opacity: 0.5; }
    @media (prefers-color-scheme: dark) {
      .textarea-base {
        border-color: #334155;
        background-color: #0f172a;
        color: #cbd5e1;
      }
      .textarea-base::placeholder { color: #475569; }
    }
    .textarea-h-20 { height: 5rem; } /* h-20 */

    /* Label Styles */
    .label-base {
      display: block;
      font-size: 0.875rem; /* text-sm */
      font-weight: 500; /* font-medium */
      color: #1e293b; /* text-slate-800 */
      margin-bottom: 0.375rem; /* mb-1.5 */
    }
    @media (prefers-color-scheme: dark) {
      .label-base { color: #e2e8f0; } /* dark:text-slate-200 */
    }
    .label-xs { font-size: 0.75rem; } /* text-xs */

    /* Card Styles */
    .card-base {
      background-color: white;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1); /* shadow-lg */
      border-radius: 0.75rem; /* rounded-xl */
      border: 1px solid #e2e8f0; /* border-slate-200 */
    }
    @media (prefers-color-scheme: dark) {
      .card-base {
        background-color: #0f172a; /* dark:bg-slate-900 */
        border-color: #1e293b; /* dark:border-slate-800 */
      }
    }
    .card-mb-6 { margin-bottom: 1.5rem; }
    .card-mb-8 { margin-bottom: 2rem; }
    .card-my-8 { margin-top: 2rem; margin-bottom: 2rem; }

    .card-header-base {
      padding: 1rem; /* p-4 */
      border-bottom: 1px solid #e2e8f0;
    }
    @media (min-width: 640px) { /* sm: */
      .card-header-base { padding: 1.25rem; } /* sm:p-5 */
    }
    @media (prefers-color-scheme: dark) {
      .card-header-base { border-color: #1e293b; }
    }
    
    .card-header-flex {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
    .card-header-flex-column-sm { /* For Rooms header */
        flex-direction: column;
        align-items: flex-start;
        gap: 0.75rem;
    }
    @media (min-width: 640px) { /* sm: */
      .card-header-flex-column-sm {
        flex-direction: row;
        align-items: center;
      }
    }


    .card-header-interactive:hover {
        background-color: #f8fafc; /* hover:bg-slate-50 */
    }
    @media (prefers-color-scheme: dark) {
        .card-header-interactive:hover {
            background-color: rgba(30, 41, 59, 0.6); /* dark:hover:bg-slate-800/60 */
        }
    }
    
    .card-header-wall { /* Specific for WallInputCard header */
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        padding-top: 0.75rem; /* py-3 */
        padding-bottom: 0.75rem;
        padding-left: 1rem; /* px-4 */
        padding-right: 1rem;
        background-color: #f8fafc; /* bg-slate-50 */
        border-top-left-radius: 0.75rem; /* rounded-t-lg */
        border-top-right-radius: 0.75rem;
        cursor: pointer;
    }
    @media (min-width: 640px) { /* sm: */
      .card-header-wall { padding-left: 1.25rem; padding-right: 1.25rem; } /* sm:px-5 */
    }
    @media (prefers-color-scheme: dark) {
      .card-header-wall { background-color: rgba(30, 41, 59, 0.5); } /* dark:bg-slate-800/50 */
    }


    .card-title-base {
      font-size: 1.125rem; /* text-lg */
      font-weight: 600; /* font-semibold */
      line-height: 1.375; /* leading-tight */
      letter-spacing: -0.025em; /* tracking-tight */
      color: #0f172a;
    }
    @media (min-width: 640px) { /* sm: */
      .card-title-base { font-size: 1.25rem; } /* sm:text-xl */
    }
    @media (prefers-color-scheme: dark) {
      .card-title-base { color: #f1f5f9; }
    }
    .card-title-sky { color: #0369a1; } /* text-sky-600 */
    @media (prefers-color-scheme: dark) { .card-title-sky { color: #38bdf8; } } /* dark:text-sky-400 */
    .card-title-blue { color: #1d4ed8; } /* text-blue-600 */
    @media (prefers-color-scheme: dark) { .card-title-blue { color: #60a5fa; } } /* dark:text-blue-400 */
    .card-title-green { color: #15803d; } /* text-green-700 */
    @media (prefers-color-scheme: dark) { .card-title-green { color: #4ade80; } } /* dark:text-green-400 */
    .card-title-purple { color: #6d28d9; } /* Example for room details */
    @media (prefers-color-scheme: dark) { .card-title-purple { color: #a78bfa; } }


    .card-description-base {
      font-size: 0.875rem; /* text-sm */
      color: #475569; /* text-slate-600 */
    }
    @media (prefers-color-scheme: dark) {
      .card-description-base { color: #94a3b8; } /* dark:text-slate-400 */
    }

    .card-content-base {
      padding: 1rem; /* p-4 */
    }
    @media (min-width: 640px) { /* sm: */
      .card-content-base { padding: 1.25rem; } /* sm:p-5 */
    }
    .card-content-grid {
        display: grid;
        grid-template-columns: repeat(1, minmax(0, 1fr)); /* grid-cols-1 */
        gap: 1.5rem 1.25rem; /* gap-x-6 gap-y-5 */
        padding-top: 1.25rem; /* pt-5 */
    }
    @media (min-width: 768px) { /* md: */
      .card-content-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } /* md:grid-cols-2 */
    }
    @media (min-width: 1024px) { /* lg: */
      .card-content-grid-3-cols { grid-template-columns: repeat(3, minmax(0, 1fr)); } /* lg:grid-cols-3 */
    }
    .card-content-grid-wall { /* For WallInputCard */
        display: grid;
        grid-template-columns: repeat(1, minmax(0, 1fr));
        gap: 1.5rem 1.25rem; /* gap-x-6 gap-y-5 */
        padding: 1rem;
    }
    @media (min-width: 640px) { /* sm: */
      .card-content-grid-wall { grid-template-columns: repeat(2, minmax(0, 1fr)); padding: 1.25rem; }
    }
    @media (min-width: 1024px) { /* lg: */
      .card-content-grid-wall { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    }
    
    .card-content-col-span-2 .md\:col-span-2 { grid-column: span 2 / span 2; }
    .card-content-col-span-3 .lg\:col-span-3 { grid-column: span 3 / span 3; }


    /* Alert Styles */
    .alert-base {
      position: relative;
      width: 100%;
      border-radius: 0.5rem; /* rounded-lg */
      border: 1px solid;
      padding: 1rem; /* p-4 */
      margin-bottom: 0.75rem; /* mb-3, specific to header alerts */
    }
    .alert-base > svg { /* [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 */
      position: absolute;
      left: 1rem;
      top: 1rem;
      height: 1.25rem; /* h-5 */
      width: 1.25rem; /* w-5 */
    }
    .alert-base > svg ~ * { /* [&>svg~*]:pl-7 */
      padding-left: 1.75rem; 
    }
     .alert-base > svg + div { /* [&>svg+div]:translate-y-[-3px] */
      transform: translateY(-3px);
    }

    .alert-destructive {
      background-color: #fef2f2; /* bg-red-50 */
      border-color: #fca5a5; /* border-red-300 */
      color: #b91c1c; /* text-red-700 */
    }
    @media (prefers-color-scheme: dark) {
      .alert-destructive {
        background-color: #450a0a; /* dark:bg-red-950 */
        border-color: #991b1b; /* dark:border-red-800 */
        color: #f87171; /* dark:text-red-400 */
      }
    }
    .alert-success {
      background-color: #f0fdf4; /* bg-green-50 */
      border-color: #4ade80; /* border-green-400 */
      color: #15803d; /* text-green-700 */
    }
    @media (prefers-color-scheme: dark) {
      .alert-success {
        background-color: #052e16; /* dark:bg-green-950 */
        border-color: #166534; /* dark:border-green-800 */
        color: #4ade80; /* dark:text-green-400 */
      }
    }
    /* Default alert variant (sky) */
    .alert-default {
      background-color: #f0f9ff; /* bg-sky-50 */
      border-color: #7dd3fc; /* border-sky-300 */
      color: #0369a1; /* text-sky-700 */
    }
    @media (prefers-color-scheme: dark) {
      .alert-default {
        background-color: #082f49; /* dark:bg-sky-950 */
        border-color: #075985; /* dark:border-sky-800 */
        color: #38bdf8; /* dark:text-sky-400 */
      }
    }

    .alert-title-base {
      margin-bottom: 0.25rem; /* mb-1 */
      font-weight: 600; /* font-semibold */
      line-height: 1; /* leading-none */
      letter-spacing: -0.025em; /* tracking-tight */
    }
    .alert-description-base {
      font-size: 0.875rem; /* text-sm */
    }
    .alert-description-base p { /* [&_p]:leading-relaxed */
      line-height: 1.625;
    }
    
    /* Project Menu Modal */
    .project-menu-modal-overlay {
      position: fixed;
      inset: 0;
      z-index: 100;
      display: flex;
      animation: fadeIn 0.3s ease-out;
    }
    .project-menu-modal-backdrop {
      position: fixed;
      inset: 0;
      background-color: rgba(0,0,0,0.6); /* bg-black/60 */
      animation: fadeIn 0.3s ease-out;
      /* backdrop-filter: blur(4px); Simplified, actual blur is harder */
    }
    .project-menu-modal-content {
      position: relative;
      display: flex;
      flex-direction: column;
      width: 100%;
      max-width: 20rem; /* max-w-xs */
      background-color: #f8fafc; /* bg-slate-50 */
      height: 100%;
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1); /* shadow-xl */
      border-right: 1px solid #e2e8f0; /* border-slate-200 */
      transform: translateX(-100%);
      transition: transform 0.3s ease-in-out;
    }
    .project-menu-modal-content.open {
      transform: translateX(0);
    }
    @media (min-width: 640px) { /* sm: */
      .project-menu-modal-content { max-width: 24rem; } /* sm:max-w-sm */
    }
    @media (prefers-color-scheme: dark) {
      .project-menu-modal-content {
        background-color: #0f172a; /* dark:bg-slate-900 */
        border-color: #1e293b; /* dark:border-slate-800 */
      }
    }
    .project-menu-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem;
      border-bottom: 1px solid #e2e8f0;
    }
    @media (prefers-color-scheme: dark) {
      .project-menu-header { border-color: #1e293b; }
    }
    .project-menu-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1e293b;
    }
    @media (prefers-color-scheme: dark) {
      .project-menu-title { color: #f1f5f9; }
    }
    .project-menu-search-container {
      padding: 1rem;
    }
    .project-menu-search-input-wrapper {
      margin-bottom: 1rem;
      position: relative;
    }
    .project-menu-search-input-wrapper svg { /* Search icon */
      position: absolute;
      left: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      height: 1rem; width: 1rem;
      color: #94a3b8;
    }
    @media (prefers-color-scheme: dark) {
      .project-menu-search-input-wrapper svg { color: #64748b; }
    }
    .project-menu-search-input {
      padding-left: 2.5rem !important; /* pl-10 */
    }
    .project-menu-new-btn {
      width: 100%;
      background-color: #10b981; /* bg-emerald-500 */
      color: white;
      margin-bottom: 1rem;
    }
    .project-menu-new-btn:hover { background-color: #059669; } /* hover:bg-emerald-600 */
    .project-menu-new-btn svg { margin-right: 0.5rem; }

    .project-menu-list {
      flex-grow: 1;
      overflow-y: auto;
      padding-left: 1rem; padding-right: 1rem; padding-bottom: 1rem;
      space-y: 0.25rem; /* space-y-1 not directly translatable, use margin */
    }
    .project-menu-list > div + div { margin-top: 0.25rem; } /* Approximates space-y-1 */

    .project-menu-item {
      display: flex;
      align-items: center;
      padding: 0.125rem; /* p-0.5 */
      border-radius: 0.375rem; /* rounded-md */
      transition: background-color 0.15s;
      background-color: #e2e8f0; /* bg-slate-200 */
    }
    .project-menu-item:hover { background-color: #cbd5e1; } /* hover:bg-slate-300 */
    .project-menu-item.current {
      background-color: #2563eb; /* bg-blue-600 */
      box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05); /* shadow-sm */
    }
    @media (prefers-color-scheme: dark) {
      .project-menu-item { background-color: #1e293b; } /* dark:bg-slate-800 */
      .project-menu-item:hover { background-color: #334155; } /* dark:hover:bg-slate-700 */
      .project-menu-item.current { background-color: #1d4ed8; } /* dark:bg-blue-700 */
    }
    .project-menu-item-button {
      flex-grow: 1;
      justify-content: flex-start !important;
      text-align: left;
      padding: 0.375rem 0.625rem !important; /* px-2.5 py-1.5 */
      height: auto !important;
      font-size: 0.875rem !important; /* text-sm */
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      background-color: transparent !important;
      color: #334155; /* text-slate-700 */
    }
    .project-menu-item-button:hover { background-color: #cbd5e1 !important; }
    .project-menu-item.current .project-menu-item-button {
      background-color: #2563eb !important; /* bg-blue-600 */
      color: white !important;
    }
    .project-menu-item.current .project-menu-item-button:hover { background-color: #1d4ed8 !important; }
    @media (prefers-color-scheme: dark) {
      .project-menu-item-button { color: #e2e8f0; } /* dark:text-slate-200 */
      .project-menu-item-button:hover { background-color: #334155 !important; }
      .project-menu-item.current .project-menu-item-button { background-color: #1d4ed8 !important; } /* dark:bg-blue-700 */
      .project-menu-item.current .project-menu-item-button:hover { background-color: #2563eb !important; } /* dark:hover:bg-blue-600 */
    }
    .project-menu-item-delete-btn {
      margin-left: 0.25rem !important;
      width: 1.75rem !important; /* w-7 */
      height: 1.75rem !important; /* h-7 */
      opacity: 0.6;
      color: #64748b; /* text-slate-500 */
    }
    .project-menu-item:hover .project-menu-item-delete-btn { opacity: 1; }
    .project-menu-item-delete-btn:hover {
      color: #dc2626 !important; /* hover:text-red-600 */
      background-color: #fee2e2 !important; /* hover:bg-red-100 */
    }
    .project-menu-item.current .project-menu-item-delete-btn {
      color: #dbeafe !important; /* text-blue-100 */
    }
    .project-menu-item.current .project-menu-item-delete-btn:hover {
      color: white !important;
      background-color: rgba(59, 130, 246, 0.8) !important; /* hover:bg-blue-500/80 */
    }
     @media (prefers-color-scheme: dark) {
        .project-menu-item-delete-btn { color: #94a3b8; } /* dark:text-slate-400 */
        .project-menu-item-delete-btn:hover {
            color: #f87171 !important; /* dark:hover:text-red-500 */
            background-color: rgba(153, 27, 27, 0.5) !important; /* dark:hover:bg-red-900/50 */
        }
     }
    .project-menu-item-delete-btn svg { width: 0.875rem; height: 0.875rem; } /* w-3.5 h-3.5 */
    .project-menu-empty-text {
      color: #64748b; /* text-slate-500 */
      font-size: 0.875rem;
      text-align: center;
      padding-top: 0.75rem; padding-bottom: 0.75rem;
    }
    @media (prefers-color-scheme: dark) {
      .project-menu-empty-text { color: #94a3b8; } /* dark:text-slate-400 */
    }


    /* Select (Dropdown) Styles */
    .select-container { position: relative; }
    .select-trigger {
      display: flex;
      height: 2.5rem;
      width: 100%;
      align-items: center;
      justify-content: space-between;
      border-radius: 0.375rem;
      border: 1px solid #cbd5e1; /* border-slate-300 */
      background-color: white;
      padding: 0.5rem 0.75rem;
      font-size: 0.875rem;
      color: #1e293b; /* text-slate-800 */
      box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05); /* shadow-sm */
      cursor: pointer;
    }
    .select-trigger:focus {
      outline: 2px solid #3b82f6; /* focus:ring-blue-500 */
      outline-offset: 2px;
    }
    @media (prefers-color-scheme: dark) {
      .select-trigger {
        border-color: #334155; /* dark:border-slate-700 */
        background-color: #0f172a; /* dark:bg-slate-900 */
        color: #e2e8f0; /* dark:text-slate-200 */
      }
    }
    .select-value {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .select-value-placeholder { color: #64748b; }
    @media (prefers-color-scheme: dark) {
      .select-value-placeholder { color: #94a3b8; }
    }
    .select-trigger svg { /* ChevronDown */
      height: 1rem; width: 1rem; opacity: 0.5; margin-left: 0.5rem; flex-shrink: 0;
    }
    .select-content {
      position: absolute;
      z-index: 50;
      margin-top: 0.25rem;
      max-height: 15rem; /* max-h-60 */
      min-width: 100%; 
      overflow-y: auto;
      border-radius: 0.375rem;
      border: 1px solid #e2e8f0; 
      background-color: white;
      color: #0f172a; 
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1); 
      animation: fadeInScaleUp 0.1s ease-out;
    }
    @media (prefers-color-scheme: dark) {
      .select-content {
        border-color: #334155; 
        background-color: #1e293b; 
        color: #f1f5f9; 
      }
    }
    .select-content-inner { padding: 0.25rem; } 
    .select-item {
      position: relative;
      display: flex;
      width: 100%;
      cursor: pointer;
      user-select: none;
      align-items: center;
      border-radius: 0.25rem; 
      padding: 0.375rem 0.5rem 0.375rem 2rem; 
      padding-left: 0.5rem; 
      padding-right: 2rem; 
      font-size: 0.875rem;
      outline: none;
    }
    .select-item:hover, .select-item-focused {
      background-color: #f1f5f9; 
      color: #0f172a; 
    }
    .select-item-selected {
      font-weight: 600; 
      background-color: #f1f5f9; 
      color: #2563eb; 
    }
    @media (prefers-color-scheme: dark) {
      .select-item:hover, .select-item-focused {
        background-color: #334155; 
        color: #f8fafc; 
      }
      .select-item-selected {
        background-color: #334155; 
        color: #60a5fa; 
      }
    }
    .select-item-label {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .select-item-check {
      position: absolute;
      right: 0.5rem; 
      height: 1rem; width: 1rem;
      color: #2563eb; 
    }
    @media (prefers-color-scheme: dark) {
      .select-item-check { color: #60a5fa; } 
    }

    /* Total Project Labor Display */
    .total-project-labor {
      display: flex;
      align-items: center;
      font-size: 1.125rem; /* text-lg */
      font-weight: 600; /* font-semibold */
      color: #16a34a; /* text-green-600 */
      background-color: #f0fdf4; /* bg-green-50 */
      padding: 0.375rem 0.75rem; /* px-3 py-1.5 */
      border-radius: 0.375rem; /* rounded-md */
    }
    .total-project-labor svg {
      height: 1.25rem; width: 1.25rem; /* h-5 w-5 */
      margin-right: 0.375rem; /* mr-1.5 */
      opacity: 0.8;
    }
    @media (prefers-color-scheme: dark) {
      .total-project-labor {
        color: #4ade80; /* dark:text-green-400 */
        background-color: rgba(22, 101, 52, 0.3); /* dark:bg-green-900/30 */
      }
    }
    
    /* Room specific styles */
    .room-item-container {
        border: 1px solid #e2e8f0; /* border-slate-200 */
        border-radius: 0.5rem; /* rounded-lg */
        overflow: hidden;
        margin-bottom: 1.5rem; /* Added for spacing between room cards */
    }
    @media (prefers-color-scheme: dark) {
        .room-item-container { border-color: #334155; } /* dark:border-slate-700 */
    }
    .room-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.75rem; /* p-3 */
        background-color: #f8fafc; /* bg-slate-50 */
        cursor: pointer;
    }
    .room-header:hover { background-color: #f1f5f9; } /* hover:bg-slate-100 */
    @media (prefers-color-scheme: dark) {
        .room-header { background-color: rgba(30, 41, 59, 0.5); } /* dark:bg-slate-800/50 */
        .room-header:hover { background-color: rgba(51, 65, 85, 0.5); } /* dark:hover:bg-slate-700/50 */
    }
    .room-header-left {
        display: flex;
        align-items: center;
        flex-grow: 1;
        min-width: 0; /* For truncation */
    }
    .room-header-right {
        display: flex;
        align-items: center;
        flex-shrink: 0;
    }
    .room-labor-collapsed {
        font-size: 0.875rem; /* text-sm */
        color: #16a34a; /* text-green-600 */
        font-weight: 600; /* font-semibold */
        margin-right: 0.75rem; /* mr-3 */
    }
    @media (prefers-color-scheme: dark) {
        .room-labor-collapsed { color: #4ade80; } /* dark:text-green-400 */
    }
    .room-labor-expanded {
        font-size: 0.75rem; /* text-xs */
        color: #64748b; /* text-slate-500 */
        margin-right: 0.75rem; /* mr-3 */
    }
    @media (prefers-color-scheme: dark) {
        .room-labor-expanded { color: #94a3b8; } /* dark:text-slate-400 */
    }
    .room-delete-btn { /* Shared with project menu delete btn styling */
        width: 2rem !important; height: 2rem !important; /* w-8 h-8 */
        color: #64748b; /* text-slate-500 */
    }
    .room-delete-btn:hover {
        color: #dc2626 !important; /* hover:text-red-600 */
        background-color: #fee2e2 !important; /* hover:bg-red-100 */
    }
    @media (prefers-color-scheme: dark) {
        .room-delete-btn { color: #94a3b8; } /* dark:text-slate-400 */
        .room-delete-btn:hover {
            color: #f87171 !important; /* dark:hover:text-red-500 */
            background-color: rgba(153, 27, 27, 0.5) !important; /* dark:hover:bg-red-900/50 */
        }
    }
    .room-delete-btn svg { width: 1rem; height: 1rem; } /* w-4 h-4 */

    .room-content { /* For walls list */
        padding: 1rem; /* p-4 */
        border-top: 1px solid #e2e8f0; /* border-t border-slate-200 */
    }
    @media (prefers-color-scheme: dark) {
        .room-content { border-color: #334155; } /* dark:border-slate-700 */
    }
    
    .room-details-card { /* New card for room specific details */
      margin-bottom: 1.5rem; /* mb-6 */
      border: 1px solid #d1d5db; /* Example border */
    }
    .room-details-header {
      background-color: #f3f4f6; /* Lighter than wall card header */
    }
    @media (prefers-color-scheme: dark) {
      .room-details-header { background-color: #374151; }
    }


    .btn-add-wall {
        margin-top: 0.5rem; /* mt-2 */
        background-color: #0ea5e9; /* bg-sky-500 */
        color: white;
        padding: 0.5rem 1rem; /* py-2 px-4 */
        font-size: 0.875rem; /* text-sm */
    }
    .btn-add-wall:hover { background-color: #0284c7; } /* hover:bg-sky-600 */
    .btn-add-wall svg { margin-right: 0.375rem; height: 1rem; width: 1rem; } /* mr-1.5 h-4 w-4 */

    .no-projects-container {
        padding: 2.5rem; /* p-10 */
        background-color: #f1f5f9; /* bg-slate-100 */
        min-height: 100vh;
        color: #1e293b; /* text-slate-800 */
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }
    @media (prefers-color-scheme: dark) {
      .no-projects-container {
        background-color: #020617; /* dark:bg-slate-950 */
        color: #e2e8f0; /* dark:text-slate-200 */
      }
    }
    .no-projects-content { text-align: center; }
    .no-projects-icon {
        height: 4rem; width: 4rem; /* h-16 w-16 */
        color: #94a3b8; /* text-slate-400 */
        margin-left: auto; margin-right: auto;
        margin-bottom: 1rem; /* mb-4 */
    }
    @media (prefers-color-scheme: dark) {
      .no-projects-icon { color: #64748b; } /* dark:text-slate-500 */
    }
    .no-projects-title {
        font-size: 1.5rem; /* text-2xl */
        font-weight: 600; /* font-semibold */
        color: #334155; /* text-slate-700 */
        margin-bottom: 0.5rem; /* mb-2 */
    }
    @media (prefers-color-scheme: dark) {
      .no-projects-title { color: #cbd5e1; } /* dark:text-slate-300 */
    }
    .no-projects-text {
        color: #64748b; /* text-slate-500 */
        margin-bottom: 1.5rem; /* mb-6 */
    }
    @media (prefers-color-scheme: dark) {
      .no-projects-text { color: #94a3b8; } /* dark:text-slate-400 */
    }
    .no-projects-button {
        background-color: #10b981; /* bg-emerald-500 */
        color: white;
        padding: 0.625rem 1.5rem; /* py-2.5 px-6 */
    }
    .no-projects-button:hover { background-color: #059669; } /* hover:bg-emerald-600 */
    .no-projects-button svg { margin-right: 0.5rem; height: 1.25rem; width: 1.25rem; } /* mr-2 h-5 w-5 */
    
    .footer-text {
      text-align: center;
      font-size: 0.875rem; /* text-sm */
      color: #64748b; /* text-slate-500 */
      margin-top: 4rem; /* mt-16 */
      padding-bottom: 2rem; /* pb-8 */
    }
    @media (prefers-color-scheme: dark) {
      .footer-text { color: #94a3b8; } /* dark:text-slate-400 */
    }

    .flex-grow-0 { flex-grow: 0; }
    .flex-shrink-0 { flex-shrink: 0; }
    .min-w-0 { min-width: 0; }
    .truncate {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .font-bold-lg-green { /* For Grand Total Labor in WallInputCard */
        font-weight: 700;
        font-size: 1.125rem; /* text-lg */
        color: #15803d; /* text-green-700 */
    }
    @media (prefers-color-scheme: dark) {
        .font-bold-lg-green { color: #4ade80; } /* dark:text-green-400 */
    }
    .space-y-4 > *:not([hidden]) ~ *:not([hidden]) { margin-top: 1rem; } /* space-y-4 */
    .mt-1 { margin-top: 0.25rem; }
    .mt-2 { margin-top: 0.5rem; }
    .mt-4 { margin-top: 1rem; }
    .mr-1_5 { margin-right: 0.375rem; }
    .mr-2 { margin-right: 0.5rem; }
    .mr-3 { margin-right: 0.75rem; }
    .ml-1 { margin-left: 0.25rem; }
    .ml-2 { margin-left: 0.5rem; }
    .pl-10 { padding-left: 2.5rem; }

    /* Animations */
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    .animate-fadeIn { animation: fadeIn 0.3s ease-out; }

    @keyframes fadeInScaleUp { /* Simplified animation for select content */
        from { opacity: 0; transform: scale(0.95); }
        to { opacity: 1; transform: scale(1); }
    }
    
    /* Tooltip Styles */
    .info-icon-container {
      position: relative;
      display: inline-flex; 
      align-items: center;
    }
    .info-icon {
      margin-left: 0.3rem; /* Adjusted margin */
      cursor: help;
      color: #3b82f6; /* blue-500 */
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    @media (prefers-color-scheme: dark) {
      .info-icon {
        color: #60a5fa; /* dark:blue-400 */
      }
    }
    .tooltip-text {
      visibility: hidden;
      width: max-content; 
      max-width: 280px; 
      background-color: #1f2937; /* bg-gray-800 */
      color: #fff;
      text-align: left; /* Changed to left for better readability */
      border-radius: 0.375rem; /* rounded-md */
      padding: 0.5rem 0.75rem; /* p-2 px-3 */
      position: absolute;
      z-index: 100; /* Ensure tooltip is on top */
      bottom: 135%; /* Position above the icon */
      left: 50%;
      transform: translateX(-50%);
      opacity: 0;
      transition: opacity 0.2s, visibility 0.2s;
      font-size: 0.75rem; /* text-xs */
      line-height: 1.4;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .info-icon-container:hover .tooltip-text,
    .info-icon:focus + .tooltip-text, /* Show on focus for accessibility */
    .info-icon:focus-within + .tooltip-text { /* Show if child of icon has focus */
      visibility: visible;
      opacity: 1;
    }
    .tooltip-text::after { /* Arrow */
      content: "";
      position: absolute;
      top: 100%;
      left: 50%;
      margin-left: -6px; /* Adjusted for slightly larger arrow */
      border-width: 6px;
      border-style: solid;
      border-color: #1f2937 transparent transparent transparent;
    }
    
    .field-highlight-input {
      background-color: #d1fae5 !important; /* Light green, similar to green-50 */
      transition: background-color 0.3s ease-out, border-color 0.3s ease-out;
    }
    .field-highlight-output {
      background-color: #fee2e2 !important; /* Light red, similar to red-50 */
      transition: background-color 0.3s ease-out, border-color 0.3s ease-out;      
    }
    @media (prefers-color-scheme: dark) {
      .field-highlight-input {
        background-color: #064e3b !important; /* Darker green, similar to dark:green-900 */
      }
      .field-highlight-output {
        background-color: #7f1d1d !important; /* Darker red, similar to dark:red-900 */
      }
    }
    .label-highlight {
        color: #1d4ed8 !important; /* blue-700 */
        font-weight: bold;
    }
     @media (prefers-color-scheme: dark) {
        .label-highlight {
             color: #60a5fa !important; /* dark:blue-400 */
        }
     }


    /* Utility for screen readers only */
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border-width: 0;
    }

  `}
    </style>
);


// --- UI Component Placeholders (Now using defined CSS classes) ---
const Button = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'default' | 'ghost' | 'link'; size?: 'default' | 'sm' | 'lg' | 'icon' | 'xs' | 'xs-sm'; baseClass?: string }
>(({ className = '', children, variant = 'default', size = 'default', baseClass = 'btn', ...props }, ref) => {
    const variantClass = `btn-${variant}`;
    const sizeClass = `btn-size-${size}`;

    return (
        <button
            ref={ref}
            className={`${baseClass} ${variantClass} ${sizeClass} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
});
Button.displayName = 'Button';

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { onWheel?: (e: React.WheelEvent<HTMLInputElement>) => void }>(
    ({ className = '', type = "text", onWheel, ...props }, ref) => (
        <input ref={ref} type={type} className={`input-base ${className}`} {...props} onWheel={onWheel} />
    )
);
Input.displayName = 'Input';

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
    ({ className = '', ...props }, ref) => (
        <textarea ref={ref} className={`textarea-base ${className}`} {...props} />
    )
);
Textarea.displayName = 'Textarea';

const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
    ({ className = '', ...props }, ref) => (
        <label ref={ref} className={`label-base ${className}`} {...props} />
    )
);
Label.displayName = 'Label';

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className = '', ...props }, ref) => (
        <div ref={ref} className={`card-base ${className}`} {...props} />
    )
);
Card.displayName = 'Card';

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className = '', ...props }, ref) => (
        <div ref={ref} className={`card-header-base ${className}`} {...props} />
    )
);
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
    ({ className = '', ...props }, ref) => (
        <h3 ref={ref} className={`card-title-base ${className}`} {...props} />
    )
);
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
    ({ className = '', ...props }, ref) => (
        <p ref={ref} className={`card-description-base ${className}`} {...props} />
    )
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className = '', ...props }, ref) => (
        <div ref={ref} className={`card-content-base ${className}`} {...props} />
    )
);
CardContent.displayName = 'CardContent';

const Alert = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { variant?: 'default' | 'destructive' | 'success' }>(
    ({ className = '', variant = 'default', ...props }, ref) => {
        const variantClass = `alert-${variant}`;
        return (
            <div
                ref={ref}
                role="alert"
                className={`alert-base ${variantClass} ${className}`}
                {...props}
            />
        );
    }
);
Alert.displayName = 'Alert';

const AlertTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
    ({ className = '', ...props }, ref) => (
        <h5 ref={ref} className={`alert-title-base ${className}`} {...props} />
    )
);
AlertTitle.displayName = 'AlertTitle';

const AlertDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
    ({ className = '', ...props }, ref) => (
        <div ref={ref} className={`alert-description-base ${className}`} {...props} />
    )
);
AlertDescription.displayName = 'AlertDescription';


const SelectContext = React.createContext<{ currentValue?: string; onValueChange: (value: string) => void; setIsOpen?: React.Dispatch<React.SetStateAction<boolean>>; options?: {value: string, label: React.ReactNode}[]; }>({ onValueChange: () => {} });

const Select: React.FC<{ children: React.ReactNode; onValueChange: (value: string) => void; value?: string | number; id?: string; className?: string; }> = ({ children, onValueChange, value, id, className }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);


    const handleToggle = () => setIsOpen(!isOpen);
    const handleValueChange = (selectedValue: string) => { onValueChange(selectedValue); setIsOpen(false); };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen && triggerRef.current && contentRef.current) {
            const triggerWidth = triggerRef.current.offsetWidth;
            contentRef.current.style.width = `${triggerWidth}px`;
        }
    }, [isOpen]);


    const contextValue = { currentValue: value !== undefined ? String(value) : undefined, onValueChange: handleValueChange, setIsOpen, options: React.Children.toArray(children).filter((child: any): child is React.ReactElement<{value: string, children: React.ReactNode}> => React.isValidElement(child) && child.type === SelectItem).map((child: React.ReactElement<{value: string, children: React.ReactNode}>) => ({value: child.props.value, label: child.props.children})) };

    return (
        <SelectContext.Provider value={contextValue}>
            <div ref={selectRef} className={`select-container ${className || ''}`} id={id}>
                {React.Children.map(children, child => {
                    if (React.isValidElement(child) && child.type === SelectTrigger) { return React.cloneElement(child as React.ReactElement<any>, { onClick: handleToggle, ref: triggerRef }); }
                    if (React.isValidElement(child) && child.type === SelectContent) { return isOpen ? React.cloneElement(child as React.ReactElement<any>, {ref: contentRef}) : null; }
                    return null;
                })}
            </div>
        </SelectContext.Provider>
    );
};

const SelectTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>( ({ className = '', children, ...props }, ref) => ( <button ref={ref} type="button" className={`select-trigger ${className}`} {...props}> {children} <ChevronDown /> </button> ));
SelectTrigger.displayName = 'SelectTrigger';

const SelectValue = ({ placeholder }: { placeholder?: string }) => { const { currentValue, options } = React.useContext(SelectContext); const selectedOption = options?.find(opt => opt.value === currentValue); const displayValue = selectedOption ? selectedOption.label : currentValue; return <span className={`select-value ${!displayValue && placeholder ? 'select-value-placeholder' : ''}`}>{displayValue || placeholder}</span>; };

const SelectContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>( ({ className = '', children, ...props }, ref) => ( <div ref={ref} className={`select-content ${className}`} {...props}> <div className="select-content-inner">{children}</div> </div> ));
SelectContent.displayName = 'SelectContent';

const SelectItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { value: string }>( ({ className = '', children, value, ...props }, ref) => { const { onValueChange, currentValue, setIsOpen } = React.useContext(SelectContext); const isSelected = currentValue === value; return ( <div ref={ref} onClick={() => { onValueChange(value); if (setIsOpen) setIsOpen(false); }} className={`select-item ${isSelected ? 'select-item-selected' : ''} ${className}`} onFocus={(e) => e.currentTarget.classList.add('select-item-focused')} onBlur={(e) => e.currentTarget.classList.remove('select-item-focused')} tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { onValueChange(value); if (setIsOpen) setIsOpen(false);}}} > <span className="select-item-label">{children}</span> {isSelected && <Check className="select-item-check" />} </div> ); });
SelectItem.displayName = 'SelectItem';


// SVG Icon Components
const InfoIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
);
const AlertCircle = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>;
const Plus = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const Trash2 = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;
const CheckCircle = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const ChevronDown = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>;
const ChevronUp = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>;
const Check = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;
const FolderPlus = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"></path><line x1="12" x2="12" y1="10" y2="16"></line><line x1="9" x2="15" y1="13" y2="13"></line></svg>;
const Home = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>;
const Search = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const Save = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>;
const MenuIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>;
const XIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const DollarSign = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>;

// Constants
const PAPER_WIDTH_OPTIONS = [ { label: '20.5"', value: 20.5 }, { label: '27"', value: 27 }, { label: '36"', value: 36 }, { label: '52"', value: 52 }, { label: 'Custom (in)', value: 'custom' }];
const BOLT_LENGTH_OPTIONS = [ { label: '5 yd/180"', value: 180 }, { label: '8 yd/288"', value: 288 }, { label: '9 yd/324"', value: 324 }, { label: '10 yd/360"', value: 360 }, { label: '11 yd/393"', value: 393 }, { label: '12 yd/432"', value: 432 }, { label: '15 yd/540"', value: 540 }, { label: '30 yd/1080"', value: 1080 }, { label: '42 yd/1512"', value: 1512 }, { label: 'Custom (in)', value: 'custom' }];
const PATTERN_MATCH_OPTIONS = [ { label: 'Straight', value: 1 }, { label: 'Half Drop', value: 0.5 }, { label: '1/3 Drop', value: 0.33 }, { label: '1/4 Drop', value: 0.25 }];
const PRICING_OPTIONS = [ { label: '$65/SR Liner', value: 65 }, { label: '$85/SR Pretrimmed', value: 85 }, { label: '$125/SR Untrimmed', value: 125 }, { label: '$150/SR Untrimmed/Grasscloth/Fabric', value: 150 }, { label: '38% of Material Cost', value: 'materialPercent' }];
const SR_MULTIPLIER_OPTIONS = [ {label: "2/3 S/R per Bolt", value: 2/3}, {label: "1 S/R per Bolt", value: 1}, {label: "2 S/R per Bolt (Standard)", value: 2}, {label: "Custom", value: "custom"}];

const AUTO_SAVE_DEBOUNCE_TIME = 2000;

// Interfaces
interface ClientInfo { clientName: string; clientAddress: string; clientPhone: string; clientEmail: string; }
interface GeneralProjectInfo {
    designerBuilderName: string;
    projectManagerName: string;
    projectManagerPhone: string;
    invoiceTo: string;
    notes: string;
    projectType: string;
    roundTripMileage?: number;
    numberOfDaysForInstall?: number;
    inputDate: string;
    estimateSentDate: string;
    approvalDate: string;
    orderDate: string;
    orderReceivedDate: string;
    estimatedDateReadyForInstall: string;
    scheduledInstallDate: string;
}
interface RoomSpecificInfo {
    paperManufacturer: string;
    paperPatternNumber: string;
    paperColorNumber: string;
    paperProductPhotoLink: string;
    paperType: string;
    paperSpecialRequirements: string;
    ceilingHeight?: number;
    baseboardHeight?: number;
    verticalCrownHeight?: number;
    chairRailHeight?: number;
    isDetailsCollapsed?: boolean;
}
interface Wall {
    id: string;
    name: string;
    width?: number;
    heightOfWall?: number;
    // totalArea?: number; // Removed
    paperWidthOption: number | 'custom';
    paperWidthCustom?: number;
    lengthOfBoltOption: number | 'custom';
    lengthOfBoltCustom?: number;
    patternVerticalRepeat?: number;
    patternMatch: number;
    verticalHeightOfMatchedRepeat?: number;
    pricedBy: number | 'materialPercent';
    unitPriceOfWallpaper?: number;
    perimeterWallWidth?: number;
    srMultiplierOption: number | 'custom'; // New field
    srMultiplierCustom?: number; // New field
    numberOfCutsForProject?: number;
    numberOfRepeatsPerCut?: number;
    lengthOfCuts?: number;
    totalLengthNeeded?: number; // Calculated Total Length Needed
    totalLengthPurchased?: number; // New field: Length of Bolt * # of Bolts
    numberOfCutLengthsPerBolt?: number;
    numberOfBolts?: number;
    numberOfYardsToOrder?: number;
    materialCost?: number;
    equivalentProjectSRCalculation?: number;
    baseLabor?: number;
    heightSurcharge?: number;
    subtotalLabor?: number; // Renamed from grandTotalLabor for wall-specific total
    travelCharges?: number; // Will always be 0 from this function
    grandTotalLabor?: number; // Kept for consistency, but represents wall subtotal
    isCollapsed?: boolean;
}
interface Room { id: string; name: string; details: RoomSpecificInfo; walls: Wall[]; isCollapsed?: boolean; }
interface Project { id: string; name: string; clientInfo: ClientInfo; generalProjectInfo: GeneralProjectInfo; rooms: Room[]; isClientInfoCollapsed?: boolean; isGeneralProjectInfoCollapsed?: boolean; }

// Helper functions to create new entities
const createNewRoomSpecificInfo = (): RoomSpecificInfo => ({
    paperManufacturer: '', paperPatternNumber: '', paperColorNumber: '', paperProductPhotoLink: '', paperType: '', paperSpecialRequirements: '',
    ceilingHeight: undefined, baseboardHeight: undefined, verticalCrownHeight: undefined, chairRailHeight: undefined, isDetailsCollapsed: false,
});
const createNewWall = (nameSuffix: string | number): Wall => ({
    id: `wall-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    name: `Wall ${nameSuffix}`,
    paperWidthOption: 20.5,
    lengthOfBoltOption: 180,
    patternMatch: 1,
    pricedBy: 85,
    heightOfWall: 96,
    srMultiplierOption: 2, // Default S/R per Bolt Multiplier
    isCollapsed: false,
});
const createNewRoom = (nameSuffix: string | number): Room => ({ id: `room-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`, name: `Room ${nameSuffix}`, details: createNewRoomSpecificInfo(), walls: [createNewWall(1)], isCollapsed: false, });
const createNewClientInfo = (): ClientInfo => ({ clientName: '', clientAddress: '', clientPhone: '', clientEmail: '' });
const createNewGeneralProjectInfo = (): GeneralProjectInfo => ({ designerBuilderName: '', projectManagerName: '', projectManagerPhone: '', invoiceTo: '', notes: '', projectType: '', roundTripMileage: undefined, numberOfDaysForInstall: undefined, inputDate: '', estimateSentDate: '', approvalDate: '', orderDate: '', orderReceivedDate: '', estimatedDateReadyForInstall: '', scheduledInstallDate: '', });
const createNewProject = (nameSuffix: string | number): Project => ({ id: `project-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`, name: `Project ${nameSuffix}`, clientInfo: createNewClientInfo(), generalProjectInfo: createNewGeneralProjectInfo(), rooms: [createNewRoom(1)], isClientInfoCollapsed: false, isGeneralProjectInfoCollapsed: false, });

// Calculation Logic
const calculateWallValues = (wall: Wall, roomCeilingHeight?: number): Wall => {
    const {
        width, heightOfWall,
        paperWidthOption, paperWidthCustom,
        lengthOfBoltOption, lengthOfBoltCustom,
        patternVerticalRepeat, patternMatch,
        pricedBy, unitPriceOfWallpaper,
        srMultiplierOption, srMultiplierCustom
    } = wall;

    let paperWidth = paperWidthOption === 'custom' ? paperWidthCustom : paperWidthOption;
    let lengthOfBolt = lengthOfBoltOption === 'custom' ? lengthOfBoltCustom : lengthOfBoltOption;
    const calculationHeight = heightOfWall;

    const verticalHeightOfMatchedRepeat = patternVerticalRepeat && patternMatch ? patternVerticalRepeat * patternMatch : undefined;
    const numberOfCutsForProject = width && paperWidth && paperWidth > 0 ? Math.ceil(width / paperWidth) : undefined;
    const effectiveHeightForRepeats = calculationHeight !== undefined ? calculationHeight + 4 : undefined;
    const numberOfRepeatsPerCut = effectiveHeightForRepeats && verticalHeightOfMatchedRepeat && verticalHeightOfMatchedRepeat > 0 ? Math.ceil(effectiveHeightForRepeats / verticalHeightOfMatchedRepeat) : (effectiveHeightForRepeats ? 1 : undefined);
    const lengthOfCuts = numberOfRepeatsPerCut && verticalHeightOfMatchedRepeat && verticalHeightOfMatchedRepeat > 0 ? numberOfRepeatsPerCut * verticalHeightOfMatchedRepeat : effectiveHeightForRepeats;
    const totalLengthNeeded = lengthOfCuts && numberOfCutsForProject ? lengthOfCuts * numberOfCutsForProject : undefined; // This is the calculated need
    const numberOfCutLengthsPerBolt = lengthOfBolt && lengthOfCuts && lengthOfCuts > 0 ? Math.floor(lengthOfBolt / lengthOfCuts) : undefined;
    const numberOfBolts = numberOfCutsForProject && numberOfCutLengthsPerBolt && numberOfCutLengthsPerBolt > 0 ? Math.ceil(numberOfCutsForProject / numberOfCutLengthsPerBolt) : undefined;

    // Calculate totalLengthPurchased first, as it's now a dependency for others
    const totalLengthPurchased = (lengthOfBolt || 0) * (numberOfBolts || 0);

    // Updated to use totalLengthPurchased
    const numberOfYardsToOrder = totalLengthPurchased ? Math.ceil(totalLengthPurchased / 36) : undefined;

    const materialCost = (unitPriceOfWallpaper || 0) * (numberOfBolts || 0);

    const srMultiplier = srMultiplierOption === 'custom' ? (srMultiplierCustom || 0) : (srMultiplierOption || 0);

    // Updated to use totalLengthPurchased
    const equivalentProjectSRCalculation = totalLengthPurchased && lengthOfBolt && lengthOfBolt > 0 && srMultiplier
        ? Math.ceil((totalLengthPurchased / lengthOfBolt) * srMultiplier)
        : undefined;

    const baseLabor = equivalentProjectSRCalculation && pricedBy !== undefined ? (typeof pricedBy === 'number' ? equivalentProjectSRCalculation * pricedBy : (materialCost > 0 ? materialCost * 0.38 : 0)) : undefined;

    const heightToUseForSurcharge = roomCeilingHeight !== undefined && roomCeilingHeight > 0
        ? roomCeilingHeight
        : calculationHeight;

    let heightSurcharge = 0;
    if (heightToUseForSurcharge && heightToUseForSurcharge > 96) {
        heightSurcharge = ((heightToUseForSurcharge - 96) / 12) * 100;
        heightSurcharge = Math.max(0, heightSurcharge);
    }

    const subtotalLabor = baseLabor !== undefined ? baseLabor + heightSurcharge : undefined;
    const travelCharges = 0;
    const grandTotalLabor = subtotalLabor;


    return { ...wall, verticalHeightOfMatchedRepeat, numberOfCutsForProject, numberOfRepeatsPerCut, lengthOfCuts, totalLengthNeeded, totalLengthPurchased, numberOfCutLengthsPerBolt, numberOfBolts, numberOfYardsToOrder, materialCost, equivalentProjectSRCalculation, baseLabor, heightSurcharge, subtotalLabor, travelCharges, grandTotalLabor, };
};

function useDebounce<T>(value: T, delay: number): T { const [debouncedValue, setDebouncedValue] = useState<T>(value); useEffect(() => { const handler = setTimeout(() => { setDebouncedValue(value); }, delay); return () => { clearTimeout(handler); }; }, [value, delay]); return debouncedValue; }

// Define field dependencies for highlighting
const fieldDependencies: Record<string, { inputs: string[], outputs: string[] }> = {
    width: { inputs: [], outputs: ['numberOfCutsForProject', 'totalLengthNeeded', 'numberOfBolts', 'materialCost', 'totalLengthPurchased', 'numberOfYardsToOrder', 'equivalentProjectSRCalculation', 'baseLabor', 'grandTotalLabor'] },
    heightOfWall: { inputs: [], outputs: ['effectiveHeightForRepeats', 'numberOfRepeatsPerCut', 'lengthOfCuts', 'totalLengthNeeded', 'numberOfBolts', 'materialCost', 'totalLengthPurchased', 'numberOfYardsToOrder', 'equivalentProjectSRCalculation', 'baseLabor', 'heightSurcharge', 'grandTotalLabor'] },
    paperWidthOption: { inputs: [], outputs: ['numberOfCutsForProject', 'totalLengthNeeded', 'numberOfBolts', 'materialCost', 'totalLengthPurchased', 'numberOfYardsToOrder', 'equivalentProjectSRCalculation', 'baseLabor', 'grandTotalLabor'] },
    paperWidthCustom: { inputs: ['paperWidthOption'], outputs: ['numberOfCutsForProject', 'totalLengthNeeded', 'numberOfBolts', 'materialCost', 'totalLengthPurchased', 'numberOfYardsToOrder', 'equivalentProjectSRCalculation', 'baseLabor', 'grandTotalLabor'] },
    lengthOfBoltOption: { inputs: [], outputs: ['numberOfCutLengthsPerBolt', 'numberOfBolts', 'totalLengthPurchased', 'numberOfYardsToOrder', 'equivalentProjectSRCalculation', 'baseLabor', 'grandTotalLabor'] },
    lengthOfBoltCustom: { inputs: ['lengthOfBoltOption'], outputs: ['numberOfCutLengthsPerBolt', 'numberOfBolts', 'totalLengthPurchased', 'numberOfYardsToOrder', 'equivalentProjectSRCalculation', 'baseLabor', 'grandTotalLabor'] },
    patternVerticalRepeat: { inputs: [], outputs: ['verticalHeightOfMatchedRepeat', 'numberOfRepeatsPerCut', 'lengthOfCuts', 'totalLengthNeeded', 'numberOfBolts', 'materialCost', 'totalLengthPurchased', 'numberOfYardsToOrder', 'equivalentProjectSRCalculation', 'baseLabor', 'grandTotalLabor'] },
    patternMatch: { inputs: [], outputs: ['verticalHeightOfMatchedRepeat', 'numberOfRepeatsPerCut', 'lengthOfCuts', 'totalLengthNeeded', 'numberOfBolts', 'materialCost', 'totalLengthPurchased', 'numberOfYardsToOrder', 'equivalentProjectSRCalculation', 'baseLabor', 'grandTotalLabor'] },
    pricedBy: { inputs: [], outputs: ['baseLabor', 'grandTotalLabor'] },
    unitPriceOfWallpaper: { inputs: [], outputs: ['materialCost', 'baseLabor', 'grandTotalLabor'] },
    srMultiplierOption: { inputs: [], outputs: ['equivalentProjectSRCalculation', 'baseLabor', 'grandTotalLabor'] },
    srMultiplierCustom: { inputs: ['srMultiplierOption'], outputs: ['equivalentProjectSRCalculation', 'baseLabor', 'grandTotalLabor'] },
    // Calculated fields
    verticalHeightOfMatchedRepeat: { inputs: ['patternVerticalRepeat', 'patternMatch'], outputs: ['numberOfRepeatsPerCut', 'lengthOfCuts'] },
    numberOfCutsForProject: { inputs: ['width', 'paperWidthOption', 'paperWidthCustom'], outputs: ['totalLengthNeeded', 'numberOfBolts'] },
    numberOfRepeatsPerCut: { inputs: ['heightOfWall', 'verticalHeightOfMatchedRepeat'], outputs: ['lengthOfCuts'] },
    lengthOfCuts: { inputs: ['numberOfRepeatsPerCut', 'verticalHeightOfMatchedRepeat', 'heightOfWall'], outputs: ['totalLengthNeeded', 'numberOfCutLengthsPerBolt'] },
    totalLengthNeeded: { inputs: ['lengthOfCuts', 'numberOfCutsForProject'], outputs: [] }, // totalLengthNeeded is no longer a direct input to Yards or SR Calc, but it's still useful to keep as an intermediary calculation.
    totalLengthPurchased: { inputs: ['lengthOfBoltOption', 'lengthOfBoltCustom', 'numberOfBolts'], outputs: ['numberOfYardsToOrder', 'equivalentProjectSRCalculation'] }, // Now the primary input
    numberOfCutLengthsPerBolt: { inputs: ['lengthOfBoltOption', 'lengthOfBoltCustom', 'lengthOfCuts'], outputs: ['numberOfBolts'] },
    numberOfBolts: { inputs: ['numberOfCutsForProject', 'numberOfCutLengthsPerBolt'], outputs: ['materialCost', 'totalLengthPurchased'] },

    // Updated inputs
    numberOfYardsToOrder: { inputs: ['totalLengthPurchased'], outputs: [] },
    // Updated inputs
    equivalentProjectSRCalculation: { inputs: ['totalLengthPurchased', 'lengthOfBoltOption', 'lengthOfBoltCustom', 'srMultiplierOption', 'srMultiplierCustom'], outputs: ['baseLabor'] },

    materialCost: { inputs: ['unitPriceOfWallpaper', 'numberOfBolts'], outputs: ['baseLabor'] },
    baseLabor: { inputs: ['equivalentProjectSRCalculation', 'pricedBy', 'materialCost'], outputs: ['grandTotalLabor'] },
    heightSurcharge: { inputs: ['heightOfWall' /* indirectly roomCeilingHeight */], outputs: ['grandTotalLabor'] },
    grandTotalLabor: { inputs: ['baseLabor', 'heightSurcharge'], outputs: [] },
};


const WallInputCard = ({ wall, onChange, onDelete, onToggleCollapse }: { wall: Wall; onChange: (wallId: string, updates: Partial<Wall>) => void; onDelete: (wallId: string) => void; onToggleCollapse: (wallId: string) => void; }) => {
    const { id, name, isCollapsed } = wall;
    const [highlightedInputs, setHighlightedInputs] = useState<string[]>([]);
    const [highlightedOutputs, setHighlightedOutputs] = useState<string[]>([]);

    const handleNumberInputWheel = (event: React.WheelEvent<HTMLInputElement>) => {
        if (document.activeElement === event.currentTarget) {
            event.preventDefault();
        }
    };

    const handleMouseEnterField = (fieldKey: keyof Wall | string) => {
        const related = fieldDependencies[fieldKey as string];
        if (related) {
            setHighlightedInputs([...related.inputs]);
            setHighlightedOutputs([...related.outputs]);
        } else {
            setHighlightedInputs([fieldKey as string]);
            setHighlightedOutputs([]);
        }
    };

    const handleMouseLeaveField = () => {
        setHighlightedInputs([]);
        setHighlightedOutputs([]);
    };

    const handleInputChange = useCallback((field: keyof Wall, value: any) => {
        const numericFields: (keyof Wall)[] = ['width', 'heightOfWall', 'paperWidthCustom', 'lengthOfBoltCustom', 'patternVerticalRepeat', 'unitPriceOfWallpaper', 'perimeterWallWidth', 'srMultiplierCustom'];
        let processedValue = value;
        if (numericFields.includes(field)) {
            processedValue = value === '' ? undefined : Number(value);
        }
        onChange(id, { [field]: processedValue });
    }, [id, onChange]);

    const getFieldHighlightClass = (fieldKey: keyof Wall | string) => {
        if (highlightedInputs.includes(fieldKey as string)) {
            return 'field-highlight-input'; // Field is an input for the highlighted relationship
        } else if (highlightedOutputs.includes(fieldKey as string)) {
            return 'field-highlight-output'; // Field is an output for the highlighted relationship
        }
        return '';
    };

    const getLabelHighlightClass = (fieldKey: keyof Wall | string) => {
        if (highlightedInputs.includes(fieldKey as string) && highlightedOutputs.includes(fieldKey as string)) {
            return 'label-highlight-input-output';
        } else if (highlightedInputs.includes(fieldKey as string)) {
            return 'label-highlight-input';
        } else if (highlightedOutputs.includes(fieldKey as string)) {
            return 'label-highlight-output';
        }
        return '';
    };

    const renderReadOnlyInput = (label: string, fieldKey: keyof Wall, value?: number | string, unitOrClass?: string, baseTooltipText?: string) => {
        const isBoldGreen = unitOrClass === 'font-bold-lg-green';
        const unit = isBoldGreen ? undefined : unitOrClass;
        const extraClass = isBoldGreen ? unitOrClass : '';

        let dynamicTooltip = baseTooltipText || label;
        if (baseTooltipText) {
            if (fieldKey === 'numberOfCutsForProject') {
                dynamicTooltip = `⌈Wall Width (${wall.width || 'N/A'}) / Paper Width (${(wall.paperWidthOption === 'custom' ? wall.paperWidthCustom : wall.paperWidthOption) || 'N/A'})⌉`;
            } else if (fieldKey === 'totalLengthNeeded') {
                dynamicTooltip = `Length of Cuts (${wall.lengthOfCuts?.toFixed(2) || 'N/A'}) × # Cuts (${wall.numberOfCutsForProject || 'N/A'})`;
            } else if (fieldKey === 'totalLengthPurchased') {
                dynamicTooltip = `# Bolts (${wall.numberOfBolts || 'N/A'}) × Bolt Length (${(wall.lengthOfBoltOption === 'custom' ? wall.lengthOfBoltCustom : wall.lengthOfBoltOption) || 'N/A'})`;
            } else if (fieldKey === 'equivalentProjectSRCalculation') {
                dynamicTooltip = `⌈(Calc. Total Length (${wall.totalLengthNeeded?.toFixed(2) || 'N/A'}) / Bolt Length (${(wall.lengthOfBoltOption === 'custom' ? wall.lengthOfBoltCustom : wall.lengthOfBoltOption) || 'N/A'})) × S/R Multiplier (${(wall.srMultiplierOption === 'custom' ? wall.srMultiplierCustom : wall.srMultiplierOption) || 'N/A'})⌉`;
            }
        }

        return (
            <div
                onMouseEnter={() => handleMouseEnterField(fieldKey)}
                onMouseLeave={handleMouseLeaveField}
                className={getFieldHighlightClass(fieldKey)}
            >
                <div className="info-icon-container">
                    <Label htmlFor={`${id}-${fieldKey}`} className={getLabelHighlightClass(fieldKey)}>{label}</Label>
                    {baseTooltipText && (
                        <span className="info-icon" tabIndex={0} role="button" aria-label={`Info for ${label}`}>
                            <InfoIcon />
                            <span className="tooltip-text">{dynamicTooltip}</span>
                        </span>
                    )}
                </div>
                <Input id={`${id}-${fieldKey}`} type="text" value={value !== undefined && value !== null ? (unit ? `${value} ${unit}` : String(value)) : ''} className={`input-readonly ${extraClass}`} readOnly tabIndex={-1} />
            </div>
        );
    };

    const renderInput = (label: string, fieldKey: keyof Wall, type: string = "number", placeholder?: string, options?: { label: string, value: string | number }[]) => {
        return (
            <div
                onMouseEnter={() => handleMouseEnterField(fieldKey)}
                onMouseLeave={handleMouseLeaveField}
                className={getFieldHighlightClass(fieldKey)}
            >
                <Label htmlFor={`${id}-${fieldKey}`} className={getLabelHighlightClass(fieldKey)}>{label}</Label>
                {options ? (
                    <Select id={`${id}-${fieldKey}`} onValueChange={(val) => handleInputChange(fieldKey, val === 'custom' ? 'custom' : Number(val))} value={(wall as any)[fieldKey]}>
                        <SelectTrigger><SelectValue placeholder={`Select ${label.toLowerCase()}`} /></SelectTrigger>
                        <SelectContent>
                            {options.map(opt => <SelectItem key={String(opt.value)} value={String(opt.value)}>{opt.label}</SelectItem>)}
                        </SelectContent>
                    </Select>
                ) : (
                    <Input
                        id={`${id}-${fieldKey}`}
                        type={type}
                        value={(wall as any)[fieldKey] || ''}
                        onChange={(e) => handleInputChange(fieldKey, e.target.value)}
                        onWheel={type === "number" ? handleNumberInputWheel : undefined}
                        className="mt-1"
                        placeholder={placeholder}
                    />
                )}
            </div>
        );
    };

    return (
        <Card className="card-mb-6">
            <div className="card-header-wall" onClick={() => onToggleCollapse(id)}>
                <div className="flex items-center flex-grow-0 min-w-0">
                    <Button variant="ghost" size="icon" className="mr-2" baseClass="btn" style={{ height: '2rem', width: '2rem' }}> {isCollapsed ? <ChevronDown /> : <ChevronUp />} </Button>
                    <Input id={`wallName-${id}`} value={wall.name || ''} onChange={(e) => { e.stopPropagation(); handleInputChange('name', e.target.value); }} onClick={(e) => e.stopPropagation()} className="input-wall-name" placeholder="Wall Name" />
                </div>
                <div className="flex items-center flex-shrink-0"> {isCollapsed && wall.grandTotalLabor !== undefined && ( <span style={{ fontSize: '0.875rem', fontWeight: 600, marginRight: '0.75rem', color: wall.grandTotalLabor < 0 ? '#ef4444' : '#16a34a' }}> Wall Labor: ${wall.grandTotalLabor.toFixed(2)} </span> )} <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onDelete(id); }} baseClass="btn" style={{ height: '2rem', width: '2rem', borderRadius: '9999px', padding: '0.25rem' }} aria-label={`Delete ${name}`}> <Trash2 style={{ height: '1rem', width: '1rem' }} /> </Button> </div>
            </div>
            {!isCollapsed && ( <CardContent className="card-content-grid-wall">
                {renderInput("Net Height of Wall to Paper (in)", "heightOfWall", "number", "e.g., 96")}
                {renderInput("Width of Wall to Paper (in)", "width", "number", "e.g., 144")}
                <div>
                    <div onMouseEnter={() => handleMouseEnterField('paperWidthOption')} onMouseLeave={handleMouseLeaveField} className={getFieldHighlightClass('paperWidthOption')}>
                        <Label htmlFor={`${id}-paperWidthOption`} className={getLabelHighlightClass('paperWidthOption')}>Paper Width</Label>
                        <Select id={`${id}-paperWidthOption`} onValueChange={(value) => { handleInputChange('paperWidthOption', value === 'custom' ? 'custom' : Number(value)); if (value !== 'custom') handleInputChange('paperWidthCustom', undefined); }} value={wall.paperWidthOption}> <SelectTrigger><SelectValue placeholder="Select width" /></SelectTrigger> <SelectContent> {PAPER_WIDTH_OPTIONS.map((option) => <SelectItem key={option.value} value={String(option.value)}>{option.label}</SelectItem>)} </SelectContent> </Select>
                    </div>
                    {wall.paperWidthOption === 'custom' && (<div className={`mt-2 ${getFieldHighlightClass('paperWidthCustom')}`} onMouseEnter={() => handleMouseEnterField('paperWidthCustom')} onMouseLeave={handleMouseLeaveField}><Label htmlFor={`${id}-paperWidthCustom`} className={`label-xs ${getLabelHighlightClass('paperWidthCustom')}`}>Custom Width (in)</Label><Input id={`${id}-paperWidthCustom`} type="number" value={wall.paperWidthCustom || ''} onChange={(e) => handleInputChange('paperWidthCustom', e.target.value)} onWheel={handleNumberInputWheel} className="mt-1" /></div>)}
                </div>
                <div>
                    <div onMouseEnter={() => handleMouseEnterField('lengthOfBoltOption')} onMouseLeave={handleMouseLeaveField} className={getFieldHighlightClass('lengthOfBoltOption')}>
                        <Label htmlFor={`${id}-lengthOfBoltOption`} className={getLabelHighlightClass('lengthOfBoltOption')}>Length of Packaged Bolt</Label>
                        <Select id={`${id}-lengthOfBoltOption`} onValueChange={(value) => { handleInputChange('lengthOfBoltOption', value === 'custom' ? 'custom' : Number(value)); if (value !== 'custom') handleInputChange('lengthOfBoltCustom', undefined); }} value={wall.lengthOfBoltOption}> <SelectTrigger><SelectValue placeholder="Select length" /></SelectTrigger> <SelectContent> {BOLT_LENGTH_OPTIONS.map((option) => <SelectItem key={option.value} value={String(option.value)}>{option.label}</SelectItem>)} </SelectContent> </Select>
                    </div>
                    {wall.lengthOfBoltOption === 'custom' && (<div className={`mt-2 ${getFieldHighlightClass('lengthOfBoltCustom')}`} onMouseEnter={() => handleMouseEnterField('lengthOfBoltCustom')} onMouseLeave={handleMouseLeaveField}><Label htmlFor={`${id}-lengthOfBoltCustom`} className={`label-xs ${getLabelHighlightClass('lengthOfBoltCustom')}`}>Custom Length (in)</Label><Input id={`${id}-lengthOfBoltCustom`} type="number" value={wall.lengthOfBoltCustom || ''} onChange={(e) => handleInputChange('lengthOfBoltCustom', e.target.value)} onWheel={handleNumberInputWheel} className="mt-1" /></div>)}
                </div>
                {renderInput("Pattern Vertical Repeat (in)", "patternVerticalRepeat", "number", "0 if no repeat")}
                {renderInput("Pattern Match", "patternMatch", "select", undefined, PATTERN_MATCH_OPTIONS)}
                {renderInput("Installation Priced By", "pricedBy", "select", undefined, PRICING_OPTIONS)}
                {renderInput("Unit Price of Wallpaper ($ per Bolt)", "unitPriceOfWallpaper", "number", "e.g., 75")}
                <div>
                    <div onMouseEnter={() => handleMouseEnterField('srMultiplierOption')} onMouseLeave={handleMouseLeaveField} className={getFieldHighlightClass('srMultiplierOption')}>
                        <Label htmlFor={`${id}-srMultiplierOption`} className={getLabelHighlightClass('srMultiplierOption')}>S/R per Bolt Multiplier</Label>
                        <Select id={`${id}-srMultiplierOption`} onValueChange={(value) => { handleInputChange('srMultiplierOption', value === 'custom' ? 'custom' : Number(value)); if (value !== 'custom') handleInputChange('srMultiplierCustom', undefined); }} value={wall.srMultiplierOption}>
                            <SelectTrigger><SelectValue placeholder="Select S/R Multiplier" /></SelectTrigger>
                            <SelectContent>
                                {SR_MULTIPLIER_OPTIONS.map((option) => <SelectItem key={String(option.value)} value={String(option.value)}>{option.label}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    {wall.srMultiplierOption === 'custom' && (<div className={`mt-2 ${getFieldHighlightClass('srMultiplierCustom')}`} onMouseEnter={() => handleMouseEnterField('srMultiplierCustom')} onMouseLeave={handleMouseLeaveField}><Label htmlFor={`${id}-srMultiplierCustom`} className={`label-xs ${getLabelHighlightClass('srMultiplierCustom')}`}>Custom S/R Multiplier</Label><Input id={`${id}-srMultiplierCustom`} type="number" value={wall.srMultiplierCustom || ''} onChange={(e) => handleInputChange('srMultiplierCustom', e.target.value)} onWheel={handleNumberInputWheel} className="mt-1" /></div>)}
                </div>
                {renderInput("Perimeter (Optional, for notes)", "perimeterWallWidth", "number", "e.g., 400")}

                {renderReadOnlyInput('Vert. Height of Matched Repeat (in)', "verticalHeightOfMatchedRepeat", wall.verticalHeightOfMatchedRepeat, undefined, `Pattern Vert. Repeat (${wall.patternVerticalRepeat || 'N/A'}) × Pattern Match (${wall.patternMatch || 'N/A'})`)}
                {renderReadOnlyInput('# of Cuts for Project', "numberOfCutsForProject", wall.numberOfCutsForProject, undefined, `⌈Wall Width (${wall.width || 'N/A'}) / Paper Width (${(wall.paperWidthOption === 'custom' ? wall.paperWidthCustom : wall.paperWidthOption) || 'N/A'})⌉`)}
                {renderReadOnlyInput('# of Repeats per Cut', "numberOfRepeatsPerCut", wall.numberOfRepeatsPerCut, undefined, `⌈(Net Height (${wall.heightOfWall || 'N/A'}) + 4″) / Vert. Height of Matched Repeat (${wall.verticalHeightOfMatchedRepeat?.toFixed(2) || 'N/A'})⌉`)}
                {renderReadOnlyInput('Length of Cuts (incl. trim) (in)', "lengthOfCuts", wall.lengthOfCuts?.toFixed(2), undefined, `# Repeats per Cut (${wall.numberOfRepeatsPerCut || 'N/A'}) × Vert. Height of Matched Repeat (${wall.verticalHeightOfMatchedRepeat?.toFixed(2) || 'N/A'})`)}
                {renderReadOnlyInput('Calculated Total Length Needed (in)', "totalLengthNeeded", wall.totalLengthNeeded?.toFixed(2), undefined, `Length of Cuts (${wall.lengthOfCuts?.toFixed(2) || 'N/A'}) × # of Cuts (${wall.numberOfCutsForProject || 'N/A'})`)}
                {renderReadOnlyInput('# of Cut Lengths per Bolt', "numberOfCutLengthsPerBolt", wall.numberOfCutLengthsPerBolt, undefined, `⌊Bolt Length (${(wall.lengthOfBoltOption === 'custom' ? wall.lengthOfBoltCustom : wall.lengthOfBoltOption) || 'N/A'}) / Length of Cuts (${wall.lengthOfCuts?.toFixed(2) || 'N/A'})⌋`)}
                {renderReadOnlyInput('# of Bolts to Order', "numberOfBolts", wall.numberOfBolts, undefined, `⌈# of Cuts (${wall.numberOfCutsForProject || 'N/A'}) / # Cut Lengths per Bolt (${wall.numberOfCutLengthsPerBolt || 'N/A'})⌉`)}
                {renderReadOnlyInput('Total Material from Bolts (in)', "totalLengthPurchased", wall.totalLengthPurchased?.toFixed(2), undefined, `# Bolts (${wall.numberOfBolts || 'N/A'}) × Bolt Length (${(wall.lengthOfBoltOption === 'custom' ? wall.lengthOfBoltCustom : wall.lengthOfBoltOption) || 'N/A'})`)}
                {renderReadOnlyInput('# of Yards to Order', "numberOfYardsToOrder", wall.numberOfYardsToOrder, undefined, `⌈Calculated Total Length Needed (${wall.totalLengthNeeded?.toFixed(2) || 'N/A'}) / 36⌉`)}
                {renderReadOnlyInput('Equiv. Project S/R Calc.', "equivalentProjectSRCalculation", wall.equivalentProjectSRCalculation, undefined, `⌈(Calc. Total Length (${wall.totalLengthNeeded?.toFixed(2) || 'N/A'}) / Bolt Length (${(wall.lengthOfBoltOption === 'custom' ? wall.lengthOfBoltCustom : wall.lengthOfBoltOption) || 'N/A'})) × S/R Multiplier (${(wall.srMultiplierOption === 'custom' ? wall.srMultiplierCustom : wall.srMultiplierOption) || 'N/A'})⌉`)}
                {renderReadOnlyInput('Base Labor ($)', "baseLabor", wall.baseLabor?.toFixed(2), undefined, `Equiv. S/R Calc. (${wall.equivalentProjectSRCalculation || 'N/A'}) × Price/SR (or 38% of Material Cost)`)}
                {renderReadOnlyInput('Height Surcharge ($)', "heightSurcharge", wall.heightSurcharge?.toFixed(2), undefined, `((Room Ceiling Ht. - 96″) / 12) × $100`)}
                {renderReadOnlyInput('Wall Labor Total ($)', "grandTotalLabor", wall.grandTotalLabor?.toFixed(2), 'font-bold-lg-green', "Base Labor + Height Surcharge")}
            </CardContent> )}
        </Card>
    );
};

const ProjectMenuModal = ({ isOpen, onClose, projects, currentProjectId, onSelectProject, onAddProject, onDeleteProject, searchTerm, onSearchTermChange }: { isOpen: boolean; onClose: () => void; projects: Project[]; currentProjectId: string | null; onSelectProject: (id: string) => void; onAddProject: () => void; onDeleteProject: (id: string) => void; searchTerm: string; onSearchTermChange: (term: string) => void; }) => { if (!isOpen) return null; const filteredProjects = projects.filter(proj => proj.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return (
        <div className="project-menu-modal-overlay"> <div className="project-menu-modal-backdrop" onClick={onClose}></div> <div className={`project-menu-modal-content ${isOpen ? 'open' : ''}`}> <div className="project-menu-header"> <h2 className="project-menu-title">Projects</h2> <Button variant="ghost" size="icon" onClick={onClose} baseClass="btn" style={{color: '#64748b'}}> <XIcon /> </Button> </div> <div className="project-menu-search-container"> <div className="project-menu-search-input-wrapper"> <Input type="search" placeholder="Search projects..." value={searchTerm} onChange={(e) => onSearchTermChange(e.target.value)} className="project-menu-search-input" /> <Search /> </div> <Button onClick={() => {onAddProject();}} className="project-menu-new-btn"> <FolderPlus /> New Project </Button> </div> <div className="project-menu-list"> {filteredProjects.length > 0 ? filteredProjects.map(proj => ( <div key={proj.id} className={`project-menu-item ${currentProjectId === proj.id ? 'current' : ''}`}> <Button onClick={() => { onSelectProject(proj.id); onClose(); }} baseClass="btn project-menu-item-button" variant="ghost" > {proj.name} </Button> {projects.length > 1 && ( <Button onClick={(e) => { e.stopPropagation(); onDeleteProject(proj.id); }} variant="ghost" size="icon" baseClass="btn project-menu-item-delete-btn" aria-label="Delete project"> <Trash2 /> </Button> )} </div> )) : <p className="project-menu-empty-text">No projects match your search.</p>} {projects.length === 0 && !searchTerm && <p className="project-menu-empty-text">No projects yet. Click "New Project" to start.</p>} </div> </div> </div>
    );
};

const App = () => {
    const [projects, setProjects] = useState<Project[]>(() => {
        const savedData = localStorage.getItem('wallpaperCalculatorData_v3');
        if (savedData) {
            try {
                const parsedData = JSON.parse(savedData);
                return parsedData.projects.map((proj: Project) => ({
                    ...proj,
                    generalProjectInfo: proj.generalProjectInfo || createNewGeneralProjectInfo(),
                    clientInfo: proj.clientInfo || createNewClientInfo(),
                    isClientInfoCollapsed: proj.isClientInfoCollapsed === undefined ? false : proj.isClientInfoCollapsed,
                    isGeneralProjectInfoCollapsed: proj.isGeneralProjectInfoCollapsed === undefined ? false : proj.isGeneralProjectInfoCollapsed,
                    rooms: proj.rooms.map((room: Room) => ({
                        ...room,
                        details: room.details || createNewRoomSpecificInfo(),
                        isCollapsed: room.isCollapsed === undefined ? false : room.isCollapsed,
                        walls: room.walls.map((wall: Wall) => ({
                            ...calculateWallValues(wall, room.details?.ceilingHeight),
                            isCollapsed: wall.isCollapsed === undefined ? false : wall.isCollapsed
                        }))
                    }))
                })) || [createNewProject(1)];
            } catch (e) { console.error("Failed to parse saved projects:", e); }
        }
        return [createNewProject(1)];
    });
    const [currentProjectId, setCurrentProjectId] = useState<string | null>(() => { const savedData = localStorage.getItem('wallpaperCalculatorData_v3'); if (savedData) { try { const parsedData = JSON.parse(savedData); return parsedData.currentProjectId || (projects.length > 0 ? projects[0].id : null); } catch(e) {} } return projects.length > 0 ? projects[0].id : null; });
    const [currentRoomId, setCurrentRoomId] = useState<string | null>(() => { const savedData = localStorage.getItem('wallpaperCalculatorData_v3'); if (savedData) { try { const parsedData = JSON.parse(savedData); const cpid = parsedData.currentProjectId || (projects.length > 0 ? projects[0].id : null); return parsedData.currentRoomId || projects.find(p=>p.id === cpid)?.rooms[0]?.id || null; } catch(e) {} } const cpid = projects.length > 0 ? projects[0].id : null; return projects.find(p=>p.id === cpid)?.rooms[0]?.id || null; });
    const [error, setError] = useState<string | null>(null);
    const [infoMessage, setInfoMessage] = useState<string | null>(null);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const [projectSearchTerm, setProjectSearchTerm] = useState('');
    const [isProjectMenuOpen, setIsProjectMenuOpen] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const debouncedHasUnsavedChanges = useDebounce(hasUnsavedChanges, AUTO_SAVE_DEBOUNCE_TIME);

    const currentProject = useMemo(() => projects.find(p => p.id === currentProjectId), [projects, currentProjectId]);

    useEffect(() => { if (debouncedHasUnsavedChanges && projects && projects.length > 0) { handleSave(true); setHasUnsavedChanges(false); } }, [debouncedHasUnsavedChanges, projects]);
    useEffect(() => { if (infoMessage) { const timer = setTimeout(() => setInfoMessage(null), 3000); return () => clearTimeout(timer); }}, [infoMessage]);
    useEffect(() => { if (error) { const timer = setTimeout(() => setError(null), 5000); return () => clearTimeout(timer); }}, [error]);

    const markUnsaved = () => { setHasUnsavedChanges(true); setSaveStatus('idle'); }
    const handleAddProject = () => { const newProject = createNewProject(projects.length + 1); setProjects(prev => [...prev, newProject]); setCurrentProjectId(newProject.id); setCurrentRoomId(newProject.rooms[0]?.id || null); setInfoMessage(`Project "${newProject.name}" added.`); markUnsaved(); };
    const handleDeleteProject = (projectId: string) => { if (projects.length === 1) { setError("Cannot delete the last project."); return; } const projectName = projects.find(p=>p.id === projectId)?.name || "Project"; setProjects(prev => prev.filter(p => p.id !== projectId)); if (currentProjectId === projectId) { const remainingProjects = projects.filter(p => p.id !== projectId); const firstProject = remainingProjects.length > 0 ? remainingProjects[0] : null; setCurrentProjectId(firstProject?.id || null); setCurrentRoomId(firstProject?.rooms[0]?.id || null); } setInfoMessage(`Project "${projectName}" deleted.`); markUnsaved(); if (projects.filter(p => p.id !== projectId).length === 0) { setIsProjectMenuOpen(false); setCurrentProjectId(null); setCurrentRoomId(null);} };
    const handleProjectNameChange = (projectId: string, newName: string) => { setProjects(prev => prev.map(p => p.id === projectId ? { ...p, name: newName } : p)); markUnsaved(); };
    const handleSelectProject = (projectId: string) => { setCurrentProjectId(projectId); setCurrentRoomId(projects.find(p => p.id === projectId)?.rooms[0]?.id || null); };
    const handleNumberInputWheel = (event: React.WheelEvent<HTMLInputElement>) => {
        // Prevent the default scroll behavior only if the input is focused
        if (document.activeElement === event.currentTarget) {
            event.preventDefault();
        }
    };

    const handleAddRoom = () => {
        if (!currentProjectId || !currentProject) return;
        const newRoom = createNewRoom(currentProject.rooms.length + 1);
        setProjects(prev => prev.map(p => p.id === currentProjectId ? { ...p, rooms: [...p.rooms, newRoom] } : p));
        setCurrentRoomId(newRoom.id);
        setInfoMessage(`Room "${newRoom.name}" added to ${currentProject.name}.`);
        markUnsaved();
    };
    const handleDeleteRoom = (roomId: string) => { if (!currentProjectId || !currentProject) return; if (currentProject.rooms.length === 1) { setError(`Cannot delete the last room in project "${currentProject.name}".`); return; } const roomName = currentProject.rooms.find(r=>r.id === roomId)?.name || "Room"; setProjects(prev => prev.map(p => p.id === currentProjectId ? { ...p, rooms: p.rooms.filter(r => r.id !== roomId) } : p)); if (currentRoomId === roomId) { setCurrentRoomId(currentProject.rooms.filter(r => r.id !== roomId)[0]?.id || null); } setInfoMessage(`Room "${roomName}" deleted.`); markUnsaved(); };
    const handleRoomNameChange = (roomId: string, newName: string) => { if (!currentProjectId || !currentProject) return; setProjects(prev => prev.map(p => p.id === currentProjectId ? { ...p, rooms: p.rooms.map(r => r.id === roomId ? {...r, name: newName} : r) } : p)); markUnsaved(); };
    const toggleRoomCollapse = (roomId: string) => { if (!currentProjectId || !currentProject) return; setProjects(prev => prev.map(p => p.id === currentProjectId ? { ...p, rooms: p.rooms.map(r => r.id === roomId ? {...r, isCollapsed: !r.isCollapsed} : r) } : p)); markUnsaved(); };

    const handleRoomDetailsChange = (roomId: string, field: keyof RoomSpecificInfo, value: any) => {
        if (!currentProjectId) return;
        setProjects(prev => prev.map(p => {
            if (p.id === currentProjectId) {
                return {
                    ...p,
                    rooms: p.rooms.map(r => {
                        if (r.id === roomId) {
                            const updatedDetails = { ...r.details, [field]: value };
                            if (field === 'ceilingHeight') {
                                return {
                                    ...r,
                                    details: updatedDetails,
                                    walls: r.walls.map(wall => calculateWallValues(wall, value as number | undefined))
                                };
                            }
                            return { ...r, details: updatedDetails };
                        }
                        return r;
                    })
                };
            }
            return p;
        }));
        markUnsaved();
    };
    const handleNumericRoomDetailsChange = (roomId: string, field: keyof RoomSpecificInfo, value: string) => {
        handleRoomDetailsChange(roomId, field, value === '' ? undefined : Number(value));
    };
    const toggleRoomDetailsCollapse = (roomId: string) => {
        if (!currentProjectId) return;
        setProjects(prev => prev.map(p => p.id === currentProjectId ? { ...p, rooms: p.rooms.map(r => r.id === roomId ? {...r, details: {...r.details, isDetailsCollapsed: !r.details.isDetailsCollapsed}} : r) } : p));
        markUnsaved();
    };

    const toggleClientInfoCollapse = (projectId: string) => { setProjects(prev => prev.map(p => p.id === projectId ? { ...p, isClientInfoCollapsed: !p.isClientInfoCollapsed } : p)); markUnsaved(); };
    const toggleGeneralProjectInfoCollapse = (projectId: string) => { setProjects(prev => prev.map(p => p.id === projectId ? { ...p, isGeneralProjectInfoCollapsed: !p.isGeneralProjectInfoCollapsed } : p)); markUnsaved(); };

    const handleAddWall = (targetRoomId: string) => {
        if (!currentProjectId || !currentProject) return;
        let targetRoomNameForMessage = "Unknown Room";
        let wallCountInTargetRoomForNaming = 0;
        const projectInstance = projects.find(p => p.id === currentProjectId);
        let roomCeilingHeight: number | undefined = undefined;
        if (projectInstance) {
            const roomInstance = projectInstance.rooms.find(r => r.id === targetRoomId);
            if (roomInstance) {
                targetRoomNameForMessage = roomInstance.name;
                wallCountInTargetRoomForNaming = roomInstance.walls.length;
                roomCeilingHeight = roomInstance.details.ceilingHeight;
            } else { console.error("Target room not found"); setError("Could not add wall: target room not found."); return; }
        } else { console.error("Current project not found"); setError("Could not add wall: current project not found."); return; }
        const newWall = createNewWall(wallCountInTargetRoomForNaming + 1);
        setProjects(prev => prev.map(p => p.id === currentProjectId ? { ...p, rooms: p.rooms.map(r => r.id === targetRoomId ? { ...r, walls: [...r.walls, calculateWallValues(newWall, roomCeilingHeight)] } : r ) } : p ));
        setInfoMessage(`Wall "${newWall.name}" added to ${targetRoomNameForMessage}.`);
        markUnsaved();
    };

    const handleDeleteWall = (roomId: string, wallId: string) => { if (!currentProjectId) return; setProjects(prevProjects => prevProjects.map(proj => { if (proj.id !== currentProjectId) return proj; return { ...proj, rooms: proj.rooms.map(room => { if (room.id !== roomId) return room; if (room.walls.length === 1) { setError(`Cannot delete the last wall in room "${room.name}".`); return room; } const wallName = room.walls.find(w => w.id === wallId)?.name || "Wall"; setInfoMessage(`Wall "${wallName}" deleted from ${room.name}.`); return { ...room, walls: room.walls.filter(w => w.id !== wallId) }; })}; })); markUnsaved(); };

    const handleWallChange = useCallback((roomId: string, wallId: string, updates: Partial<Wall>) => {
        setProjects(prevProjects => prevProjects.map(proj => {
            if (proj.id !== currentProjectId) return proj;
            const targetRoom = proj.rooms.find(r => r.id === roomId);
            const roomCeilingHeight = targetRoom?.details?.ceilingHeight;
            return { ...proj, rooms: proj.rooms.map(room => {
                    if (room.id !== roomId) return room;
                    return { ...room, walls: room.walls.map(wall => wall.id === wallId ? calculateWallValues({ ...wall, ...updates }, roomCeilingHeight) : wall)};
                })};
        }));
        markUnsaved();
    }, [currentProjectId]);

    const toggleWallCollapse = (roomId: string, wallId: string) => { if (!currentProjectId) return; setProjects(prevProjects => prevProjects.map(proj => { if (proj.id !== currentProjectId) return proj; return { ...proj, rooms: proj.rooms.map(room => { if (room.id !== roomId) return room; return { ...room, walls: room.walls.map(wall => wall.id === wallId ? { ...wall, isCollapsed: !wall.isCollapsed } : wall)}; })}; })); markUnsaved(); };

    const handleClientInfoChange = (field: keyof ClientInfo, value: any) => {
        if (!currentProjectId || !currentProject) return;
        setProjects(prev => prev.map(p => p.id === currentProjectId ? { ...p, clientInfo: { ...p.clientInfo, [field]: value } } : p));
        markUnsaved();
    };
    const handleGeneralProjectInfoChange = (field: keyof GeneralProjectInfo, value: any) => {
        if (!currentProjectId || !currentProject) return;
        setProjects(prev => prev.map(p => p.id === currentProjectId ? { ...p, generalProjectInfo: { ...p.generalProjectInfo, [field]: value } } : p));
        markUnsaved();
    };
    const handleNumericGeneralProjectInfoChange = (field: keyof GeneralProjectInfo, value: string) => { handleGeneralProjectInfoChange(field, value === '' ? undefined : Number(value)); };

    const handleSave = useCallback((isAutoSave = false) => {
        if (!isAutoSave) {setInfoMessage(null); setHasUnsavedChanges(false);}
        setError(null);
        setSaveStatus('saving');
        try {
            const dataToSave = { projects, currentProjectId, currentRoomId };
            const jsonData = JSON.stringify(dataToSave, null, 2);
            localStorage.setItem('wallpaperCalculatorData_v3', jsonData);
            setTimeout(() => {
                setSaveStatus('saved');
                if (!isAutoSave) setInfoMessage('All projects saved successfully!');
                setTimeout(() => setSaveStatus('idle'), 2000);
            }, 500);
        } catch (e: any) {
            setSaveStatus('error');
            setError(`Error saving data: ${e.message}`);
        }
    }, [projects, currentProjectId, currentRoomId]);

    const handleLoad = () => { setError(null); setInfoMessage(null); try { const savedData = localStorage.getItem('wallpaperCalculatorData_v3'); if (savedData) { const parsedData = JSON.parse(savedData); const loadedProjects: Project[] = parsedData.projects.map((proj: Project) => ({ ...proj, generalProjectInfo: proj.generalProjectInfo || createNewGeneralProjectInfo(), clientInfo: proj.clientInfo || createNewClientInfo(), isClientInfoCollapsed: proj.isClientInfoCollapsed === undefined ? false : proj.isClientInfoCollapsed, isGeneralProjectInfoCollapsed: proj.isGeneralProjectInfoCollapsed === undefined ? false : proj.isGeneralProjectInfoCollapsed, rooms: proj.rooms.map((room: Room) => ({ ...room, details: room.details || createNewRoomSpecificInfo(), isCollapsed: room.isCollapsed === undefined ? false : room.isCollapsed, walls: room.walls.map((wall: Wall) => ({...calculateWallValues(wall, room.details?.ceilingHeight), isCollapsed: wall.isCollapsed === undefined ? false : wall.isCollapsed})) })) })); setProjects(loadedProjects || [createNewProject(1)]); const cpid = parsedData.currentProjectId || (loadedProjects.length > 0 ? loadedProjects[0].id : null); setCurrentProjectId(cpid); setCurrentRoomId(parsedData.currentRoomId || loadedProjects.find(p=>p.id === cpid)?.rooms[0]?.id || null); setInfoMessage('Projects loaded successfully!'); } else { setInfoMessage('No saved data found.'); } } catch (e: any) { setError(`Error loading data: ${e.message}`); } setSaveStatus('idle'); setHasUnsavedChanges(false); };
    useEffect(() => { if (projects.length > 0) { if (!currentProjectId || !projects.find(p => p.id === currentProjectId)) { const firstProject = projects[0]; setCurrentProjectId(firstProject.id); setCurrentRoomId(firstProject.rooms[0]?.id || null); } else { const proj = projects.find(p => p.id === currentProjectId); if (proj && (!currentRoomId || !proj.rooms.find(r => r.id === currentRoomId))) { setCurrentRoomId(proj.rooms[0]?.id || null); } } } else { setCurrentProjectId(null); setCurrentRoomId(null); } }, [projects, currentProjectId, currentRoomId]);

    const projectTravelCharges = useMemo(() => {
        if (!currentProject || !currentProject.generalProjectInfo) return 0;
        const { roundTripMileage, numberOfDaysForInstall } = currentProject.generalProjectInfo;
        if (roundTripMileage === undefined || numberOfDaysForInstall === undefined) return 0;
        return Math.round((roundTripMileage * 0.655 * numberOfDaysForInstall));
    }, [currentProject]);

    const totalProjectLaborWithTravel = useMemo(() => {
        if (!currentProject) return 0;
        const laborFromWalls = currentProject.rooms.reduce((projectTotal, room) => projectTotal + room.walls.reduce((roomWallTotal, wall) => roomWallTotal + (wall.grandTotalLabor || 0), 0), 0);
        return laborFromWalls + projectTravelCharges;
    }, [currentProject, projectTravelCharges]);

    const getRoomTotalLabor = useCallback((room: Room | undefined) => { if (!room) return 0; return room.walls.reduce((total, wall) => total + (wall.grandTotalLabor || 0), 0); }, []);

    if (projects.length === 0 && !currentProject) { return ( <div className="no-projects-container"> <AppStyles /> <div className="no-projects-content"> <FolderPlus className="no-projects-icon" /> <h1 className="no-projects-title">No Projects Yet</h1> <p className="no-projects-text">Get started by creating your first project.</p> <Button onClick={handleAddProject} className="no-projects-button"> <Plus /> Create New Project </Button> </div> <footer className="footer-text"> Wallpaper Calculator &copy; {new Date().getFullYear()} </footer> </div> ); }

    return (
        <div className="app-container">
            <AppStyles />
            <ProjectMenuModal isOpen={isProjectMenuOpen} onClose={() => setIsProjectMenuOpen(false)} projects={projects} currentProjectId={currentProjectId} onSelectProject={handleSelectProject} onAddProject={handleAddProject} onDeleteProject={handleDeleteProject} searchTerm={projectSearchTerm} onSearchTermChange={setProjectSearchTerm} />
            <div className="sticky-header">
                {error && (<Alert variant="destructive"><AlertCircle /><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>)}
                {infoMessage && (<Alert variant="success"><CheckCircle /><AlertTitle>Success</AlertTitle><AlertDescription>{infoMessage}</AlertDescription></Alert>)}
                <div className="header-content">
                    <div className="header-left"> <Button variant="ghost" size="icon" onClick={() => setIsProjectMenuOpen(true)} className="btn-open-menu" aria-label="Open project menu"> <MenuIcon /> </Button> <h1 className="app-title">Wallpaper Calculator</h1> </div>
                    <div className="header-right"> <span className={`save-status ${saveStatus !== 'idle' || hasUnsavedChanges ? 'save-status-visible' : 'save-status-hidden'}`}> {hasUnsavedChanges && saveStatus === 'idle' && <span className="status-unsaved">Unsaved</span>} {saveStatus === 'saving' && <span className="status-saving">Saving...</span>} {saveStatus === 'saved' && <span className="status-saved">Saved</span>} {saveStatus === 'error' && <span className="status-error">Save failed</span>} </span> <Button onClick={() => handleSave(false)} className="btn-manualsave" size="xs-sm"> <Save /> Manual Save </Button> </div>
                </div>
            </div>

            {!currentProject && projects.length > 0 && ( <Card className="card-my-8"> <CardContent className="text-center py-10" style={{textAlign: 'center', paddingTop: '2.5rem', paddingBottom: '2.5rem'}}> <FolderPlus style={{height: '3rem', width: '3rem', color: '#94a3b8', margin: '0 auto 0.75rem auto'}} /> <p style={{color: '#475569', marginBottom: '1rem'}}>Please select or create a project to begin.</p> <Button onClick={() => setIsProjectMenuOpen(true)} className="mt-4 bg-blue-500 hover:bg-blue-600 text-white" style={{marginTop: '1rem', backgroundColor: '#3b82f6', color: 'white'}}>Open Project Menu</Button> </CardContent> </Card> )}

            {currentProject && (
                <>
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3" style={{marginBottom: '1rem', display:'flex', flexWrap: 'wrap', alignItems:'center', justifyContent:'space-between', gap:'0.75rem'}}> <Input value={currentProject.name} onChange={(e) => handleProjectNameChange(currentProject.id, e.target.value)} className="input-project-name" placeholder="Project Name" /> <div className="total-project-labor"> <DollarSign /> Total Project Labor: ${totalProjectLaborWithTravel.toFixed(2)} </div> </div>
                    <Card className="card-mb-6">
                        <CardHeader className="card-header-flex card-header-interactive" onClick={() => toggleClientInfoCollapse(currentProject.id)}> <CardTitle className="card-title-sky">Client Information</CardTitle> <Button variant="ghost" size="icon" baseClass="btn" style={{color: '#64748b'}}> {currentProject.isClientInfoCollapsed ? <ChevronDown /> : <ChevronUp />} </Button> </CardHeader>
                        {!currentProject.isClientInfoCollapsed && ( <CardContent className="card-content-grid"> <div> <Label htmlFor="clientName">Client Name</Label> <Input id="clientName" value={currentProject.clientInfo.clientName} onChange={(e) => handleClientInfoChange("clientName", e.target.value)} /> </div> <div> <Label htmlFor="clientAddress">Client Address</Label> <Input id="clientAddress" value={currentProject.clientInfo.clientAddress} onChange={(e) => handleClientInfoChange("clientAddress", e.target.value)} /> </div> <div> <Label htmlFor="clientPhone">Client Phone</Label> <Input id="clientPhone" type="tel" value={currentProject.clientInfo.clientPhone} onChange={(e) => handleClientInfoChange("clientPhone", e.target.value)} /> </div> <div> <Label htmlFor="clientEmail">Client Email</Label> <Input id="clientEmail" type="email" value={currentProject.clientInfo.clientEmail} onChange={(e) => handleClientInfoChange("clientEmail", e.target.value)} /> </div> </CardContent> )}
                    </Card>
                    <Card className="card-mb-8">
                        <CardHeader className="card-header-flex card-header-interactive" onClick={() => toggleGeneralProjectInfoCollapse(currentProject.id)}> <CardTitle className="card-title-blue">General Project Details</CardTitle> <Button variant="ghost" size="icon" baseClass="btn" style={{color: '#64748b'}}> {currentProject.isGeneralProjectInfoCollapsed ? <ChevronDown /> : <ChevronUp />} </Button> </CardHeader>
                        {!currentProject.isGeneralProjectInfoCollapsed && ( <CardContent className="card-content-grid card-content-grid-3-cols"> {[ {label: "Designer/Builder", field: "designerBuilderName", type: "text"}, {label: "Project Manager", field: "projectManagerName", type: "text"}, {label: "PM Phone", field: "projectManagerPhone", type: "tel"}, {label: "Invoice To", field: "invoiceTo", type: "text"}, {label: "Project Type", field: "projectType", type: "text"}, {label: "Round Trip Mileage", field: "roundTripMileage", type: "number"}, {label: "# Days for Install", field: "numberOfDaysForInstall", type: "number"}, {label: "Input Date", field: "inputDate", type: "date"}, {label: "Estimate Sent", field: "estimateSentDate", type: "date"}, {label: "Approval Date", field: "approvalDate", type: "date"}, {label: "Order Date", field: "orderDate", type: "date"}, {label: "Order Rec'd", field: "orderReceivedDate", type: "date"}, {label: "Est. Ready Install", field: "estimatedDateReadyForInstall", type: "date"}, {label: "Sched. Install", field: "scheduledInstallDate", type: "date"}, ].map(item => ( <div key={item.field}> <Label htmlFor={`genProjInfo-${item.field}`}>{item.label}</Label> <Input id={`genProjInfo-${item.field}`} type={item.type} value={(currentProject.generalProjectInfo as any)[item.field] || ''} onChange={(e) => item.type === 'number' ? handleNumericGeneralProjectInfoChange(item.field as keyof GeneralProjectInfo, e.target.value) : handleGeneralProjectInfoChange(item.field as keyof GeneralProjectInfo, e.target.value)} className="mt-1" /> </div> ))} <div className="md:col-span-2 lg:col-span-3"> <Label htmlFor="genProjInfo-notes">Notes / Site Conditions</Label> <Textarea id="genProjInfo-notes" value={currentProject.generalProjectInfo.notes} onChange={(e) => handleGeneralProjectInfoChange("notes", e.target.value)} className="mt-1 textarea-h-20" /> </div></CardContent> )}
                    </Card>

                    {/* Rooms Section */}
                    <Card className="card-mb-6">
                        <CardHeader className="card-header-flex-column-sm"> <div> <CardTitle className="card-title-green">Rooms in {currentProject.name}</CardTitle> <CardDescription>Manage rooms, their specific details, and walls.</CardDescription> </div> <Button onClick={handleAddRoom} className="btn-add-wall" style={{backgroundColor: '#14b8a6', marginTop: 0}}> <Home className="mr-2" style={{height:'1.25rem', width:'1.25rem', marginRight:'0.5rem'}}/> Add New Room </Button> </CardHeader>
                        {currentProject.rooms.length > 0 && ( <CardContent className="space-y-4" style={{paddingTop: '1rem', paddingBottom: '1rem'}}> {currentProject.rooms.map(room => { const roomTotalLabor = getRoomTotalLabor(room); return ( <div key={room.id} className="room-item-container"> <div className="room-header" onClick={() => toggleRoomCollapse(room.id)}> <div className="room-header-left"> <Button variant="ghost" size="icon" baseClass="btn" className="mr-2" style={{height: '2rem', width: '2rem', color: '#64748b'}}> {room.isCollapsed ? <ChevronDown /> : <ChevronUp />} </Button> <Input value={room.name} onChange={(e) => {e.stopPropagation(); handleRoomNameChange(room.id, e.target.value);}} onClick={(e) => e.stopPropagation()} className="input-room-name" placeholder="Room Name" /> </div> <div className="room-header-right"> {room.isCollapsed && roomTotalLabor > 0 && (<span className="room-labor-collapsed">Room Labor: ${roomTotalLabor.toFixed(2)}</span>)} {!room.isCollapsed && <span className="room-labor-expanded">({room.walls.length} wall{room.walls.length === 1 ? '' : 's'}) Labor: ${roomTotalLabor.toFixed(2)}</span>} {currentProject.rooms.length > 1 && ( <Button onClick={(e) => { e.stopPropagation(); handleDeleteRoom(room.id); }} variant="ghost" size="icon" baseClass="btn room-delete-btn" aria-label="Delete room"> <Trash2 /> </Button> )} </div> </div>
                            {!room.isCollapsed && (
                                <>
                                    <Card className="room-details-card" style={{margin: '1rem', borderTop: '1px solid #e2e8f0'}}>
                                        <CardHeader className="card-header-flex card-header-interactive room-details-header" onClick={() => toggleRoomDetailsCollapse(room.id)}>
                                            <CardTitle className="card-title-purple" style={{fontSize: '1.1rem'}}>Room Paper & Dimension Details</CardTitle>
                                            <Button variant="ghost" size="icon" baseClass="btn" style={{color: '#64748b'}}>
                                                {room.details.isDetailsCollapsed ? <ChevronDown /> : <ChevronUp />}
                                            </Button>
                                        </CardHeader>
                                        {!room.details.isDetailsCollapsed && (
                                            <CardContent className="card-content-grid card-content-grid-3-cols">
                                                {[
                                                    {label: "Paper Manufacturer", field: "paperManufacturer", type: "text"},
                                                    {label: "Paper Pattern #", field: "paperPatternNumber", type: "text"},
                                                    {label: "Paper Color #", field: "paperColorNumber", type: "text"},
                                                    {label: "Product Photo Link", field: "paperProductPhotoLink", type: "url"},
                                                    {label: "Type of Paper", field: "paperType", type: "text"},
                                                    {label: "Ceiling Height (overall, for surcharge)", field: "ceilingHeight", type: "number"},
                                                    {label: "Baseboard Height (in)", field: "baseboardHeight", type: "number"},
                                                    {label: "Crown Height (in)", field: "verticalCrownHeight", type: "number"},
                                                    {label: "Chair Rail Ht (in)", field: "chairRailHeight", type: "number"},
                                                ].map(item => (
                                                    <div
                                                        key={item.field}>
                                                        <Label htmlFor={`roomDetail-${room.id}-${item.field}`}>{item.label}</Label>
                                                        <Input id={`roomDetail-${room.id}-${item.field}`} type={item.type} value={(room.details as any)[item.field] || ''} onChange={(e) => item.type === 'number' ? handleNumericRoomDetailsChange(room.id, item.field as keyof RoomSpecificInfo, e.target.value) : handleRoomDetailsChange(room.id, item.field as keyof RoomSpecificInfo, e.target.value)} className="mt-1" onWheel={item.type === "number" ? handleNumberInputWheel : undefined} />
                                                    </div>
                                                ))}
                                                <div className="md:col-span-2 lg:col-span-3">
                                                    <Label htmlFor={`roomDetail-${room.id}-paperSpecialRequirements`}>Paper Specific Special Requirements</Label>
                                                    <Textarea id={`roomDetail-${room.id}-paperSpecialRequirements`} value={room.details.paperSpecialRequirements} onChange={(e) => handleRoomDetailsChange(room.id, "paperSpecialRequirements", e.target.value)} className="mt-1 textarea-h-20" />
                                                </div>
                                            </CardContent>
                                        )}
                                    </Card>
                                    <div className="room-content"> {room.walls.map(wall => ( <WallInputCard key={wall.id} wall={wall} onChange={(wallId, updates) => handleWallChange(room.id, wallId, updates)} onDelete={(wallId) => handleDeleteWall(room.id, wallId)} onToggleCollapse={(wallId) => toggleWallCollapse(room.id, wallId)} /> ))} <Button onClick={() => handleAddWall(room.id)} className="btn-add-wall"> <Plus /> Add Wall to {room.name} </Button> </div>
                                </>
                            )}
                        </div> ); })} </CardContent> )}
                        {currentProject.rooms.length === 0 && ( <CardContent style={{textAlign: 'center', paddingTop: '2rem', paddingBottom: '2rem'}}> <Home style={{height: '2.5rem', width: '2.5rem', color: '#94a3b8', margin: '0 auto 0.5rem auto'}} /> <p style={{color: '#64748b', marginBottom: '0.75rem'}}>This project has no rooms yet.</p> <Button onClick={handleAddRoom} style={{backgroundColor: '#14b8a6', color: 'white'}}> <Plus className="mr-2" style={{height:'1rem', width:'1rem', marginRight:'0.5rem'}}/> Add First Room </Button> </CardContent> )}
                    </Card>
                </>
            )}
            <footer className="footer-text"> Wallpaper Calculator &copy; {new Date().getFullYear()} </footer>
        </div>
    );
};

export default App;
