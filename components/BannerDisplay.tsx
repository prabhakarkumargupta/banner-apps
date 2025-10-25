
import React, { useState, useRef, useEffect } from 'react';
import { LocationIcon } from './icons/LocationIcon';
import { PhoneIcon } from './icons/PhoneIcon';
import { EmailIcon } from './icons/EmailIcon';
import { WebsiteIcon } from './icons/WebsiteIcon';
import { InstagramIcon } from './icons/InstagramIcon';
import { FacebookIcon } from './icons/FacebookIcon';
import { CustomText } from '../App';

interface BannerDisplayProps {
  isLoading: boolean;
  error: string | null;
  generatedImage: string | null;
  festivalName: string;
  offers: string;
  accentColor: string;
  shopName: string;
  logoUrl: string | null;
  address: string;
  email: string;
  website: string;
  mobileNumber: string;
  altMobileNumber: string;
  instagramHandle: string;
  facebookHandle: string;
  customTexts: CustomText[];
  setCustomTexts: (texts: CustomText[]) => void;
  isGeneratingVideo: boolean;
  videoError: string | null;
  videoUrl: string | null;
}

const festivalTranslations: { [key: string]: string } = {
  'Chhath Puja': 'छठ पूजा',
  'Diwali': 'दिवाली',
  'Holi': 'होली',
  'Akshaya Tritiya': 'अक्षय तृतीया',
};

const getFestivalHindiName = (name: string) => {
    return festivalTranslations[name] || name;
}

type DraggableElement = 
    | { type: 'footer'; id: null }
    | { type: 'customText'; id: number };


export const BannerDisplay: React.FC<BannerDisplayProps> = ({
  isLoading, error, generatedImage, festivalName, offers, accentColor,
  shopName, logoUrl, address, email, website, mobileNumber, altMobileNumber,
  instagramHandle, facebookHandle, customTexts, setCustomTexts,
  isGeneratingVideo, videoError, videoUrl,
}) => {
    // State for font sizes in rem
    const [happyTextSize, setHappyTextSize] = useState(6);
    const [festivalTextSize, setFestivalTextSize] = useState(4.5);
    
    // State for element positions
    const [footerPos, setFooterPos] = useState({ x: 0, y: 0 });
    
    // Drag and Drop State
    const [draggingElement, setDraggingElement] = useState<DraggableElement | null>(null);
    const [dragStartOffset, setDragStartOffset] = useState({ x: 0, y: 0 });
    const bannerRef = useRef<HTMLDivElement>(null);


    const FONT_SIZE_STEP = 0.25; // rem
    const MIN_FONT_SIZE = 1; // rem

    const handleTextSizeChange = (
        setter: React.Dispatch<React.SetStateAction<number>>, 
        direction: 'increase' | 'decrease'
    ) => {
        setter(prev => {
            const newSize = direction === 'increase' ? prev + FONT_SIZE_STEP : prev - FONT_SIZE_STEP;
            return Math.max(newSize, MIN_FONT_SIZE);
        });
    };
    
    const handleCustomTextSizeChange = (id: number, direction: 'increase' | 'decrease') => {
        setCustomTexts(prevTexts => prevTexts.map(text => {
            if (text.id === id) {
                const newSize = direction === 'increase' ? text.size + FONT_SIZE_STEP : text.size - FONT_SIZE_STEP;
                return { ...text, size: Math.max(newSize, MIN_FONT_SIZE) };
            }
            return text;
        }));
    };

    const handleDragStart = (e: React.MouseEvent | React.TouchEvent, element: DraggableElement) => {
        e.preventDefault();
        setDraggingElement(element);

        let pos: { x: number, y: number };
        if (element.type === 'footer') {
            pos = footerPos;
        } else {
            const customText = customTexts.find(t => t.id === element.id);
            pos = customText ? customText.position : { x: 0, y: 0 };
        }
        
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        
        const bannerRect = bannerRef.current?.getBoundingClientRect();
        if (!bannerRect) return;

        setDragStartOffset({
            x: clientX - bannerRect.left - pos.x,
            y: clientY - bannerRect.top - pos.y,
        });
    };

    const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!draggingElement) return;

        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

        const bannerRect = bannerRef.current?.getBoundingClientRect();
        if (!bannerRect) return;

        let newX = clientX - bannerRect.left - dragStartOffset.x;
        let newY = clientY - bannerRect.top - dragStartOffset.y;
        
        if (draggingElement.type === 'footer') {
            setFooterPos({ x: newX, y: newY });
        } else if (draggingElement.type === 'customText') {
            setCustomTexts(prevTexts => prevTexts.map(text => 
                text.id === draggingElement.id ? { ...text, position: { x: newX, y: newY } } : text
            ));
        }
    };
    
    const handleDragEnd = () => {
        setDraggingElement(null);
    };

    useEffect(() => {
        const handleMouseUp = () => handleDragEnd();
        const handleTouchEnd = () => handleDragEnd();

        if(draggingElement) {
            window.addEventListener('mousemove', handleDragMove as any);
            window.addEventListener('touchmove', handleDragMove as any);
            window.addEventListener('mouseup', handleMouseUp);
            window.addEventListener('touchend', handleTouchEnd);
        }
        
        return () => {
            window.removeEventListener('mousemove', handleDragMove as any);
            window.removeEventListener('touchmove', handleDragMove as any);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchend', handleTouchEnd);
        }
    }, [draggingElement, dragStartOffset]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin" style={{ borderColor: accentColor }}></div>
          <p className="mt-4 text-lg text-gray-300">Generating your beautiful banner...</p>
          <p className="text-sm text-gray-500">This might take a moment.</p>
        </div>
      );
    }
    
    if (isGeneratingVideo) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-indigo-400"></div>
          <p className="mt-4 text-lg text-gray-300">Generating your video...</p>
          <p className="text-sm text-gray-500">This can take a few minutes. Please keep this tab open.</p>
        </div>
      );
    }

    if (error || videoError) {
      return (
        <div className="flex items-center justify-center h-full text-center text-red-400">
          <p>{error || videoError}</p>
        </div>
      );
    }

    if (!generatedImage && !videoUrl) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l-1.586-1.586a2 2 0 00-2.828 0L6 14m6-6l.01.01" />
          </svg>
          <p className="mt-4 text-lg text-gray-400">Your generated banner will appear here.</p>
          <p className="text-sm text-gray-600">Fill out the form and click "Generate Banner" to start.</p>
        </div>
      );
    }

    return (
      <div 
        ref={bannerRef}
        className="relative w-full aspect-[3/4] shadow-2xl overflow-hidden rounded-md text-white select-none"
        onMouseUp={handleDragEnd}
        onTouchEnd={handleDragEnd}
        onMouseLeave={handleDragEnd}
        >
        
        {videoUrl ? (
            <video src={videoUrl} className="absolute inset-0 w-full h-full object-cover" autoPlay loop muted playsInline />
        ) : (
            <img src={generatedImage} alt={`${festivalName} Banner`} className="absolute inset-0 w-full h-full object-cover" />
        )}
        
        <div className="absolute inset-0 bg-black bg-opacity-10"></div>
        
        {/* Overlays */}
        <div className="absolute top-4 left-4">
          {logoUrl && (
            <div className="w-32 h-24 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg flex items-center justify-center p-2">
              <img src={logoUrl} alt="Shop Logo" className="max-w-full max-h-full object-contain" />
            </div>
          )}
        </div>
        
        <div className="absolute top-1/4 left-0 right-0 text-center flex flex-col items-center px-4" style={{textShadow: '2px 2px 8px rgba(0,0,0,0.7)'}}>
            <h2 
                className="font-tangerine text-white cursor-pointer select-none transition-transform duration-200 hover:scale-105"
                onClick={() => handleTextSizeChange(setHappyTextSize, 'increase')}
                onContextMenu={(e) => { e.preventDefault(); handleTextSizeChange(setHappyTextSize, 'decrease'); }}
                style={{ fontSize: `${happyTextSize}rem`, lineHeight: '1' }}
                title="Left-click to enlarge, Right-click to shrink"
            >
                Happy
            </h2>
            <h1 
                className="font-devanagari font-bold mt-[-10px] tracking-wider cursor-pointer select-none transition-transform duration-200 hover:scale-105"
                 onClick={() => handleTextSizeChange(setFestivalTextSize, 'increase')}
                 onContextMenu={(e) => { e.preventDefault(); handleTextSizeChange(setFestivalTextSize, 'decrease'); }}
                style={{ color: accentColor, fontSize: `${festivalTextSize}rem`, lineHeight: '1.1' }}
                title="Left-click to enlarge, Right-click to shrink"
            >
               {getFestivalHindiName(festivalName)}
            </h1>
        </div>

        <div className="absolute top-1/2 mt-8 right-4 md:right-8 text-left max-w-[50%] md:max-w-[45%]" style={{textShadow: '1px 1px 6px rgba(0,0,0,0.8)'}}>
            <h3 className="font-semibold text-lg md:text-xl mb-2" style={{ color: accentColor }}>{festivalName} Offer</h3>
            <ul className="list-none space-y-1 text-sm md:text-base">
              {offers.split('\n').map((offer, index) => (
                <li key={index} className="leading-tight">{offer}</li>
              ))}
            </ul>
        </div>
        
         {/* Custom Texts */}
        {customTexts.map(text => (
            <div
                key={text.id}
                className="absolute cursor-move"
                style={{ 
                    left: 0,
                    top: 0,
                    transform: `translate(${text.position.x}px, ${text.position.y}px)`,
                    textShadow: '1px 1px 4px #000',
                }}
                onMouseDown={(e) => handleDragStart(e, { type: 'customText', id: text.id })}
                onTouchStart={(e) => handleDragStart(e, { type: 'customText', id: text.id })}
            >
                <p 
                    className="font-semibold text-white tracking-wide transition-transform duration-200 hover:scale-105"
                    style={{ fontSize: `${text.size}rem` }}
                    onClick={() => handleCustomTextSizeChange(text.id, 'increase')}
                    onContextMenu={(e) => { e.preventDefault(); handleCustomTextSizeChange(text.id, 'decrease'); }}
                    title="Left-click to enlarge, Right-click to shrink"
                >
                    {text.text}
                </p>
            </div>
        ))}


        <div 
            className="absolute bottom-4 left-4 right-4 cursor-move"
            style={{ 
                transform: `translate(${footerPos.x}px, ${footerPos.y}px)`,
            }}
            onMouseDown={(e) => handleDragStart(e, { type: 'footer', id: null })}
            onTouchStart={(e) => handleDragStart(e, { type: 'footer', id: null })}
        >
          <div className="bg-black/70 backdrop-blur-sm p-3 md:p-4 rounded-lg border-t-2" style={{ borderColor: accentColor }}>
            <div className="flex flex-col gap-2 text-amber-100 text-[10px] md:text-xs">
              {/* Line 1: Shop Name */}
              <p className="text-lg md:text-xl font-bold text-white tracking-widest text-center w-full">{shopName}</p>
              
              {/* Line 2: Address */}
              {address && (
                  <div className="flex items-center gap-2 border-t border-gray-600 pt-2">
                      <LocationIcon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: accentColor }} />
                      <span className="truncate">{address}</span>
                  </div>
              )}

              {/* Line 3: Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                 {mobileNumber && (
                    <div className="flex items-center gap-2">
                        <PhoneIcon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: accentColor }}/>
                        <span>{mobileNumber}{altMobileNumber && `, ${altMobileNumber}`}</span>
                    </div>
                  )}
                  {email && (
                    <div className="flex items-center gap-2">
                        <EmailIcon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: accentColor }}/>
                        <span className="truncate">{email}</span>
                    </div>
                  )}
              </div>

              {/* Line 4: Social */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                   {website && (
                    <div className="flex items-center gap-2">
                        <WebsiteIcon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: accentColor }}/>
                        <span className="truncate">{website}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-4">
                    {instagramHandle && (
                        <div className="flex items-center gap-2">
                            <InstagramIcon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: accentColor }}/>
                            <span className="truncate">@{instagramHandle}</span>
                        </div>
                    )}
                    {facebookHandle && (
                        <div className="flex items-center gap-2">
                            <FacebookIcon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: accentColor }}/>
                            <span className="truncate">{facebookHandle}</span>
                        </div>
                    )}
                  </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg aspect-[3/4] w-full max-w-2xl mx-auto lg:max-w-none">
      {renderContent()}
    </div>
  );
};
