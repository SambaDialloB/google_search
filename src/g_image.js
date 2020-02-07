// jshint esversion: 9

/**
 * @description null
 * @param {ParamsType} params list of command parameters
 * @param {?string} commandText text message
 * @param {!object} [secrets = {}] list of secrets
 * @return {Promise<SlackBodyType>} Response body
 */
const getContent = (url, headers) => {
    // Return new pending promise
    return new Promise((resolve, reject) => {
        const request = require('https').get(url, { headers }, response => {
            // Handle http errors
            if (response.statusCode < 200 || response.statusCode > 299) {
                reject(
                    new Error('Failed to load page, status code: ' + response.statusCode)
                );
            }

            // Temporary data holder
            const body = [];
            // On every content chunk, push it to the data array
            response.on('data', chunk => body.push(chunk));
            // We are done, resolve promise with those joined chunks
            response.on('end', () => resolve(body.join('')));
        });
        // Handle connection errors of the request
        request.on('error', err => reject(err));
    });
};
async function _command(params, commandText, secrets = {}) {
    const {
        search,
        num,
    } = params;
    const {
        customSearchEngine,
        googleSearchKey
    } = secrets;


    let index = 0;
    if (num) {
        if (num > 9 || num < 0) {
            return {
                response_type: 'in_channel', // or `ephemeral` for private response
                text: "Please choose an image range between 0 and 9"
            };
        }
        index = num;
    }

    let url = "https://content.googleapis.com/customsearch/v1?cx=" + customSearchEngine + "&q=" + search + "&searchType=" + "image" + "&key=" + googleSearchKey;
    console.log(url);
    let str = await getContent(url);
    let searchJSON = JSON.parse(str);
    let images = searchJSON.items;


    return {
        response_type: 'in_channel', // or `ephemeral` for private response
        blocks: [
            {
                "type": "image",
                "title": {
                    "type": "plain_text",
                    "text": images[index].title,
                    "emoji": true
                },
                "image_url": images[index].link,
                "alt_text": images[index].title,
            }
        ]
    };
}

/**
 * @typedef {object} SlackBodyType
 * @property {string} text
 * @property {'in_channel'|'ephemeral'} [response_type]
 */

const main = async ({ __secrets = {}, commandText, ...params }) => ({ body: await _command(params, commandText, __secrets) });
module.exports = main;
