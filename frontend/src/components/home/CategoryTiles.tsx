import { useNavigate } from 'react-router-dom';
import {
    HiVideoCamera,
    HiAcademicCap,
    HiTrophy,
    HiBuildingOffice2,
    HiMusicalNote,
    HiWrenchScrewdriver,
    HiBriefcase,
    HiSparkles
} from 'react-icons/hi2';

// Category data matching Event.EventType enum
const categories = [
    { type: 'WEBINAR', label: 'Webinars', icon: HiVideoCamera, color: 'from-violet-500 to-purple-600' },
    { type: 'CONFERENCE', label: 'Conferences', icon: HiBuildingOffice2, color: 'from-blue-500 to-cyan-500' },
    { type: 'WORKSHOP', label: 'Workshops', icon: HiWrenchScrewdriver, color: 'from-green-500 to-emerald-500' },
    { type: 'AWARD_FUNCTION', label: 'Award Functions', icon: HiTrophy, color: 'from-amber-500 to-orange-500' },
    { type: 'CONCERT', label: 'Concerts', icon: HiMusicalNote, color: 'from-pink-500 to-rose-500' },
    { type: 'MEETING', label: 'Meetings', icon: HiBriefcase, color: 'from-slate-500 to-gray-600' },
    { type: 'TRADE_SHOW', label: 'Trade Shows', icon: HiSparkles, color: 'from-cyan-500 to-teal-500' },
    { type: 'SPORTING_EVENT', label: 'Sports', icon: HiAcademicCap, color: 'from-red-500 to-orange-500' },
];

const CategoryTiles = () => {
    const navigate = useNavigate();

    const handleCategoryClick = (type: string) => {
        navigate(`/events?type=${type}`);
    };

    return (
        <div className="py-6">
            <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-thin scrollbar-thumb-violet-500/30 scrollbar-track-transparent">
                {categories.map((category) => {
                    const IconComponent = category.icon;
                    return (
                        <button
                            key={category.type}
                            onClick={() => handleCategoryClick(category.type)}
                            className="flex-shrink-0 group"
                        >
                            <div className="glass-card p-6 w-36 flex flex-col items-center gap-3 
                                transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-violet-500/20
                                group-hover:border-violet-500/50">
                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${category.color} 
                                    flex items-center justify-center shadow-lg transition-transform group-hover:scale-110`}>
                                    <IconComponent className="w-7 h-7 text-white" />
                                </div>
                                <span className="text-sm font-semibold text-slate-200 text-center group-hover:text-violet-300 transition-colors">
                                    {category.label}
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default CategoryTiles;
