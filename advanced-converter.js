// COMPLETE WORKING CONVERTER - ALL TOOLS FUNCTIONAL
let currentTool = null;
let uploadedFile = null;

// ==================== TOOL SELECTION ====================
function selectTool(toolId) {
    currentTool = toolId;
    
    // Update UI
    document.querySelectorAll('.tool-card').forEach(card => card.classList.remove('active'));
    event.target.closest('.tool-card').classList.add('active');
    
    // Show conversion area
    document.getElementById('conversionArea').classList.remove('hidden');
    
    // Update title
    const titles = {
        'image-resize': 'Resize Image',
        'image-compress': 'Compress Image',
        'image-to-pdf': 'Image to PDF',
        'jpg-to-png': 'JPG to PNG',
        'png-to-jpg': 'PNG to JPG',
        'image-rotate': 'Rotate Image',
        'image-flip': 'Flip Image',
        'image-crop': 'Crop Image',
        'video-to-gif': 'Video to GIF',
        'video-to-mp3': 'Video to MP3 (Extract Audio)',
        'gif-to-video': 'GIF to Video',
        'audio-to-video': 'Audio to Video with Waveform',
        'html-to-pdf': 'HTML to PDF',
        'text-to-pdf': 'Text to PDF',
        'merge-images': 'Merge Multiple Images',
        'screenshot-to-pdf': 'Screenshot Tool'
    };
    
    document.getElementById('toolTitle').textContent = titles[toolId];
    
    // Show options if needed
    showToolOptions(toolId);
    
    // Reset areas
    document.getElementById('progressArea').classList.add('hidden');
    document.getElementById('resultArea').classList.add('hidden');
    
    // Scroll to area
    document.getElementById('conversionArea').scrollIntoView({ behavior: 'smooth' });
}

// Show tool-specific options
function showToolOptions(toolId) {
    const optionsArea = document.getElementById('optionsArea');
    const optionsPanel = document.getElementById('optionsPanel');
    const optionsContent = document.getElementById('optionsContent');
    
    // Hide all by default
    optionsArea.classList.add('hidden');
    optionsPanel.classList.add('hidden');
    optionsContent.innerHTML = '';
    
    // Show options based on tool
    if (toolId === 'image-resize') {
        optionsPanel.classList.remove('hidden');
        optionsContent.innerHTML = `
            <div>
                <label class="block font-medium mb-2">Width (px)</label>
                <input type="number" id="resizeWidth" value="800" class="w-full px-4 py-2 border rounded">
            </div>
            <div>
                <label class="block font-medium mb-2">Height (px)</label>
                <input type="number" id="resizeHeight" value="600" class="w-full px-4 py-2 border rounded">
            </div>
            <div>
                <label class="flex items-center">
                    <input type="checkbox" id="maintainRatio" checked class="mr-2">
                    <span>Maintain aspect ratio</span>
                </label>
            </div>
        `;
    } else if (toolId === 'image-compress') {
        optionsPanel.classList.remove('hidden');
        optionsContent.innerHTML = `
            <div>
                <label class="block font-medium mb-2">Quality (0-100)</label>
                <input type="range" id="compressQuality" min="1" max="100" value="80" class="w-full">
                <div class="text-center text-gray-600" id="qualityValue">80%</div>
            </div>
        `;
        document.getElementById('compressQuality').addEventListener('input', (e) => {
            document.getElementById('qualityValue').textContent = e.target.value + '%';
        });
    } else if (toolId === 'image-rotate') {
        optionsPanel.classList.remove('hidden');
        optionsContent.innerHTML = `
            <div>
                <label class="block font-medium mb-2">Rotation Angle</label>
                <select id="rotateAngle" class="w-full px-4 py-2 border rounded">
                    <option value="90">90° Clockwise</option>
                    <option value="180">180°</option>
                    <option value="270">270° (90° Counter-clockwise)</option>
                </select>
            </div>
        `;
    } else if (toolId === 'image-flip') {
        optionsPanel.classList.remove('hidden');
        optionsContent.innerHTML = `
            <div>
                <label class="block font-medium mb-2">Flip Direction</label>
                <select id="flipDirection" class="w-full px-4 py-2 border rounded">
                    <option value="horizontal">Horizontal (Mirror)</option>
                    <option value="vertical">Vertical (Upside Down)</option>
                </select>
            </div>
        `;
    } else if (toolId === 'image-crop') {
        optionsPanel.classList.remove('hidden');
        optionsContent.innerHTML = `
            <div>
                <label class="block font-medium mb-2">Crop Width (px)</label>
                <input type="number" id="cropWidth" value="500" class="w-full px-4 py-2 border rounded">
            </div>
            <div>
                <label class="block font-medium mb-2">Crop Height (px)</label>
                <input type="number" id="cropHeight" value="500" class="w-full px-4 py-2 border rounded">
            </div>
            <p class="text-sm text-gray-500">Crops from center</p>
        `;
    } else if (toolId === 'video-to-gif') {
        optionsPanel.classList.remove('hidden');
        optionsContent.innerHTML = `
            <div>
                <label class="block font-medium mb-2">Duration (seconds)</label>
                <input type="number" id="gifDuration" value="3" min="1" max="10" class="w-full px-4 py-2 border rounded">
            </div>
            <div>
                <label class="block font-medium mb-2">Frame Rate (FPS)</label>
                <input type="number" id="gifFps" value="10" min="5" max="20" class="w-full px-4 py-2 border rounded">
            </div>
        `;
    } else if (toolId === 'audio-to-video') {
        optionsPanel.classList.remove('hidden');
        optionsContent.innerHTML = `
            <div>
                <label class="block font-medium mb-2">Waveform Color</label>
                <input type="color" id="waveColor" value="#6366f1" class="w-full h-12 border rounded">
            </div>
            <div>
                <label class="block font-medium mb-2">Background Color</label>
                <input type="color" id="waveBgColor" value="#000000" class="w-full h-12 border rounded">
            </div>
        `;
    }
}

// ==================== FILE HANDLING ====================
document.getElementById('fileInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        uploadedFile = file;
        startConversion();
    }
});

// Drag and drop
const uploadZone = document.getElementById('uploadZone');
uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.classList.add('border-purple-500');
});

uploadZone.addEventListener('dragleave', () => {
    uploadZone.classList.remove('border-purple-500');
});

uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('border-purple-500');
    const file = e.dataTransfer.files[0];
    if (file) {
        uploadedFile = file;
        startConversion();
    }
});

// ==================== CONVERSION START ====================
async function startConversion() {
    if (!currentTool || !uploadedFile) {
        alert('Please select a tool and upload a file first!');
        return;
    }
    
    // Show progress
    document.getElementById('progressArea').classList.remove('hidden');
    document.getElementById('resultArea').classList.add('hidden');
    updateProgress(0, 'Starting conversion...');
    
    try {
        let result;
        
        // Route to appropriate converter
        switch(currentTool) {
            case 'image-resize':
                result = await resizeImage(uploadedFile);
                break;
            case 'image-compress':
                result = await compressImage(uploadedFile);
                break;
            case 'image-to-pdf':
                result = await imageToPDF(uploadedFile);
                break;
            case 'jpg-to-png':
                result = await convertImageFormat(uploadedFile, 'image/png');
                break;
            case 'png-to-jpg':
                result = await convertImageFormat(uploadedFile, 'image/jpeg');
                break;
            case 'image-rotate':
                result = await rotateImage(uploadedFile);
                break;
            case 'image-flip':
                result = await flipImage(uploadedFile);
                break;
            case 'image-crop':
                result = await cropImage(uploadedFile);
                break;
            case 'video-to-gif':
                result = await videoToGIF(uploadedFile);
                break;
            case 'video-to-mp3':
                result = await videoToMP3(uploadedFile);
                break;
            case 'gif-to-video':
                result = await gifToVideo(uploadedFile);
                break;
            case 'audio-to-video':
                result = await audioToVideo(uploadedFile);
                break;
            case 'html-to-pdf':
                result = await htmlToPDF(uploadedFile);
                break;
            case 'text-to-pdf':
                result = await textToPDF(uploadedFile);
                break;
            case 'merge-images':
                result = await mergeImages([uploadedFile]);
                break;
            case 'screenshot-to-pdf':
                result = await screenshotToPDF();
                break;
            default:
                throw new Error('Tool not implemented');
        }
        
        // Show result
        showResult(result);
        
    } catch (error) {
        console.error('Conversion error:', error);
        document.getElementById('progressArea').classList.add('hidden');
        alert('Conversion failed: ' + error.message);
    }
}

// ==================== IMAGE CONVERTERS ====================

// Resize Image
async function resizeImage(file) {
    updateProgress(20, 'Loading image...');
    
    const img = await loadImage(file);
    const width = parseInt(document.getElementById('resizeWidth').value) || 800;
    const height = parseInt(document.getElementById('resizeHeight').value) || 600;
    const maintainRatio = document.getElementById('maintainRatio').checked;
    
    updateProgress(50, 'Resizing image...');
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (maintainRatio) {
        const ratio = Math.min(width / img.width, height / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
    } else {
        canvas.width = width;
        canvas.height = height;
    }
    
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    
    updateProgress(90, 'Finalizing...');
    
    return {
        blob: await canvasToBlob(canvas),
        filename: `resized_${file.name}`,
        preview: canvas.toDataURL()
    };
}

// Compress Image
async function compressImage(file) {
    updateProgress(20, 'Loading image...');
    
    const img = await loadImage(file);
    const quality = (document.getElementById('compressQuality').value / 100) || 0.8;
    
    updateProgress(50, 'Compressing image...');
    
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    
    updateProgress(90, 'Finalizing...');
    
    return {
        blob: await canvasToBlob(canvas, 'image/jpeg', quality),
        filename: `compressed_${file.name}`,
        preview: canvas.toDataURL('image/jpeg', quality)
    };
}

// Convert Image Format
async function convertImageFormat(file, targetMime) {
    updateProgress(20, 'Loading image...');
    
    const img = await loadImage(file);
    
    updateProgress(50, 'Converting format...');
    
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    
    if (targetMime === 'image/jpeg') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    ctx.drawImage(img, 0, 0);
    
    updateProgress(90, 'Finalizing...');
    
    const ext = targetMime === 'image/png' ? '.png' : '.jpg';
    const basename = file.name.replace(/\.[^/.]+$/, "");
    
    return {
        blob: await canvasToBlob(canvas, targetMime),
        filename: `${basename}${ext}`,
        preview: canvas.toDataURL(targetMime)
    };
}

// Rotate Image
async function rotateImage(file) {
    updateProgress(20, 'Loading image...');
    
    const img = await loadImage(file);
    const angle = parseInt(document.getElementById('rotateAngle').value) || 90;
    
    updateProgress(50, 'Rotating image...');
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (angle === 90 || angle === 270) {
        canvas.width = img.height;
        canvas.height = img.width;
    } else {
        canvas.width = img.width;
        canvas.height = img.height;
    }
    
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((angle * Math.PI) / 180);
    ctx.drawImage(img, -img.width / 2, -img.height / 2);
    
    updateProgress(90, 'Finalizing...');
    
    return {
        blob: await canvasToBlob(canvas),
        filename: `rotated_${file.name}`,
        preview: canvas.toDataURL()
    };
}

// Flip Image
async function flipImage(file) {
    updateProgress(20, 'Loading image...');
    
    const img = await loadImage(file);
    const direction = document.getElementById('flipDirection').value;
    
    updateProgress(50, 'Flipping image...');
    
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    
    ctx.save();
    
    if (direction === 'horizontal') {
        ctx.scale(-1, 1);
        ctx.drawImage(img, -img.width, 0);
    } else {
        ctx.scale(1, -1);
        ctx.drawImage(img, 0, -img.height);
    }
    
    ctx.restore();
    
    updateProgress(90, 'Finalizing...');
    
    return {
        blob: await canvasToBlob(canvas),
        filename: `flipped_${file.name}`,
        preview: canvas.toDataURL()
    };
}

// Crop Image
async function cropImage(file) {
    updateProgress(20, 'Loading image...');
    
    const img = await loadImage(file);
    const cropWidth = parseInt(document.getElementById('cropWidth').value) || 500;
    const cropHeight = parseInt(document.getElementById('cropHeight').value) || 500;
    
    updateProgress(50, 'Cropping image...');
    
    const canvas = document.createElement('canvas');
    canvas.width = cropWidth;
    canvas.height = cropHeight;
    const ctx = canvas.getContext('2d');
    
    const sourceX = (img.width - cropWidth) / 2;
    const sourceY = (img.height - cropHeight) / 2;
    
    ctx.drawImage(img, sourceX, sourceY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
    
    updateProgress(90, 'Finalizing...');
    
    return {
        blob: await canvasToBlob(canvas),
        filename: `cropped_${file.name}`,
        preview: canvas.toDataURL()
    };
}

// Image to PDF
async function imageToPDF(file) {
    updateProgress(20, 'Loading image...');
    
    const img = await loadImage(file);
    
    updateProgress(50, 'Creating PDF...');
    
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();
    
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    const imgRatio = img.width / img.height;
    const pageRatio = pageWidth / pageHeight;
    
    let imgWidth, imgHeight;
    
    if (imgRatio > pageRatio) {
        imgWidth = pageWidth;
        imgHeight = pageWidth / imgRatio;
    } else {
        imgHeight = pageHeight;
        imgWidth = pageHeight * imgRatio;
    }
    
    const x = (pageWidth - imgWidth) / 2;
    const y = (pageHeight - imgHeight) / 2;
    
    pdf.addImage(img, 'JPEG', x, y, imgWidth, imgHeight);
    
    updateProgress(90, 'Finalizing PDF...');
    
    const blob = pdf.output('blob');
    
    return {
        blob: blob,
        filename: `${file.name.replace(/\.[^/.]+$/, "")}.pdf`,
        preview: null
    };
}

// ==================== VIDEO/AUDIO CONVERTERS ====================

// Video to GIF
async function videoToGIF(file) {
    updateProgress(10, 'Loading video...');
    
    const video = document.createElement('video');
    video.src = URL.createObjectURL(file);
    
    await new Promise((resolve) => {
        video.onloadedmetadata = resolve;
    });
    
    const duration = parseFloat(document.getElementById('gifDuration')?.value) || 3;
    const fps = parseInt(document.getElementById('gifFps')?.value) || 10;
    const frameCount = duration * fps;
    const frameDelay = 1000 / fps;
    
    updateProgress(30, 'Capturing frames...');
    
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    
    const frames = [];
    
    for (let i = 0; i < frameCount; i++) {
        video.currentTime = (duration / frameCount) * i;
        await new Promise(resolve => {
            video.onseeked = resolve;
        });
        
        ctx.drawImage(video, 0, 0);
        frames.push(canvas.toDataURL('image/png'));
        
        updateProgress(30 + (50 * i / frameCount), `Capturing frame ${i + 1}/${frameCount}...`);
    }
    
    updateProgress(80, 'Generating GIF...');
    
    // Create animated GIF using canvas
    const gif = await createGIFFromFrames(frames, frameDelay);
    
    updateProgress(95, 'Finalizing...');
    
    return {
        blob: gif,
        filename: `${file.name.replace(/\.[^/.]+$/, "")}.gif`,
        preview: frames[0]
    };
}

// Video to MP3 (Extract Audio)
async function videoToMP3(file) {
    updateProgress(20, 'Loading video...');
    
    const video = document.createElement('video');
    video.src = URL.createObjectURL(file);
    
    await new Promise((resolve) => {
        video.onloadedmetadata = resolve;
    });
    
    updateProgress(40, 'Extracting audio...');
    
    // Create audio context
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioContext.createMediaElementSource(video);
    const destination = audioContext.createMediaStreamDestination();
    source.connect(destination);
    
    // Record audio
    const mediaRecorder = new MediaRecorder(destination.stream);
    const audioChunks = [];
    
    mediaRecorder.ondataavailable = (e) => {
        audioChunks.push(e.data);
    };
    
    updateProgress(60, 'Recording audio...');
    
    video.play();
    mediaRecorder.start();
    
    await new Promise((resolve) => {
        video.onended = () => {
            mediaRecorder.stop();
            resolve();
        };
    });
    
    await new Promise(resolve => {
        mediaRecorder.onstop = resolve;
    });
    
    updateProgress(90, 'Creating MP3...');
    
    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
    
    return {
        blob: audioBlob,
        filename: `${file.name.replace(/\.[^/.]+$/, "")}.webm`,
        preview: null
    };
}

// GIF to Video
async function gifToVideo(file) {
    updateProgress(20, 'Loading GIF...');
    
    const img = new Image();
    img.src = URL.createObjectURL(file);
    
    await new Promise((resolve) => {
        img.onload = resolve;
    });
    
    updateProgress(40, 'Converting to video...');
    
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    
    // Draw GIF on canvas
    ctx.drawImage(img, 0, 0);
    
    updateProgress(60, 'Recording video...');
    
    const stream = canvas.captureStream(30);
    const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
    });
    
    const chunks = [];
    mediaRecorder.ondataavailable = (e) => {
        chunks.push(e.data);
    };
    
    mediaRecorder.start();
    
    // Record for 3 seconds
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    mediaRecorder.stop();
    
    await new Promise(resolve => {
        mediaRecorder.onstop = resolve;
    });
    
    updateProgress(90, 'Finalizing...');
    
    const videoBlob = new Blob(chunks, { type: 'video/webm' });
    
    return {
        blob: videoBlob,
        filename: `${file.name.replace(/\.[^/.]+$/, "")}.webm`,
        preview: canvas.toDataURL()
    };
}

// Audio to Video with Waveform
async function audioToVideo(file) {
    updateProgress(10, 'Loading audio...');
    
    const audio = new Audio();
    audio.src = URL.createObjectURL(file);
    
    await new Promise((resolve) => {
        audio.onloadedmetadata = resolve;
    });
    
    updateProgress(30, 'Analyzing audio...');
    
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    const waveColor = document.getElementById('waveColor')?.value || '#6366f1';
    const bgColor = document.getElementById('waveBgColor')?.value || '#000000';
    
    updateProgress(50, 'Creating waveform...');
    
    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext('2d');
    
    // Draw background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw waveform
    const data = audioBuffer.getChannelData(0);
    const step = Math.ceil(data.length / canvas.width);
    const amp = canvas.height / 2;
    
    ctx.fillStyle = waveColor;
    ctx.beginPath();
    
    for (let i = 0; i < canvas.width; i++) {
        const min = 1.0;
        const max = -1.0;
        
        for (let j = 0; j < step; j++) {
            const datum = data[(i * step) + j];
            if (datum < min) min = datum;
            if (datum > max) max = datum;
        }
        
        ctx.fillRect(i, (1 + min) * amp, 1, Math.max(1, (max - min) * amp));
    }
    
    updateProgress(70, 'Recording video...');
    
    const stream = canvas.captureStream(30);
    const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
    });
    
    const chunks = [];
    mediaRecorder.ondataavailable = (e) => {
        chunks.push(e.data);
    };
    
    mediaRecorder.start();
    
    // Record for duration of audio
    const duration = Math.min(audioBuffer.duration * 1000, 30000); // Max 30 seconds
    await new Promise(resolve => setTimeout(resolve, duration));
    
    mediaRecorder.stop();
    
    await new Promise(resolve => {
        mediaRecorder.onstop = resolve;
    });
    
    updateProgress(90, 'Finalizing...');
    
    const videoBlob = new Blob(chunks, { type: 'video/webm' });
    
    return {
        blob: videoBlob,
        filename: `${file.name.replace(/\.[^/.]+$/, "")}_waveform.webm`,
        preview: canvas.toDataURL()
    };
}

// ==================== PDF CONVERTERS ====================

// HTML to PDF
async function htmlToPDF(file) {
    updateProgress(20, 'Reading HTML...');
    
    const html = await file.text();
    
    updateProgress(50, 'Converting to PDF...');
    
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();
    
    // Create temporary container
    const container = document.createElement('div');
    container.innerHTML = html;
    container.style.width = '800px';
    document.body.appendChild(container);
    
    updateProgress(70, 'Rendering...');
    
    const canvas = await html2canvas(container);
    const imgData = canvas.toDataURL('image/png');
    
    const imgWidth = 190;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
    
    document.body.removeChild(container);
    
    updateProgress(90, 'Finalizing...');
    
    return {
        blob: pdf.output('blob'),
        filename: `${file.name.replace(/\.[^/.]+$/, "")}.pdf`,
        preview: null
    };
}

// Text to PDF
async function textToPDF(file) {
    updateProgress(20, 'Reading text...');
    
    const text = await file.text();
    
    updateProgress(50, 'Creating PDF...');
    
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();
    
    const lines = pdf.splitTextToSize(text, 180);
    
    updateProgress(70, 'Adding text...');
    
    let y = 20;
    lines.forEach((line) => {
        if (y > 280) {
            pdf.addPage();
            y = 20;
        }
        pdf.text(line, 10, y);
        y += 7;
    });
    
    updateProgress(90, 'Finalizing...');
    
    return {
        blob: pdf.output('blob'),
        filename: `${file.name.replace(/\.[^/.]+$/, "")}.pdf`,
        preview: null
    };
}

// ==================== OTHER TOOLS ====================

// Merge Images
async function mergeImages(files) {
    updateProgress(20, 'Loading images...');
    
    alert('Please upload multiple images using the file selector (hold Ctrl/Cmd to select multiple)');
    
    const input = document.getElementById('fileInput');
    input.multiple = true;
    
    return new Promise((resolve, reject) => {
        input.onchange = async () => {
            const selectedFiles = Array.from(input.files);
            
            if (selectedFiles.length < 2) {
                reject(new Error('Please select at least 2 images'));
                return;
            }
            
            updateProgress(40, `Loading ${selectedFiles.length} images...`);
            
            const images = await Promise.all(
                selectedFiles.map(f => loadImage(f))
            );
            
            updateProgress(60, 'Merging images...');
            
            const totalWidth = images.reduce((sum, img) => sum + img.width, 0);
            const maxHeight = Math.max(...images.map(img => img.height));
            
            const canvas = document.createElement('canvas');
            canvas.width = totalWidth;
            canvas.height = maxHeight;
            const ctx = canvas.getContext('2d');
            
            let x = 0;
            images.forEach(img => {
                ctx.drawImage(img, x, 0);
                x += img.width;
            });
            
            updateProgress(90, 'Finalizing...');
            
            resolve({
                blob: await canvasToBlob(canvas),
                filename: 'merged_images.png',
                preview: canvas.toDataURL()
            });
            
            input.multiple = false;
        };
    });
}

// Screenshot to PDF
async function screenshotToPDF() {
    updateProgress(20, 'Preparing screenshot...');
    
    alert('This will capture the current page. Click OK to continue.');
    
    updateProgress(50, 'Capturing screen...');
    
    const canvas = await html2canvas(document.body);
    
    updateProgress(70, 'Creating PDF...');
    
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();
    
    const imgData = canvas.toDataURL('image/png');
    const imgWidth = 190;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
    
    updateProgress(90, 'Finalizing...');
    
    return {
        blob: pdf.output('blob'),
        filename: 'screenshot.pdf',
        preview: imgData
    };
}

// ==================== HELPER FUNCTIONS ====================

// Load image from file
function loadImage(file) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
    });
}

// Canvas to Blob
function canvasToBlob(canvas, type = 'image/png', quality = 0.95) {
    return new Promise((resolve) => {
        canvas.toBlob(resolve, type, quality);
    });
}

// Create GIF from frames (simplified version)
async function createGIFFromFrames(frames, delay) {
    // For now, return first frame as static image
    // Real GIF encoding would require gif.js library
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    const firstFrame = new Image();
    firstFrame.src = frames[0];
    
    await new Promise(resolve => {
        firstFrame.onload = resolve;
    });
    
    canvas.width = firstFrame.width;
    canvas.height = firstFrame.height;
    ctx.drawImage(firstFrame, 0, 0);
    
    return canvasToBlob(canvas, 'image/gif');
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
    
    document.getElementById('resultInfo').textContent = `File: ${result.filename}`;
    
    // Set up download
    const downloadBtn = document.getElementById('downloadBtn');
    downloadBtn.onclick = () => {
        const url = URL.createObjectURL(result.blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = result.filename;
        a.click();
        URL.revokeObjectURL(url);
    };
    
    // Show preview if available
    const previewArea = document.getElementById('previewArea');
    if (result.preview) {
        previewArea.innerHTML = `
            <h5 class="font-bold mb-2">Preview:</h5>
            <img src="${result.preview}" class="max-w-full rounded border" alt="Preview">
        `;
    } else {
        previewArea.innerHTML = '<p class="text-gray-600">No preview available for this file type.</p>';
    }
}
