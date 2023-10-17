
import log4js from 'log4js'
import moment from 'moment';
var date = moment().format('YYYY_MM_DD');
log4js.configure({
    appenders: {
        out: { type: 'stdout' },
        app: { type: 'file', filename: 'src/shared/logs/info_' + date + '.log' }
    },
    categories: {
        default: { appenders: ['out', 'app'], level: 'debug' }
    }
});
export const logger = log4js.getLogger();