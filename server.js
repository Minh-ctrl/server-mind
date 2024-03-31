const puppeteer = require('puppeteer')
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')




const fs = require('fs')

const app = express()
app.use(cors())
app.use(bodyParser.raw({ type: ["image/jpeg", "image/png"], limit: "10mb"}));

// const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));


app.post('/create-mind-file', async (req, res)=>{
    // res.setHeader('Content-Type', 'application/octet-stream');

    await fs.writeFile("imageToUpload.jpeg", req.body, (error) => {
        if (error) {
         throw error;
       }
        console.log("Image saved.");
       });
        
    const { success } = await e2ePuppet()
    if(success){
        const data= fs.readFileSync('./result/targets.mind')
        res.send(data);
    }
    else{
        res.sendStatus(500)
    }

})

app.listen(9013)




async function e2ePuppet(){
    const URL= "https://hiukim.github.io/mind-ar-js-doc/tools/compile/"
    const browser = await puppeteer.launch({
        headless: true,
    });
    const page = await browser.newPage();
    const client = await page.target().createCDPSession()
    await client.send('Page.setDownloadBehavior', {
    behavior: 'allow',
    downloadPath: './result/',
    })
    await page.goto(URL);
    const inputEl = await page.waitForSelector('.dz-hidden-input', {
        timeout: 10000,
    }); 
    const addButton = await page.waitForSelector('.startButton_OY2G', {
        timeout: 10000,
    })
    inputEl.uploadFile('./imageToUpload.jpeg')
    addButton.click()
    const downloadButton = await page.waitForSelector('xpath///button[contains(text(), "Download compiled")]', {
        timeout: 10000,
    })
    downloadButton.click()
    
    await waitUntilDownload(page, 'targets.mind')

    browser.close()
    return {
        success: true
    }
}

async function waitUntilDownload(page, fileName = '') {
    return new Promise((resolve, reject) => {
        page._client().on('Page.downloadProgress', e => {
            if (e.state === 'completed') {
                resolve(fileName);
            } else if (e.state === 'canceled') {
                reject();
            }
        });
    });
}
