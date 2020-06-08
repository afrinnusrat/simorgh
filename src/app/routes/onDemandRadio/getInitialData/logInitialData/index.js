import path from 'ramda/src/path';
import nodeLogger from '#lib/logger.node';
import { RADIO_EPISODE_EXPIRED } from '#lib/logger.const';

const logger = nodeLogger(__filename);

const parsePageIdentifier = pageIdentifier => {
  const pathParts = pageIdentifier.split('.');
  if (pathParts.slice(-1)[0] === 'page') {
    pathParts.pop();
  }
  const uri = pathParts.join('/');
  return uri;
};

const getUri = pageJson => {
  const pageIdentifier = path(
    ['metadata', 'analyticsLabels', 'pageIdentifier'],
    pageJson,
  );
  const pageUri = parsePageIdentifier(pageIdentifier);
  return pageUri;
};

const logExpiredEpisode = pageJson => {
  logger.info(RADIO_EPISODE_EXPIRED, {
    url: getUri(pageJson),
  });
};

// const pathWithValidation = pageData => {
// }

export { logExpiredEpisode, parsePageIdentifier };
