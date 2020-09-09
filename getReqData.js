const {parse} = require('querystring');

exports.collectRequestData = function(request, callback) {

        let body = '';
        let parsedBody = [];
        request.on('data', chunk => {
            body += chunk.toString();
            if(body.includes("%40"))
            {
                let splitBody = body.split("%40");
                splitBody[0] += "@";
                body = splitBody.join("");
            }

        });
        request.on('end', () => {
            parsedBody = parse(body);
            callback(parsedBody);
        });
};
