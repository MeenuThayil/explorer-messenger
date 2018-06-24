
const PORT = 3000;
const messageApi = require('./message-api');
const bodyParser = require('body-parser');
const {logger, expressLogger} = require('./logger');

messageApi.set('port', PORT);
messageApi.use(bodyParser.json());
messageApi.use(bodyParser.urlencoded({ extended: true }));
messageApi.use(expressLogger);

messageApi.listen(PORT, () => {
  logger.info(`ExplorerMessenger is listening on port ${PORT}`);
});
