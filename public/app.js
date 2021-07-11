const toCurrency = (price) => {
 return  new Intl.NumberFormat('uk',{
        currency:'UAH',
        style:'currency'
    }).format(price)
}

document.querySelectorAll('.price').forEach(node => {
    node.textContent = toCurrency(node.textContent)
})


const $card = document.querySelector('#card');

if ($card) {
    $card.addEventListener('click',(event) => {
        if (event.target.classList.contains('js-remove')) {
            const id = event.target.dataset.id
            const csrf = event.target.dataset.csrf

            fetch('/card/remove/' + id,{
                method:'delete',
                headers: {
                    'X-XSRF-TOKEN': csrf
                  },
            }).then(res => res.json())
            .then(card => {
                if (card.courses.length) {
                    const html = card.courses.map(e => {
                       return  ` <tr>
                        <td>${e.title}</td>
                        <td>${e.count}</td>
                        <td>
                            <button class="btn btn-small js-remove" data-id="${e.id}">
                                Delete
                            </button>
                        </td>
                    </tr>`
                    }).join('');
                    $card.querySelector('tbody').innerHTML = html;
                    $card.querySelector('.price').textContent = toCurrency(card.price)

                }else {
                    $card.innerHTML = '<h1>trash is empty</h1>'
                }
            })
        }
    })
}

function toDate(date) {
    return new Intl.DateTimeFormat('ru-RU',{
        day:'2-digit',
        month:'long',
       year:'numeric',
       hour:'2-digit',
       minute:'2-digit',
       second:'2-digit'
    }).format(new Date(date))
}

document.querySelectorAll('.date').forEach(node => {
    node.textContent = toDate(node.textContent)
})

M.Tabs.init(document.querySelectorAll('.tabs'));