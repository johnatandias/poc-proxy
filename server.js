const express = require('express');
const path = require('path');
const fs = require('fs');
const useragent = require('express-useragent');

const app = express();
const PORT = process.env.PORT || 3000;
const WEBAPP = path.join(`${__dirname}/build/index.html`);

app.use(useragent.express());
app.use(express.static(__dirname + '/build'));

const createMetadataTag = ({ property, content }) =>
  `<meta property="${property}" content="${content}">`;

const injectMetadata = (webAppData, openGraphData) =>
  webAppData
    .replace(/<head>/gm, `<head>${openGraphData}`)
    .replace(/\r?\n|\r/gm, '');

app.get('/*', (request, response) => {
  const { useragent } = request;

  if (useragent.isBot || useragent.browser) {
    const [campaignId] = request.params[0].split('/');
    let webAppData = fs.readFileSync(WEBAPP, 'utf-8');
    webAppData = webAppData.replace('<meta name="description" content="Web site created using create-react-app"/>', '');

    const HOST_URL = `${request.protocol}s://${request.hostname}`;

    const metadata = [
      { property: 'description', content: 'Description of dorime' },
      { property: 'og:title', content: 'Title Dorime' },
      { property: 'og:description', content: 'Description of dorime (og)' },
      { property: 'og:site_name', content: 'Site Name' },
      { property: 'og:url', content: `${HOST_URL}${request.path}` },

      { property: 'og:image', content: `${HOST_URL}/dorime.png` },
      { property: 'og:video', content: `${HOST_URL}/dorime.mp4` },
      { property: 'og:video:secure_url', content: `${HOST_URL}/dorime.mp4` },
      { property: 'og:type', content: 'video' },
      { property: 'og:video:type', content: 'video/mp4' },
      // { property: 'og:video:width', content: '640' },
      // { property: 'og:video:height', content: '360' },
    ];

    const openGraphData = metadata
      .map(data => createMetadataTag(data))
      .join('');

    const responseWith = injectMetadata(webAppData, openGraphData)

    return response.send(responseWith);
  }

  response.sendFile(WEBAPP);
});

app.listen(PORT, () => {
  console.info(`App listening on port ${PORT}!`);
});
