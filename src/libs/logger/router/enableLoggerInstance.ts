const enableLoggerInstance = (logInstance, config) => (req, res, next) => {
  const response = {
    path: req.originalUrl,
    ip: req.headers.host,
    method: req.method,
  };
  config.map((x) => {
    response[x.key] = req[x.location][x.key];
  })
  res.locals.logger = logInstance.child(response);
  next();
}
export default enableLoggerInstance;
