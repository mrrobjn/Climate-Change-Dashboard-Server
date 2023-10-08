import express from 'express';
import airquality from './routers/airquality.js'
import location from './routers/loction.js'
import historicalweather from './routers/historicalweather.js'
import weatherforecast from './routers/weatherforecast.js'
import crawdata from './routers/crawdata.js'
import cors from 'cors'

const app = express()
const PORT = 5000

app.use(cors())
app.use('/airquality',airquality)
app.use('/location',location)
app.use('/historicalweather',historicalweather)
app.use('/weatherforecast',weatherforecast)
app.use('/crawdata',crawdata)

app.listen(PORT)
