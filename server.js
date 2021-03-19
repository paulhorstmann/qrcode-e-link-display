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
        "header": "Anmeldungen zum neuen Schuljahr für die Klasse 5 und die EF",
        "icon": "Herder Logo",
        "description": "Wenn Sie zum Schuljahr 2021/22 Ihr Kind für die 5. Klasse oder für die EF bei uns anmelden möchten, erhalten Sie hier Anmeldeunterlagen und Informationen. Auch können Sie schon jetzt Termine für das Anmeldegespräch im Februar vereinbaren:",
        "qrcode": "https://herder-gymnasium-minden.de/wbs/?view=article&id=1060"
    },
    {
        "type": "cloud-link",
        "header": "Das Herder kennenlernen",
        "icon": "Herder Logo",
        "description": "Gern geben wir über unsere Videoclips und den Kurzfilm einen ersten Einblick in unsere Schule. Unser schulisches Konzept für die Erprobungsstufe lernen Sie über das Elternabend-Video kennen.\n",
        "qrcode": "https://herder-gymnasium-minden.de/wbs/?view=article&id=1047"
    },
    {
        "type": "herder-news",
        "header": "Videokonferenz-Räume",
        "icon": "Herder Logo",
        "description": "Hier befindet sich eine Liste mit Videokonferenz-Räumen der Kolleginnen und Kollegen. ",
        "qrcode": "https://herder-gymnasium-minden.de/wbs/?view=article&id=1058"
    }
]

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
    } catch (error) {
        res.status(500).send(error);
    }
});

const getPageHTML = async () => {
    const pageUrl = 'https://herder-gymnasium-minden.de'

    const browser = await puppeteer.launch();

    const page = await browser.newPage();

    await page.goto(pageUrl);

    const pageHTML = await page.evaluate('new XMLSerializer().serializeToString(document.doctype) + document.documentElement.outerHTML');

    const $ = cheerio.load(pageHTML)

    let res = []

    let articels = $('div[itemprop="blogPost"]')

    try {
        articels.each((i, el) => {
            const article = $(el);
            console.log(article.find('h2').find('a').html().trim().replace("amp;", ""))

            let headline = article.find('h2').find('a').html().trim().replace("amp;", "")
            console.log(headline)
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


            console.log(headline)
            console.log(description)
            console.log(link)

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

app.listen(port, () => console.log(`Läuft auf http://localhost:${port}`))

const createImage = (imgData) => {
    const data = JSON.stringify(imgData);

    fs.writeFile('./src/assets/temp/temp.site.json', data, (err) => {
        if (err) {
            throw err
        }
    })

    let pyapp = spawn('python', [__dirname + './src/createImage.py'])

    pyapp.stdout.on('data', (data) => {
        console.log(`child stdout: ${data}`);
    });

    pyapp.stderr.on('data', (data) => {
        console.error(`child stderr:\n${data}`);
    });
}

// const updateDisplay = async () => {
//     let actSlideImg = 1
//     idx = setInterval(function () {
//         // return clearInterval(idx);

//         if (pages.length != 0) {
//             let app = spawn('python', [__dirname + './src/updateDisplay.py', actSlideImg])

//             app.stdout.on('data', (data) => {
//                 console.log(`child stdout: ${data}`);
//             });

//             app.stderr.on('data', (data) => {
//                 console.error(`child stderr:\n${data}`);
//             });
//         }

//         if (actSlideImg >= pages.length) {
//             actSlideImg = 1
//         } else {
//             actSlideImg++
//         }

//     }, 10000)
// }

// updateDisplay()