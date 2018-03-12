const React = require("react");
const ReactDOM = require("react-dom");
const { Provider } = require("react-redux");

const configureStore = require("./store");

const Topbar = require("./components/topbar");
const MapConnected = require("./components/map");
const SidebarConnected = require("./components/sidebar");
const ExportMenuConnected = require("./components/export-window");

require("normalize.css/normalize.css");
require("mapbox-gl/dist/mapbox-gl.css");
require("mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css");
require("@blueprintjs/core/lib/css/blueprint.css");
require("@blueprintjs/icons/lib/css/blueprint-icons.css");
require("@blueprintjs/datetime/lib/css/blueprint-datetime.css");

require("./style.less");

const store = configureStore();

const Main = ({ children }) => <div className="main">{children}</div>;

const App = () => (
  <div className="container">
    <Topbar />
    <Main>
      <ExportMenuConnected />
      <SidebarConnected />
      <MapConnected />
    </Main>
  </div>
);

const AppContainer = () => (
  <Provider store={store}>
    <App />
  </Provider>
);

ReactDOM.render(<AppContainer />, document.getElementById("app"));
