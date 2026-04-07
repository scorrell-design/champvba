/** @type {import('tailwindcss').Config} */

/*
 * ============================================================
 *  Champion Health Admin Portal — Design Token Extraction
 * ============================================================
 *
 *  SOURCE: 4 portal screenshots (Dashboard, Member Search,
 *          Member List/Table, Member Details)
 *
 *  FONT STACK
 *  ──────────
 *  Primary:  Inter (or system fallback)
 *            – Clean geometric sans-serif visible in headings
 *              ("Welcome, Stephanie"), body copy, nav labels,
 *              and form fields.
 *            – Weight range observed: 400 (body), 600 (stat
 *              numbers, nav), 700 (headings, bold metrics).
 *
 *  BORDER-RADIUS — Cards
 *  ─────────────────────
 *  • Dashboard section cards (Open Enrollment / App Highlights):
 *      ~16px  →  rounded-2xl
 *  • Stat metric cards inside sections:
 *      ~12px  →  rounded-xl
 *  • Member details card / form card:
 *      ~12px  →  rounded-xl  (thin border, no shadow)
 *  • Input fields:
 *      ~8px   →  rounded-lg
 *
 *  BORDER-RADIUS — Tables
 *  ──────────────────────
 *  • Table container/wrapper card:
 *      ~12px  →  rounded-xl
 *  • Individual rows: 0 (square, separated by 1px bottom border)
 *  • "View" / "User profile" row-action buttons:
 *      Pill / fully rounded  →  rounded-full
 *
 *  BORDER-RADIUS — Buttons
 *  ───────────────────────
 *  • Primary CTAs ("View full report", "Create VIP member",
 *    "Terminate member", "Edit member"):
 *      Pill / fully rounded  →  rounded-full
 *  • Full-width block buttons ("Search"):
 *      ~8px  →  rounded-lg
 *  • Icon buttons (calendar):
 *      ~8px  →  rounded-lg
 *
 * ============================================================
 */

module.exports = {
    content: ['./src/**/*.{js,jsx,ts,tsx,html}'],
  
    theme: {
      extend: {
  
        /* ── Typography ──────────────────────────────────── */
        fontFamily: {
          sans: [
            'Inter',
            'ui-sans-serif',
            'system-ui',
            '-apple-system',
            'BlinkMacSystemFont',
            'Segoe UI',
            'Roboto',
            'Helvetica Neue',
            'Arial',
            'sans-serif',
          ],
        },
  
        /* ── Color Palette ───────────────────────────────── */
        colors: {
  
          /* Primary Blue Scale
           * Derived from buttons, active sidebar, links, icons.
           * Main interactive color is 500. */
          primary: {
            50:  '#EEF2FF',   // page background tint
            100: '#E0E7FF',   // stat-card inner bg
            200: '#C7D2FE',   // hover-ring / focus-ring
            300: '#A5B4FC',   // lighter accents
            400: '#818CF8',   // —
            500: '#3B6FF6',   // ★ primary buttons, active nav, links
            600: '#2F5CD4',   // button hover
            700: '#2447A8',   // button active / pressed
            800: '#1E3A8A',   // —
            900: '#172554',   // —
          },
  
          /* Grays
           * Sidebar bg, borders, text hierarchy, table headers. */
          gray: {
            50:  '#F9FAFB',   // card bg, table row bg
            100: '#F3F4F6',   // input bg, hover row bg
            200: '#E5E7EB',   // borders, dividers, table row lines
            300: '#D1D5DB',   // input borders, disabled state
            400: '#9CA3AF',   // placeholder text, field labels (member details)
            500: '#6B7280',   // secondary text, table header text
            600: '#4B5563',   // sidebar nav text, body copy
            700: '#374151',   // primary body text
            800: '#1F2937',   // headings, bold stat text
            900: '#111827',   // page titles ("Member details")
          },
  
          /* Semantic: Success */
          success: {
            50:  '#F0FDF4',
            100: '#DCFCE7',
            400: '#4ADE80',
            500: '#22C55E',   // ★ green checkmark circles on dashboard
            600: '#16A34A',
            700: '#15803D',
          },
  
          /* Semantic: Danger */
          danger: {
            50:  '#FEF2F2',
            100: '#FEE2E2',
            400: '#F87171',
            500: '#EF4444',   // ★ "Terminate member" btn, notification badge
            600: '#DC2626',
            700: '#B91C1C',
          },
  
          /* Semantic: Warning (inferred for consistency) */
          warning: {
            50:  '#FFFBEB',
            400: '#FBBF24',
            500: '#F59E0B',
            600: '#D97706',
          },
  
          /* Sidebar */
          sidebar: {
            bg:      '#F5F7FE',   // very light blue-gray sidebar panel
            active:  '#3B6FF6',   // active icon + text color
            hover:   '#EEF2FF',   // hover row bg
          },
        },
  
        /* ── Border Radius ───────────────────────────────── */
        borderRadius: {
          /* These map to the specific radii observed in the portal.
           * Tailwind defaults are kept; these are explicit aliases. */
          'card':       '16px',   // dashboard section cards
          'card-inner': '12px',   // stat cards, detail cards, table wrapper
          'input':      '8px',    // form inputs, block buttons
          'btn':        '9999px', // pill CTAs (rounded-full)
        },
  
        /* ── Box Shadow ──────────────────────────────────── */
        boxShadow: {
          'card':  '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.03)',
          'card-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.06), 0 2px 4px -2px rgba(0, 0, 0, 0.04)',
        },
  
        /* ── Font Size (observed) ────────────────────────── */
        fontSize: {
          'page-title': ['1.75rem', { lineHeight: '2.25rem', fontWeight: '700' }],
          'section-title': ['1.25rem', { lineHeight: '1.75rem', fontWeight: '600' }],
          'stat-value': ['1rem', { lineHeight: '1.5rem', fontWeight: '700' }],
          'table-header': ['0.75rem', { lineHeight: '1rem', fontWeight: '600', letterSpacing: '0.05em' }],
        },
      },
    },
  
    plugins: [],
  };
  