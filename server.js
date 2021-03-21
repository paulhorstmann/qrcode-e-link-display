const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

const express = require('express');
const bodyParser = require("body-parser");

const fs = require('fs');

const app = express();
const port = 80;

const { response } = require('express');
const { spawn } = require('child_process');

let pages = [
    {
        "type": "herder-news",
        "header": "Erste Seite",
        "icon": "Herder Logo",
        "description": "Wenn Sie zum Schuljahr 2021/22 Ihr Kind für die 5. Klasse oder für die EF bei uns anmelden möchten, erhalten Sie hier Anmeldeunterlagen und Informationen. Auch können Sie schon jetzt Termine für das Anmeldegespräch im Februar vereinbaren:",
        "qrcode": "https://herder-gymnasium-minden.de/wbs/?view=article&id=1060"
    },
    {
        "type": "cloud-link",
        "header": "Zweite Seite",
        "icon": "Herder Logo",
        "description": "Gern geben wir über unsere Videoclips und den Kurzfilm einen ersten Einblick in unsere Schule. Unser schulisches Konzept für die Erprobungsstufe lernen Sie über das Elternabend-Video kennen.\n",
        "qrcode": "https://herder-gymnasium-minden.de/wbs/?view=article&id=1047"
    },
    {
        "type": "herder-news",
        "header": "Dritte Seite",
        "icon": "Herder Logo",
        "description": "Hier befindet sich eine Liste mit Videokonferenz-Räumen der Kolleginnen und Kollegen. ",
        "qrcode": "https://herder-gymnasium-minden.de/wbs/?view=article&id=1058"
    }
]

const createImage = async (imgData) => {
    console.log('\n')
    console.log(imgData)

    const data = JSON.stringify(imgData);

    console.log(data)

    fs.writeFile('./src/assets/temp/temp.site.json', data, (err) => {
        if (err) {
            throw err
        }
    })

    let pyapp = spawn('python', [__dirname + '/src/createImage.py'])

    pyapp.stdout.on('data', (data) => {
        console.log(`\nchild stdout:\n${data}`);
    });

    pyapp.stderr.on('data', (data) => {
        console.error(`\nchild stderr:\n${data}`);
    });
}

async function loadPages() {
    for (i = 0; i < pages.length; i++) {
        console.log(`[INFO] Create Page: ${i + 1}`)
        pages[i]['site'] = i + 1
        await createImage(pages[i])
        // Prevent Multifileaccess
        await new Promise(resolve => setTimeout(resolve, 500))
    }
}

async function updateDisplay() {
    let actSlideImg = 1
    let intervalNum = 0
    console.log('\n++ Starte Interval ++')

    let runLoop = true
    let done = false

    while (runLoop) {

        console.log(`\nAktuelle Seit: ${actSlideImg}\nAktuelle Länge: ${pages.length}`)
        done = false
        intervalNum++

        if (pages.length >= 0) {
            let pyapp = spawn('python', [__dirname + '/src/updateDisplay.py', actSlideImg])

            pyapp.stdout.on('data', (data) => {
                done = true
                console.log(`Updater: ${data}`)
            });

            pyapp.stderr.on('data', (data) => {
                console.error(`Updater: \n${data}`)
            });
        }

        while (!done) {
            await new Promise(resolve => setTimeout(resolve, 10000))
        }

        if (pages.length == 0) {
            actSlideImg = 0
        } else if (actSlideImg >= pages.length) {
            actSlideImg = 1
        } else {
            actSlideImg++
        }
    }
}

function writeToStorage() {
    const data = JSON.stringify(pages);

    fs.writeFile('./temp/site.store.json', data, (err) => {
        if (err) {
            throw err
        }
    })
}

function recoverFromStorage() {
    let rawdata = fs.readFileSync('./temp/site.store.json');
    pages = JSON.parse(rawdata)
}


recoverFromStorage()
loadPages()
updateDisplay()


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/', express.static('public'));

app.get('/api/getpages', async (req, res) => {
    try {
        res.status(200).send(pages);
    } catch (error) {
        res.status(500).send(error);
    }
});

app.delete('/api/deletepage', (req, res) => {
    const id = req.body.id

    if (id > -1) {
        pages.splice(id, 1);
    }

    res.status(200).send('Succsses')

    loadPages()
    writeToStorage()
})

app.get('/api/getherdernews', async (req, res) => {
    try {
        const html = await getPageHTML();

        res.status(200).send(html);
    } catch (error) {
        res.status(500).send(error);
    }
});

app.post('/api/PostView', (req, res) => {
    try {
        pages.push(req.body)
        req.body.site = pages.length
        createImage(req.body)
        res.status(200).send('Succsses')
        writeToStorage()
    } catch (error) {
        res.status(500).send(error);
    }
});

const getPageHTML = async () => {
    const pageUrl = 'https://herder-gymnasium-minden.de'

    const browser = await puppeteer.launch({
        headless: true,
        executablePath: '/usr/bin/chromium-browser',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    await page.goto(pageUrl);

    const pageHTML = await page.evaluate('new XMLSerializer().serializeToString(document.doctype) + document.documentElement.outerHTML');

    const $ = cheerio.load(pageHTML)

    let res = []

    let articels = $('div[itemprop="blogPost"]')

    try {
        articels.each((i, el) => {
            const article = $(el);

            let headline = article.find('h2').find('a').html().trim().replace("amp;", "")
            let description = article.find('p')

            let link = article.find('h2').find('a').attr('href').split("&")[2]
            link = 'https://herder-gymnasium-minden.de/wbs/?view=article&' + link.substring(0, link.indexOf(':'))

            article.find('p').each((j, art) => {
                if (j == 0) {
                    description = $(art).find('span').text()
                } else if (j == 1) {
                }
            })

            let decWordArr = description.split(' ')

            if (decWordArr.length > 40) {
                description = decWordArr.splice(0, 30).join(' ')
            }


            console.log('[~GET~ INFO]' + headline)
            console.log('[~GET~ INFO]' + description)
            console.log('[~GET~ INFO]' + link)

            res.push({
                headline: headline,
                description: description,
                link: link
            })
        })
    }
    catch (e) {
        logMyErrors(e)
    }

    await browser.close();

    return res.slice(0, 6);
}

app.listen(port, () => console.log(`\n++Webserver ist auf http://localhost:${port} gestartet ++`))



