import core from 'puppeteer-core';
import chrome from 'chrome-aws-lambda';

const exePath = process.platform === 'win32'
    ? 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
    : process.platform === 'linux'
        ? '/usr/bin/google-chrome'
        : '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

async function getOptions(isDev: boolean) {
    let options: {
        args: string[];
        executablePath: string;
        headless: boolean;
    };
    if (isDev) {
        options = {
            args: [],
            executablePath: exePath,
            headless: true
        };
    } else {
        options = {
            args: chrome.args,
            executablePath: await chrome.executablePath,
            headless: chrome.headless,
        };
    }
    return options;
}

let _page: core.Page | null;
async function getPage(isDev: boolean) {
    if (_page) {
        return _page;
    }
    const options = await getOptions(isDev);
    const browser = await core.launch(options);
    _page = await browser.newPage();
    return _page;
}

export async function getScreenshot(html: string, width: number = 2048, height: number = 1170, isDev: boolean = false) {
    const page = await getPage(isDev);
    await page.setViewport({ width, height });
    await page.setContent(html);

    return await page.screenshot({ type: 'png' });
}
