// IE9+ supported. No polyfill

// Add the input value to the list
var addPair = function () {
    var inputVal = document.getElementById('input').value.replace(' ', '');
    var list = document.getElementById('list');
    var regex = /^[a-zA-Z0-9]+=[a-zA-Z0-9]+$/;

    if (!list.innerText || list.innerText.indexOf(inputVal) < 0) {
        if (regex.test(inputVal)) {
            var name = inputVal.match(/^[a-zA-Z0-9]+/)[0];
            var value = inputVal.match(/[a-zA-Z0-9]+$/)[0];
            list.innerHTML += `<li tabindex="1"><span class="name">${name}</span>=<span class="value">${value}</span></li>`;
        } else {
            alert('Format should be "Name=Value"');
        }
    }
};

// Press 'Enter' to add pair
var addPairFiredByEnter = function(e) {
    if (e.key === 'Enter') document.getElementById('btn-add').click();
};

// Clear input box after adding
var clearInput = function () {
    document.getElementById('input').value = '';
};

// Press ↑ and ↓ to switch focus on the pair
var switchPair = function(e) {
    var target = e.target;
    var keys = {
        ArrowDown() {
            var next =  target.nextElementSibling || target.parentNode.firstElementChild;
            next.focus();
        },
        ArrowUp() {
            var previous = target.previousElementSibling || target.parentNode.lastElementChild
            previous.focus();
        }
    };
    if (e.key in keys) keys[e.key]();
}

// Check the innerText of 'Show in XML' button
var isXML = function () {
    return document.getElementById('xml').innerText.indexOf('XML') > -1;
};

// Check if the user is clicking the sort buttons instead of delete or XML buttons
var isSortButton = function (e) {
    return e.target.tagName === 'BUTTON' && e.target.innerText.indexOf('Sort') > -1;
};

// Get innerText of certain elements
var getNodesInnerHtml = function (identifier) {
    return [...document.getElementsByClassName(identifier)].map(function (i) { return i.innerHTML });
};

// Set name/value array for sorting
var setNameValuePair = function () {
    var names = getNodesInnerHtml('name');
    var values = getNodesInnerHtml('value');
    var arr = [];
    for (let i = 0; i < names.length; i++) {
        arr.push({ Name: names[i], Value: values[i] });
    }
    return arr;
};

// Render sorted name/value array back to DOM. This DocumentFragment type of method has better performance than the reverse of the setNameValuePair()
var renderSortedNameValuePair = function (arr) {
    var innerHTMLList = arr.map(function (pair) {
        return (isXML() ?
            `<li tabindex="1"><span class="name">${pair.Name}</span>=<span class="value">${pair.Value}</span></li>` :
            `<li tabindex="1">&lt;pair&gt;<br><span class="name">${pair.Name}</span><br><span class="value">${pair.Value}</span><br>&lt;/pair&gt;</li>`
        );
    });
    var innerHTML = innerHTMLList.join('');
    document.getElementById('list').innerHTML = innerHTML;
};

// Sort by name/value in ascending/descending order, 4-in-1
var sortList = function (sortBy, order) {
    return function (a, b) {
        var _a = a[sortBy].toLowerCase();
        var _b = b[sortBy].toLowerCase();
        if (order === '↑') {
            return _a > _b ? 1 : _a < _b ? -1 : 0;
        } else {
            return _a > _b ? -1 : _a < _b ? 1 : 0;
        }
    };
};

// Sort by name/value/order based on the innerText of the clicked button
var sortHandler = function (e) {
    if (isSortButton(e)) {
        var buttonClicked = e.target;
        var buttonHTML = buttonClicked.innerText;
        var arrow = buttonHTML.match(/↑|↓/)[0];
        var sortBy = buttonHTML.match(/Name|Value/)[0];

        var pair = setNameValuePair();
        pair.sort(sortList(sortBy, arrow));
        renderSortedNameValuePair(pair);
    }
};

// Toggle '↓' & '↑' of button innerText
var toggleArrow = function (e) {
    if (isSortButton(e)) {
        var target = e.target;
        var html = target.innerHTML;
        var arrow = /↑/.test(html) ? '↓' : '↑';
        var newHtml = html.replace(/↑|↓/, arrow);
        target.innerHTML = newHtml;
    }
};

// Remove selected <li>. Due to browser support, ChildNode.remove() not using
var deleteList = function () {
    var focusedElement = document.activeElement;
    if (focusedElement.tagName === 'LI') focusedElement.parentNode.removeChild(focusedElement);
};

// XML/HTML conversion
var convertXML = function () {
    var html = document.getElementById('list').innerHTML;
    var [stringsToReplace, regex] = isXML() ?
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

    var newHtml = html.replace(regex, function (match) { return stringsToReplace[match] });
    document.getElementById('list').innerHTML = newHtml;
};

// Toggle the innerText of 'Show in XML' button
var toggleXML = function (e) {
    var target = e.target;
    var html = target.innerHTML;
    var xml = /XML/.test(html) ? 'HTML' : 'XML';
    var newHtml = html.replace(/XML|HTML/, xml);
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