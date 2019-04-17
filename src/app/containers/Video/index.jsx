import React from 'react';
import Figure from '@bbc/psammead-figure';
import Video from '../../components/Video';
import Caption from '../Caption';

import {
  videoPropTypes,
  emptyBlockArrayDefaultProps,
} from '../../models/propTypes';
import { filterForBlockType } from '../../helpers/blockHandlers';

const VideoContainer = ({ blocks }) => {
  const rawVideo = filterForBlockType(blocks, 'rawVideo');

  if (!rawVideo) {
    return null;
  }

  const { locator: videoLocator, duration, versionID, kind } = rawVideo.model;

  const imageBlock = filterForBlockType(blocks, 'image');

  if (!imageBlock) {
    return null;
  }

  const rawImage = filterForBlockType(imageBlock.model.blocks, 'rawImage');

  if (!rawImage) {
    return null;
  }

  const captionBlock = filterForBlockType(blocks, 'caption');

  const { locator: imageLocator } = rawImage.model;
  const rawImageSrc = `https://ichef.bbci.co.uk/news/640${imageLocator}`;

  return (
    <Figure>
      <Video
        videoLocator={videoLocator}
        duration={duration}
        rawImageSrc={rawImageSrc}
        versionID={versionID}
        imageLocator={imageLocator}
        kind={kind}
      />
      {captionBlock ? <Caption block={captionBlock} video /> : null}
    </Figure>
  );
};

VideoContainer.propTypes = videoPropTypes;

VideoContainer.defaultProps = emptyBlockArrayDefaultProps;

export default VideoContainer;
