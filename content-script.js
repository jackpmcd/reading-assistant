console.log("hello world")
console.log(window.location.href);

// Extract text from the webpage
function extractText() {
    // Attempt to extract article text
    const articleElement = document.querySelector('article') || document.getElementById('main-content') || document.querySelector('[role="article"]'); // Add more selectors as needed

    if (articleElement) {
        console.log("Article found!");
        console.log(articleElement.innerText);
        return articleElement.innerText;  
    } else {
        // Fallback to original logic
        console.log("No clear article found, using entire page text");
        const text = document.body.innerText;
        if (text) {
            console.log("Got the text");
        }
        return text;
    }
}

function checkPDF() {
    return window.location.href.includes(".pdf")
}

// Sends a message to the background script to open side panel 
// also sends the text 
function sendText() { 
    const text = extractText();
    if (checkPDF() === true){
        console.log("PDF found!");
        const pdfURL = window.location.href;
        chrome.runtime.sendMessage({action: 'extractTextFromPDF', url: pdfURL})
    } else if (text) { 
        chrome.runtime.sendMessage({ action: 'openPanelAndSendText', text: text })
            if (chrome.runtime.lastError) {
                console.error('Error:', chrome.runtime.lastError.message);
            } else {    
                console.log("message sent")
        };
    };
} 


// Creating the entire button to open the reading assistant

// Create button container
const buttonContainer = document.createElement("div");
buttonContainer.id = "buttonContainer";

const assistantContainer = document.createElement("div");
assistantContainer.id = "assistantContainer";

// Create button
var button = document.createElement("button");
button.textContent = 'Reading Assistant';
button.id = "myButton";

// Append arrow span before the button text
var arrowContainer = document.createElement("div");
arrowContainer.id = "arrowContainer";

var arrow = document.createElement("img");
arrow.id = "arrow";
let iconUrl = chrome.runtime.getURL("images/arrow.svg");
arrow.src = iconUrl;

var downArrowContainer = document.createElement("div");
downArrowContainer.id = "downArrowContainer";

const dropdownArrow = document.createElement("img");
dropdownArrow.id = "dropdownArrow";
dropdownArrow.src = iconUrl;
dropdownArrow.classList.add("arrowDown");

const tooltip = document.createElement("div");
tooltip.id = "tooltip";
tooltip.textContent = "Click here to style the page";
tooltip.classList.add("hidden");

const stylePanel = document.createElement("div");
stylePanel.id = "stylePanel";
stylePanel.style.display = "none"; // Initially hidden

const heading = document.createElement("h2");
heading.textContent = "Style Options";
stylePanel.appendChild(heading);
stylePanel.appendChild(document.createElement("br"));

const fontSizeGroup = document.createElement("div");
fontSizeGroup.classList.add("option-group"); 

const fontSizeLabel = document.createElement("h3");
fontSizeLabel.textContent = "Font Size";
fontSizeGroup.appendChild(fontSizeLabel);

const fontButtons = document.createElement("div");
fontButtons.classList.add("font-buttons");

const decreaseFontSizeBtn = document.createElement("button");
decreaseFontSizeBtn.classList.add("size-btn");
decreaseFontSizeBtn.textContent = "A-";
fontButtons.appendChild(decreaseFontSizeBtn);
decreaseFontSizeBtn.addEventListener('click', () => {
    changeRelativeFontSizes(-1); // Directly call the function
});

const increaseFontSizeBtn = document.createElement("button");
increaseFontSizeBtn.classList.add("size-btn");
increaseFontSizeBtn.textContent = "A+";
fontButtons.appendChild(increaseFontSizeBtn);
increaseFontSizeBtn.addEventListener('click', () => {
    changeRelativeFontSizes(1); // Directly call the function
});

fontSizeGroup.appendChild(fontButtons);

stylePanel.appendChild(fontSizeGroup);
stylePanel.appendChild(document.createElement("br"));

// Background Color Dropdown 
const colorGroup = document.createElement("div"); 
colorGroup.classList.add("option-group"); 

const colorLabel = document.createElement("h3");
colorLabel.textContent = "Background Color";
colorGroup.appendChild(colorLabel);

const palette = document.createElement("img");
palette.id = "palette";
palette.tabIndex = 0;
let imgURL = chrome.runtime.getURL("images/color-palette.svg");
palette.src = imgURL;
colorGroup.appendChild(palette);

const colorDropdown = document.createElement("div");
colorDropdown.id = "colorDropdown";
colorDropdown.style.display = "none"; 
colorGroup.appendChild(colorDropdown);

// Color Buttons (Modified)
const colorOptions = [
    { id:"white", label: "White"},
    { id: "#EDD1B0", label: "Peach"},
    { id: "yellow", label: "Yellow"},
    { id: "orange", label: "Orange"}
];

colorOptions.forEach(colorData => {
    const button = document.createElement("button");
    button.id = colorData.id;
    button.classList.add('colorButtons');
    button.style.backgroundColor = colorData.id; 
    button.textContent = colorData.label; // Add descriptive label
    colorDropdown.appendChild(button); // Append to colorDropdown

    ["click", "keypress"].forEach(ev => { 
    button.addEventListener(ev, function(e) {
        const selectedColor = this.id; // Assuming `this` refers to the clicked button
        applyColor(selectedColor);
    
        localStorage.setItem('selectedColor', selectedColor);
    
        colorDropdown.style.display = 'none';
    
        e.stopPropagation();
      }); 
    });
});

// Add the color group to the style panel
stylePanel.appendChild(colorGroup);

arrowContainer.appendChild(arrow);
downArrowContainer.appendChild(dropdownArrow);
assistantContainer.appendChild(downArrowContainer);
assistantContainer.appendChild(stylePanel);
assistantContainer.appendChild(button);

buttonContainer.appendChild(assistantContainer);

buttonContainer.appendChild(arrowContainer);
buttonContainer.appendChild(tooltip);

document.body.appendChild(buttonContainer);

button.addEventListener('click', function () {
    sendText();
});

downArrowContainer.addEventListener('click', function () {
    if (stylePanel.style.display === "flex") {
        stylePanel.style.display = "none";
    } else {
        stylePanel.style.display = "flex";
    }
});

downArrowContainer.addEventListener('mouseover', function () {
    tooltip.classList.remove('hidden');
});

downArrowContainer.addEventListener('mouseout', function () {
    tooltip.classList.add('hidden');
});

button.addEventListener('click', function () {
    sendText(); 
});

palette.addEventListener('click', function(event) {
    colorDropdown.style.display = colorDropdown.style.display === 'flex' ? 'none' : 'flex';
    event.stopPropagation();
});

arrowContainer.addEventListener('click', function () {
    if (assistantContainer.style.display === 'none') {
        assistantContainer.style.display = 'flex';
    } else {
        assistantContainer.style.display = 'none'; 
    }
    // Assuming you have CSS for 'arrow-flipped' to rotate the arrow
    arrow.classList.toggle('arrow-flipped'); 
});

function changeRelativeFontSizes(adjustment) {
    const elements = document.querySelectorAll('body *:not(#buttonContainer):not(#buttonContainer *)');

    elements.forEach(element => {
        if (element.closest('#buttonContainer') === null && element.id !== 'buttonContainer') { 
            const computedStyle = window.getComputedStyle(element);
            const currentFontSize = parseFloat(computedStyle.fontSize);
            
            let newFontSize = currentFontSize + adjustment; 

            // Apply limits
            newFontSize = Math.max(10, Math.min(newFontSize, 26)); // Clamp between 10px and 20px

            element.style.fontSize = newFontSize + 'px';
        } 
    });
}

function applyColor(selectedColor) {
    document.body.style.backgroundColor = selectedColor;
}

const storedColor = localStorage.getItem('selectedColor');
    if (storedColor) {
        applyColor(storedColor);
}
