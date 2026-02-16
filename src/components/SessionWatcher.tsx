// @ts-nocheck
import { useSession } from "../context/SessionContext";
import SessionExpiryModal from "./SessionExpiryModal";

export default function SessionWatcher() {
    const { showPopup, extendSession, cancelSession, remainingSeconds } = useSession();

    return (
        <>
            <SessionExpiryModal
                open={showPopup}
                onExtend={extendSession}
                onCancel={cancelSession}
                remainingSeconds={remainingSeconds}
            />
        </>
    );
}
