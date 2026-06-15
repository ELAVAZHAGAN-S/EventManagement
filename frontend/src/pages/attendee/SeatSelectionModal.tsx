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

            let bgClass = "bg-amber-100/10 hover:bg-amber-200 border-amber-200 text-amber-200 hover:text-black";
            if (isBooked) {
                bgClass = "bg-amber-200/30 text-amber-200/30 cursor-not-allowed border-amber-200/10";
            } else if (isSelected) {
                bgClass = "bg-amber-200 text-black scale-105";
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center pt-4 z-60">
            <div className="glass-card w-[550px] max-w-2xl py-6 px-10 relative animate-fadeIn flex flex-col max-h-[90vh] text-white">
                <button onClick={onClose} className="absolute top-10 right-10 cursor-pointer text-white/50 hover:text-amber-200 transition-colors">
                    <X size={24} />
                </button>

                <div className="text-center mb-2">
                    <h2 className="text-2xl font-bold text-white">Select Your Seat</h2>
                    <p className="text-slate-400">Floor {currentFloor} of {totalFloors}</p>
                </div>

                <div className="flex justify-center gap-6 mb-4 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-green-300 border border-green-300"></div>
                        <span className="text-green-300">Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-amber-200/30 border border-amber-200"></div>
                        <span className="text-amber-200">Booked</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-amber-200"></div>
                        <span className="text-amber-200 font-medium">Selected</span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto max-h-[300px] px-6 py-6 bg-black/20 rounded-4xl border border-amber-200 mb-6 custom-scrollbar">
                    <div className="grid grid-cols-5 md:grid-cols-8 gap-2 sm:gap-3 place-items-center">
                        {renderGrid()}
                    </div>
                </div>

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

                    <div className="flex gap-5 items-center">
                        {selectedSeat && <span className="text-lg font-bold text-amber-200">Seat {selectedSeat}</span>}
                        <button
                            onClick={handleConfirm}
                            disabled={!selectedSeat}
                            className="px-6 py-3 bg-amber-200 cursor-pointer text-black rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-amber-100 transition-colors"
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
