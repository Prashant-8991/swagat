// @ts-nocheck
import { useSession } from "../context/SessionContext";

export default function SessionTimer() {
    const { remainingSeconds, formatTime, isSessionCritical } = useSession();

    // Calculate percentage for circular progress
    const percentage = (remainingSeconds / 120) * 100;
    const circumference = 2 * Math.PI * 18; // radius = 18
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    // Determine color based on remaining time
    const getTimerColor = () => {
        if (remainingSeconds <= 10) return "#e74c3c"; // Red - Critical
        if (remainingSeconds <= 30) return "#f39c12"; // Orange - Warning
        return "#27ae60"; // Green - Safe
    };

    const timerColor = getTimerColor();

    return (
        <div style={styles.container} className="session-timer">
            {/* Circular Progress Ring */}
            <div style={styles.circularContainer}>
                <svg style={styles.svg} viewBox="0 0 44 44">
                    {/* Background circle */}
                    <circle
                        cx="22"
                        cy="22"
                        r="18"
                        fill="none"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="3"
                    />
                    {/* Progress circle */}
                    <circle
                        cx="22"
                        cy="22"
                        r="18"
                        fill="none"
                        stroke={timerColor}
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        style={{
                            transform: "rotate(-90deg)",
                            transformOrigin: "center",
                            transition: "stroke-dashoffset 1s linear, stroke 0.3s ease"
                        }}
                    />
                </svg>

                {/* Timer Icon */}
                <div style={styles.iconContainer}>
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <circle cx="12" cy="13" r="8" stroke={timerColor} strokeWidth="2" fill="none" />
                        <path d="M12 9v4l3 2" stroke={timerColor} strokeWidth="2" strokeLinecap="round" />
                        <path d="M9 2h6" stroke={timerColor} strokeWidth="2" strokeLinecap="round" />
                        <path d="M12 2v2" stroke={timerColor} strokeWidth="2" strokeLinecap="round" />
                    </svg>
                </div>
            </div>

            {/* Time Display */}
            <div style={styles.textContainer}>
                <span style={styles.label}>Session</span>
                <span
                    style={{
                        ...styles.time,
                        color: timerColor,
                        animation: isSessionCritical ? "pulse-text 1s infinite" : "none"
                    }}
                >
                    {formatTime(remainingSeconds)}
                </span>
            </div>

            {/* Warning indicator when critical */}
            {isSessionCritical && (
                <div style={styles.warningDot}></div>
            )}

            <style>{`
                @keyframes pulse-text {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
                @keyframes blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0; }
                }
                .session-timer:hover {
                    transform: scale(1.05);
                }
            `}</style>
        </div>
    );
}

const styles = {
    container: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "8px 16px",
        background: "linear-gradient(135deg, rgba(26, 26, 46, 0.9), rgba(22, 33, 62, 0.9))",
        borderRadius: "12px",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        backdropFilter: "blur(10px)",
        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
        cursor: "default",
        transition: "transform 0.2s ease",
        position: "relative" as const
    },
    circularContainer: {
        position: "relative" as const,
        width: "44px",
        height: "44px"
    },
    svg: {
        width: "44px",
        height: "44px"
    },
    iconContainer: {
        position: "absolute" as const,
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)"
    },
    textContainer: {
        display: "flex",
        flexDirection: "column" as const,
        alignItems: "flex-start"
    },
    label: {
        fontSize: "10px",
        color: "#95a5a6",
        textTransform: "uppercase" as const,
        letterSpacing: "1px",
        fontWeight: "500" as const
    },
    time: {
        fontSize: "18px",
        fontWeight: "700" as const,
        fontFamily: "'Roboto Mono', monospace",
        letterSpacing: "1px",
        transition: "color 0.3s ease"
    },
    warningDot: {
        position: "absolute" as const,
        top: "8px",
        right: "8px",
        width: "8px",
        height: "8px",
        borderRadius: "50%",
        background: "#e74c3c",
        animation: "blink 1s infinite"
    }
};
