import dotenv from 'dotenv';
import { createReadStream, createWriteStream } from 'fs';
import { logger } from './src/logger.js';
import { getFilePathAndName, isInputFilePathExists, isOutputFormatIsHtml, getJsonObj, createOutputFolder } from './src/utility.js';
import { transformCSVToJSON, transformJSONToHTML } from './src/transforms.js';
import { OUTPUT_DIR_NAME, HTML_FORMAT } from './src/constants.js';

dotenv.config();

const inputFileObj = getFilePathAndName();

if (isInputFilePathExists(inputFileObj)) {
    try {
        const readStream = createReadStream(inputFileObj.path, 'utf8')
            .on('data', () => logger.info('File Read successfully'))
            .on('error', (err) => logger.info('Failed to Read file,', err));

        const csvTojson = readStream.pipe(transformCSVToJSON());

        if (isOutputFormatIsHtml(process.env.OUTPUT_FORMAT)) {
            createOutputFolder();
            const writeStream = createWriteStream(`${OUTPUT_DIR_NAME}/${inputFileObj.name}.${HTML_FORMAT}`)
                .on('finish', () => logger.info('File Writing Done'))
                .on('error', (err) => logger.error('Failed to Write file', err));
            csvTojson.pipe(transformJSONToHTML).pipe(writeStream);
        }
        else {
            await getJsonObj(csvTojson);
            logger.info('JSON object returned successfully');
        }

    } catch (err) {
        logger.error('Error occured in csv-html-converter,', err)
    }
} else {
    logger.warn('Filepath is required.');
}
