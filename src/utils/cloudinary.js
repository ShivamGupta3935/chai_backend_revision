import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'



    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
    });
    
    // Upload an image
    const uploadOnCloudinary = async (localFilePath) => {
        try {
            if(!localFilePath) return null

            const responseUrl = await cloudinary.uploader.upload(localFilePath, {
                resource_type: 'auto'
            })

            console.log("file uploaded successfully", responseUrl.url);
            return responseUrl;            

        } catch (error) {
            fs.unlinkSync(localFilePath)
            return null;
        }
     }
       
    console.log(uploadOnCloudinary);
    