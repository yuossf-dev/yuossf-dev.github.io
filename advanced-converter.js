// Advanced Converter with Real Conversion Libraries
let currentTool = '';
let uploadedFile = null;
let ffmpegInstance = null;
let ffmpegLoaded = false;

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
    
    // Show options for image tools
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
    
    // Show/hide video/audio options
    const optionsArea = document.getElementById('optionsArea');
    const gifOptions = document.getElementById('gifOptions');
    const mp3Options = document.getElementById('mp3Options');
    const videoOptions = document.getElementById('videoOptions');
    const waveOptions = document.getElementById('waveOptions');
    
    // Hide all first
    optionsArea.classList.add('hidden');
    gifOptions.classList.add('hidden');
    mp3Options.classList.add('hidden');
    videoOptions.classList.add('hidden');
    waveOptions.classList.add('hidden');
    
    // Show relevant options
    if (tool === 'video-to-gif') {
        optionsArea.classList.remove('hidden');
        gifOptions.classList.remove('hidden');
    } else if (tool === 'video-to-mp3') {
        optionsArea.classList.remove('hidden');
        mp3Options.classList.remove('hidden');
    } else if (tool === 'gif-to-video') {
        optionsArea.classList.remove('hidden');
        videoOptions.classList.remove('hidden');
    } else if (tool === 'audio-to-video') {
        optionsArea.classList.remove('hidden');
        waveOptions.classList.remove('hidden');
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

// Video Conversion Implementation
async function videoConversionPlaceholder(tool) {
    updateProgress(10, 'Initializing FFmpeg...');
    
    try {
        // Initialize FFmpeg if not already done
        if (!ffmpegInstance) {
            const { FFmpeg } = FFmpegWASM;
            ffmpegInstance = new FFmpeg();
            
            ffmpegInstance.on('log', ({ message }) => {
                console.log('FFmpeg:', message);
            });
            
            ffmpegInstance.on('progress', ({ progress }) => {
                const percent = Math.round(progress * 100);
                updateProgress(60 + (percent * 0.3), `Processing... ${percent}%`);
            });
        }
        
        if (!ffmpegLoaded) {
            updateProgress(20, 'Loading FFmpeg library (first time, ~30MB)...');
            await ffmpegInstance.load();
            ffmpegLoaded = true;
            updateProgress(50, 'FFmpeg loaded successfully!');
        } else {
            updateProgress(50, 'FFmpeg ready!');
        }
        
        // Route to appropriate conversion
        switch(tool) {
            case 'video-to-gif':
                return await videoToGif();
            case 'video-to-mp3':
                return await videoToMp3();
            case 'gif-to-video':
                return await gifToVideo();
            case 'audio-to-video':
                return await audioToVideo();
            default:
                throw new Error('Unknown conversion type');
        }
        
    } catch (error) {
        console.error('FFmpeg error:', error);
        throw new Error('Video conversion failed. ' + error.message);
    }
}

// Video to GIF conversion
async function videoToGif() {
    updateProgress(60, 'Converting video to GIF...');
    
    const fps = document.getElementById('gifFps')?.value || 10;
    const duration = document.getElementById('gifDuration')?.value || 5;
    
    // Write video file to FFmpeg virtual filesystem
    const videoData = await uploadedFile.arrayBuffer();
    await ffmpegInstance.writeFile('input.mp4', new Uint8Array(videoData));
    
    // Run FFmpeg command
    updateProgress(70, 'Processing frames...');
    await ffmpegInstance.exec([
        '-i', 'input.mp4',
        '-t', String(duration),
        '-vf', `fps=${fps},scale=640:-1:flags=lanczos`,
        '-loop', '0',
        'output.gif'
    ]);
    
    updateProgress(90, 'Finalizing GIF...');
    
    // Read the result
    const data = await ffmpegInstance.readFile('output.gif');
    const blob = new Blob([data.buffer], { type: 'image/gif' });
    const url = URL.createObjectURL(blob);
    
    // Cleanup
    await ffmpegInstance.deleteFile('input.mp4');
    await ffmpegInstance.deleteFile('output.gif');
    
    return {
        url: url,
        filename: uploadedFile.name.replace(/\.[^/.]+$/, '') + '.gif',
        size: blob.size,
        preview: `<img src="${url}" class="max-w-full h-auto rounded" alt="GIF Preview">`
    };
}

// Video to MP3 conversion
async function videoToMp3() {
    updateProgress(60, 'Extracting audio...');
    
    const quality = document.getElementById('audioQuality')?.value || '192k';
    
    // Write video file
    const videoData = await uploadedFile.arrayBuffer();
    await ffmpegInstance.writeFile('input.mp4', new Uint8Array(videoData));
    
    // Extract audio
    updateProgress(70, 'Converting to MP3...');
    await ffmpegInstance.exec([
        '-i', 'input.mp4',
        '-vn',
        '-ar', '44100',
        '-ac', '2',
        '-b:a', quality,
        'output.mp3'
    ]);
    
    updateProgress(90, 'Finalizing audio...');
    
    // Read result
    const data = await ffmpegInstance.readFile('output.mp3');
    const blob = new Blob([data.buffer], { type: 'audio/mpeg' });
    const url = URL.createObjectURL(blob);
    
    // Cleanup
    await ffmpegInstance.deleteFile('input.mp4');
    await ffmpegInstance.deleteFile('output.mp3');
    
    return {
        url: url,
        filename: uploadedFile.name.replace(/\.[^/.]+$/, '') + '.mp3',
        size: blob.size,
        preview: `<audio controls class="w-full"><source src="${url}" type="audio/mpeg"></audio>`
    };
}

// GIF to Video conversion
async function gifToVideo() {
    updateProgress(60, 'Converting GIF to video...');
    
    const format = document.getElementById('videoFormat')?.value || 'mp4';
    
    // Write GIF file
    const gifData = await uploadedFile.arrayBuffer();
    await ffmpegInstance.writeFile('input.gif', new Uint8Array(gifData));
    
    // Convert to video
    updateProgress(70, 'Encoding video...');
    await ffmpegInstance.exec([
        '-i', 'input.gif',
        '-movflags', 'faststart',
        '-pix_fmt', 'yuv420p',
        '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2',
        `output.${format}`
    ]);
    
    updateProgress(90, 'Finalizing video...');
    
    // Read result
    const data = await ffmpegInstance.readFile(`output.${format}`);
    const mimeType = format === 'mp4' ? 'video/mp4' : 'video/webm';
    const blob = new Blob([data.buffer], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    // Cleanup
    await ffmpegInstance.deleteFile('input.gif');
    await ffmpegInstance.deleteFile(`output.${format}`);
    
    return {
        url: url,
        filename: uploadedFile.name.replace(/\.[^/.]+$/, '') + '.' + format,
        size: blob.size,
        preview: `<video controls class="max-w-full h-auto rounded"><source src="${url}" type="${mimeType}"></video>`
    };
}

// Audio to Video (with waveform)
async function audioToVideo() {
    updateProgress(60, 'Generating waveform visualization...');
    
    const waveColor = document.getElementById('waveColor')?.value || '#6366f1';
    const bgColor = document.getElementById('waveBg')?.value || '#000000';
    
    // Write audio file
    const audioData = await uploadedFile.arrayBuffer();
    const inputExt = uploadedFile.name.split('.').pop().toLowerCase();
    await ffmpegInstance.writeFile(`input.${inputExt}`, new Uint8Array(audioData));
    
    // Create video with waveform
    updateProgress(70, 'Creating waveform video...');
    await ffmpegInstance.exec([
        '-i', `input.${inputExt}`,
        '-filter_complex',
        `color=c=${bgColor.replace('#', '0x')}:s=1280x720[bg];[0:a]showwaves=s=1280x720:mode=line:rate=25:colors=${waveColor.replace('#', '0x')}[waves];[bg][waves]overlay=format=auto`,
        '-c:v', 'libx264',
        '-c:a', 'aac',
        '-shortest',
        'output.mp4'
    ]);
    
    updateProgress(90, 'Finalizing video...');
    
    // Read result
    const data = await ffmpegInstance.readFile('output.mp4');
    const blob = new Blob([data.buffer], { type: 'video/mp4' });
    const url = URL.createObjectURL(blob);
    
    // Cleanup
    await ffmpegInstance.deleteFile(`input.${inputExt}`);
    await ffmpegInstance.deleteFile('output.mp4');
    
    return {
        url: url,
        filename: uploadedFile.name.replace(/\.[^/.]+$/, '') + '_waveform.mp4',
        size: blob.size,
        preview: `<video controls class="max-w-full h-auto rounded"><source src="${url}" type="video/mp4"></video>`
    };
}
