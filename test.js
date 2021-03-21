const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

async function get() {
    const pageUrl = 'https://herder-gymnasium-minden.de'

    const browser = await puppeteer.launch({
        headless: true,
        executablePath: '/usr/bin/chromium-browser',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    await page.goto(pageUrl);

    const pageHTML = await page.evaluate('new XMLSerializer().serializeToString(document.doctype) + document.documentElement.outerHTML');

    console.log(pageHTML)
    // const $ = cheerio.load(pageHTML)
}

get()