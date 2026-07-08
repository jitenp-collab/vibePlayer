// theme/colors.ts

export const colors = {

    // ─── Base ───────────────────────────────────────────────

    background: '#09090F',        // Main app background (deep near-black)
    surface: '#1E1340',           // Cards, modals, bottom sheets
    surfaceLight: '#2A1A5E',      // Elevated cards, selected states
    overlay: 'rgba(9,9,15,0.85)', // Modal overlays, blur backdrops

    // ─── Brand / Primary ────────────────────────────────────

    primary: '#7C3AED',           // Buttons, active icons, key accents
    primaryLight: '#A78BFA',      // Highlights, borders on dark bg
    primaryFaint: 'rgba(124, 58, 237, 0.15)', // Tinted backgrounds, chips
    primaryBorder: 'rgba(124, 58, 237, 0.45)', // Subtle bordered elements

    // ─── Text ───────────────────────────────────────────────

    textPrimary: '#F4F4F6',       // Headings, body text
    textSecondary: 'rgba(244, 244, 246, 0.55)', // Supporting text, labels
    textMuted: 'rgba(244, 244, 246, 0.38)',     // Placeholders, captions
    textDisabled: 'rgba(244, 244, 246, 0.20)',  // Disabled states

    // ─── Border / Divider ───────────────────────────────────

    border: 'rgba(124, 58, 237, 0.25)',  // Subtle card borders
    borderStrong: 'rgba(124, 58, 237, 0.45)', // Focused / emphasized borders
    divider: 'rgba(244, 244, 246, 0.08)', // Horizontal rules, separators

    // ─── Semantic ───────────────────────────────────────────

    success: '#22C55E',           // Playback active, download done
    successFaint: 'rgba(34, 197, 94, 0.12)',
    warning: '#F59E0B',           // Low battery, sync issues
    warningFaint: 'rgba(245, 158, 11, 0.12)',
    error: '#EF4444',             // Errors, destructive actions
    errorFaint: 'rgba(239, 68, 68, 0.12)',

    // ─── Player specific ────────────────────────────────────

    waveformActive: '#A78BFA',    // Played portion of waveform
    waveformInactive: 'rgba(167, 139, 250, 0.25)', // Unplayed portion
    progressTrack: 'rgba(124, 58, 237, 0.25)',      // Seek bar track
    progressFill: '#7C3AED',                        // Seek bar fill
    progressThumb: '#F4F4F6',                       // Seek bar handle


    tabBg: "#272747d8",
    borderIconClr:"#a78bfa86",

    folderBg:"#918e8e"

} as const;

export type AppColor = keyof typeof colors;