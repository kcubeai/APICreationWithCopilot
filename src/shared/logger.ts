
import log4js from 'log4js'
log4js.configure({
    appenders: {
        out: { type: 'stdout' },
        app: { type: 'file', filename: 'src/shared/logs/info.log' }
    },
    categories: {
        default: { appenders: ['out', 'app'], level: 'debug' }
    }
});
export const logger = log4js.getLogger();