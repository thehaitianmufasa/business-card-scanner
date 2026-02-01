import vision from "@google-cloud/vision";

// Initialize Vision client with service account credentials
const visionClient = new vision.ImageAnnotatorClient({
  credentials: {
    client_email: process.env.GOOGLE_VISION_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_VISION_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  },
});

export interface VisionResult {
  text: string;
  confidence: number;
}

export async function extractTextFromImage(
  imageBuffer: Buffer
): Promise<VisionResult> {
  const [result] = await visionClient.textDetection({
    image: { content: imageBuffer.toString("base64") },
  });

  if (!result.textAnnotations || result.textAnnotations.length === 0) {
    throw new Error("No text detected in the image");
  }

  const text = result.textAnnotations[0].description || "";
  const confidence = result.textAnnotations[0].confidence || 0.9;

  return { text, confidence };
}
