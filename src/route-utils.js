import { GET, PUT, POST, PATCH, DELETE } from "./route-constants";

let routes;

const attachRoute = (routeType, endPointURL, controller) => {
  switch (routeType) {
    case GET:
      if (endPointURL.includes(":")) {
        routes.get(endPointURL, controller.show.bind(controller));
      } else {
        routes.get(endPointURL, controller.index.bind(controller));
      }
      break;
    case PUT:
      routes.put(endPointURL, controller.update.bind(controller));
      break;
    case POST:
      routes.post(endPointURL, controller.save.bind(controller));
      break;
    case PATCH:
      routes.patch(endPointURL, controller.index.bind(controller));
      break;
    case DELETE:
      routes.delete(endPointURL, controller.destroy.bind(controller));
      break;
    default:
      console.warn(`Wrong route type: ${routeType}`);
      break;
  }
};

const attachDefaultRoutes = (URL, controller) => {
  attachRoute(PATCH, `/${URL}`, controller);
  attachRoute(POST, `/${URL}`, controller);
  attachRoute(GET, `/${URL}/:id`, controller);
  attachRoute(PUT, `/${URL}/:id`, controller);
  attachRoute(DELETE, `/${URL}/:id`, controller);
};

const loadRoutes = (routesParam) => (routes = routesParam);

export { attachDefaultRoutes, loadRoutes };
