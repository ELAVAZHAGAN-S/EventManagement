import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { HiXMark, HiCheck, HiCloudArrowUp } from 'react-icons/hi2';
import { fileService } from '../../services/api';
import toast from 'react-hot-toast';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onUploadSuccess: (url: string) => void;
    title?: string;
    aspectRatio?: number; // 1 for circle/square, 16/9 for banner
    circularCrop?: boolean;
}

const ImageUploadModal = ({ isOpen, onClose, onUploadSuccess, title = "Upload Image", aspectRatio = 1, circularCrop = false }: Props) => {
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.addEventListener('load', () => setImageSrc(reader.result as string));
            reader.readAsDataURL(file);
        }
    };

    const createImage = (url: string): Promise<HTMLImageElement> =>
        new Promise((resolve, reject) => {
            const image = new Image();
            image.addEventListener('load', () => resolve(image));
            image.addEventListener('error', (error) => reject(error));
            image.setAttribute('crossOrigin', 'anonymous');
            image.src = url;
        });

    const getCroppedImg = async (imageSrc: string, pixelCrop: any): Promise<Blob> => {
        const image = await createImage(imageSrc);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            throw new Error('No 2d context');
        }

        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;

        ctx.drawImage(
            image,
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height,
            0,
            0,
            pixelCrop.width,
            pixelCrop.height
        );

        return new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (!blob) {
                    reject(new Error('Canvas is empty'));
                    return;
                }
                resolve(blob);
            }, 'image/jpeg');
        });
    };

    const handleSave = async () => {
        if (!imageSrc || !croppedAreaPixels) return;
        setLoading(true);
        try {
            const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
            const file = new File([croppedBlob], "cropped.jpg", { type: "image/jpeg" });

            // Upload
            const url = await fileService.upload(file);
            onUploadSuccess(url);
            onClose();
            toast.success("Image uploaded successfully");
            setImageSrc(null); // Reset
        } catch (e) {
            console.error(e);
            toast.error("Failed to upload image");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-gray-800">{title}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <HiXMark className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 p-4 bg-gray-50 relative min-h-[300px]">
                    {imageSrc ? (
                        <div className="relative w-full h-full min-h-[300px]">
                            <Cropper
                                image={imageSrc}
                                crop={crop}
                                zoom={zoom}
                                aspect={aspectRatio}
                                cropShape={circularCrop ? 'round' : 'rect'}
                                onCropChange={setCrop}
                                onCropComplete={onCropComplete}
                                onZoomChange={setZoom}
                            />
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-8 hover:bg-gray-100 transition cursor-pointer relative">
                            <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                            <div className="bg-blue-50 p-4 rounded-full mb-3">
                                <HiCloudArrowUp className="w-8 h-8 text-blue-600" />
                            </div>
                            <p className="text-sm font-medium text-gray-700">Click or drag to upload image</p>
                            <p className="text-xs text-gray-400 mt-1">Supports JPG, PNG</p>
                        </div>
                    )}
                </div>

                {imageSrc && (
                    <div className="p-4 bg-white border-t border-gray-100 space-y-4">
                        <div className="flex items-center gap-4">
                            <span className="text-xs text-gray-500 font-medium">Zoom</span>
                            <input
                                type="range"
                                value={zoom}
                                min={1}
                                max={3}
                                step={0.1}
                                aria-labelledby="Zoom"
                                onChange={(e) => setZoom(Number(e.target.value))}
                                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setImageSrc(null)}
                                    className="px-4 py-2 text-sm text-gray-600 bg-gray-50 hover:bg-gray-100 font-medium rounded-lg transition-colors"
                                >
                                    Change Photo
                                </button>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={onClose} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-50 rounded-lg">Cancel</button>
                                <button
                                    onClick={handleSave}
                                    disabled={loading}
                                    className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
                                >
                                    {loading ? 'Uploading...' : <><HiCheck className="w-5 h-5" /> Save Image</>}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImageUploadModal;
