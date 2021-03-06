import isEmpty from 'ramda/src/isEmpty';
import { STORY_PAGE, MEDIA_ASSET_PAGE } from '#app/routes/utils/pageTypes';
import getAssetType from './getAssetType';
import getAssetUri from './getAssetUri';
import hasRecommendations from './hasRecommendations';
import fetchPageData from '../../utils/fetchPageData';
import { getMostReadEndpoint } from '#lib/utilities/getMostReadUrls';
import getMostWatchedEndpoint from '#lib/utilities/getMostWatchedUrl';
import getSecondaryColumnUrl from '#lib/utilities/getSecondaryColumnUrl';
import getRecommendationsUrl from '#lib/utilities/getRecommendationsUrl';

const noop = () => {};

const pageTypeUrls = async (
  assetType,
  service,
  variant,
  assetUri,
  pageData,
  env,
) => {
  switch (assetType) {
    case STORY_PAGE:
      return [
        {
          name: 'mostRead',
          path: getMostReadEndpoint({ service, variant }).replace('.json', ''),
          assetUri,
        },
        {
          name: 'secondaryColumn',
          path: getSecondaryColumnUrl({ service, variant }),
          assetUri,
        },
        (await hasRecommendations(service, variant, pageData))
          ? {
              name: 'recommendations',
              path: getRecommendationsUrl({ assetUri, variant }),
              assetUri,
            }
          : null,
      ].filter(i => i);
    case MEDIA_ASSET_PAGE:
      return [
        {
          name: 'mostWatched',
          path: getMostWatchedEndpoint({ service, variant, env }),
          assetUri,
        },
      ];
    default:
      return null;
  }
};

const validateResponse = ({ status, json }, name) => {
  if (status === 200 && !isEmpty(json)) {
    return { [name]: json };
  }

  return null;
};

const fetchUrl = ({ name, path, ...loggerArgs }) =>
  fetchPageData({ path, ...loggerArgs })
    .then(response => validateResponse(response, name))
    .catch(noop);

const getAdditionalPageData = async ({ pageData, service, variant, env }) => {
  const assetType = getAssetType(pageData);
  const assetUri = getAssetUri(pageData);

  const urlsToFetch = await pageTypeUrls(
    assetType,
    service,
    variant,
    assetUri,
    pageData,
    env,
  );

  if (urlsToFetch) {
    return Promise.all(urlsToFetch.map(fetchUrl)).then(results =>
      Object.assign({}, ...results),
    );
  }

  return null;
};

export default getAdditionalPageData;
