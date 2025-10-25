
import React, { useState, useCallback, useEffect } from 'react';
import { BannerForm } from './components/BannerForm';
import { BannerDisplay } from './components/BannerDisplay';
import { generateBannerImage, generateBannerVideo, getVideosOperation } from './services/geminiService';
import { Operation } from '@google/genai';

export interface CustomText {
  id: number;
  text: string;
  position: { x: number; y: number };
  size: number; // in rem
}

const App: React.FC = () => {
  // Banner Content State
  const [festivalName, setFestivalName] = useState<string>('Chhath Puja');
  const [offers, setOffers] = useState<string>(
    `1. Flat 25% off on Gold Jewellery Making Charges.
2. Upto 50% off on Diamond Jewellery.
3. Special collection of Silver Ornaments.
4. 100% BIS Hallmarked Jewellery.`
  );
  const [accentColor, setAccentColor] = useState<string>('#fbbf24');
  const [customTexts, setCustomTexts] = useState<CustomText[]>([]);


  // Branding & Contact State
  const [shopName, setShopName] = useState<string>('Raj Nandani Jewellers');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [address, setAddress] = useState<string>('Johri Complex, Opp. Axis Bank ATM, Bakerganj, Patna');
  const [email, setEmail] = useState<string>('');
  const [website, setWebsite] = useState<string>('');
  const [mobileNumber, setMobileNumber] = useState<string>('+91 82107 75023');
  const [altMobileNumber, setAltMobileNumber] = useState<string>('');
  const [instagramHandle, setInstagramHandle] = useState<string>('');
  const [facebookHandle, setFacebookHandle] = useState<string>('');

  // API State
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Video API State
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState<boolean>(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [apiKeyReady, setApiKeyReady] = useState(false);

  useEffect(() => {
    // Check if the user has selected an API key for video generation
    if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
        window.aistudio.hasSelectedApiKey().then(setApiKeyReady);
    }
  }, []);

  const handleGenerateBanner = useCallback(async () => {
    if (!festivalName) {
      setError('Please enter a festival name.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);
    setVideoUrl(null); // Reset video when generating a new image

    try {
      const imageUrl = await generateBannerImage(festivalName);
      setGeneratedImage(imageUrl);
    } catch (e) {
      console.error(e);
      setError('Failed to generate banner image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [festivalName]);
  
  const handleGenerateVideo = useCallback(async () => {
    if (!generatedImage) {
        setVideoError("Please generate a banner image first.");
        return;
    }
    setIsGeneratingVideo(true);
    setVideoError(null);
    setVideoUrl(null);

    try {
      // Create a new Gemini instance to ensure the latest API key is used
      let operation = await generateBannerVideo(generatedImage);

      // Polling for the result
      const poll = async () => {
          if (!operation.done) {
              operation = await getVideosOperation(operation);
              setTimeout(poll, 10000); // Poll every 10 seconds
          } else {
              const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
              if (downloadLink && process.env.API_KEY) {
                // The response.body contains the MP4 bytes. You must append an API key when fetching from the download link.
                const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
                const blob = await response.blob();
                const objectUrl = URL.createObjectURL(blob);
                setVideoUrl(objectUrl);
              } else if(operation.error) {
                console.error("Video generation error:", operation.error);
                let errorMessage = 'Video generation failed.';
                if (typeof operation.error.message === 'string' && operation.error.message.includes('not found')) {
                    errorMessage += ' Your API key might be invalid. Please re-select it.';
                    setApiKeyReady(false); // Reset key state
                }
                setVideoError(errorMessage);
              } else {
                setVideoError("Video generation failed: No download link found.");
              }
              setIsGeneratingVideo(false);
          }
      };
      
      poll();

    } catch (e: any) {
        console.error(e);
        let errorMessage = 'Failed to start video generation.';
        if (typeof e.message === 'string' && e.message.includes('not found')) {
            errorMessage += ' Your API key might be invalid. Please re-select it.';
            setApiKeyReady(false);
        }
        setVideoError(errorMessage);
        setIsGeneratingVideo(false);
    }
  }, [generatedImage]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-amber-400">Festival Banner Generator</h1>
          <p className="text-gray-400 mt-2">Create stunning jewellery ads for any occasion.</p>
        </header>
        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <BannerForm
            festivalName={festivalName}
            setFestivalName={setFestivalName}
            offers={offers}
            setOffers={setOffers}
            accentColor={accentColor}
            setAccentColor={setAccentColor}
            customTexts={customTexts}
            setCustomTexts={setCustomTexts}
            shopName={shopName}
            setShopName={setShopName}
            logoUrl={logoUrl}
            setLogoUrl={setLogoUrl}
            address={address}
            setAddress={setAddress}
            email={email}
            setEmail={setEmail}
            website={website}
            setWebsite={setWebsite}
            mobileNumber={mobileNumber}
            setMobileNumber={setMobileNumber}
            altMobileNumber={altMobileNumber}
            setAltMobileNumber={setAltMobileNumber}
            instagramHandle={instagramHandle}
            setInstagramHandle={setInstagramHandle}
            facebookHandle={facebookHandle}
            setFacebookHandle={setFacebookHandle}
            isLoading={isLoading}
            onGenerate={handleGenerateBanner}
            isGeneratingVideo={isGeneratingVideo}
            onGenerateVideo={handleGenerateVideo}
            generatedImage={generatedImage}
            apiKeyReady={apiKeyReady}
            setApiKeyReady={setApiKeyReady}
            videoError={videoError}
          />
          <BannerDisplay
            isLoading={isLoading}
            error={error}
            generatedImage={generatedImage}
            festivalName={festivalName}
            offers={offers}
            accentColor={accentColor}
            shopName={shopName}
            logoUrl={logoUrl}
            address={address}
            email={email}
            website={website}
            mobileNumber={mobileNumber}
            altMobileNumber={altMobileNumber}
            instagramHandle={instagramHandle}
            facebookHandle={facebookHandle}
            customTexts={customTexts}
            setCustomTexts={setCustomTexts}
            isGeneratingVideo={isGeneratingVideo}
            videoError={videoError}
            videoUrl={videoUrl}
          />
        </main>
      </div>
    </div>
  );
};

export default App;
