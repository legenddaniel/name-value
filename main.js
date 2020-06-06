// Encapsulcation of some simple jQuery methods in alphabetic order
class JQ {
    constructor(selector) {
        this.selector = document.querySelector(selector);
    }

    append(child) {
        switch (typeof child) {
            case 'string':
                this.selector.innerHTML += child;
                break;
            case 'object':
                this.selector.appendChild(child);
                break;
        }
    }

    on(e, handler) {
        return this.selector.addEventListener(e, handler);
    }

    val() {
        return this.selector.value;
    }


}
const $ = function (selector) {
    return new JQ(selector);
}

class List {

}



const addPair = function () {
    const inputVal = $('#input').val().replace(' ', '');
    const list = $('#list');
    const regex = /^[a-zA-Z0-9]+=[a-zA-Z0-9]+$/;

    if (regex.test(inputVal)) {
        list.append(`<li tabindex="1">${inputVal}</li>`);
    } else {
        alert('Format should be "Name=Value"');
    }


}

$('#btn-add').on('click', addPair);