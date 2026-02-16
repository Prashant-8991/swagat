// @ts-nocheck
import { createContext, useContext, useState, useRef, useCallback, useEffect } from "react";
import { useLocation } from "react-router-dom";

// Default session duration in seconds (20 minutes = 1200 seconds) - fallback if API doesn't provide valid_upto
const SESSION_DURATION = 20 * 60;
// Show popup before expiry (1 minute = 60 seconds)
const POPUP_BEFORE_EXPIRY = 60;
// localStorage key for persisting session expiry time (persists across refresh and tab close)
const SESSION_EXPIRY_STORAGE_KEY = 'swagat_session_expiry';

// Parse valid_upto date string "DD/MM/YYYY HH:mm:ss" to timestamp
const parseValidUpto = (validUpto: string): number | null => {
 try {
 // Format: "09/02/2026 17:39:51" (DD/MM/YYYY HH:mm:ss)
 const [datePart, timePart] = validUpto.trim().split(' ');
 const [day, month, year] = datePart.split('/').map(Number);
 const [hours, minutes, seconds] = timePart.split(':').map(Number);

 // Create date (month is 0-indexed in JavaScript)
 const expiryDate = new Date(year, month - 1, day, hours, minutes, seconds);
 const timestamp = expiryDate.getTime();

 // Validate the timestamp
 if (isNaN(timestamp)) {
 console.error("[Session] Invalid valid_upto date:", validUpto);
 return null;
 }

 return timestamp;
 } catch (error) {
 console.error("[Session] Error parsing valid_upto:", error);
 return null;
 }
};

// Logger utility - disabled (no-op functions)
const logger = {
 info: (_message: string, ..._args: any[]) => { },
 success: (_message: string, ..._args: any[]) => { },
 warning: (_message: string, ..._args: any[]) => { },
 error: (_message: string, ..._args: any[]) => { },
 timer: (_message: string, ..._args: any[]) => { },
 route: (_message: string, ..._args: any[]) => { },
 api: (_message: string, ..._args: any[]) => { }
};

interface SessionContextType {
 remainingSeconds: number;
 showPopup: boolean;
 extendSession: () => Promise<void>;
 cancelSession: () => void;
 formatTime: (seconds: number) => string;
 isSessionCritical: boolean;
}

const SessionContext = createContext<SessionContextType | null>(null);

export const useSession = () => {
 const context = useContext(SessionContext);
 if (!context) {
 throw new Error("useSession must be used within SessionProvider");
 }
 return context;
};

export const SessionProvider = ({ children }: { children: React.ReactNode }) => {
 const location = useLocation();

 // Refs to persist across renders
 const sessionStartTimeRef = useRef<number | null>(null);
 const sessionExpiryTimeRef = useRef<number | null>(null);
 const popupTimerRef = useRef<NodeJS.Timeout | null>(null);
 const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
 const isInitializedRef = useRef<boolean>(false);

 const [showPopup, setShowPopup] = useState(false);
 const [remainingSeconds, setRemainingSeconds] = useState<number>(SESSION_DURATION);

 // Check if session is critical (less than 30 seconds)
 const isSessionCritical = remainingSeconds <= 30;

 // Clear all timers
 const clearAllTimers = useCallback(() => {
 if (popupTimerRef.current) {
 clearTimeout(popupTimerRef.current);
 popupTimerRef.current = null;
 logger.timer("Cleared popup timer");
 }
 if (countdownIntervalRef.current) {
 clearInterval(countdownIntervalRef.current);
 countdownIntervalRef.current = null;
 logger.timer("Cleared countdown interval");
 }
 }, []);

 // Format seconds to MM:SS
 const formatTime = (seconds: number): string => {
 const mins = Math.floor(seconds / 60);
 const secs = seconds % 60;
 return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
 };

 // Handle session expiry
 const handleSessionExpired = () => {
 logger.error("Redirecting to SSO login page...");
 window.location.href =
 "https://sso.gujarat.gov.in/SSO.aspx?Rurl=https://swagat.gujarat.gov.in/frm_LoginRole.aspx";
 };

 // Start the session (called on login or resume from storage)
 const startSession = useCallback((duration: number = SESSION_DURATION, existingExpiryTime?: number) => {
 const now = Date.now();
 sessionStartTimeRef.current = now;

 // Use existing expiry time if provided (from localStorage), otherwise calculate new one
 if (existingExpiryTime && existingExpiryTime > now) {
 sessionExpiryTimeRef.current = existingExpiryTime;
 } else {
 sessionExpiryTimeRef.current = now + (duration * 1000);
 // Save to localStorage for persistence across refreshes
 try {
 localStorage.setItem(SESSION_EXPIRY_STORAGE_KEY, sessionExpiryTimeRef.current.toString());
 } catch (e) {
 // localStorage might not be available
 }
 }

 const remainingDuration = Math.floor((sessionExpiryTimeRef.current - now) / 1000);

 logger.success("═══════════════════════════════════════════════");
 logger.success("SESSION STARTED");
 logger.success(`Session Duration: ${remainingDuration} seconds (${(remainingDuration / 60).toFixed(1)} minutes)`);
 logger.success(`Started At: ${new Date(now).toLocaleTimeString()}`);
 logger.success(`Will Expire At: ${new Date(sessionExpiryTimeRef.current).toLocaleTimeString()}`);
 logger.success(`Popup will show at: ${new Date(sessionExpiryTimeRef.current - (POPUP_BEFORE_EXPIRY * 1000)).toLocaleTimeString()}`);
 logger.success("═══════════════════════════════════════════════");

 // Clear any existing timers
 clearAllTimers();

 // Start countdown interval (logs every 10 seconds and updates state)
 countdownIntervalRef.current = setInterval(() => {
 if (sessionExpiryTimeRef.current) {
 const remaining = Math.max(0, Math.floor((sessionExpiryTimeRef.current - Date.now()) / 1000));
 setRemainingSeconds(remaining);

 // Log every 10 seconds or when <= 10 seconds remaining
 if (remaining % 10 === 0 || remaining <= 10) {
 logger.timer(`Time Remaining: ${formatTime(remaining)} (${remaining} seconds)`);
 }

 if (remaining <= 0) {
 logger.error("SESSION EXPIRED! Redirecting to login...");
 clearAllTimers();
 // Clear localStorage on expiry
 try {
 localStorage.removeItem(SESSION_EXPIRY_STORAGE_KEY);
 } catch (e) { }
 handleSessionExpired();
 }
 }
 }, 1000);

 // Set timer to show popup before expiry
 const timeUntilPopup = Math.max(0, (sessionExpiryTimeRef.current - now) - (POPUP_BEFORE_EXPIRY * 1000));

 // Only set popup timer if we haven't passed the popup time yet
 if (timeUntilPopup > 0) {
 popupTimerRef.current = setTimeout(() => {
 logger.warning("═══════════════════════════════════════════════");
 logger.warning(`SHOWING POPUP - Session expires in ${POPUP_BEFORE_EXPIRY} seconds!`);
 logger.warning("═══════════════════════════════════════════════");
 setShowPopup(true);
 }, timeUntilPopup);
 } else if (remainingDuration > 0 && remainingDuration <= POPUP_BEFORE_EXPIRY) {
 // Already in popup zone, show popup immediately
 setShowPopup(true);
 }

 isInitializedRef.current = true;
 }, [clearAllTimers]);

 // Auth-check API call (called on every route change and on initial load)
 const authCheck = useCallback(async (currentPath: string, isInitialLoad: boolean = false) => {
 try {
 logger.api("───────────────────────────────────────────────");
 logger.api(`AUTH CHECK - Route changed to: ${currentPath}`);
 logger.api(`Calling auth-check API: ${import.meta.env.VITE_API_URL}`);

 const res = await fetch(`${import.meta.env.VITE_API_URL}`, {
 method: "GET",
 credentials: "include"
 });

 logger.api(`Auth-check Response Status: ${res.status}`);

 if (res.status === 401) {
 logger.error("Auth-check failed: User is not authenticated!");
 logger.error("Redirecting to SSO login...");
 // Clear stored session expiry on auth failure
 try {
 localStorage.removeItem(SESSION_EXPIRY_STORAGE_KEY);
 } catch (e) { }
 window.location.href =
 "https://sso.gujarat.gov.in/SSO.aspx?Rurl=https://swagat.gujarat.gov.in/frm_LoginRole.aspx";
 return false;
 }

 if (res.status === 200) {
 const data = await res.json();
 logger.success(`Auth-check successful! User is authenticated.`);
 logger.api(`Response data:`, data);

 // Parse valid_upto from response and update session
 if (data.valid_upto) {
 const newExpiryTime = parseValidUpto(data.valid_upto);

 if (newExpiryTime && newExpiryTime > Date.now()) {
 console.log("[Session] valid_upto from API:", data.valid_upto);
 console.log("[Session] Parsed expiry timestamp:", newExpiryTime, "->", new Date(newExpiryTime).toLocaleString());

 // Store the new expiry time in localStorage
 try {
 localStorage.setItem(SESSION_EXPIRY_STORAGE_KEY, newExpiryTime.toString());
 } catch (e) {
 console.error("[Session] Failed to save to localStorage:", e);
 }

 // Always update the session timer with the server's valid_upto
 // This ensures the timer is always in sync with the server
 sessionExpiryTimeRef.current = newExpiryTime;
 const remaining = Math.max(0, Math.floor((newExpiryTime - Date.now()) / 1000));
 setRemainingSeconds(remaining);
 console.log("[Session] Session timer updated - remaining:", remaining, "seconds");
 } else {
 console.warn("[Session] valid_upto is in the past or invalid:", data.valid_upto);
 }
 } else {
 console.warn("[Session] No valid_upto in API response, using existing session timer");
 }

 // Log remaining session time
 if (sessionExpiryTimeRef.current) {
 const remaining = Math.max(0, Math.floor((sessionExpiryTimeRef.current - Date.now()) / 1000));
 logger.info(`Current session remaining: ${formatTime(remaining)}`);
 }

 return true;
 }

 logger.warning(`Unexpected response status: ${res.status}`);
 return false;
 } catch (err) {
 logger.error("Auth-check API call failed:", err);
 return false;
 } finally {
 logger.api("───────────────────────────────────────────────");
 }
 }, []);

 // Extend session (when user clicks "Extend" button)
 const extendSession = async () => {
 try {
 logger.info("═══════════════════════════════════════════════");
 logger.info("USER REQUESTED SESSION EXTENSION");
 logger.api("Calling extend session API: https://swar-api.gujarat.gov.in/Swagat_AI/increase_session");

 const res = await fetch("https://swar-api.gujarat.gov.in/Swagat_AI/increase_session", {
 method: "POST",
 credentials: "include",
 headers: {
 "Content-Type": "application/json"
 }
 });

 logger.api(`Extend session Response Status: ${res.status}`);

 if (res.status === 200) {
 let data;
 try {
 data = await res.json();
 logger.success(`API Response:`, data);
 } catch (e) {
 logger.info("No JSON response body");
 }

 logger.success("Session Extended Successfully!");

 setShowPopup(false);

 // Clear old expiry from storage before starting new session
 try {
 localStorage.removeItem(SESSION_EXPIRY_STORAGE_KEY);
 } catch (e) { }

 // Check if response contains valid_upto and use it
 if (data && data.valid_upto) {
 const newExpiryTime = parseValidUpto(data.valid_upto);
 if (newExpiryTime && newExpiryTime > Date.now()) {
 console.log("[Session] Extended session valid_upto:", data.valid_upto);
 // Store in localStorage
 try {
 localStorage.setItem(SESSION_EXPIRY_STORAGE_KEY, newExpiryTime.toString());
 } catch (e) { }
 startSession(SESSION_DURATION, newExpiryTime);
 } else {
 // Fallback to default duration
 startSession(SESSION_DURATION);
 }
 } else {
 // Fallback to default duration if no valid_upto in response
 startSession(SESSION_DURATION);
 }

 logger.success("═══════════════════════════════════════════════");
 logger.success("SESSION EXTENDED");
 logger.success("═══════════════════════════════════════════════");

 } else {
 logger.error(`Failed to extend session: Status ${res.status}`);
 logger.warning("Calling logout and redirecting...");
 await performLogout();
 }
 } catch (err) {
 logger.error("Extend session API call failed:", err);
 await performLogout();
 } finally {
 logger.info("═══════════════════════════════════════════════");
 }
 };

 // Logout API call
 const performLogout = async () => {
 try {
 logger.api("Calling logout API: https://swar-api.gujarat.gov.in/Swagat_AI/logout");

 const res = await fetch("https://swar-api.gujarat.gov.in/Swagat_AI/logout", {
 method: "POST",
 credentials: "include",
 headers: {
 "Content-Type": "application/json"
 }
 });

 logger.api(`Logout Response Status: ${res.status}`);

 if (res.status === 200) {
 logger.success("Logout successful!");
 } else {
 logger.warning(`Logout returned status: ${res.status}`);
 }
 } catch (err) {
 logger.error("Logout API call failed:", err);
 } finally {
 clearAllTimers();
 // Clear session expiry from localStorage on logout
 try {
 localStorage.removeItem(SESSION_EXPIRY_STORAGE_KEY);
 } catch (e) { }
 logger.info("Redirecting to SSO login...");
 window.location.href = import.meta.env.VITE_SSO_LOGIN_URL;
 }
 };

 // Cancel session - call logout API and redirect
 const cancelSession = async () => {
 logger.warning("═══════════════════════════════════════════════");
 logger.warning("USER CLICKED CANCEL - Logging out...");
 logger.warning("═══════════════════════════════════════════════");
 await performLogout();
 };

 // Initialize session on first load - runs only once
 useEffect(() => {
 if (!isInitializedRef.current) {
 logger.info("╔═══════════════════════════════════════════════╗");
 logger.info("║ SESSION WATCHER INITIALIZED ║");
 logger.info("╚═══════════════════════════════════════════════╝");

 // Check for stored session expiry time as fallback (persistence across refresh)
 let storedExpiry: number | null = null;
 try {
 const stored = localStorage.getItem(SESSION_EXPIRY_STORAGE_KEY);
 if (stored) {
 storedExpiry = parseInt(stored, 10);
 // Validate the stored expiry time
 if (isNaN(storedExpiry) || storedExpiry <= Date.now()) {
 // Expired or invalid, clear it
 localStorage.removeItem(SESSION_EXPIRY_STORAGE_KEY);
 storedExpiry = null;
 }
 }
 } catch (e) {
 // localStorage might not be available
 }

 // First, start session with stored expiry as temporary (if available)
 // Then authCheck will update it with server's valid_upto
 if (storedExpiry) {
 // Resume session from stored expiry time temporarily
 console.log("[Session] Using stored expiry as initial value, will update from API");
 startSession(SESSION_DURATION, storedExpiry);
 } else {
 // Start a temporary session, will be updated by authCheck
 console.log("[Session] No stored expiry found, starting default session");
 startSession();
 }
 }

 // Cleanup only on unmount - DON'T cleanup on route changes
 return () => {
 // Only clear timers when component is actually unmounting
 // Not on dependency changes
 };
 }, [startSession]);

 // Initial auth check - runs once after initialization
 useEffect(() => {
 if (isInitializedRef.current) {
 // Call auth-check API to get the actual valid_upto from server on initial load
 console.log("[Session] Calling initial authCheck to get valid_upto from server...");
 authCheck(location.pathname, true);
 }
 }, [isInitializedRef.current ? 'initialized' : 'not-initialized']);

 // Handle route changes - call auth-check to update session timer
 useEffect(() => {
 // Skip if this is initial load (handled by initialization effect)
 if (!isInitializedRef.current) {
 return;
 }

 logger.route(`Route changed detected: ${location.pathname}`);

 // Call auth-check API on every route change to get latest valid_upto
 authCheck(location.pathname, false);

 // Log current session status
 if (sessionExpiryTimeRef.current) {
 const remaining = Math.max(0, Math.floor((sessionExpiryTimeRef.current - Date.now()) / 1000));
 logger.info(`Session status: ${formatTime(remaining)} remaining`);
 }
 }, [location.pathname]);

 // Cleanup timers on unmount
 useEffect(() => {
 return () => {
 console.log("[Session] Component unmounting, clearing timers");
 clearAllTimers();
 };
 }, [clearAllTimers]);

 return (
 <SessionContext.Provider
 value={{
 remainingSeconds,
 showPopup,
 extendSession,
 cancelSession,
 formatTime,
 isSessionCritical
 }}
 >
 {children}
 </SessionContext.Provider>
 );
};
