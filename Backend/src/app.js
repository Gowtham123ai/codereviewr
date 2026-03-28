const express = require('express');
const aiRoutes = require('./routes/ai.routes')
const rewriteRoutes = require('./routes/rewrite.routes')
const toolRoutes = require('./routes/tool.routes')

const cors = require('cors')

const app = express()

app.use(cors())


app.use(express.json())
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

app.get('/', (req, res) => {
    res.send('Hello World')
})

app.use('/ai', aiRoutes)
app.use('/api', rewriteRoutes)
app.use('/api/tools', toolRoutes)


module.exports = app