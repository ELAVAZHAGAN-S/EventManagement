import React from 'react';
import { CommonTextField } from './EventFormComponents';

export const WebinarFields = () => (
    <div className="space-y-4 animate-fadeIn">
        <h4 className="font-semibold text-slate-200 border-b border-white/10 pb-2">Webinar Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <CommonTextField name="customDetails.platformLink" label="Platform Link" placeholder="Zoom/Meet URL" />
            <CommonTextField name="customDetails.recordingAvailable" label="Recording Available?" placeholder="Yes/No" />
            <div className="md:col-span-2">
                <CommonTextField name="customDetails.takeaways" label="Key Takeaways" placeholder="List top 3 things attendees will learn..." />
            </div>
        </div>
    </div>
);

export const AwardFields = () => (
    <div className="space-y-4 animate-fadeIn">
        <h4 className="font-semibold text-slate-200 border-b border-white/10 pb-2">Award Ceremony Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CommonTextField name="customDetails.chiefGuest" label="Chief Guest" placeholder="Guest Name" />
            <CommonTextField name="customDetails.nominationDeadline" label="Nomination Deadline" type="datetime-local" />
            <div className="md:col-span-2">
                <CommonTextField name="customDetails.awardCategories" label="Award Categories" placeholder="List categories..." />
            </div>
            <div className="md:col-span-2">
                <CommonTextField name="customDetails.judgingPanel" label="Judging Panel" placeholder="Names and credentials..." />
            </div>
        </div>
    </div>
);

export const ConferenceFields = () => (
    <div className="space-y-4 animate-fadeIn">
        <h4 className="font-semibold text-slate-200 border-b border-white/10 pb-2">Conference Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CommonTextField name="customDetails.keynoteSpeakers" label="Keynote Speakers" placeholder="Names..." />
            <div className="md:col-span-2">
                <CommonTextField name="customDetails.sponsors" label="Sponsors" placeholder="List of sponsors..." />
            </div>
        </div>
    </div>
);

export const WorkshopFields = () => (
    <div className="space-y-4 animate-fadeIn">
        <h4 className="font-semibold text-slate-200 border-b border-white/10 pb-2">Workshop Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CommonTextField name="customDetails.instructor" label="Instructor" required />
            <CommonTextField name="customDetails.materialsRequired" label="Materials Required" placeholder="Laptop, Software..." />
            <CommonTextField name="customDetails.certification provided" label="Certification" placeholder="Yes/No" />
        </div>
    </div>
);

export const ProductLaunchFields = () => (
    <div className="space-y-4 animate-fadeIn">
        <h4 className="font-semibold text-slate-200 border-b border-white/10 pb-2">Product Launch Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CommonTextField name="customDetails.productName" label="Product Name" required />
            <CommonTextField name="customDetails.demoVideoLink" label="Demo Video Link" placeholder="YouTube/Vimeo URL" />
            <CommonTextField name="customDetails.earlyAccessLink" label="Early Access/Pre-order Link" />
            <div className="md:col-span-2">
                <CommonTextField name="customDetails.specialOffers" label="Special Offers" placeholder="Launch day discounts..." />
            </div>
        </div>
    </div>
);

export const DynamicCategoryForm = ({ type }: { type: string }) => {
    switch (type) {
        case 'WEBINAR': return <WebinarFields />;
        case 'AWARD_FUNCTION': return <AwardFields />;
        case 'CONFERENCE': return <ConferenceFields />;
        case 'WORKSHOP': return <WorkshopFields />;
        case 'PRODUCT_LAUNCH': return <ProductLaunchFields />;
        default: return null;
    }
};
