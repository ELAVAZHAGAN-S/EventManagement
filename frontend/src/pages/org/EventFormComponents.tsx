import { useFormContext } from 'react-hook-form';

export const CommonTextField = ({ name, label, required = false, type = 'text', placeholder = '' }: any) => {
    const { register, formState: { errors } } = useFormContext();
    return (
        <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-300">
                {label} {required && <span className="text-pink-400">*</span>}
            </label>
            {type === 'textarea' ? (
                <textarea
                    {...register(name, { required: required ? `${label} is required` : false })}
                    placeholder={placeholder}
                    className="glass-input w-full resize-none"
                    rows={4}
                />
            ) : (
                <input
                    type={type}
                    {...register(name, { required: required ? `${label} is required` : false })}
                    placeholder={placeholder}
                    className="glass-input w-full"
                />
            )}
            {errors[name] && <span className="text-xs text-pink-400">{(errors[name] as any)?.message}</span>}
        </div>
    );
};

export const AwardFunctionFields = () => (
    <div className="space-y-4 border-l-4 border-pink-500 pl-4 bg-pink-500/10 p-4 rounded-r-xl">
        <h3 className="text-lg font-bold text-pink-300">Award Function Details</h3>
        <CommonTextField name="customDetails.awardCategories" label="Award Categories" placeholder="e.g., Best Innovation, Employee of the Year" type="textarea" />
        <CommonTextField name="customDetails.nominationProcess" label="Nomination Process" type="textarea" />
        <CommonTextField name="customDetails.eligibilityCriteria" label="Eligibility Criteria" type="textarea" />
        <CommonTextField name="customDetails.juryPanel" label="Jury Panel Details" type="textarea" />
    </div>
);

export const ConferenceFields = () => (
    <div className="space-y-4 border-l-4 border-violet-500 pl-4 bg-violet-500/10 p-4 rounded-r-xl">
        <h3 className="text-lg font-bold text-violet-300">Conference Details</h3>
        <CommonTextField name="customDetails.keynoteSpeakers" label="Keynote Speakers" placeholder="Names and designations" type="textarea" />
        <CommonTextField name="customDetails.sessionTracks" label="Session Tracks" placeholder="e.g., AI, Cloud, CyberSecurity" />
        <CommonTextField name="customDetails.exhibitors" label="Exhibitors & Sponsors" type="textarea" />
    </div>
);

export const WebinarFields = () => (
    <div className="space-y-4 border-l-4 border-cyan-500 pl-4 bg-cyan-500/10 p-4 rounded-r-xl">
        <h3 className="text-lg font-bold text-cyan-300">Webinar Details</h3>
        <CommonTextField name="customDetails.learningOutcomes" label="Learning Outcomes" type="textarea" />
        <CommonTextField name="customDetails.speakerProfile" label="Speaker Profile" type="textarea" />
        <div className="flex items-center gap-2">
            <input type="checkbox" {...useFormContext().register('customDetails.certificateAvailable')} className="w-4 h-4 rounded border-white/20 bg-white/5 text-violet-500 focus:ring-violet-500" />
            <label className="text-sm font-medium text-slate-300">Certificate Available</label>
        </div>
    </div>
);

// Generic placeholder for others
export const GenericTypeFields = ({ typeName }: { typeName: string }) => (
    <div className="space-y-4 border-l-4 border-blue-500 pl-4 bg-blue-500/10 p-4 rounded-r-xl">
        <h3 className="text-lg font-bold text-blue-300">{typeName} Specifics</h3>
        <CommonTextField name="customDetails.specialRequirements" label="Special Requirements/Notes" type="textarea" />
        <CommonTextField name="customDetails.highlights" label="Key Highlights" type="textarea" />
    </div>
);

export const EventTypeSelector = () => {
    const { register, formState: { errors } } = useFormContext();

    return (
        <div className="space-y-2">
            <select
                {...register('eventType')}
                className="glass-input w-full text-lg font-semibold"
            >
                <option value="WEBINAR">Webinar / Seminar</option>
                <option value="AWARD_FUNCTION">Award Function</option>
                <option value="CONFERENCE">Conference & Convention</option>
                <option value="TRADE_SHOW">Trade Show / Expo</option>
                <option value="WORKSHOP">Workshop / Training</option>
                <option value="CONCERT">Concert / Performance</option>
                <option value="MEETING">Meeting / Town Hall</option>
                <option value="SPORTING_EVENT">Sporting Event</option>
                <option value="PRODUCT_LAUNCH">Product Launch</option>
                <option value="FUNDRAISER">Fundraiser / Gala</option>
            </select>
            {errors.eventType && <span className="text-xs text-pink-400">{(errors.eventType as any)?.message}</span>}
        </div>
    );
};
