/**
 * Roboto Font Loader for jsPDF
 * Loads Roboto font from CDN and converts to base64 for jsPDF
 */

// Cache for loaded font
let cachedRobotoBase64 = null;

// Roboto Regular font base64 (minimal subset for invoices)
// This is a placeholder - you can replace with full Roboto font base64
// To get the full font, convert Roboto-Regular.ttf to base64
// You can use online tools like: https://base64.guru/converter/encode/file
const ROBOTO_REGULAR_BASE64 = '';

/**
 * Load Roboto font from URL and convert to base64
 * @param {string} fontUrl - URL to Roboto font file
 * @returns {Promise<string>} Base64 encoded font
 */
export const loadRobotoFont = async (fontUrl = 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxP.ttf') => {
  // Return cached font if available
  if (cachedRobotoBase64) {
    return cachedRobotoBase64;
  }
  
  try {
    const response = await fetch(fontUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch font: ${response.statusText}`);
    }
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result.split(',')[1];
        cachedRobotoBase64 = base64; // Cache it
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error loading Roboto font:', error);
    return null;
  }
};

/**
 * Preload Roboto font (call this early in the app)
 * @returns {Promise<boolean>} True if font was loaded successfully
 */
export const preloadRobotoFont = async () => {
  try {
    const base64 = await loadRobotoFont();
    return base64 !== null;
  } catch (error) {
    console.error('Error preloading Roboto font:', error);
    return false;
  }
};

/**
 * Get cached Roboto font base64
 * @returns {string|null} Cached base64 font or null
 */
export const getCachedRobotoFont = () => {
  return cachedRobotoBase64 || ROBOTO_REGULAR_BASE64 || null;
};

/**
 * Initialize Roboto font in jsPDF document (async version)
 * @param {jsPDF} doc - jsPDF document instance
 * @param {string} base64Font - Base64 encoded font (optional)
 * @returns {Promise<boolean>} True if font was loaded successfully
 */
export const initializeRobotoFont = async (doc, base64Font = null) => {
  try {
    let fontBase64 = base64Font || getCachedRobotoFont() || ROBOTO_REGULAR_BASE64;
    
    // If no base64 provided, try to load from CDN
    if (!fontBase64) {
      fontBase64 = await loadRobotoFont();
    }
    
    if (!fontBase64) {
      console.warn('Roboto font not available, using default font');
      return false;
    }
    
    // Add font to jsPDF
    doc.addFileToVFS('Roboto-Regular.ttf', fontBase64);
    doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
    doc.setFont('Roboto');
    
    return true;
  } catch (error) {
    console.error('Error initializing Roboto font:', error);
    return false;
  }
};

/**
 * Synchronous version - requires base64 font to be provided or cached
 * @param {jsPDF} doc - jsPDF document instance
 * @param {string} base64Font - Base64 encoded Roboto font (optional, uses cache if not provided)
 * @returns {boolean} True if font was loaded successfully
 */
export const initializeRobotoFontSync = (doc, base64Font = null) => {
  try {
    // Try to get font from parameter, cache, or constant
    const fontBase64 = base64Font || getCachedRobotoFont() || ROBOTO_REGULAR_BASE64;
    
    if (!fontBase64) {
      console.warn('Roboto font base64 not available, using default font');
      return false;
    }
    
    doc.addFileToVFS('Roboto-Regular.ttf', fontBase64);
    doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
    doc.setFont('Roboto');
    
    return true;
  } catch (error) {
    console.error('Error initializing Roboto font:', error);
    return false;
  }
};

