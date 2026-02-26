import React from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';

const TicketTierInput = () => {
    const { register, control, watch, formState: { errors } } = useFormContext();
    const { fields, append, remove } = useFieldArray({
        control,
        name: "ticketTiers"
    });

    const ticketType = watch('ticketType');

    if (ticketType !== 'PAID') return null;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">Ticket Tiers</label>
                <button
                    type="button"
                    onClick={() => append({ name: '', price: 0, capacity: 100, description: '' })}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                    <Plus size={16} /> Add Tier
                </button>
            </div>

            <div className="space-y-3">
                {fields.map((field, index) => (
                    <div key={field.id} className="flex gap-4 items-start bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <div className="flex-1 space-y-2">
                            <div className="grid grid-cols-12 gap-2">
                                <div className="col-span-4">
                                    <input
                                        {...register(`ticketTiers.${index}.name`, { required: "Name is required" })}
                                        placeholder="Tier Name (e.g. VIP)"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                    />
                                </div>
                                <div className="col-span-3">
                                    <div className="relative">
                                        <span className="absolute left-3 top-2 text-gray-500 text-sm">$</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            {...register(`ticketTiers.${index}.price`, { required: "Price is required", min: 0.01 })}
                                            placeholder="Price"
                                            className="w-full pl-6 pr-3 py-2 border border-gray-300 rounded-md text-sm"
                                        />
                                    </div>
                                </div>
                                <div className="col-span-3">
                                    <input
                                        type="number"
                                        {...register(`ticketTiers.${index}.capacity`)}
                                        placeholder="Capacity"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                    />
                                </div>
                                <div className="col-span-2 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => remove(index)}
                                        className="text-red-500 hover:text-red-700 p-2"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                            <input
                                {...register(`ticketTiers.${index}.description`)}
                                placeholder="Description / Perks"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                            />
                        </div>
                    </div>
                ))}
            </div>
            {errors.ticketTiers && <p className="text-red-500 text-sm">Please add at least one ticket tier.</p>}
        </div>
    );
};

export default TicketTierInput;
