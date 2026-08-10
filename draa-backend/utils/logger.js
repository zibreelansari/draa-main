const pino = require('pino-http');
const { v4: uuidv4 } = require('uuid');
const colors = require('colors');

// Custom stream for development to format JSON logs into beautiful colored outputs
const devStream = {
  write: (msg) => {
    try {
      const log = JSON.parse(msg);

      // If it's a request completion log:
      if (log.req && log.res) {
        const time = new Date(log.time).toLocaleTimeString();
        const method = log.req.method;
        const url = log.req.url;
        const status = log.res.statusCode;
        const duration = log.responseTime;

        // Colorize HTTP Method
        let methodColored = method;
        if (method === 'GET') methodColored = method.green;
        else if (method === 'POST') methodColored = method.yellow;
        else if (method === 'PUT' || method === 'PATCH') methodColored = method.blue;
        else if (method === 'DELETE') methodColored = method.red;

        // Colorize HTTP Status Code
        let statusColored = status.toString();
        if (status >= 200 && status < 300) statusColored = statusColored.green;
        else if (status >= 300 && status < 400) statusColored = statusColored.cyan;
        else if (status >= 400 && status < 500) statusColored = statusColored.yellow.bold;
        else if (status >= 500) statusColored = statusColored.red.bold;

        // Construct detailed log line
        let details = `[${time}] ${methodColored} ${url} ${statusColored} - ${duration}ms`;

        // Add Client IP Address
        const ip = log.remoteAddress || log.req?.remoteAddress || '';
        if (ip) {
          details += ` | IP: ${ip.replace('::ffff:', '')}`;
        }

        // Add Referer Page Path
        const referer = log.req?.headers?.referer || '';
        if (referer) {
          try {
            const refUrl = new URL(referer);
            details += ` | Page: ${refUrl.pathname}`;
          } catch {
            details += ` | Page: ${referer}`;
          }
        }

        // Add Query Parameters if any
        if (log.req?.query && Object.keys(log.req.query).length > 0) {
          details += ` | Query: ${JSON.stringify(log.req.query)}`;
        }

        // Add Trace ID
        if (log.traceId) {
          details += ` | Trace: ${log.traceId.slice(0, 8)}`;
        }

        console.log(details);

        // If there was an error in the request:
        if (log.err) {
          console.log(`   └─ ❌ ${'ERROR:'.red} ${log.err.message || log.err}`);
          if (log.err.stack) {
            const stackSnippet = log.err.stack.split('\n').slice(0, 3).join('\n   ');
            console.log(`   ${stackSnippet}`);
          }
        }
      } else if (log.msg) {
        // Standard logging messages (like DB Connected, etc.)
        const time = new Date(log.time).toLocaleTimeString();
        let levelStr = 'INFO';
        if (log.level === 30) levelStr = 'INFO'.green;
        else if (log.level === 40) levelStr = 'WARN'.yellow;
        else if (log.level >= 50) levelStr = 'ERROR'.red;

        console.log(`[${time}] [${levelStr}] ${log.msg}`);
      } else {
        // Fallback for other log shapes
        process.stdout.write(msg);
      }
    } catch (err) {
      process.stdout.write(msg);
    }
  }
};

const isDev = process.env.NODE_ENV !== 'production';

const logger = pino({
  genReqId: (req) => req.headers['x-request-id'] || uuidv4(),
  customProps: (req, res) => ({
    traceId: req.id,
  }),
  serializers: {
    req: (req) => ({
      id: req.id,
      method: req.method,
      url: req.url,
      query: req.query || {},
      params: req.params || {},
      headers: req.headers,
      remoteAddress: req.remoteAddress,
      remotePort: req.remotePort,
    }),
    res: (res) => ({
      statusCode: res.statusCode,
      headers: res.getHeaders ? res.getHeaders() : res.headers,
    }),
  },
  customSuccessMessage: (req, res, responseTime) => 'request completed',
  customErrorMessage: (req, res, err) => `request failed: ${err.message}`,
  customResponseKey: 'responseTime',
}, isDev ? devStream : undefined);

module.exports = logger;
