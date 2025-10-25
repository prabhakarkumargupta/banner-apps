
import React, { useState, useRef } from 'react';
import { removeLogoBackground } from '../services/geminiService';
import { CustomText } from '../App';

interface BannerFormProps {
  festivalName: string;
  setFestivalName: (name: string) => void;
  offers: string;
  setOffers: (offers: string) => void;
  accentColor: string;
  setAccentColor: (color: string) => void;
  customTexts: CustomText[];
  setCustomTexts: (texts: CustomText[]) => void;
  shopName: string;
  setShopName: (name: string) => void;
  logoUrl: string | null;
  setLogoUrl: (url: string | null) => void;
  address: string;
  setAddress: (address: string) => void;
  email: string;
  setEmail: (email: string) => void;
  website: string;
  setWebsite: (website: string) => void;
  mobileNumber: string;
  setMobileNumber: (num: string) => void;
  altMobileNumber: string;
  setAltMobileNumber: (num: string) => void;
  instagramHandle: string;
  setInstagramHandle: (handle: string) => void;
  facebookHandle: string;
  setFacebookHandle: (handle: string) => void;
  isLoading: boolean;
  onGenerate: () => void;
  isGeneratingVideo: boolean;
  onGenerateVideo: () => void;
  generatedImage: string | null;
  apiKeyReady: boolean;
  setApiKeyReady: (ready: boolean) => void;
  videoError: string | null;
}

const CollapsibleSection: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-gray-700">
      <button
        type="button"
        className="w-full flex justify-between items-center py-4 text-left text-lg font-semibold text-amber-300"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        {title}
        <svg
          className={`w-5 h-5 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && <div className="pb-4 space-y-6">{children}</div>}
    </div>
  );
};


export const BannerForm: React.FC<BannerFormProps> = ({
  festivalName, setFestivalName, offers, setOffers, accentColor, setAccentColor,
  customTexts, setCustomTexts, shopName, setShopName, logoUrl, setLogoUrl, address, setAddress, email, setEmail,
  website, setWebsite, mobileNumber, setMobileNumber, altMobileNumber, setAltMobileNumber,
  instagramHandle, setInstagramHandle, facebookHandle, setFacebookHandle,
  isLoading, onGenerate, isGeneratingVideo, onGenerateVideo, generatedImage, apiKeyReady, setApiKeyReady, videoError
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isRemovingBackground, setIsRemovingBackground] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [customTextInput, setCustomTextInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate();
  };
  
  const handleFileSelect = (file: File | null) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoUrl(reader.result as string);
        setLogoError(null);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleLegacyFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     handleFileSelect(e.target.files?.[0] || null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files?.[0] || null);
  };

  const handleDropZoneClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveBackground = async () => {
    if (!logoUrl) return;
    setIsRemovingBackground(true);
    setLogoError(null);
    try {
        const newLogoUrl = await removeLogoBackground(logoUrl);
        setLogoUrl(newLogoUrl);
    } catch(err) {
        console.error("Background removal failed:", err);
        setLogoError("Failed to remove background. Please try another image.");
    } finally {
        setIsRemovingBackground(false);
    }
  }

  const handleAddCustomText = () => {
    if (customTextInput.trim() === '') return;
    const newText: CustomText = {
        id: Date.now(),
        text: customTextInput.trim(),
        position: { x: 0, y: 0 },
        size: 1.5 // default size in rem
    };
    setCustomTexts([...customTexts, newText]);
    setCustomTextInput('');
  };

  const handleRemoveCustomText = (id: number) => {
    setCustomTexts(customTexts.filter(text => text.id !== id));
  }
  
  const handleApiKeySelect = async () => {
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
        await window.aistudio.openSelectKey();
        // Assume key selection is successful to avoid race conditions
        setApiKeyReady(true);
    }
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg sticky top-8 max-h-[90vh] overflow-y-auto">
      <h2 className="text-2xl font-bold mb-4 text-amber-300">Customize Your Banner</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        
        <CollapsibleSection title="Banner Details">
            <div>
              <label htmlFor="festivalName" className="block text-sm font-medium text-gray-300 mb-2">Festival Name</label>
              <input type="text" id="festivalName" value={festivalName} onChange={(e) => setFestivalName(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition" placeholder="e.g., Diwali, Eid, Christmas" required />
            </div>
            <div>
              <label htmlFor="offers" className="block text-sm font-medium text-gray-300 mb-2">Promotional Offers</label>
              <textarea id="offers" value={offers} onChange={(e) => setOffers(e.target.value)} rows={5} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition" placeholder="Enter each offer on a new line" required />
            </div>
            <div>
              <label htmlFor="accentColor" className="block text-sm font-medium text-gray-300 mb-2">Accent Color</label>
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10">
                  <input type="color" id="accentColor" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="w-full h-full p-0 border-0 cursor-pointer absolute opacity-0 inset-0" />
                  <div className="w-full h-full rounded-md border border-gray-600 pointer-events-none" style={{ backgroundColor: accentColor }} aria-hidden="true"></div>
                </div>
                <input type="text" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition" placeholder="#fbbf24" aria-label="Accent color hex code" />
              </div>
            </div>
        </CollapsibleSection>
        
        <CollapsibleSection title="Add Custom Text" defaultOpen={false}>
            <div className="flex items-center gap-2">
                 <input 
                    type="text" 
                    value={customTextInput}
                    onChange={(e) => setCustomTextInput(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition" placeholder="Enter custom text..."
                />
                <button type="button" onClick={handleAddCustomText} className="bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold py-2 px-4 rounded-md transition-colors">Add</button>
            </div>
            {customTexts.length > 0 && (
                <div className="mt-4 space-y-2">
                    {customTexts.map(text => (
                        <div key={text.id} className="flex items-center justify-between bg-gray-700 p-2 rounded-md">
                            <p className="text-sm text-white truncate">{text.text}</p>
                            <button type="button" onClick={() => handleRemoveCustomText(text.id)} className="text-red-400 hover:text-red-300 font-bold text-lg">&times;</button>
                        </div>
                    ))}
                </div>
            )}
        </CollapsibleSection>

        <CollapsibleSection title="Shop Details">
            <div>
              <label htmlFor="shopName" className="block text-sm font-medium text-gray-300 mb-2">Shop Name</label>
              <input type="text" id="shopName" value={shopName} onChange={(e) => setShopName(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition" placeholder="Your Jewellery Store" required />
            </div>
             <div>
              <label htmlFor="logo-upload" className="block text-sm font-medium text-gray-300 mb-2">Logo</label>
              <div
                onClick={handleDropZoneClick}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`flex justify-center items-center w-full px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md cursor-pointer transition-colors duration-300 ${isDragging ? 'border-amber-500 bg-gray-700' : 'hover:border-gray-500'}`}
              >
                <div className="space-y-1 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="flex text-sm text-gray-400">
                    <p className="pl-1">Drag & drop, or <span className="font-semibold text-amber-400">click to upload</span></p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF</p>
                </div>
                 <input
                    ref={fileInputRef}
                    type="file"
                    id="logo-upload"
                    onChange={handleLegacyFileChange}
                    accept="image/*"
                    className="hidden"
                 />
              </div>
               {logoUrl && (
                <div className="mt-4 text-center">
                    <div className="flex items-center justify-center gap-4">
                        <p className="text-sm text-gray-400">Preview:</p>
                        <img src={logoUrl} alt="Logo Preview" className="w-16 h-16 object-contain bg-white p-1 rounded-md shadow-md" />
                    </div>
                    <button type="button" onClick={handleRemoveBackground} disabled={isRemovingBackground} className="mt-3 text-sm bg-gray-600 hover:bg-gray-500 text-white font-medium py-2 px-4 rounded-md transition-all duration-300 disabled:bg-gray-700 disabled:cursor-not-allowed flex items-center justify-center mx-auto">
                        {isRemovingBackground ? (
                             <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Removing...
                            </>
                        ) : 'Remove Background (AI)'}
                    </button>
                    {logoError && <p className="text-red-400 text-xs mt-2">{logoError}</p>}
                </div>
              )}
            </div>
             <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-300 mb-2">Address</label>
              <input type="text" id="address" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition" placeholder="Shop address" />
            </div>
        </CollapsibleSection>
        
        <CollapsibleSection title="Contact Information" defaultOpen={false}>
             <div>
              <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-300 mb-2">Mobile Number</label>
              <input type="tel" id="mobileNumber" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition" placeholder="+91 12345 67890" />
            </div>
            <div>
              <label htmlFor="altMobileNumber" className="block text-sm font-medium text-gray-300 mb-2">Alternative Mobile Number</label>
              <input type="tel" id="altMobileNumber" value={altMobileNumber} onChange={(e) => setAltMobileNumber(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition" placeholder="Optional second number" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">Email ID</label>
              <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition" placeholder="contact@example.com" />
            </div>
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-300 mb-2">Website</label>
              <input type="url" id="website" value={website} onChange={(e) => setWebsite(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition" placeholder="https://www.example.com" />
            </div>
        </CollapsibleSection>

        <CollapsibleSection title="Social Media" defaultOpen={false}>
           <div>
              <label htmlFor="instagramHandle" className="block text-sm font-medium text-gray-300 mb-2">Instagram Handle</label>
              <input type="text" id="instagramHandle" value={instagramHandle} onChange={(e) => setInstagramHandle(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition" placeholder="your_handle" />
            </div>
            <div>
              <label htmlFor="facebookHandle" className="block text-sm font-medium text-gray-300 mb-2">Facebook Handle</label>
              <input type="text" id="facebookHandle" value={facebookHandle} onChange={(e) => setFacebookHandle(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition" placeholder="your.page" />
            </div>
        </CollapsibleSection>


        <div className="pt-4 space-y-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold py-3 px-4 rounded-md transition-all duration-300 disabled:bg-amber-800 disabled:cursor-not-allowed transform hover:scale-105"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating Image...
                </>
              ) : (
                'Generate Banner'
              )}
            </button>

            {apiKeyReady ? (
                 <button
                    type="button"
                    onClick={onGenerateVideo}
                    disabled={!generatedImage || isGeneratingVideo || isLoading}
                    className="w-full flex justify-center items-center bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-4 rounded-md transition-all duration-300 disabled:bg-indigo-800 disabled:cursor-not-allowed transform hover:scale-105"
                    >
                    {isGeneratingVideo ? (
                        <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating Video...
                        </>
                    ) : (
                        'Generate Video'
                    )}
                </button>
            ) : (
                <button
                    type="button"
                    onClick={handleApiKeySelect}
                    className="w-full flex justify-center items-center bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-4 rounded-md transition-all duration-300"
                >
                    Select API Key to Generate Video
                </button>
            )}
            {videoError && <p className="text-red-400 text-sm text-center">{videoError} <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline">Check billing</a>.</p>}
        </div>
      </form>
    </div>
  );
};
