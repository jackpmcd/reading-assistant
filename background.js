console.log("background js running")

function loadPDF(url) {
    return fetch(url) 
        .then(response => response.arrayBuffer()); 
}

async function extractText(pdfData) {
    console.log("doing a thing");
    const loadingTask = pdfjsLib.getDocument(pdfData);
    const pdfDocument = await loadingTask.promise; 

    const numPages = pdfDocument.numPages;
    let completeText = '';

    for (let i = 1; i <= numPages; i++) {
        const page = await pdfDocument.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' '); 
        completeText += pageText + '\n';
    }

    // Store the text in localStorage
    localStorage.setItem('pdfText', completeText);
    console.log(completeText);
    return completeText;
} 

// Function to retrieve text from localStorage
async function getStoredText() {
    const text = await chrome.storage.local.get('pdfText');
    return text['pdfText'];
}


// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'openPanelAndSendText') {
        console.log("extracting text from non-PDF")
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const tab = tabs[0]; 

            // Open the side panel
            chrome.sidePanel.open({ tabId: tab.id }); 

            sendResponse({ status: 'success' });
        });

        chrome.storage.local.set({'pdfText':request.text});
    }

    if (request.action === 'summarise') {
        getStoredText().then(text => {
            summarizeText(text);
        }).catch(error => {
            console.error(error); // Handle any errors
        });
    }

    if (request.action === 'quiz') {
        getStoredText().then(text => {
            makeQuiz(text);
        }).catch(error => {
            console.error(error); // Handle any errors
        });
    }

    if (request.action === 'extractTextFromPDF') {
        console.log("extracting text from pdf")
        extractText(loadPDF(request.url));
    }
});


// Function to summarize text using GPT-3.5 API
async function summarizeText(text) {
    console.log("summarising...");
    console.log(text);

    // Prepare the request data
    const requestData = {
        model: 'gpt-3.5-turbo-0125',
        messages: [{"role":"user", "content": "Please summarize the following text while ensuring that the summary captures the main points and key arguments. \
                The summary should provide a clear understanding of the text's content, including its central thesis, supporting evidence, and major conclusions. \
                Prioritize conciseness and clarity in the summary. afterwards add sections, putting <h2> tags to headers and '+' for bullet points \n\n" 
                + text}],
        max_tokens: 500,
        temperature: 0.5    
    };

    // Send request to the OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(requestData)
    });


    // Parse the response
    const responseData = await response.json();
    console.log('API response:', responseData);

    if (response.ok) {
        const summary = responseData.choices[0].message.content.trim();
        chrome.runtime.sendMessage({ action: "displaySummary", summary: summary });
    } else {
        throw new Error(responseData.error.message || 'Failed to summarize text');
    }
    /* chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === "readyForSummary") {
            chrome.runtime.sendMessage({ action: "displaySummary", summary: "<h2>Summary</h2>\
            President Joe Biden faces a high-stakes State of the Union address to combat concerns about his age, highlight his first-term accomplishments, and make a case for re-election. \
            Questions about his fitness for office, low approval ratings, and tight race for the presidency make this speech critical. \
            Biden must appear competent and comfortable to dispel doubts about his age and address criticisms. \
            He will focus on defending his legislative record, emphasizing economic improvements, and addressing challenges like inflation and immigration. \
            The speech will present a contrast between Biden's leadership and former President Donald Trump's record, highlighting key policy differences and themes like preserving democracy. \
            Biden will also address foreign policy issues, including the recent conflicts in Afghanistan, Ukraine, and Israel, to demonstrate his ability to manage global challenges effectively.\
            <h2>Key Points</h2>\
            + Biden faces a critical State of the Union address to address concerns about his age, low approval ratings, and tight race for re-election.\
            + He must appear competent and comfortable to dispel doubts about his fitness for office and address criticisms about his age.\
            + Biden will focus on defending his legislative record, emphasizing economic improvements, and addressing challenges like inflation and immigration.\
            + The speech will present a contrast between Biden's leadership and former President Donald Trump's record, highlighting key policy differences and themes like preserving democracy.\
            + Biden will also address foreign policy issues, including recent conflicts in Afghanistan, Ukraine, and Israel, to demonstrate his ability to manage global challenges effectively."})
        }
    }); */
    
}

async function makeQuiz(text) {
    console.log("quizzing...");

    // Prepare the request data
    const requestData = {
        model: 'gpt-3.5-turbo-0125',
        messages: [{"role":"user", "content": "Please create a 5-question multiple-choice quiz to assess the understanding of this text. Try to use very few numerical questions. Use the following format:\
        \
        #Q: (question)\
        \
        {\
        #R: (in front of correct answer ONLY)\
        #A: (in front of the rest of the answers)\
        #A: (incorrect answer)\
        #A: (incorrect answer)\
        }\
        \
        REALLY IMPORTANT: Make sure only 1 answer can be correct\n\n text: "
                + text}],
        max_tokens: 1500,
        temperature: 0.33
    };

    // Send request to the OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(requestData)
    });


    // Parse the response
    const responseData = await response.json();
    console.log('API response:', responseData);

    if (response.ok) {
        console.log(responseData.choices[0].message.content.trim());
        const quiz = responseData.choices[0].message.content.trim();
        chrome.runtime.sendMessage({ action: "displayQuiz", quiz: quiz });
    } else {
        throw new Error(responseData.error.message || 'Failed to quizzify text');
    }
    /* chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === "readyForQuiz") {
            chrome.runtime.sendMessage({ action: "displayQuiz", quiz: "#Q: What is the main purpose of President Joe Biden's State of the Union address?\
            #C: To combat worries about his age, lay out the case for re-election, and address concerns about his fitness for office\
            #A: To criticize his Republican competitor, former President Donald Trump\
            #A: To discuss his plans for a second term in office\
            #A: To focus on foreign policy issues only\
            \
            #Q: What is one of the challenges President Biden faces in his re-election campaign?\
            #A: Low unemployment rates\
            #A: A growing stock market\
            #A: Inflation that has impacted American household finances\
            #C: A surge in undocumented migrants at the US-Mexico border\
            \
            #Q: What is a key theme that President Biden's campaign has hinted will be addressed in his State of the Union address?\
            #A: Gun control\
            #A: Abortion rights\
            #A: Expanded healthcare\
            #C: Preserving democracy\
            \
            #Q: What is one of the criticisms of President Biden's handling of foreign policy?\
            #A: Stability on the world stage after a tumultuous Trump administration\
            #A: Providing Ukraine and Israel with US aid\
            #C: Chaotic US withdrawal from Afghanistan\
            #A: Managing global situations effectively\
            \
            #Q: How does President Biden plan to draw contrasts with his opponent, former President Donald Trump?\
            #C: By focusing on areas of perceived weakness, such as gun control and abortion rights\
            #A: By avoiding mentioning Mr. Trump by name\
            #A: By discussing the economic and social upheaval in the last year of the Trump administration\
            #A: By highlighting Mr. Trump's foreign policy experience"})
        }
    }); */
    
}


