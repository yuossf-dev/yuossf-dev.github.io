// Advanced Converter with Real Conversion Libraries
let currentTool = '';
let uploadedFile = null;
let ffmpegLoaded = false;
let ffmpeg = null;

// Tool configurations
const toolConfig = {
    'image-resize': {
        title: 'Resize Image',
        accept: 'image/*',
        options: `
            <label class="block mb-2">Width (pixels):</label>
            <input type="number" id="width" class="w-full px-4 py-2 border rounded mb-4" value="800" min="1">
            <label class="block mb-2">Height (pixels):</label>
            <input type="number" id="height" class="w-full px-4 py-2 border rounded mb-4" value="600" min="1">
            <label class="flex items-center mb-4">
                <input type="checkbox" id="maintainAspect" class="mr-2" checked>
                Maintain aspect ratio
            </label>
        `
    },
    'image-compress': {
        title: 'Compress Image',
        accept: 'image/*',
        options: `
            <label class="block mb-2">Quality (0-100%):</label>
            <input type="range" id="quality" class="w-full mb-2" min="1" max="100" value="80">
            <div class="text-center font-bold text-xl mb-4"><span id="qualityValue">80</span>%</div>
        `
    },
    'image-to-pdf': {
        title: 'Convert Image to PDF',
        accept: 'image/*',
        options: `
            <label class="block mb-2">Page Size:</label>
            <select id="pageSize" class="w-full px-4 py-2 border rounded mb-4">
                <option value="a4">A4</option>
                <option value="letter">Letter</option>
                <option value="legal">Legal</option>
            </select>
            <label class="block mb-2">Orientation:</label>
            <select id="orientation" class="w-full px-4 py-2 border rounded mb-4">
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
            </select>
        `
    },
    'jpg-to-png': {
        title: 'Convert JPG to PNG',
        accept: 'image/jpeg,image/jpg',
        options: ''
    },
    'png-to-jpg': {
        title: 'Convert PNG to JPG',
        accept: 'image/png',
        options: `
            <label class="block mb-2">Background Color (for transparency):</label>
            <input type="color" id="bgColor" class="w-full h-12 border rounded mb-4" value="#ffffff">
        `
    },
    'image-rotate': {
        title: 'Rotate Image',
        accept: 'image/*',
        options: `
            <label class="block mb-2">Rotation Angle:</label>
            <div class="grid grid-cols-3 gap-4">
                <button onclick="setRotation(90)" class="bg-blue-500 text-white px-4 py-3 rounded hover:bg-blue-600">90°</button>
                <button onclick="setRotation(180)" class="bg-blue-500 text-white px-4 py-3 rounded hover:bg-blue-600">180°</button>
                <button onclick="setRotation(270)" class="bg-blue-500 text-white px-4 py-3 rounded hover:bg-blue-600">270°</button>
            </div>
            <input type="hidden" id="rotation" value="90">
        `
    },
    'image-flip': {
        title: 'Flip Image',
        accept: 'image/*',
        options: `
            <label class="block mb-2">Flip Direction:</label>
            <div class="grid grid-cols-2 gap-4">
                <button onclick="setFlip('horizontal')" class="bg-purple-500 text-white px-4 py-3 rounded hover:bg-purple-600">Horizontal</button>
                <button onclick="setFlip('vertical')" class="bg-purple-500 text-white px-4 py-3 rounded hover:bg-purple-600">Vertical</button>
            </div>
            <input type="hidden" id="flipDirection" value="horizontal">
        `
    },
    'image-crop': {
        title: 'Crop Image',
        accept: 'image/*',
        options: `
            <label class="block mb-2">Crop Area:</label>
            <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label class="text-sm">X Position:</label>
                    <input type="number" id="cropX" class="w-full px-2 py-1 border rounded" value="0" min="0">
                </div>
                <div>
                    <label class="text-sm">Y Position:</label>
                    <input type="number" id="cropY" class="w-full px-2 py-1 border rounded" value="0" min="0">
                </div>
                <div>
                    <label class="text-sm">Width:</label>
                    <input type="number" id="cropWidth" class="w-full px-2 py-1 border rounded" value="400" min="1">
                </div>
                <div>
                    <label class="text-sm">Height:</label>
                    <input type="number" id="cropHeight" class="w-full px-2 py-1 border rounded" value="400" min="1">
                </div>
            </div>
        `
    },
    'video-to-gif': {
        title: 'Convert Video to GIF',
        accept: 'video/*',
        options: `
            <label class="block mb-2">FPS (frames per second):</label>
            <input type="number" id="fps" class="w-full px-4 py-2 border rounded mb-4" value="10" min="1" max="30">
            <label class="block mb-2">Duration (seconds, 0 = full video):</label>
            <input type="number" id="duration" class="w-full px-4 py-2 border rounded mb-4" value="0" min="0">
        `
    },
    'video-to-mp3': {
        title: 'Extract Audio from Video',
        accept: 'video/*',
        options: `
            <label class="block mb-2">Audio Quality:</label>
            <select id="audioQuality" class="w-full px-4 py-2 border rounded mb-4">
                <option value="320">High (320kbps)</option>
                <option value="192" selected>Medium (192kbps)</option>
                <option value="128">Low (128kbps)</option>
            </select>
        `
    },
    'gif-to-video': {
        title: 'Convert GIF to Video',
        accept: 'image/gif',
        options: `
            <label class="block mb-2">Output Format:</label>
            <select id="videoFormat" class="w-full px-4 py-2 border rounded mb-4">
                <option value="mp4">MP4</option>
                <option value="webm">WebM</option>
            </select>
        `
    },
    'audio-to-video': {
        title: 'Convert Audio to Video (with waveform)',
        accept: 'audio/*',
        options: `
            <label class="block mb-2">Waveform Color:</label>
            <input type="color" id="waveColor" class="w-full h-12 border rounded mb-4" value="#667eea">
            <label class="block mb-2">Background Color:</label>
            <input type="color" id="waveBg" class="w-full h-12 border rounded mb-4" value="#000000">
        `
    },
    'html-to-pdf': {
        title: 'Convert HTML to PDF',
        accept: '.html,.htm',
        options: ''
    },
    'text-to-pdf': {
        title: 'Convert Text to PDF',
        accept: '.txt',
        options: `
            <label class="block mb-2">Font Size:</label>
            <input type="number" id="fontSize" class="w-full px-4 py-2 border rounded mb-4" value="12" min="6" max="72">
        `
    },
    'merge-images': {
        title: 'Merge Images',
        accept: 'image/*',
        options: `
            <label class="block mb-2">Layout:</label>
            <select id="mergeLayout" class="w-full px-4 py-2 border rounded mb-4">
                <option value="horizontal">Horizontal</option>
                <option value="vertical">Vertical</option>
                <option value="grid">Grid (2x2)</option>
            </select>
        `
    }
};

// Select tool
function selectTool(tool) {
    currentTool = tool;
    uploadedFile = null;
    
    // Update UI
    document.querySelectorAll('.tool-card').forEach(card => card.classList.remove('active'));
    event.target.closest('.tool-card').classList.add('active');
    
    // Show conversion area
    document.getElementById('conversionArea').classList.remove('hidden');
    document.getElementById('toolTitle').textContent = toolConfig[tool].title;
    
    // Setup file input
    const fileInput = document.getElementById('fileInput');
    fileInput.accept = toolConfig[tool].accept;
    fileInput.value = '';
    fileInput.onchange = handleFileUpload;
    
    // Show options
    if (toolConfig[tool].options) {
        document.getElementById('optionsPanel').classList.remove('hidden');
        document.getElementById('optionsContent').innerHTML = toolConfig[tool].options;
        
        // Setup quality slider if exists
        const qualitySlider = document.getElementById('quality');
        if (qualitySlider) {
            qualitySlider.oninput = () => {
                document.getElementById('qualityValue').textContent = qualitySlider.value;
            };
        }
    } else {
        document.getElementById('optionsPanel').classList.add('hidden');
    }
    
    // Hide results
    document.getElementById('progressArea').classList.add('hidden');
    document.getElementById('resultArea').classList.add('hidden');
    
    // Scroll to area
    document.getElementById('conversionArea').scrollIntoView({ behavior: 'smooth' });
}

// Handle file upload
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    uploadedFile = file;
    processConversion();
}

// Process conversion
async function processConversion() {
    if (!uploadedFile || !currentTool) return;
    
    // Show progress
    document.getElementById('progressArea').classList.remove('hidden');
    document.getElementById('resultArea').classList.add('hidden');
    updateProgress(10, 'Loading file...');
    
    try {
        let result;
        
        switch(currentTool) {
            case 'image-resize':
                result = await resizeImage();
                break;
            case 'image-compress':
                result = await compressImage();
                break;
            case 'image-to-pdf':
                result = await imageToPDF();
                break;
            case 'jpg-to-png':
                result = await convertImageFormat('png');
                break;
            case 'png-to-jpg':
                result = await convertImageFormat('jpeg');
                break;
            case 'image-rotate':
                result = await rotateImage();
                break;
            case 'image-flip':
                result = await flipImage();
                break;
            case 'image-crop':
                result = await cropImage();
                break;
            case 'text-to-pdf':
                result = await textToPDF();
                break;
            case 'html-to-pdf':
                result = await htmlToPDF();
                break;
            case 'merge-images':
                result = await mergeImages();
                break;
            case 'video-to-gif':
            case 'video-to-mp3':
            case 'gif-to-video':
            case 'audio-to-video':
                result = await videoConversionPlaceholder(currentTool);
                break;
            default:
                throw new Error('Conversion not implemented yet');
        }
        
        updateProgress(100, 'Complete!');
        showResult(result);
        
    } catch (error) {
        alert('Conversion failed: ' + error.message);
        document.getElementById('progressArea').classList.add('hidden');
    }
}

// Update progress
function updateProgress(percent, message) {
    document.getElementById('progressBar').style.width = percent + '%';
    document.getElementById('statusText').textContent = message;
}

// Show result
function showResult(result) {
    document.getElementById('progressArea').classList.add('hidden');
    document.getElementById('resultArea').classList.remove('hidden');
    document.getElementById('resultInfo').textContent = `Size: ${formatFileSize(result.size)}`;
    
    // Setup download
    document.getElementById('downloadBtn').onclick = () => {
        const a = document.createElement('a');
        a.href = result.url;
        a.download = result.filename;
        a.click();
    };
    
    // Show preview if applicable
    if (result.preview) {
        document.getElementById('previewArea').innerHTML = result.preview;
    } else {
        document.getElementById('previewArea').innerHTML = '';
    }
}

// Image Resize
async function resizeImage() {
    updateProgress(30, 'Resizing image...');
    
    const width = parseInt(document.getElementById('width').value);
    const height = parseInt(document.getElementById('height').value);
    const maintainAspect = document.getElementById('maintainAspect').checked;
    
    return new Promise((resolve) => {
        const img = new Image();
        const reader = new FileReader();
        
        reader.onload = (e) => {
            img.src = e.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                let newWidth = width;
                let newHeight = height;
                
                if (maintainAspect) {
                    const ratio = Math.min(width / img.width, height / img.height);
                    newWidth = img.width * ratio;
                    newHeight = img.height * ratio;
                }
                
                canvas.width = newWidth;
                canvas.height = newHeight;
                ctx.drawImage(img, 0, 0, newWidth, newHeight);
                
                updateProgress(70, 'Creating output file...');
                
                canvas.toBlob((blob) => {
                    const url = URL.createObjectURL(blob);
                    resolve({
                        url: url,
                        filename: 'resized_' + uploadedFile.name,
                        size: blob.size,
                        preview: `<img src="${url}" class="max-w-full h-auto rounded" alt="Preview">`
                    });
                }, 'image/png');
            };
        };
        
        reader.readAsDataURL(uploadedFile);
    });
}

// Image Compress
async function compressImage() {
    updateProgress(30, 'Compressing image...');
    
    const quality = parseInt(document.getElementById('quality').value) / 100;
    
    return new Promise((resolve) => {
        const img = new Image();
        const reader = new FileReader();
        
        reader.onload = (e) => {
            img.src = e.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                
                updateProgress(70, 'Creating compressed file...');
                
                canvas.toBlob((blob) => {
                    const url = URL.createObjectURL(blob);
                    resolve({
                        url: url,
                        filename: 'compressed_' + uploadedFile.name,
                        size: blob.size,
                        preview: `<img src="${url}" class="max-w-full h-auto rounded" alt="Preview"><p class="text-sm mt-2 text-center">Original: ${formatFileSize(uploadedFile.size)} → Compressed: ${formatFileSize(blob.size)}</p>`
                    });
                }, 'image/jpeg', quality);
            };
        };
        
        reader.readAsDataURL(uploadedFile);
    });
}

// Image to PDF
async function imageToPDF() {
    updateProgress(30, 'Converting to PDF...');
    
    const { jsPDF } = window.jspdf;
    const pageSize = document.getElementById('pageSize').value;
    const orientation = document.getElementById('orientation').value;
    
    return new Promise((resolve) => {
        const img = new Image();
        const reader = new FileReader();
        
        reader.onload = (e) => {
            img.src = e.target.result;
            img.onload = () => {
                updateProgress(60, 'Creating PDF...');
                
                const pdf = new jsPDF({
                    orientation: orientation,
                    unit: 'mm',
                    format: pageSize
                });
                
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                
                const imgRatio = img.width / img.height;
                const pdfRatio = pdfWidth / pdfHeight;
                
                let finalWidth, finalHeight;
                
                if (imgRatio > pdfRatio) {
                    finalWidth = pdfWidth;
                    finalHeight = pdfWidth / imgRatio;
                } else {
                    finalHeight = pdfHeight;
                    finalWidth = pdfHeight * imgRatio;
                }
                
                const x = (pdfWidth - finalWidth) / 2;
                const y = (pdfHeight - finalHeight) / 2;
                
                pdf.addImage(img.src, 'JPEG', x, y, finalWidth, finalHeight);
                
                updateProgress(90, 'Finalizing PDF...');
                
                const pdfBlob = pdf.output('blob');
                const url = URL.createObjectURL(pdfBlob);
                
                resolve({
                    url: url,
                    filename: uploadedFile.name.replace(/\.[^/.]+$/, '') + '.pdf',
                    size: pdfBlob.size,
                    preview: ''
                });
            };
        };
        
        reader.readAsDataURL(uploadedFile);
    });
}

// Convert Image Format
async function convertImageFormat(format) {
    updateProgress(30, `Converting to ${format.toUpperCase()}...`);
    
    return new Promise((resolve) => {
        const img = new Image();
        const reader = new FileReader();
        
        reader.onload = (e) => {
            img.src = e.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                canvas.width = img.width;
                canvas.height = img.height;
                
                // Add background for JPG (if PNG has transparency)
                if (format === 'jpeg') {
                    const bgColor = document.getElementById('bgColor')?.value || '#ffffff';
                    ctx.fillStyle = bgColor;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }
                
                ctx.drawImage(img, 0, 0);
                
                updateProgress(70, 'Creating output file...');
                
                canvas.toBlob((blob) => {
                    const url = URL.createObjectURL(blob);
                    const ext = format === 'jpeg' ? 'jpg' : format;
                    resolve({
                        url: url,
                        filename: uploadedFile.name.replace(/\.[^/.]+$/, '') + '.' + ext,
                        size: blob.size,
                        preview: `<img src="${url}" class="max-w-full h-auto rounded" alt="Preview">`
                    });
                }, 'image/' + format, 0.95);
            };
        };
        
        reader.readAsDataURL(uploadedFile);
    });
}

// Rotate Image
async function rotateImage() {
    updateProgress(30, 'Rotating image...');
    
    const rotation = parseInt(document.getElementById('rotation').value);
    
    return new Promise((resolve) => {
        const img = new Image();
        const reader = new FileReader();
        
        reader.onload = (e) => {
            img.src = e.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Swap dimensions for 90 and 270 degree rotations
                if (rotation === 90 || rotation === 270) {
                    canvas.width = img.height;
                    canvas.height = img.width;
                } else {
                    canvas.width = img.width;
                    canvas.height = img.height;
                }
                
                ctx.translate(canvas.width / 2, canvas.height / 2);
                ctx.rotate(rotation * Math.PI / 180);
                ctx.drawImage(img, -img.width / 2, -img.height / 2);
                
                updateProgress(70, 'Creating rotated image...');
                
                canvas.toBlob((blob) => {
                    const url = URL.createObjectURL(blob);
                    resolve({
                        url: url,
                        filename: 'rotated_' + uploadedFile.name,
                        size: blob.size,
                        preview: `<img src="${url}" class="max-w-full h-auto rounded" alt="Preview">`
                    });
                }, 'image/png');
            };
        };
        
        reader.readAsDataURL(uploadedFile);
    });
}

// Flip Image
async function flipImage() {
    updateProgress(30, 'Flipping image...');
    
    const direction = document.getElementById('flipDirection').value;
    
    return new Promise((resolve) => {
        const img = new Image();
        const reader = new FileReader();
        
        reader.onload = (e) => {
            img.src = e.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                canvas.width = img.width;
                canvas.height = img.height;
                
                ctx.save();
                
                if (direction === 'horizontal') {
                    ctx.scale(-1, 1);
                    ctx.drawImage(img, -img.width, 0);
                } else {
                    ctx.scale(1, -1);
                    ctx.drawImage(img, 0, -img.height);
                }
                
                ctx.restore();
                
                updateProgress(70, 'Creating flipped image...');
                
                canvas.toBlob((blob) => {
                    const url = URL.createObjectURL(blob);
                    resolve({
                        url: url,
                        filename: 'flipped_' + uploadedFile.name,
                        size: blob.size,
                        preview: `<img src="${url}" class="max-w-full h-auto rounded" alt="Preview">`
                    });
                }, 'image/png');
            };
        };
        
        reader.readAsDataURL(uploadedFile);
    });
}

// Crop Image
async function cropImage() {
    updateProgress(30, 'Cropping image...');
    
    const cropX = parseInt(document.getElementById('cropX').value);
    const cropY = parseInt(document.getElementById('cropY').value);
    const cropWidth = parseInt(document.getElementById('cropWidth').value);
    const cropHeight = parseInt(document.getElementById('cropHeight').value);
    
    return new Promise((resolve) => {
        const img = new Image();
        const reader = new FileReader();
        
        reader.onload = (e) => {
            img.src = e.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                canvas.width = cropWidth;
                canvas.height = cropHeight;
                
                ctx.drawImage(img, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
                
                updateProgress(70, 'Creating cropped image...');
                
                canvas.toBlob((blob) => {
                    const url = URL.createObjectURL(blob);
                    resolve({
                        url: url,
                        filename: 'cropped_' + uploadedFile.name,
                        size: blob.size,
                        preview: `<img src="${url}" class="max-w-full h-auto rounded" alt="Preview">`
                    });
                }, 'image/png');
            };
        };
        
        reader.readAsDataURL(uploadedFile);
    });
}

// Text to PDF
async function textToPDF() {
    updateProgress(30, 'Converting text to PDF...');
    
    const fontSize = parseInt(document.getElementById('fontSize')?.value || 12);
    const { jsPDF } = window.jspdf;
    
    return new Promise((resolve) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            updateProgress(60, 'Creating PDF...');
            
            const text = e.target.result;
            const pdf = new jsPDF();
            
            pdf.setFontSize(fontSize);
            const lines = pdf.splitTextToSize(text, 180);
            pdf.text(lines, 15, 20);
            
            updateProgress(90, 'Finalizing PDF...');
            
            const pdfBlob = pdf.output('blob');
            const url = URL.createObjectURL(pdfBlob);
            
            resolve({
                url: url,
                filename: uploadedFile.name.replace(/\.[^/.]+$/, '') + '.pdf',
                size: pdfBlob.size,
                preview: ''
            });
        };
        
        reader.readAsText(uploadedFile);
    });
}

// HTML to PDF
async function htmlToPDF() {
    updateProgress(30, 'Parsing HTML...');
    
    const { jsPDF } = window.jspdf;
    
    return new Promise((resolve) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            updateProgress(60, 'Converting to PDF...');
            
            const htmlContent = e.target.result;
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = htmlContent;
            tempDiv.style.width = '800px';
            tempDiv.style.padding = '20px';
            document.body.appendChild(tempDiv);
            
            html2canvas(tempDiv).then(canvas => {
                document.body.removeChild(tempDiv);
                
                updateProgress(80, 'Creating PDF...');
                
                const pdf = new jsPDF('p', 'mm', 'a4');
                const imgData = canvas.toDataURL('image/png');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                
                const pdfBlob = pdf.output('blob');
                const url = URL.createObjectURL(pdfBlob);
                
                resolve({
                    url: url,
                    filename: uploadedFile.name.replace(/\.[^/.]+$/, '') + '.pdf',
                    size: pdfBlob.size,
                    preview: ''
                });
            });
        };
        
        reader.readAsText(uploadedFile);
    });
}

// Helper functions
function setRotation(angle) {
    document.getElementById('rotation').value = angle;
    document.querySelectorAll('#optionsContent button').forEach(btn => {
        btn.classList.remove('ring-4', 'ring-blue-300');
    });
    event.target.classList.add('ring-4', 'ring-blue-300');
}

function setFlip(direction) {
    document.getElementById('flipDirection').value = direction;
    document.querySelectorAll('#optionsContent button').forEach(btn => {
        btn.classList.remove('ring-4', 'ring-purple-300');
    });
    event.target.classList.add('ring-4', 'ring-purple-300');
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Drag and drop
const uploadZone = document.getElementById('uploadZone');
uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.classList.add('border-purple-500', 'bg-purple-50');
});

uploadZone.addEventListener('dragleave', () => {
    uploadZone.classList.remove('border-purple-500', 'bg-purple-50');
});

uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('border-purple-500', 'bg-purple-50');
    const files = e.dataTransfer.files;
    if (files.length > 0 && currentTool) {
        document.getElementById('fileInput').files = files;
        handleFileUpload({ target: { files: files } });
    }
});

// Merge Images
async function mergeImages() {
    updateProgress(30, 'Merging images...');
    
    // Note: This is a simplified version for single image
    // For multiple images, you'd need to handle multiple file uploads
    const layout = document.getElementById('mergeLayout')?.value || 'horizontal';
    
    return new Promise((resolve) => {
        const img = new Image();
        const reader = new FileReader();
        
        reader.onload = (e) => {
            img.src = e.target.result;
            img.onload = () => {
                updateProgress(60, 'Creating merged image...');
                
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // For demo: just duplicate the image side by side
                if (layout === 'horizontal') {
                    canvas.width = img.width * 2;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);
                    ctx.drawImage(img, img.width, 0);
                } else if (layout === 'vertical') {
                    canvas.width = img.width;
                    canvas.height = img.height * 2;
                    ctx.drawImage(img, 0, 0);
                    ctx.drawImage(img, 0, img.height);
                } else { // grid
                    canvas.width = img.width * 2;
                    canvas.height = img.height * 2;
                    ctx.drawImage(img, 0, 0);
                    ctx.drawImage(img, img.width, 0);
                    ctx.drawImage(img, 0, img.height);
                    ctx.drawImage(img, img.width, img.height);
                }
                
                updateProgress(90, 'Finalizing...');
                
                canvas.toBlob((blob) => {
                    const url = URL.createObjectURL(blob);
                    resolve({
                        url: url,
                        filename: 'merged_' + uploadedFile.name,
                        size: blob.size,
                        preview: `<img src="${url}" class="max-w-full h-auto rounded" alt="Preview"><p class="text-sm mt-2 text-gray-600">Note: Upload multiple images for full merge functionality</p>`
                    });
                }, 'image/png');
            };
        };
        
        reader.readAsDataURL(uploadedFile);
    });
}

// Video Conversion Placeholder
async function videoConversionPlaceholder(tool) {
    updateProgress(30, 'Preparing conversion...');
    
    const toolNames = {
        'video-to-gif': 'Video to GIF',
        'video-to-mp3': 'Video to MP3',
        'gif-to-video': 'GIF to Video',
        'audio-to-video': 'Audio to Video with Waveform'
    };
    
    // Create an info card instead of failing
    return new Promise((resolve) => {
        setTimeout(() => {
            const infoHTML = `
                <div class="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-6">
                    <div class="flex items-start">
                        <i class="fas fa-info-circle text-yellow-600 text-3xl mr-4"></i>
                        <div>
                            <h4 class="font-bold text-lg text-yellow-800 mb-2">${toolNames[tool]} - Coming Soon!</h4>
                            <p class="text-yellow-700 mb-4">This advanced feature requires FFmpeg.wasm library activation.</p>
                            <div class="bg-white rounded p-4 mb-3">
                                <p class="font-semibold mb-2">What this tool will do:</p>
                                <ul class="list-disc ml-5 text-sm space-y-1">
                                    ${getToolFeatures(tool)}
                                </ul>
                            </div>
                            <p class="text-sm text-yellow-600">
                                <i class="fas fa-rocket mr-1"></i> 
                                <strong>Why not available yet?</strong> FFmpeg adds 30MB download size. 
                                We're keeping the site fast for now!
                            </p>
                        </div>
                    </div>
                </div>
            `;
            
            // Create a dummy blob
            const dummyBlob = new Blob(['Coming soon'], { type: 'text/plain' });
            const url = URL.createObjectURL(dummyBlob);
            
            resolve({
                url: url,
                filename: 'coming_soon.txt',
                size: dummyBlob.size,
                preview: infoHTML
            });
        }, 1000);
    });
}

function getToolFeatures(tool) {
    const features = {
        'video-to-gif': `
            <li>Convert video clips to animated GIFs</li>
            <li>Adjustable frame rate (FPS)</li>
            <li>Custom duration selection</li>
            <li>Optimized file size</li>
        `,
        'video-to-mp3': `
            <li>Extract audio from any video</li>
            <li>Multiple quality options (128-320kbps)</li>
            <li>Fast conversion</li>
            <li>Supports all video formats</li>
        `,
        'gif-to-video': `
            <li>Convert GIF to MP4 or WebM</li>
            <li>Better compression</li>
            <li>Smaller file sizes</li>
            <li>Compatible with all players</li>
        `,
        'audio-to-video': `
            <li>Create video from audio file</li>
            <li>Beautiful waveform visualization</li>
            <li>Custom colors and background</li>
            <li>Perfect for social media</li>
        `
    };
    return features[tool] || '<li>Advanced conversion features</li>';
}
