import fs from 'fs';
import { logger } from './logger.js';
import { FILEPATH_NAME, HTML_FORMAT, FORMAT_TABLE_VAL_REGEX, OUTPUT_DIR_NAME, CSV_FILE_TYPE } from './constants.js';

const formatString = (str) => {
    return str.replace(/"/gi, '').replace(/^\,/, '').trim();
};

// Get seperated file path and file name from input filepath
export const getFilePathAndName = () => {
    const filePathIdx = process.argv.indexOf(FILEPATH_NAME);
    const path = process.argv[filePathIdx + 1];
    if (filePathIdx > 0 && process.argv[filePathIdx + 1] && exceuteRegexPattern(path, CSV_FILE_TYPE)) {
        const splitInputFileName = process.argv[filePathIdx + 1].split('/');
        const name = splitInputFileName.length ? splitInputFileName[splitInputFileName.length - 1].replace('.csv', '') : splitInputFileName;
        return { filePathIdx, path, name };
    }
};

// Match given value with given Regex pattern
export const exceuteRegexPattern = (val, reg) => {
    return reg.exec(val);
};

// Get formated table headers
export const getFormatedHeader = (headers) => {
    try {
        const formatedHeadVal = [];
        if (headers.length) formatedHeadVal.push(formatString(headers[0]));
        headers.forEach((headVal, headIdx) => {
            if (exceuteRegexPattern(headVal, FORMAT_TABLE_VAL_REGEX)) {
                formatedHeadVal.push(formatString(headVal));
            }
            else {
                const subHeader = headVal.split(',');
                if (formatedHeadVal.length && subHeader.length && headIdx > 0) {
                    formatedHeadVal[formatedHeadVal.length - 1] = `${formatedHeadVal[formatedHeadVal.length - 1]} ${subHeader[0]}`;
                    subHeader.forEach((sub, idx) => (idx > 0) && formatedHeadVal.push(formatString(sub)));
                }
            }
        });
        return formatedHeadVal;
    } catch (err) { logger.error('Error occured in get formated header', err); }
};

// Get formated table body
export const getFormatedBody = (lines, headerEndIdex) => {
    try {
        const formatedBodyVal = [];
        lines.forEach((val, idx) => {
            if (idx > headerEndIdex) {
                const splitedRowData = val.split('",');
                splitedRowData.forEach(splitVal => {
                    if (exceuteRegexPattern(splitVal, FORMAT_TABLE_VAL_REGEX)) {
                        formatedBodyVal.push(splitVal.replace(/"/gi, '').trim());
                    }
                    else {
                        const tempSplitVal = splitVal.split(',"')
                        tempSplitVal.forEach(t => formatedBodyVal.push(t));
                    }
                });
            }
        });
        return formatedBodyVal;
    } catch (err) { logger.error('Error occured in get formated body', err); }
};

// Construct JSON from headears and body array value
export const constructJson = (headers, body) => {
    try {
        const jsonArr = []; let jsonBuild = {};
        body.forEach((bodyVal, bodyIdx) => {
            const headIdx = bodyIdx < headers.length ? bodyIdx : bodyIdx % headers.length;
            jsonBuild[headers[headIdx]] = bodyVal;
            if (headIdx === headers.length - 1) {
                jsonArr.push(jsonBuild);
                jsonBuild = {};
            }
        });
        return jsonArr;
    } catch (err) { logger.error('Error occured in constructing json', err); }
};

export const isInputFilePathExists = (inputFileObj) => {
    return inputFileObj && inputFileObj.filePathIdx > 0 && inputFileObj.path;
};

export const isOutputFormatIsHtml = (outputFormat) => {
    return outputFormat === HTML_FORMAT;
};


export const getJsonObj = async (csvTojsonStream) => {
    let result = '';
    return new Promise((resolve, reject) => {
        csvTojsonStream.on('data', (data) => {
            result += data;
        });
        csvTojsonStream.on('finish', () => {
            resolve(result);
        });
        csvTojsonStream.on('error', () => {
            reject(result);
        });
    });
};

export const createOutputFolder = () => {
    if (!fs.existsSync(OUTPUT_DIR_NAME)) {
        fs.mkdirSync(OUTPUT_DIR_NAME);
    }
};
