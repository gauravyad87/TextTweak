document.getElementById('enableButton').addEventListener('click', () => {
    injectMovableButton();
});

function injectMovableButton() {
    const button = document.createElement('button');
    button.innerText = 'T';
    button.className = 'movable-button';
    document.body.appendChild(button);
    makeMovable(button);
    button.addEventListener('click', async () => {
        let userText = '';
        let targetElement = document.activeElement;
        if (targetElement.tagName === 'INPUT' || targetElement.tagName === 'TEXTAREA' || targetElement.isContentEditable) {
            userText = targetElement.isContentEditable ? targetElement.innerText : targetElement.value;
            if (userText) {
                const correctedText = await getCorrectedText(userText);
                if (targetElement.isContentEditable) {
                    targetElement.innerText = correctedText;
                } else {
                    targetElement.value = correctedText;
                }
            } else {
                alert('No text detected. Please type something first.');
            }
        } else {
            alert('Click inside a text field or contenteditable element first.');
        }
    });
}

function makeMovable(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    element.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        element.style.top = (element.offsetTop - pos2) + "px";
        element.style.left = (element.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

async function getCorrectedText(text) {
    const response = await fetch('/correct-text', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: text })
    });

    const data = await response.json();
    return data.correctedText;
}