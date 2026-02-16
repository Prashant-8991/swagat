//@ts-nocheck
interface DownloadCsvButtonProps {
 onClick: () => void;
}

export default function DownloadCsvButton({ onClick }: DownloadCsvButtonProps) {
 return (
 <button
 onClick={onClick}
 title="Download CSV"
 className="ml-2 p-2 rounded hover:bg-gray-100 transition rounded-full"
 style={{ lineHeight: 0 }}
 >
 <svg
 width="18"
 height="18"
 fill="none"
 viewBox="0 0 20 20"
 >
 <path
 d="M10 3v10m0 0l-4-4m4 4l4-4M4 17h12"
 stroke="#000000"
 strokeWidth="1.5"
 strokeLinecap="round"
 strokeLinejoin="round"
 />
 </svg>
 </button>
 );
}
