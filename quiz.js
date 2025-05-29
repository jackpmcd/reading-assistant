chrome.runtime.sendMessage({ action: "readyForQuiz" }); 
let numOfGroups;
let generatedHTML;
let currentIndex = 0;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "displayQuiz") {
        [generatedHTML, numOfGroups] = convertToHTML(request.quiz);

        const title = document.getElementById('title');
        title.innerHTML = "Quiz of the Whole Thing";

        const outputDiv = document.getElementById('output');
        outputDiv.innerHTML = generatedHTML;

        radioButtons();
        showGroup(0, numOfGroups);
    }

    if (request.action === "darkMode"){
        console.log("dark mode")
        document.getElementById('prevBtn').style.color = "rgba(224, 228, 219, 1.00)";
        document.getElementById('nextBtn').style.color = "rgba(224, 228, 219, 1.00)";
    }

    if (request.action === "lightMode"){
        document.getElementById('prevBtn').style.color = "black";
        document.getElementById('nextBtn').style.color = "black";
    }
});

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]]; 
    }
    return array;
  }

function convertToHTML(inputText) {
    if (!inputText) {
        return ''; 
    }

    const sections = inputText.split('#Q:');
    sections.shift(); 

    let html = '';

    let counter = 0;
    sections.forEach(section => {
        counter++;
        const lines = section.trim().split('#');
        const question = lines[0].trim();
        let options = lines.slice(1).map(line => line.trim()).filter(line => line.startsWith('A:') || line.startsWith('R:'));
        const correctAnswer = options.find(answer => answer.startsWith('R:'));
    
        html += `<div class="question-group" id="group${counter}">`;
        html += `<h2>${question}</h2>`;
        html += '<div class="answer-group">';
        
        options = shuffleArray(options);

        options.forEach(option => {
            const isCorrect = option === correctAnswer;
            const answerText = option.replace(/^(R:|A:)/, '').trim();
            const answerId = `answer_${Math.random().toString(36).substr(2, 9)}`;
            html += `
                <input type="radio" class="answers ${isCorrect ? 'right' : ''}" id="${answerId}" name="quiz" value="${answerText}">
                <label for="${answerId}" class="answers">${answerText}</label><br>
            `;
        });
    
        html += '</div>';
        html += '</div>';
    });

    return [html, counter];
}


function showGroup(index, numOfGroups) {
    if (numOfGroups) {
        const groups = document.querySelectorAll('.question-group');
        groups.forEach((group, i) => {
            if (i === index) {
                group.classList.add('active');
            } else {
                group.classList.remove('active');
            }
        });

        const nextBtn = document.getElementById('nextBtn');
        const prevBtn = document.getElementById('prevBtn');

        var messageDiv = document.getElementById('message');
        messageDiv.textContent = '';

        if (index === 0) {
            prevBtn.textContent = ''; 
            prevBtn.style.cursor = 'default';
        } else {
            prevBtn.textContent = 'Prev';
        }

        if (index === numOfGroups - 1) {
            nextBtn.textContent = 'Finish'; 
        } else {
            nextBtn.textContent = 'Next';
        }
    }
}

document.getElementById('nextBtn').addEventListener('click', () => {
    currentIndex += 1;
    showGroup(currentIndex, numOfGroups);
});

document.getElementById('prevBtn').addEventListener('click', () => {
    currentIndex -= 1;
    showGroup(currentIndex, numOfGroups);
});

function radioButtons(){
    var radios = document.querySelectorAll('input[type="radio"]');
    var messageDiv = document.getElementById('message');

    radios.forEach(function(radio) {
        radio.addEventListener('click', function() {
            if (radio.classList.contains('right')) {
                messageDiv.style.backgroundColor = "green";
                messageDiv.textContent = "Well done!";
            } else {
                messageDiv.style.backgroundColor = "red";
                messageDiv.textContent = "Unlucky! Try again.";
            }
        });
    });
}
