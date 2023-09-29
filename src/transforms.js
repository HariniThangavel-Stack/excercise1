import { Transform } from 'stream';
import { HEADER_END_REGEX } from './constants.js';
import { getFormatedHeader, getFormatedBody, constructJson, exceuteRegexPattern } from './utility.js';


export const transformCSVToJSON = () => {
    const headers = []; let headerEndIdex = 0;
    return new Transform({
        readableObjectMode: true,
        transform(chunk, encoding, callback) {
            const data = chunk.toString();
            const lines = data.split('\n');
            lines.every((val, idx) => {
                if (exceuteRegexPattern(val, HEADER_END_REGEX)) {
                    headers.push(val);
                    headerEndIdex = idx;
                    return false;
                }
                headers.push(val);
                return true;
            });
            const formatedHeaders = getFormatedHeader(headers);
            const formatedBody = getFormatedBody(lines, headerEndIdex);
            const formatedJson = constructJson(formatedHeaders, formatedBody);
            this.push(JSON.stringify(formatedJson));
            callback();
        }
    });
}

export const transformJSONToHTML = new Transform({
    readableObjectMode: true,
    transform(chunk, encoding, callback) {
        const convertedJSON = JSON.parse(chunk);
        const htmlContent = `<html>
        <head>
        <h3>CSV TO HTML TABLE</h3>
        <style>
        table {
            font-family: arial, sans-serif;
            /* border-collapse: collapse; */
            width: 100%;
        }
        td,
        th {
            border: 1px solid #dddddd;
            text-align: left;
            padding: 10px;
        }
        tr:nth-child(even) {
            background-color: #dddddd;
        }
        </style>
        </head>
        <body>
        <table>
        <tr>${Object.keys(convertedJSON[0]).map(tHeaderVal => `<th> ${tHeaderVal}</th>`).join('')}</tr>
        ${convertedJSON.map(tBodyVal => `<tr> ${Object.values(tBodyVal).map(val => `<td> ${val} </td>`).join('')} </tr>`).join('')}
        </table>
        </body>
        </html>`;
        this.push(htmlContent);
        callback();
    }
});