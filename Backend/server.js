require('dotenv').config()
const app = require('./src/app')

app.use("/webhook/github", require("./routes/githubWebhook"));




app.listen(5000, () => {
    console.log('server is running on : http://localhost:5000/')
})