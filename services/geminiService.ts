
import { GoogleGenAI, Modality, Operation } from "@google/genai";

const getApiKey = (): string => {
    const apiKey = typeof process !== 'undefined' && process.env && process.env.API_KEY
        ? process.env.API_KEY
        : undefined;

    if (!apiKey) {
        throw new Error("API_KEY environment variable not found.");
    }
    return apiKey;
}

export const generateBannerImage = async (festivalName: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });

  const prompt = `Create a visually stunning, high-resolution banner image for a luxury Indian jewellery brand advertisement celebrating the '${festivalName}' festival. The image should be elegant, divine, and festive. Key elements should include traditional motifs associated with ${festivalName}, a soft golden divine light, and rich, warm colors. The composition should have ample, clean, and subtly blurred background space, especially on the right and center, to allow for text overlays. Do not include any text in the image. Focus on creating a beautiful, atmospheric background.`;

  const response = await ai.models.generateImages({
    model: 'imagen-4.0-generate-001',
    prompt,
    config: {
      numberOfImages: 1,
      outputMimeType: 'image/jpeg',
      aspectRatio: '3:4',
    },
  });

  if (response.generatedImages && response.generatedImages.length > 0 && response.generatedImages[0].image.imageBytes) {
    const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
    return `data:image/jpeg;base64,${base64ImageBytes}`;
  } else {
    throw new Error('Image generation failed, no image bytes returned.');
  }
};

export const removeLogoBackground = async (base64Url: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });

  const match = base64Url.match(/^data:(image\/[a-z]+);base64,(.*)$/);
  if (!match) {
    throw new Error("Invalid base64 image URL format.");
  }
  const mimeType = match[1];
  const base64Data = match[2];

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType,
          },
        },
        {
          text: 'Remove the background from this logo. Make the background fully transparent. The output must be a PNG image.',
        },
      ],
    },
    config: {
        responseModalities: [Modality.IMAGE],
    },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      const base64ImageBytes: string = part.inlineData.data;
      return `data:image/png;base64,${base64ImageBytes}`;
    }
  }
  
  throw new Error('Background removal failed, no image data returned.');
};

export const generateBannerVideo = async (imageBase64: string): Promise<Operation> => {
    // A new instance must be created to use the key selected from the dialog.
    const ai = new GoogleGenAI({ apiKey: getApiKey() });

    const match = imageBase64.match(/^data:(image\/[a-z]+);base64,(.*)$/);
    if (!match) {
        throw new Error("Invalid base64 image URL format.");
    }
    const mimeType = match[1];
    const base64Data = match[2];

    const operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: 'Gently animate this festive image. Add subtle, elegant golden sparkles and a soft, slow zoom effect to make it feel magical and luxurious.',
        image: {
            imageBytes: base64Data,
            mimeType: mimeType,
        },
        config: {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio: '3:4'
        }
    });
    return operation;
}

export const getVideosOperation = async (operation: Operation): Promise<Operation> => {
    // A new instance must be created to use the key selected from the dialog.
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const updatedOperation = await ai.operations.getVideosOperation({ operation: operation });
    return updatedOperation;
}
