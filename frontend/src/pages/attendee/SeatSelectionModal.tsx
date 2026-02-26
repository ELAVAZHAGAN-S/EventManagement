import { useState } from 'react';
import { X, ChevronUp, ChevronDown } from 'lucide-react';

interface SeatSelectionModalProps {
    totalCapacity: number;
    bookedSeats: number[];
    onClose: () => void;
    onConfirm: (seatNumber: number) => void;
}

const SEATS_PER_FLOOR = 100;

const SeatSelectionModal = ({ totalCapacity, bookedSeats, onClose, onConfirm }: SeatSelectionModalProps) => {
    const [currentFloor, setCurrentFloor] = useState(1);
    const [selectedSeat, setSelectedSeat] = useState<number | null>(null);

    const totalFloors = Math.ceil(totalCapacity / SEATS_PER_FLOOR);

    const handleSeatClick = (seatNum: number) => {
        if (bookedSeats.includes(seatNum)) return;
        setSelectedSeat(seatNum === selectedSeat ? null : seatNum);
    };

    const renderGrid = () => {
        const startSeat = (currentFloor - 1) * SEATS_PER_FLOOR + 1;
        const endSeat = Math.min(currentFloor * SEATS_PER_FLOOR, totalCapacity);

        const seats = [];
        for (let i = startSeat; i <= endSeat; i++) {
            const isBooked = bookedSeats.includes(i);
            const isSelected = selectedSeat === i;

            let bgClass = "bg-green-500/20 hover:bg-green-500/30 text-green-300 border-green-500/30";
            if (isBooked) {
                bgClass = "bg-red-500/10 text-red-500/30 cursor-not-allowed border-red-500/10";
            } else if (isSelected) {
                bgClass = "bg-blue-500 text-white border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)] transform scale-105";
            }

            seats.push(
                <button
                    key={i}
                    disabled={isBooked}
                    onClick={() => handleSeatClick(i)}
                    className={`w-10 h-10 rounded-lg text-sm font-bold flex items-center justify-center border transition-all ${bgClass}`}
                    title={isBooked ? `Seat ${i} (Booked)` : `Seat ${i}`}
                >
                    {i}
                </button>
            );
        }
        return seats;
    };

    const handleConfirm = () => {
        if (selectedSeat) {
            onConfirm(selectedSeat);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
            <div className="glass-card w-full max-w-2xl p-6 relative animate-fadeIn flex flex-col max-h-[90vh] text-white">
                <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors">
                    <X size={24} />
                </button>

                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 text-glow">Select Your Seat</h2>
                    <p className="text-slate-400">Floor {currentFloor} of {totalFloors}</p>
                </div>

                {/* Legend */}
                <div className="flex justify-center gap-6 mb-4 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-green-500/20 border border-green-500/30"></div>
                        <span className="text-slate-300">Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-red-500/10 border border-red-500/10"></div>
                        <span className="text-slate-500">Booked</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-blue-500 border border-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                        <span className="text-white font-medium">Selected</span>
                    </div>
                </div>

                {/* Grid Container */}
                <div className="flex-1 overflow-y-auto min-h-[300px] p-2 sm:p-4 bg-black/20 rounded-xl border border-white/10 mb-6 custom-scrollbar">
                    <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2 sm:gap-3 place-items-center">
                        {renderGrid()}
                    </div>
                </div>

                {/* Footer / Controls */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div className="flex items-center gap-2">
                        <button
                            disabled={currentFloor === 1}
                            onClick={() => setCurrentFloor(prev => prev - 1)}
                            className="p-2 border border-white/10 rounded-lg hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronUp size={20} />
                        </button>
                        <span className="font-bold text-white w-20 text-center">Floor {currentFloor}</span>
                        <button
                            disabled={currentFloor === totalFloors}
                            onClick={() => setCurrentFloor(prev => prev + 1)}
                            className="p-2 border border-white/10 rounded-lg hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronDown size={20} />
                        </button>
                    </div>

                    <div className="flex gap-4 items-center">
                        {selectedSeat && <span className="text-lg font-bold text-blue-400 text-glow">Seat {selectedSeat}</span>}
                        <button
                            onClick={handleConfirm}
                            disabled={!selectedSeat}
                            className="px-8 py-3 btn-glow text-white rounded-xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                        >
                            Confirm Selection
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SeatSelectionModal;
