const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a file buffer to Cloudinary
 * @param {Buffer} buffer - File buffer
 * @param {Object} options - Cloudinary upload options
 * @returns {Promise<Object>} Cloudinary upload result
 */
const uploadToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
};

/**
 * Convert a PDF (uploaded to Cloudinary) into page images.
 * Uses Cloudinary's built-in PDF page transformation.
 * @param {string} pdfPublicId - The Cloudinary public_id of the uploaded PDF
 * @param {number} totalPages  - Number of pages in the PDF
 * @param {string} folderName  - Target folder for page images
 * @returns {Promise<string[]>} Array of page image public_ids
 */
const convertPdfToImages = async (pdfPublicId, totalPages, folderName) => {
  const pagePublicIds = [];

  for (let page = 1; page <= totalPages; page++) {
    // Use Cloudinary's page transformation to extract each page as an image
    const pagePublicId = `${folderName}/page_${String(page).padStart(4, '0')}`;
    pagePublicIds.push(pagePublicId);
  }

  return pagePublicIds;
};

/**
 * Get a short-lived signed URL for a page image (60-second expiry).
 * @param {string} publicId - Cloudinary public_id of the page image
 * @param {number} pageNum  - Page number (used in Cloudinary PDF page extraction)
 * @param {string} pdfPublicId - The original PDF public_id
 * @returns {string} Signed URL
 */
const getSignedPageUrl = (pdfPublicId, pageNum) => {
  const expiresAt = Math.floor(Date.now() / 1000) + 60; // 60 seconds

  const signedUrl = cloudinary.url(pdfPublicId, {
    resource_type: 'image',
    format: 'jpg',
    page: pageNum,
    width: 1600,
    quality: 'auto:good',
    sign_url: true,
    type: 'authenticated',
    expires_at: expiresAt,
  });

  return signedUrl;
};

/**
 * Delete a Cloudinary resource by public_id
 */
const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (err) {
    console.error(`Failed to delete Cloudinary resource ${publicId}:`, err.message);
  }
};

/**
 * Delete an entire Cloudinary folder and its contents
 */
const deleteCloudinaryFolder = async (folderPath) => {
  try {
    // Delete all resources in the folder
    await cloudinary.api.delete_resources_by_prefix(folderPath, {
      resource_type: 'image',
    });
    // Delete the folder itself
    await cloudinary.api.delete_folder(folderPath);
  } catch (err) {
    console.error(`Failed to delete Cloudinary folder ${folderPath}:`, err.message);
  }
};

/**
 * Get total number of pages in a PDF uploaded to Cloudinary
 */
const getPdfPageCount = async (publicId) => {
  try {
    const result = await cloudinary.api.resource(publicId, {
      resource_type: 'image',
      pages: true,
      type: 'authenticated',
    });
    return result.pages || 1;
  } catch (err) {
    console.error('Failed to get PDF page count:', err.message || err);
    return 1;
  }
};

module.exports = {
  cloudinary,
  uploadToCloudinary,
  convertPdfToImages,
  getSignedPageUrl,
  deleteFromCloudinary,
  deleteCloudinaryFolder,
  getPdfPageCount,
};
