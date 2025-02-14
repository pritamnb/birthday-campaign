import { StatusCodes, SystemResponse } from '../../response-handler';
import { levels } from '../constants/constants';

/**
 * 
 * @param app 
 * @param logInstance 
 * @return
 * "Debug": true → Log level is now DEBUG
 * "Debug": false → Log level is now INFO
 */
const enableDebugger = (app, logInstance) => {
    app.use('/debug', (req, res) => {
        logInstance.level === levels.INFO ? logInstance.level = levels.DEBUG : logInstance.level = levels.INFO;
        return res.status(StatusCodes.SUCCESS).send(
            SystemResponse.success('Debugger', {
                Debug: logInstance.level === levels.DEBUG,
            }),
        );
    });
};

export default enableDebugger;
