import { useEffect, useLayoutEffect, useState, useRef } from 'react';
import { renderRoutes } from 'react-router-config';
import { withRouter } from 'react-router';
import pick from 'ramda/src/pick';
import merge from 'ramda/src/merge';
import path from 'ramda/src/path';
import getRouteProps from '#app/routes/utils/fetchPageData/utils/getRouteProps';
import usePrevious from '#lib/utilities/usePrevious';
import getToggles from '#app/lib/utilities/getToggles';
import routes from '#app/routes';

const mapToState = ({ pathname, initialData, routeProps, toggles }) => {
  const pageType = path(['route', 'pageType'], routeProps);
  const state = pick(
    [
      'service',
      'isAmp',
      'variant',
      'id',
      'assetUri',
      'errorCode',
      'pageData',
      'status',
      'error',
      'timeOnServer',
      'errorCode',
    ],
    merge(routeProps, initialData),
  );

  return merge(state, {
    pathname,
    pageType,
    toggles,
    loading: false,
  });
};

const getNextPageState = async pathname => {
  const routeProps = getRouteProps(pathname);
  const { service, variant, route } = routeProps;
  const { pageType, getInitialData } = route;
  const toggles = await getToggles(service);
  const initialData = await getInitialData({
    path: pathname,
    service,
    variant,
    pageType,
    toggles,
  });

  return mapToState({ pathname, initialData, routeProps, toggles });
};

const setFocusOnMainHeading = () => {
  const mainHeadingEl = document.querySelector('h1#content');

  if (mainHeadingEl) {
    mainHeadingEl.focus();
  }
};

export const App = ({ location, initialData, bbcOrigin, history }) => {
  const { pathname } = location;
  const hasMounted = useRef(false);
  const routeProps = getRouteProps(pathname);
  const previousLocationPath = usePrevious(pathname);
  const previousPath = history.action === 'POP' ? null : previousLocationPath; // clear the previous path on back clicks
  const { showAdsBasedOnLocation, toggles } = initialData;
  const [state, setState] = useState(
    mapToState({
      pathname,
      initialData,
      routeProps,
      toggles,
    }),
  );
  const routeHasChanged = state.pathname !== pathname;

  useEffect(() => {
    if (hasMounted.current) {
      getNextPageState(pathname).then(setState);
    } else {
      hasMounted.current = true;
    }
  }, [pathname]);

  useLayoutEffect(() => {
    if (hasMounted.current) {
      if (routeHasChanged) {
        window.scrollTo(0, 0);
      } else {
        setFocusOnMainHeading();
      }
    }
  }, [routeHasChanged]);

  return renderRoutes(routes, {
    ...state,
    bbcOrigin,
    previousPath,
    loading: routeHasChanged,
    showAdsBasedOnLocation,
  });
};

export default withRouter(App);
