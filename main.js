// IE9+ supported. No polyfill

// Add the input value to the list
const addPair = function () {
    const inputVal = document.getElementById('input').value.replace(' ', '');
    const list = document.getElementById('list');
    const regex = /^[a-zA-Z0-9]+=[a-zA-Z0-9]+$/;

    if (!list.innerText || list.innerText.indexOf(inputVal) < 0) {
        if (regex.test(inputVal)) {
            const name = inputVal.match(/^[a-zA-Z0-9]+/)[0];
            const value = inputVal.match(/[a-zA-Z0-9]+$/)[0];
            list.innerHTML += `<li tabindex="1"><span class="name">${name}</span>=<span class="value">${value}</span></li>`;
        } else {
            alert('Format should be "Name=Value"');
        }
    }
};

// Press 'Enter' to add pair
const addPairFiredByEnter = function(e) {
    if (e.key === 'Enter') document.getElementById('btn-add').click();
};

// Clear input box after adding
const clearInput = function () {
    document.getElementById('input').value = '';
};

// Press ↑ and ↓ to switch focus on the pair
const switchPair = function(e) {
    const target = e.target;
    const keys = {
        ArrowDown() {
            const next =  target.nextElementSibling || target.parentNode.firstElementChild;
            next.focus();
        },
        ArrowUp() {
            const previous = target.previousElementSibling || target.parentNode.lastElementChild
            previous.focus();
        }
    };
    if (e.key in keys) keys[e.key]();
}

// Check the innerText of 'Show in XML' button
const isXML = function () {
    return document.getElementById('xml').innerText.indexOf('XML') > -1;
};

// Check if the user is clicking the sort buttons instead of delete or XML buttons
const isSortButton = function (e) {
    return e.target.tagName === 'BUTTON' && e.target.innerText.indexOf('Sort') > -1;
};

// Get innerText of certain elements
const getNodesInnerHtml = function (identifier) {
    return [...document.getElementsByClassName(identifier)].map(function (i) { return i.innerHTML });
};

// Set name/value array for sorting
const setNameValuePair = function () {
    const names = getNodesInnerHtml('name');
    const values = getNodesInnerHtml('value');
    const arr = [];
    for (let i = 0; i < names.length; i++) {
        arr.push({ Name: names[i], Value: values[i] });
    }
    return arr;
};

// Render sorted name/value array back to DOM. This DocumentFragment type of method has better performance than the reverse of the setNameValuePair()
const renderSortedNameValuePair = function (arr) {
    const innerHTMLList = arr.map(function (pair) {
        return (isXML() ?
            `<li tabindex="1"><span class="name">${pair.Name}</span>=<span class="value">${pair.Value}</span></li>` :
            `<li tabindex="1">&lt;pair&gt;<br><span class="name">${pair.Name}</span><br><span class="value">${pair.Value}</span><br>&lt;/pair&gt;</li>`
        );
    });
    const innerHTML = innerHTMLList.join('');
    document.getElementById('list').innerHTML = innerHTML;
};

// Sort by name/value in ascending/descending order, 4-in-1
const sortList = function (sortBy, order) {
    return function (a, b) {
        const _a = a[sortBy].toLowerCase();
        const _b = b[sortBy].toLowerCase();
        if (order === '↑') {
            return _a > _b ? 1 : _a < _b ? -1 : 0;
        } else {
            return _a > _b ? -1 : _a < _b ? 1 : 0;
        }
    };
};

// Sort by name/value/order based on the innerText of the clicked button
const sortHandler = function (e) {
    if (isSortButton(e)) {
        const buttonClicked = e.target;
        const buttonHTML = buttonClicked.innerText;
        const arrow = buttonHTML.match(/↑|↓/)[0];
        const sortBy = buttonHTML.match(/Name|Value/)[0];

        const pair = setNameValuePair();
        pair.sort(sortList(sortBy, arrow));
        renderSortedNameValuePair(pair);
    }
};

// Toggle '↓' & '↑' of button innerText
const toggleArrow = function (e) {
    if (isSortButton(e)) {
        const target = e.target;
        const html = target.innerHTML;
        const arrow = /↑/.test(html) ? '↓' : '↑';
        const newHtml = html.replace(/↑|↓/, arrow);
        target.innerHTML = newHtml;
    }
};

// Remove selected <li>. Due to browser support, ChildNode.remove() not using
const deleteList = function (e) {
    const focusedElement = document.activeElement;
    if (focusedElement.tagName === 'LI') focusedElement.parentNode.removeChild(focusedElement);
};

// XML/HTML conversion
const convertXML = function () {
    const html = document.getElementById('list').innerHTML;
    const [stringsToReplace, regex] = isXML() ?
        [{
            '<li tabindex="1"><span class="name">': '<li tabindex="1">&lt;pair&gt;<br><span class="name">&lt;name&gt;',
            '</span>=<span class="value">': '&lt;/name&gt;</span><br><span class="value">&lt;value&gt;',
            '</span></li>': '&lt;/value&gt;</span><br>&lt;/pair&gt;</li>'
        }, /<li tabindex="1"><span class="name">|<\/span>=<span class="value">|<\/span><\/li>/g
        ] : [{
            '<li tabindex="1">&lt;pair&gt;<br><span class="name">&lt;name&gt;': '<li tabindex="1"><span class="name">',
            '&lt;/name&gt;</span><br><span class="value">&lt;value&gt;': '</span>=<span class="value">',
            '&lt;/value&gt;</span><br>&lt;/pair&gt;</li>': '</span></li>'
        }, /<li tabindex="1">&lt;pair&gt;<br><span class="name">&lt;name&gt;|&lt;\/name&gt;<\/span><br><span class="value">&lt;value&gt;|&lt;\/value&gt;<\/span><br>&lt;\/pair&gt;<\/li>/g
        ];

    const newHtml = html.replace(regex, function (match) { return stringsToReplace[match] });
    document.getElementById('list').innerHTML = newHtml;
};

// Toggle the innerText of 'Show in XML' button
const toggleXML = function (e) {
    const target = e.target;
    const html = target.innerHTML;
    const xml = /XML/.test(html) ? 'HTML' : 'XML';
    const newHtml = html.replace(/XML|HTML/, xml);
    target.innerHTML = newHtml;
};

document.getElementById('input').addEventListener('keydown', addPairFiredByEnter);

document.getElementById('btn-add').addEventListener('click', addPair);
document.getElementById('btn-add').addEventListener('click', clearInput);

document.getElementById('list').addEventListener('keydown', switchPair);

document.getElementById('btns').addEventListener('click', sortHandler); //Bubbling
document.getElementById('btns').addEventListener('click', toggleArrow); //Bubbling

document.getElementById('delete').addEventListener('mousedown', deleteList);

document.getElementById('xml').addEventListener('click', convertXML);
document.getElementById('xml').addEventListener('click', toggleXML);