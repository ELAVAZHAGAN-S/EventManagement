// API Base URL from environment variable with fallback
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export const getImageUrl = (imageId: string | null | undefined) => {
    if (!imageId) return undefined;
    return imageId.startsWith('http') ? imageId : `${API_BASE_URL}/files/${imageId}`;
};
