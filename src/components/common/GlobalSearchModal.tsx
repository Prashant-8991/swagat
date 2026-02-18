//@ts-nocheck
import React, { useRef, useEffect, useState } from 'react';
import Modal from 'react-modal';
import { IoMdSearch } from 'react-icons/io';
import { useGSearch } from '../../hooks/useGSearch';
import { useNavigate } from 'react-router-dom';

interface GlobalSearchModalProps {
 isOpen: boolean;
 onRequestClose: () => void;
}

const searchData: Array<{ title: string, description: string }> = [
 {
 title: "ખરાબ રસ્તા",
 description: "શહેરી અને ગ્રામ્ય વિસ્તારમાં ખાડાવાળા અને તૂટેલા રસ્તા."
 },
 {
 title: "પાણીની અછત",
 description: "ઉનાળામાં નિયમિત અને પૂરતા પાણીનો પુરવઠો ન મળવો."
 },
 {
 title: "સરકારી શાળાની સ્થિતિ",
 description: "સરકારી શાળાઓમાં શિક્ષકોની અછત અને અપૂરતી સુવિધાઓ."
 },
 {
 title: "ખેત પેદાશોના ઓછા ભાવ",
 description: "ખેડૂતોને તેમના પાક માટે યોગ્ય ટેકાના ભાવ ન મળવા."
 },
 {
 title: "સફાઈનો અભાવ",
 description: "જાહેર સ્થળો અને સોસાયટીઓમાં નિયમિત કચરાના નિકાલનો અભાવ."
 },
 {
 title: "બેરોજગારી",
 description: "યુવાનો માટે સ્થાનિક સ્તરે પૂરતી રોજગારીની તકોનો અભાવ."
 },
 {
 title: "વધતો ટ્રાફિક",
 description: "મુખ્ય શહેરોમાં ટ્રાફિક જામ અને પાર્કિંગની ગંભીર સમસ્યા."
 },
 {
 title: "પ્રદૂષણ",
 description: "ઔદ્યોગિક વિસ્તારોમાં હવાનું અને પાણીનું વધતું પ્રદૂષણ."
 },
 {
 title: "આરોગ્ય કેન્દ્રોની ગુણવત્તા",
 description: "ગ્રામ્ય અને દૂરના વિસ્તારોમાં પ્રાથમિક આરોગ્ય કેન્દ્રોમાં ડોક્ટરોની ગેરહાજરી."
 },
 {
 title: "ગેરકાયદે બાંધકામ",
 description: "જાહેર જમીન પર ગેરકાયદેસર દબાણ અને બાંધકામની સમસ્યા."
 }
];

const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onRequestClose }) => {
 const searchInputRef = useRef<HTMLInputElement>(null);
 const { setSearchQuery } = useGSearch();
 const navigate = useNavigate();
 const [inputValue, setInputValue] = useState("");

 useEffect(() => {
 if (isOpen) {
 const timer = setTimeout(() => {
 searchInputRef.current?.focus();
 }, 100);
 return () => clearTimeout(timer);
 }
 }, [isOpen]);

 useEffect(() => {
 const handleKeyDown = (event: KeyboardEvent) => {
 if (event.ctrlKey && event.key === 'k') {
 event.preventDefault();
 onRequestClose(); 
 }
 else if (event.key === 'Escape') {
 onRequestClose();
 }
 };

 if (isOpen) {
 document.addEventListener('keydown', handleKeyDown);
 }

 return () => {
 document.removeEventListener('keydown', handleKeyDown);
 };
 }, [isOpen, onRequestClose]);

 const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
 if (e.key === 'Enter' && inputValue.trim()) {
 setSearchQuery({ query: inputValue });
 navigate(`/search/${encodeURIComponent(inputValue)}`);
 onRequestClose();
 }
 };

 const handleItemClick = (title: string) => {
 setSearchQuery({ query: title });
 navigate(`/search/${encodeURIComponent(title)}`);
 onRequestClose();
 }

 return (
 <Modal
 isOpen={isOpen}
 onRequestClose={onRequestClose}
 contentLabel="Global Search"
 className="fixed inset-0 flex items-start justify-center p-4 sm:p-8 z-50 pointer-events-none"

 overlayClassName="fixed inset-0 z-40 bg-black/10 backdrop-blur-sm"
 >
 <div className="bg-white/80 backdrop-blur-sm dark:bg-gray-800/40/90 backdrop-blur-md rounded-xl shadow-2xl w-full max-w-xl 
 transition-all duration-300 transform scale-100 opacity-100 pointer-events-auto 
 mt-20 border border-white/20 dark:border-gray-700/50">
 <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-700">
 <IoMdSearch size={28} className="text-gray-400 dark:text-gray-500 mr-4 flex-shrink-0" />
 <input
 ref={searchInputRef}
 type="text"
 value={inputValue}
 onChange={(e) => setInputValue(e.target.value)}
 onKeyDown={handleInputKeyDown}
 placeholder="Type your search query..."
 className="flex-grow bg-transparent text-xl text-gray-900 dark:text-gray-100 focus:outline-none"
 />
 <kbd
 className="hidden sm:inline-block border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 text-sm text-gray-500 dark:text-gray-400 ml-3 cursor-default"
 title="Press Esc to close"
 >
 Esc
 </kbd>
 </div>

 <div className="max-h-80 overflow-y-auto p-4 space-y-3">
 <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 px-2">
 RECENT SEARCHES
 </p>
 {
 searchData.map((item, index) => (
 <React.Fragment key={index}>
 <div onClick={() => handleItemClick(item.title)} className="p-2 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-colors duration-150">
 <div>
 <p className="text-gray-900 dark:text-white font-medium">{item.title}</p>
 <p className="text-xs text-gray-500 dark:text-gray-400">{item.description}</p>
 </div>
 <span className="text-xs text-blue-500 dark:text-blue-400">Go</span>
 </div>
 </React.Fragment>
 ))
 }

 </div>
 </div>
 </Modal>
 );
};

export default GlobalSearchModal;