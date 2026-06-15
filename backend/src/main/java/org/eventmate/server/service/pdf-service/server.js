const express = require("express")
const bodyParser = require("body-parser")
const puppeteer = require("puppeteer")

const app = express()
app.use(bodyParser.text({ type: "*/*" }))

app.post("/generate-pdf", async (req, res) => {
    try {
        const html = req.body

        const browser = await puppeteer.launch({
            args: ["--no-sandbox", "--disable-setuid-sandbox"]
        })

        const page = await browser.newPage()

        await page.setContent(html, {
            waitUntil: "networkidle0"
        })

        const pdf = await page.pdf({
            format: "A4",
            printBackground: true
        })

        await browser.close()

        res.set({
            "Content-Type": "application/pdf",
            "Content-Length": pdf.length
        })

        res.send(pdf)

    } catch (error) {
        console.error(error)
        res.status(500).send("PDF generation failed")
    }
})

app.listen(3001, () => {
    console.log("PDF Service running on port 3001")
})