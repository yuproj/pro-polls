const path = require('path')
const express = require('express')
const app = express()
const expbs = require('express-handlebars')
require('./db/mongoose')
const Poll = require('./models/poll')
const requestIp = require('request-ip')
const ip = require('ip')

const port = process.env.PORT || 3000

const publicDirectoryPath = path.join(__dirname,'../public')

const hbs = expbs.create({
    defaultLayout:'main',
    helpers:{
        createPollForm: function(value){
            var out = ''
            for(var i = 0; i < value.length; i++){
                var option = value[i].option
                var votes = value[i].votes
                out+='<div>'
                out+='<input type="radio" name="option" value="'+option+'">'
                out+='<label for="'+option+'">'+option+' - '+votes+' votes</label>'
                out+='</div>'
            }
            return out
        }
    }
})
app.engine('handlebars',hbs.engine)
app.set('view engine','handlebars')

app.use(express.static(publicDirectoryPath))
app.use(express.json())

app.use(requestIp.mw())

app.get('/',(req,res)=>{
    res.render('index',{
        pageTitle:'AnonVote - Home',
        headerText:'Welcome to AnonVote!'
    })
})

app.get('/create',(req,res)=>{
    res.render('create',{
        pageTitle:'AnonVote - Create',
        headerText:'Create a Poll'
    })
})

app.post('/create',async(req,res)=>{
    const poll = new Poll(req.body)

    poll.save().then(()=>{
        res.status(201).send({
            title:poll.title,
            options:poll.options,
            id:poll.id
        })
    }).catch((e)=>{
        res.status(400).send(e)
    })
})

app.get('/polls/:id',async(req,res)=>{
    try {
        const poll = await Poll.findOne({id:req.params.id})

        if(!poll){
            return res.status(404).render('404',{
                pageTitle:'AnonVote - Poll not found',
                headerText:'404 - Poll not found'
            })
        }

        res.render('poll',{
            pageTitle:'AnonVote - Vote',
            headerText:'Vote!',
            pollTitle:poll.title,
            options:poll.options
        })
    }catch(e){
        res.status(500).send()
    }
})

app.patch('/polls/:id',async(req,res)=>{
    try {
        const poll = await Poll.findOne({id: req.params.id})
        
        if(!poll){
            return res.status(404).send()
        }
    
        // Check ip for possible duplicate vote
        const clientIp = ip.toBuffer(req.clientIp)
        const existingIp = poll.voters.find(o=>ip.toString(o.ip_buffer) === ip.toString(clientIp))
        if(existingIp) {
            return res.status(400).send()
        }

        poll.voters.push({'ip_buffer':clientIp})
        
        const option = poll.options.find(o => o.option === req.body.option)
        option.votes+=1

        await poll.save()

        res.status(200).send({
            title:poll.title,
            options:poll.options,
            id:poll.id
        })
    } catch(e) {
        res.status(400).send(e)
    }
})

app.get('*',(req,res)=>{
    res.render('404',{
        pageTitle:'AnonVote - Page not found',
        headerText:'404 - Page not found'
    })
})

app.listen(port, ()=>{
    console.log('Server is up on port ' + port)
})
