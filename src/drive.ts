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

// School filenames are "SURNAME, given names" -- keep the surname as
// uppercase (it can contain spaces, hyphens, or apostrophes) and
// title-case everything after the first comma. Filenames with no
// comma fall back to plain title case. Anything after a closing
// parenthesis is dropped, so "SMITH, John (Johnny) Robert" renders
// as "SMITH, John (Johnny)".
const formatName = (s: string): string => {
  const parenIdx = s.indexOf(')');
  const truncated = parenIdx === -1 ? s : s.slice(0, parenIdx + 1);
  const commaIdx = truncated.indexOf(',');
  if (commaIdx === -1) return toTitleCase(truncated);
  const surname = truncated.slice(0, commaIdx).trim().toUpperCase();
  const rest = truncated.slice(commaIdx + 1).trim();
  if (!rest) return surname;
  return `${surname}, ${toTitleCase(rest)}`;
};

export const fetchStudentPhotos = async (folderId: string): Promise<StudentPhoto[]> => {
  const token = await getAccessToken();
  if (!token) throw new Error('No access token available');

  const query = `'${folderId}' in parents and mimeType contains 'image/' and trashed = false`;

  // Drive's files.list defaults to 100 results per page. Page through
  // with the max allowed pageSize so folders larger than that load fully.
  const files: any[] = [];
  let pageToken: string | undefined;
  do {
    const params = new URLSearchParams({
      q: query,
      fields: 'nextPageToken, files(id,name,mimeType,thumbnailLink,webContentLink)',
      pageSize: '1000',
      supportsAllDrives: 'true',
      includeItemsFromAllDrives: 'true',
    });
    if (pageToken) params.set('pageToken', pageToken);

    const response = await fetch(`https://www.googleapis.com/drive/v3/files?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const errorDetails = await response.text();
      console.error('Drive API error:', errorDetails);
      throw new Error('Failed to fetch file list: ' + errorDetails);
    }

    const json = await response.json();
    if (json.files) files.push(...json.files);
    pageToken = json.nextPageToken;
  } while (pageToken);

  console.log(`Raw files fetched: ${files.length}`);

  const imageFiles = files.filter((f: any) => f.mimeType && f.mimeType.startsWith('image/'));
  console.log(`Filtered image files: ${imageFiles.length}`);

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
      name: formatName(f.name.replace(/\.[^/.]+$/, "")),
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
