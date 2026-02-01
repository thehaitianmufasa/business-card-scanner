export interface ExtractedContact {
  name: string;
  email: string;
  phone: string;
  website: string;
}

export function extractContactInfo(rawText: string): ExtractedContact {
  // Extract email using regex
  const emailMatch = rawText.match(/[\w\.-]+@[\w\.-]+\.\w+/);
  const email = emailMatch?.[0] || "";

  // Extract phone number (various formats)
  const phonePatterns = [
    /\+?1?[-.\s]?\(?(\d{3})\)?[-.\s]?(\d{3})[-.\s]?(\d{4})/,
    /\d{3}[-.\s]\d{3}[-.\s]\d{4}/,
    /\(\d{3}\)\s?\d{3}[-.\s]?\d{4}/,
  ];

  let phone = "";
  for (const pattern of phonePatterns) {
    const match = rawText.match(pattern);
    if (match) {
      phone = match[0];
      break;
    }
  }

  // Extract website
  const websitePatterns = [
    /https?:\/\/[\w\.-]+\.\w+[^\s]*/i,
    /www\.[\w\.-]+\.\w+/i,
    /[\w-]+\.(?:com|org|net|io|co|ai|dev|app|tech|biz)[^\s,]*/i,
  ];

  let website = "";
  for (const pattern of websitePatterns) {
    const match = rawText.match(pattern);
    if (match) {
      website = match[0];
      break;
    }
  }

  // Extract name - usually the first substantial line that isn't contact info
  const lines = rawText.split("\n").filter((line) => line.trim().length > 0);
  let name = "";

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip if it looks like contact info
    if (
      trimmed.includes("@") ||
      trimmed.match(/\d{3}.*\d{3}.*\d{4}/) ||
      trimmed.match(/www\./i) ||
      trimmed.match(/https?:\/\//i)
    ) {
      continue;
    }

    // Skip very short lines or lines that are all caps (likely company names)
    if (trimmed.length < 3 || trimmed.length > 50) {
      continue;
    }

    // Skip lines with too many numbers (addresses, dates)
    const digitCount = (trimmed.match(/\d/g) || []).length;
    if (digitCount > 3) {
      continue;
    }

    // Skip common non-name words
    const lowerLine = trimmed.toLowerCase();
    const skipWords = [
      "inc",
      "llc",
      "ltd",
      "corp",
      "company",
      "address",
      "phone",
      "email",
      "fax",
      "tel",
      "mobile",
    ];
    if (skipWords.some((word) => lowerLine.startsWith(word))) {
      continue;
    }

    // This looks like a name
    name = trimmed;
    break;
  }

  return {
    name,
    email,
    phone,
    website,
  };
}
