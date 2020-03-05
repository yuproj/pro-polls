const pollIdForm = document.querySelector('#getPollForm')
const voteForm = document.querySelector('#voteForm')
const search = document.querySelector('input')
const pollName = document.querySelector('#pollName')
const message = document.querySelector('#message')

let id = ''
// Get poll data and create form
pollIdForm.addEventListener('submit',(e)=>{
    e.preventDefault()

    id = search.value

    message.pollName = ''
    message.textContent = 'Loading...'
    $('#options').empty()
    fetch('http://localhost:3000/vote?id='+id).then((res)=>{
        res.json().then((data)=>{
            if(data.error){
                message.pollName = ''
                message.textContent = data.error
                $('#vote').hide();
            } else {
                pollName.textContent = data.pollName
                message.textContent = ''
                if(!data.multi) { // Multiple poll answers
                    radioButtons(data)
                } else {
                    checkboxes(data)
                }
                
                $('#vote').show();
            }
        })
    })
})

// Vote on poll
voteForm.addEventListener('submit',(e)=>{
    e.preventDefault()

    let options = document.getElementsByName('option')
    let selected = []
    for(let i = 0; i < options.length; i++) {
        if(options[i].checked) {
            selected.push(options[i].value)
        }
    }

    console.log(selected)
    // TODO: Create database and let user vote
})


const checkboxes = (data)=>{
    for(let i = 0; i < data.options.length; i++) {
        $('#options').append('<input type="checkbox" id=option'+(i+1)+' name="option" value="'+(i+1)+'">')
        .append('<label for="option'+(i+1)+'">'+data.options[i]+' - '+data.votes[i]+' votes</label><br>')
    }
}


const radioButtons = (data)=>{
    for(let i = 0; i < data.options.length; i++) {
        $('#options').append('<input type="radio" id=option'+(i+1)+' name="option" value="'+(i+1)+'">')
        .append('<label for="option'+(i+1)+'">'+data.options[i]+' - '+data.votes[i]+' votes</label><br>')
    }
}

