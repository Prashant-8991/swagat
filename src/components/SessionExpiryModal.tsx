// @ts-nocheck
import { useState, useEffect } from "react";

interface Props {
 open: boolean;
 onExtend: () => void;
 onCancel: () => void;
 remainingSeconds?: number;
}

// Popup appears 60 seconds before expiry
const POPUP_DURATION = 60;

export default function SessionExpiryModal({ open, onExtend, onCancel, remainingSeconds = 60 }: Props) {
 const [countdown, setCountdown] = useState(remainingSeconds);

 // Sync countdown with remainingSeconds from context
 useEffect(() => {
 if (open) {
 setCountdown(remainingSeconds);
 }
 }, [open, remainingSeconds]);

 if (!open) return null;

 return (
 <div style={styles.overlay}>
 <div style={styles.modal}>
 {/* Animated Icon */}
 <div style={styles.iconContainer}>
 <div style={styles.pulsingCircle}></div>
 <svg style={styles.icon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
 <circle cx="12" cy="12" r="10" stroke="#f39c12" strokeWidth="2" fill="none" />
 <path d="M12 6v6l4 2" stroke="#f39c12" strokeWidth="2" strokeLinecap="round" />
 </svg>
 </div>

 <h2 style={styles.title}>Session Expiring!</h2>

 {/* Countdown Display */}
 <div style={styles.countdownContainer}>
 <span style={{
 ...styles.countdownNumber,
 color: countdown <= 10 ? '#e74c3c' : countdown <= 30 ? '#f39c12' : '#3498db'
 }}>
 {countdown}
 </span>
 <span style={styles.countdownLabel}>seconds remaining</span>
 </div>

 <p style={styles.message}>
 Your session will expire soon. Would you like to continue?
 </p>

 {/* Progress Bar */}
 <div style={styles.progressContainer}>
 <div
 style={{
 ...styles.progressBar,
 width: `${(countdown / POPUP_DURATION) * 100}%`,
 background: countdown <= 10
 ? 'linear-gradient(90deg, #e74c3c, #c0392b)'
 : countdown <= 30
 ? 'linear-gradient(90deg, #f39c12, #e67e22)'
 : 'linear-gradient(90deg, #3498db, #2980b9)',
 transition: 'width 1s linear, background 0.5s ease'
 }}
 ></div>
 </div>

 {/* Buttons Container */}
 <div style={styles.buttonContainer}>
 <button onClick={onCancel} style={styles.cancelButton}>
 <span style={styles.buttonIcon}>✕</span>
 Cancel
 </button>
 <button onClick={onExtend} style={styles.extendButton}>
 <span style={styles.buttonIcon}>🔄</span>
 Extend Session
 </button>
 </div>

 <p style={styles.note}>
 Click "Extend Session" to continue or "Cancel" to logout
 </p>
 </div>

 <style>{`
 @keyframes pulse {
 0% { transform: scale(1); opacity: 1; }
 50% { transform: scale(1.3); opacity: 0.5; }
 100% { transform: scale(1); opacity: 1; }
 }
 @keyframes shake {
 0%, 100% { transform: translateX(0); }
 10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
 20%, 40%, 60%, 80% { transform: translateX(5px); }
 }
 @keyframes fadeIn {
 from { opacity: 0; transform: scale(0.9); }
 to { opacity: 1; transform: scale(1); }
 }
 .extend-btn:hover {
 transform: translateY(-2px);
 box-shadow: 0 6px 20px rgba(46, 204, 113, 0.5) !important;
 }
 .cancel-btn:hover {
 transform: translateY(-2px);
 box-shadow: 0 6px 20px rgba(231, 76, 60, 0.5) !important;
 }
 `}</style>
 </div>
 );
}

const styles = {
 overlay: {
 position: "fixed" as const,
 inset: 0,
 background: "rgba(0, 0, 0, 0.7)",
 backdropFilter: "blur(5px)",
 display: "flex",
 alignItems: "center",
 justifyContent: "center",
 zIndex: 99999
 },
 modal: {
 background: "linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)",
 padding: "32px 40px",
 borderRadius: "20px",
 width: "420px",
 textAlign: "center" as const,
 boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)",
 animation: "fadeIn 0.3s ease-out"
 },
 iconContainer: {
 position: "relative" as const,
 width: "80px",
 height: "80px",
 margin: "0 auto 20px"
 },
 pulsingCircle: {
 position: "absolute" as const,
 inset: 0,
 borderRadius: "50%",
 background: "rgba(243, 156, 18, 0.2)",
 animation: "pulse 2s infinite"
 },
 icon: {
 width: "80px",
 height: "80px",
 position: "relative" as const,
 zIndex: 1
 },
 title: {
 color: "#f39c12",
 fontSize: "24px",
 fontWeight: "700" as const,
 marginBottom: "16px",
 animation: "shake 0.5s ease-in-out"
 },
 countdownContainer: {
 display: "flex",
 flexDirection: "column" as const,
 alignItems: "center",
 marginBottom: "16px"
 },
 countdownNumber: {
 fontSize: "48px",
 fontWeight: "800" as const,
 color: "#e74c3c",
 lineHeight: "1",
 textShadow: "0 0 20px rgba(231, 76, 60, 0.5)"
 },
 countdownLabel: {
 fontSize: "14px",
 color: "#95a5a6",
 textTransform: "uppercase" as const,
 letterSpacing: "2px"
 },
 message: {
 color: "#bdc3c7",
 fontSize: "16px",
 lineHeight: "1.5",
 marginBottom: "20px"
 },
 progressContainer: {
 width: "100%",
 height: "6px",
 background: "rgba(255, 255, 255, 0.1)",
 borderRadius: "3px",
 overflow: "hidden",
 marginBottom: "24px"
 },
 progressBar: {
 height: "100%",
 background: "linear-gradient(90deg, #e74c3c, #f39c12)",
 borderRadius: "3px"
 },
 buttonContainer: {
 display: "flex",
 justifyContent: "center",
 gap: "16px"
 },
 extendButton: {
 display: "flex",
 alignItems: "center",
 gap: "8px",
 padding: "14px 28px",
 fontSize: "15px",
 fontWeight: "600" as const,
 color: "#fff",
 background: "linear-gradient(135deg, #27ae60, #2ecc71)",
 border: "none",
 borderRadius: "12px",
 cursor: "pointer",
 transition: "all 0.3s ease",
 boxShadow: "0 4px 15px rgba(46, 204, 113, 0.4)"
 },
 cancelButton: {
 display: "flex",
 alignItems: "center",
 gap: "8px",
 padding: "14px 28px",
 fontSize: "15px",
 fontWeight: "600" as const,
 color: "#fff",
 background: "linear-gradient(135deg, #c0392b, #e74c3c)",
 border: "none",
 borderRadius: "12px",
 cursor: "pointer",
 transition: "all 0.3s ease",
 boxShadow: "0 4px 15px rgba(231, 76, 60, 0.4)"
 },
 buttonIcon: {
 fontSize: "18px"
 },
 note: {
 marginTop: "16px",
 fontSize: "12px",
 color: "#7f8c8d"
 }
};
