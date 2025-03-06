console.log("summary js running")

chrome.runtime.sendMessage({ action: "readyForSummary" }); 

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "displaySummary") {
        const processedParas = convertToHTML(request.summary);

        const title = document.getElementById('title');
        title.innerHTML = "Summary of the Whole Thing";

        const outputDiv = document.getElementById('output'); 
        console.log(processedParas);
        outputDiv.innerHTML = '';
        outputDiv.innerHTML += processedParas;
    }
});
  
function convertToHTML(inputString) {
    // Split the input string by <h2> tags
    const sections = inputString.split('<h2>');

    // Initialize the HTML string
    let html = '';

    // Iterate through the sections
    for (let i = 0; i < sections.length; i++) {
        // Remove leading and trailing whitespace
        const section = sections[i].trim();

        // If the section is not empty
        if (section !== '') {
            // If this is not the first section, add a paragraph break
            if (i > 0) {
                html += '<br>'; // Add a line break between paragraphs
            }

            // Split the section by the first occurrence of '</h2>'
            const [header, content] = section.split('</h2>');

            // Add the header wrapped in <h2> tags
            html += `<h2>${header}</h2>`;
            let contentHTML = '';

            if (content.includes('+')){
                // Split content by "-" to create bullet points
                const bulletPoints = content.split('+').map(point => point.trim());

                // Iterate through bullet points
                for (let j = 0; j < bulletPoints.length; j++) {
                    const bulletPoint = bulletPoints[j];

                    // If bullet point is not empty
                    if (bulletPoint !== '') {
                        // Add the bullet point wrapped in <li> tags
                        contentHTML += `<li>${bulletPoint}</li>`;
                    }
                }

                contentHTML = `<ul>${contentHTML}</ul>`;
                
            } else{
                contentHTML += `<p>${content}</p>`;
            }

            // Add the content to the HTML string
            html += contentHTML;
        }
    }

    return html;
}
  
  