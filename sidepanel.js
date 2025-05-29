const summary = document.getElementById('summary');
const quiz = document.getElementById('quiz');
const help = document.getElementById('help');

if (summary){
  ["click", "keypress"].forEach( ev => { 
    summary.addEventListener(ev, function(e) {
    chrome.runtime.sendMessage({ action: 'summarise' });

    if (chrome.runtime.lastError) {
        console.error("Error sending message:", chrome.runtime.lastError);
    } else {
        window.location.href = "summarised.html"; 
    }
  })});
};

if (quiz){
  ["click", "keypress"].forEach( ev => { 
    quiz.addEventListener(ev, function(e) {
    chrome.runtime.sendMessage({ action: 'quiz' });

    if (chrome.runtime.lastError) {
        console.error("Error sending message:", chrome.runtime.lastError);
    } else {
        window.location.href = "quiz.html"; 
    }
  })});
};  

if (help){
  ["click", "keypress"].forEach( ev => { 
    help.addEventListener(ev, function(e) {
    chrome.runtime.sendMessage({ action: 'help' });

    if (chrome.runtime.lastError) {
        console.error("Error sending message:", chrome.runtime.lastError);
    } else {
        window.location.href = "help.html"; 
    }
  })});
};

const decreaseFontButton = document.getElementById('decreaseFont');
const increaseFontButton = document.getElementById('increaseFont');
const sidePanel = document.getElementsByClassName('sidepanel'); 

increaseFontButton.addEventListener('click', () => {
  changeRelativeFontSizes(1); 
});

decreaseFontButton.addEventListener('click', () => {
  changeRelativeFontSizes(-1); 
});

function changeRelativeFontSizes(adjustment) {
  const sidePanel = document.getElementById('mainContent');

  const elements = sidePanel.querySelectorAll('*');

  elements.forEach(element => {
      const computedStyle = window.getComputedStyle(element);
      
      const currentFontSize = parseFloat(computedStyle.fontSize);
      
      if (!isNaN(currentFontSize)) {
          const newFontSize = currentFontSize + adjustment;
          element.style.fontSize = newFontSize + 'px';
      }
  });
}

// Get the dropdown element
const colorButtons = document.querySelectorAll('.colorButtons');
const colorDropdown = document.getElementById('colorDropdown');
const dropdownBtn = document.getElementById('dropdownBtn');

// Retrieve the selected color from local storage, if available
const storedColor = localStorage.getItem('selectedColor');
if (storedColor) {
  applyColor(storedColor);
}

// Function to apply the selected color to the body and palette
function applyColor(selectedColor) {
  const palette = document.getElementById('palette');
  const sidepanelBtn = document.getElementById('sidepanelBtn');
  if (selectedColor === 'rgba(32, 33, 36, 1.00)') {
    chrome.runtime.sendMessage({ action: 'darkMode' });
    document.body.style.color = 'rgba(224, 228, 219, 1.00)';
    palette.style.filter = 'invert(1)';
    sidepanelBtn.style.color = 'rgba(224, 228, 219, 1.00)';
    sidepanelBtn.style.border = '2px solid rgba(224, 228, 219, 1.00)';
  } else {
    document.body.style.color = 'black';
    palette.style.filter = 'invert(0)';
    sidepanelBtn.style.color = 'black';
    sidepanelBtn.style.border = '2px solid black';

    chrome.runtime.sendMessage({ action: 'lightMode' });
  }
  document.body.style.backgroundColor = selectedColor;
}

colorButtons.forEach(function(button) {
  button.addEventListener('click', function(event) {
    const selectedColor = this.id;
    applyColor(selectedColor);

    localStorage.setItem('selectedColor', selectedColor);

    colorDropdown.style.display = 'none';

    event.stopPropagation();
  });
});

// show/hide dropdown if button is clicked
dropdownBtn.addEventListener('click', function(event) {
  colorDropdown.style.display = colorDropdown.style.display === 'block' ? 'none' : 'block';
  event.stopPropagation();
});

// hide dropdown if user clicks outside of it
document.addEventListener('click', function() {
  if (colorDropdown.style.display === 'block') {
    console.log('clicking outside');
    colorDropdown.style.display = 'none';
  }
});

