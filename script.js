let colorStops = [
    {position: 0, color: '#30A3D1'},
    {position: 50, color: '#5B57C7'},
    {position: 100, color: '#EDDD53'}
];

let currentStopIndex = 0;
let gradientType = 'linear';
let gradientAngle = 45;
let isDragging = false;

const gradientSlider = document.getElementById('gradientSlider');
const gradientPreview = document.getElementById('gradientPreview');
const cssCode = document.getElementById('cssCode');
const angleSlider = document.getElementById('angleSlider');
const angleDisplay = document.querySelector('.angle-display');
const hexInput = document.getElementById('hexInput');
const colorCanvas = document.getElementById('colorCanvas');
const pickerCursor = document.getElementById('pickerCursor');
const hueSlider = document.getElementById('hueSlider');
const stopsList = document.getElementById('stopsList');
const applyToHeader = document.getElementById('applyToHeader');
const applyToBackground = document.getElementById('applyToBackground');

function init() {
    setupColorPicker();
    updateGradient();
    updateStopsList();
    setupEventListeners();
}

function setupColorPicker() {
    const canvas = colorCanvas;
    const ctx = canvas.getContext('2d');
    const hue = parseInt(hueSlider.value);
    
    const satGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    satGradient.addColorStop(0, `hsl(${hue}, 0%, 50%)`);
    satGradient.addColorStop(1, `hsl(${hue}, 100%, 50%)`);
    
    ctx.fillStyle = satGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const lightGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    lightGradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    lightGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
    lightGradient.addColorStop(0.5, 'rgba(0, 0, 0, 0)');
    lightGradient.addColorStop(1, 'rgba(0, 0, 0, 1)');
    
    ctx.fillStyle = lightGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function updateGradient() {
    const stops = colorStops.map(stop => `${stop.color} ${stop.position}%`).join(', ');
    
    let gradientCSS;
    if (gradientType === 'linear') {
        gradientCSS = `linear-gradient(${gradientAngle}deg, ${stops})`;
    } else {
        gradientCSS = `radial-gradient(circle, ${stops})`;
    }
    
    gradientPreview.style.background = gradientCSS;
    gradientSlider.style.background = `linear-gradient(90deg, ${stops})`;
    updateCSSOutput(gradientCSS);
    updateColorStopsUI();
    applyLivePreview(gradientCSS);
}

function applyLivePreview(gradientCSS) {
    if (applyToHeader.checked) {
        document.querySelector('header').style.background = gradientCSS;
    } else {
        document.querySelector('header').style.background = '#1e1e1e';
    }
    
    if (applyToBackground.checked) {
        document.body.style.background = gradientCSS;
    } else {
        document.body.style.background = '#1a1a1a';
    }
}

function updateCSSOutput(gradientCSS) {
    const fallbackColor = colorStops[0].color;
    
    let cssLines = [
        `background: ${fallbackColor};`,
        `background: ${gradientCSS};`
    ];
    
    cssCode.innerHTML = cssLines.map((line, index) => 
        `<div class="css-line"><span class="line-number">${index + 1}</span>${line}</div>`
    ).join('');
}

function updateColorStopsUI() {
    document.querySelectorAll('.color-stop').forEach(stop => stop.remove());
    
    colorStops.forEach((stop, index) => {
        const stopElement = document.createElement('div');
        stopElement.className = 'color-stop';
        stopElement.dataset.index = index;
        stopElement.style.left = `${stop.position}%`;
        stopElement.innerHTML = `<div class="stop-handle" style="background-color: ${stop.color};"></div>`;
        
        stopElement.addEventListener('mousedown', startDrag);
        stopElement.addEventListener('click', selectStop);
        
        gradientSlider.appendChild(stopElement);
    });
}

function updateStopsList() {
    stopsList.innerHTML = '';
    
    colorStops.forEach((stop, index) => {
        const stopItem = document.createElement('div');
        stopItem.className = 'stop-item';
        stopItem.innerHTML = `
            <div class="stop-color" style="background-color: ${stop.color};" onclick="selectStop(${index})"></div>
            <input type="text" class="stop-hex" value="${stop.color}" onchange="updateStopColor(${index}, this.value)">
            <input type="number" class="stop-position" value="${stop.position}" min="0" max="100" onchange="updateStopPosition(${index}, this.value)">
            <button class="delete-stop" onclick="deleteStop(${index})">×</button>
        `;
        stopsList.appendChild(stopItem);
    });
}

function startDrag(e) {
    isDragging = true;
    const stopIndex = parseInt(e.target.closest('.color-stop').dataset.index);
    currentStopIndex = stopIndex;
    
    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('mouseup', stopDrag);
    e.preventDefault();
}

function handleDrag(e) {
    if (!isDragging) return;
    
    const rect = gradientSlider.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    
    colorStops[currentStopIndex].position = Math.round(percentage);
    updateGradient();
    updateStopsList();
}

function stopDrag() {
    isDragging = false;
    document.removeEventListener('mousemove', handleDrag);
    document.removeEventListener('mouseup', stopDrag);
}

function selectStop(index) {
    if (typeof index === 'object') {
        index = parseInt(index.target.closest('.color-stop').dataset.index);
    }
    currentStopIndex = index;
    const stop = colorStops[index];
    
    hexInput.value = stop.color;
    updateRGBAInputs(stop.color);
}

function updateStopColor(index, color) {
    if (color.match(/^#[0-9A-F]{6}$/i)) {
        colorStops[index].color = color;
        updateGradient();
        updateStopsList();
    }
}

function updateStopPosition(index, position) {
    colorStops[index].position = Math.max(0, Math.min(100, parseInt(position)));
    updateGradient();
    updateStopsList();
}

function deleteStop(index) {
    if (colorStops.length > 2) {
        colorStops.splice(index, 1);
        if (currentStopIndex >= colorStops.length) {
            currentStopIndex = colorStops.length - 1;
        }
        updateGradient();
        updateStopsList();
    }
}

function updateRGBAInputs(hex) {
    const rgb = hexToRgb(hex);
    if (rgb) {
        document.getElementById('rInput').value = rgb.r;
        document.getElementById('gInput').value = rgb.g;
        document.getElementById('bInput').value = rgb.b;
        document.getElementById('aInput').value = 100;
    }
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function hslToRgb(h, s, l) {
    h = h / 360;
    s = s / 100;
    l = l / 100;
    
    let r, g, b;
    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };
        
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }
    
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function copyToClipboard() {
    const cssText = cssCode.innerText;
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(cssText).then(() => {
            alert('CSS kód kimásolva!');
        });
    } else {
        const textArea = document.createElement('textarea');
        textArea.value = cssText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('CSS kód kimásolva!');
    }
}

function handleColorPickerClick(e) {
    const rect = colorCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const saturation = (x / colorCanvas.width) * 100;
    const lightness = 100 - (y / colorCanvas.height) * 100;
    const hue = parseInt(hueSlider.value);
    
    const [r, g, b] = hslToRgb(hue, saturation, lightness);
    const hex = rgbToHex(r, g, b);
    
    colorStops[currentStopIndex].color = hex;
    hexInput.value = hex;
    updateRGBAInputs(hex);
    updateGradient();
    updateStopsList();
    
    pickerCursor.style.left = x + 'px';
    pickerCursor.style.top = y + 'px';
}

function setupEventListeners() {
    document.querySelectorAll('.type-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            gradientType = e.target.dataset.type;
            updateGradient();
        });
    });
    
    angleSlider.addEventListener('input', (e) => {
        gradientAngle = e.target.value;
        angleDisplay.textContent = `${gradientAngle}°`;
        updateGradient();
    });
    
    hexInput.addEventListener('input', (e) => {
        if (e.target.value.match(/^#[0-9A-F]{6}$/i)) {
            colorStops[currentStopIndex].color = e.target.value;
            updateGradient();
            updateStopsList();
            updateRGBAInputs(e.target.value);
        }
    });
    
    hueSlider.addEventListener('input', setupColorPicker);
    colorCanvas.addEventListener('click', handleColorPickerClick);
    
    applyToHeader.addEventListener('change', () => {
        const currentGradient = getCurrentGradientCSS();
        applyLivePreview(currentGradient);
    });
    
    applyToBackground.addEventListener('change', () => {
        const currentGradient = getCurrentGradientCSS();
        applyLivePreview(currentGradient);
    });
    
    ['rInput', 'gInput', 'bInput'].forEach(id => {
        document.getElementById(id).addEventListener('input', () => {
            const r = parseInt(document.getElementById('rInput').value) || 0;
            const g = parseInt(document.getElementById('gInput').value) || 0;
            const b = parseInt(document.getElementById('bInput').value) || 0;
            
            const hex = rgbToHex(r, g, b);
            colorStops[currentStopIndex].color = hex;
            hexInput.value = hex;
            updateGradient();
            updateStopsList();
        });
    });
    
    gradientSlider.addEventListener('dblclick', (e) => {
        const rect = gradientSlider.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = Math.round((x / rect.width) * 100);
        
        colorStops.push({position: percentage, color: '#ff0000'});
        colorStops.sort((a, b) => a.position - b.position);
        updateGradient();
        updateStopsList();
    });
}

function getCurrentGradientCSS() {
    const stops = colorStops.map(stop => `${stop.color} ${stop.position}%`).join(', ');
    
    if (gradientType === 'linear') {
        return `linear-gradient(${gradientAngle}deg, ${stops})`;
    } else {
        return `radial-gradient(circle, ${stops})`;
    }
}

window.onload = init;