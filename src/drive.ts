import { getAccessToken } from './auth';

export interface StudentPhoto {
  id: string;
  name: string;
  url: string | null;
}

// Word boundaries: start of string, whitespace, hyphen, opening paren.
// "mary-anne", "JOHN", and "alice (al) smith" all become
// "Mary-Anne", "John", and "Alice (Al) Smith".
const toTitleCase = (s: string): string =>
  s.toLowerCase().replace(/(^|[\s\-(])([a-z])/g, (_, sep, ch) => sep + ch.toUpperCase());

export const fetchStudentPhotos = async (folderId: string): Promise<StudentPhoto[]> => {
  const token = await getAccessToken();
  if (!token) throw new Error('No access token available');

  const query = `'${folderId}' in parents and mimeType contains 'image/' and trashed = false`;
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,thumbnailLink,webContentLink)&supportsAllDrives=true&includeItemsFromAllDrives=true`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const errorDetails = await response.text();
    console.error('Drive API error:', errorDetails);
    throw new Error('Failed to fetch file list: ' + errorDetails);
  }

  const { files } = await response.json();
  console.log("Raw files fetched:", files);
  if (!files) return [];

  // Filter for images here if needed
  const imageFiles = files.filter((f: any) => f.mimeType && f.mimeType.startsWith('image/'));
  console.log("Filtered image files:", imageFiles);

  // Clean up the names (remove file extensions like .jpg, .png)
  return imageFiles.map((f: any) => {
    // If we have a thumbnail link, we can modify it to be higher resolution
    // thumbnail links usually look like: https://lh3.googleusercontent.com/...=s220
    let photoUrl = null;
    if (f.thumbnailLink) {
      photoUrl = f.thumbnailLink.replace(/=s\d+$/, '=s800'); // get 800px version
    }

    return {
      id: f.id,
      name: toTitleCase(f.name.replace(/\.[^/.]+$/, "")),
      url: photoUrl, // We will use this directly!
    };
  });
};

// Fetch actual image data and create an object URL
export const fetchImageBlobUrl = async (fileId: string): Promise<string> => {
  const token = await getAccessToken();
  if (!token) throw new Error('No access token available');

  const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&supportsAllDrives=true`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const errorDetails = await response.text();
    console.error('Drive API error during media fetch:', errorDetails);
    throw new Error('Failed to fetch image data: ' + errorDetails);
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
};
