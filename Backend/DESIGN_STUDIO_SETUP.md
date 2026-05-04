# Interior Design Studio - Setup Guide

## System Requirements

### Backend
- Node.js 16+ 
- Python 3.8+
- MongoDB 4.4+ (local or Atlas)

### Frontend
- Node.js 16+
- React 19+

## Installation

### 1. Backend Setup

```bash
cd Backend

# Install Node dependencies
npm install

# Install Python dependencies
pip install -r requirements.txt

# Create .env file with:
MONGODB_URI=mongodb://localhost:27017/decoview
JWT_SECRET=your_secret_key
PORT=5000
```

### 2. Frontend Setup

```bash
cd Furnish-Studio-main

# Install dependencies
npm install

# Start development server
npm start
```

### 3. Run Backend

```bash
cd Backend
npm start
```

## Features Implemented

### Image Processing Engine
- **Wall Detection**: Automatic wall segmentation using HSV analysis
- **Door Detection**: Identifies doors and windows in images
- **Realistic Texture Mapping**: 
  - Preserves lighting and shadows
  - Maintains perspective accuracy
  - Smooth edge blending

### Design Variations Generator
- **5+ Color Palettes**: Modern, Minimal, Bold, Neutral, Warm
- **5+ Texture Options**: 
  - Matte, Glossy, Wood (light/dark)
  - Marble, Concrete, Brick
  - Wallpaper patterns
- **HSV-based Color Application**: Maintains brightness and contrast
- **Smooth Transitions**: 15px Gaussian blur for natural edges

### API Endpoints

#### Upload & Process
- `POST /api/design/process-image` - Upload image and generate variations
  - Accepts: multipart/form-data with image file
  - Returns: Original + 10 variations in base64

#### Retrieve Results
- `GET /api/design/variations/:designId` - Get saved variations
- `GET /api/design/image/:designId/:filename` - Get specific image

#### Save Designs
- `POST /api/designs/save` - Save design to user profile (protected)

### Frontend Components

**DesignStudio.jsx**
- Drag & drop image upload
- Real-time processing with progress
- Grid display of all variations
- Individual image preview and download
- Batch download all variations
- Save designs to profile

## Usage

1. Navigate to `/design-studio` route
2. Upload room image (JPG, PNG, WebP)
3. System automatically:
   - Detects walls, doors, surfaces
   - Generates 10 design variations
4. Click any variation to preview
5. Download individual or all variations
6. Save favorite designs to profile

## Technical Stack

### Image Processing
- **OpenCV**: Edge detection, contour finding
- **PIL/Pillow**: Image manipulation, compositing
- **NumPy**: Array operations
- **scikit-image**: Advanced image analysis

### Backend
- **Express.js**: REST API
- **Multer**: File upload handling
- **Child Process**: Python integration
- **MongoDB**: Design storage

### Frontend
- **React 19**: UI framework
- **Lucide Icons**: UI elements
- **CSS3**: Modern styling with animations
- **Fetch API**: HTTP communication

## Performance Notes

- Image processing: 2-5 seconds (depending on resolution)
- Variation generation: Parallel processing
- Output: Base64 encoded PNGs for instant preview
- Memory efficient: Automatic cleanup of processed files

## Security

- File type validation (image/* only)
- Size limit: 10MB max
- Directory traversal protection
- JWT token authentication for saved designs
- CORS enabled for cross-origin requests

## Future Enhancements

- [ ] Real-time lighting simulation
- [ ] Material-based texture mappings
- [ ] AR preview in mobile
- [ ] Custom texture uploads
- [ ] Collaborative design sharing
- [ ] AI-suggested color palettes
- [ ] Furniture placement recommendations
- [ ] 3D walkthrough export
