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
    const sections = inputString.split('<h2>');

    let html = '';

    for (let i = 0; i < sections.length; i++) {
        const section = sections[i].trim();

        if (section !== '') {
            if (i > 0) {
                html += '<br>'; 
            }

            const [header, content] = section.split('</h2>');

            html += `<h2>${header}</h2>`;
            let contentHTML = '';

            if (content.includes('+')){
                const bulletPoints = content.split('+').map(point => point.trim());

                for (let j = 0; j < bulletPoints.length; j++) {
                    const bulletPoint = bulletPoints[j];

                    if (bulletPoint !== '') {
                        contentHTML += `<li>${bulletPoint}</li>`;
                    }
                }

                contentHTML = `<ul>${contentHTML}</ul>`;
                
            } else{
                contentHTML += `<p>${content}</p>`;
            }

            html += contentHTML;
        }
    }

    return html;
}
  
  
