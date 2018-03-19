const React = require("react");
const ReactDOM = require("react-dom");
const { Provider } = require("react-redux");
const { ConnectedRouter } = require("react-router-redux");
const createHistory = require("history/createBrowserHistory").default;
const { Route, Switch, Redirect } = require("react-router-dom");

const configureStore = require("./store");

const Sidebar = require("./components/sidebar");
const Topbar = require("./components/topbar");
const MapConnected = require("./components/map");

const SidebarEditConnected = require("./components/sidebar-edit");
const SidebarViewConnected = require("./components/sidebar-view");
const ExportMenuConnected = require("./components/export-window");

require("normalize.css/normalize.css");
require("mapbox-gl/dist/mapbox-gl.css");
require("mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css");
require("@blueprintjs/core/lib/css/blueprint.css");
require("@blueprintjs/icons/lib/css/blueprint-icons.css");
require("@blueprintjs/datetime/lib/css/blueprint-datetime.css");

require("./style.less");

const history = createHistory();

const store = configureStore({ history });

const Main = ({ children }) => <div className="main">{children}</div>;

const autoBind = require("react-autobind");
const { connect } = require("react-redux");
const { createNewExport, getExportById, updateExport } = require("./actions");
const { push: routerPush } = require("react-router-redux");

class MainContainer extends React.Component {
  constructor(props) {
    super(props);
    autoBind(this);
  }

  isEditing(selectedProps) {
    const props = selectedProps || this.props;
    return props.match.path.split("/")[1] === "edit";
  }

  componentDidMount() {
    const isEditing = this.isEditing();
    const id = this.props.match.params.id;
    if (isEditing && !id) {
      this.props.createNewExport();
    } else {
      this.props.getExportById(id);
    }
  }

  componentWillReceiveProps(nextProps) {
    const prevId = this.props.match.params.id;
    const newId = nextProps.match.params.id;
    if (prevId !== newId && !!newId) {
      this.props.getExportById(newId);
    }
  }

  componentWillUnmount() {}

  onSaveClick() {
    const id = this.props.match.params.id;
    this.props.updateExport(id);
  }

  onToggleViewState() {
    const id = this.props.match.params.id;
    this.props.routerPush(`/${this.isEditing() ? "view" : "edit"}/${id}`);
  }

  render() {
    return (
      <Main>
        <Topbar
          isEditable={true}
          isEditing={this.isEditing()}
          onSaveClick={this.onSaveClick}
          onToggleViewState={this.onToggleViewState}
        />
        <Sidebar>{this.isEditing() ? <SidebarEditConnected /> : <SidebarViewConnected />}</Sidebar>
      </Main>
    );
  }
}

const MainContainerConnected = connect(({ ui }) => ({ loaded: ui.loaded }), {
  createNewExport,
  getExportById,
  updateExport,
  routerPush
})(MainContainer);

const Layout = ({ path, exact, main: MainComponent }) => (
  <Route
    path={path}
    exact={exact}
    render={props => (
      <div className="container">
        <MainComponent {...props} />
      </div>
    )}
  />
);

const MapWrapper = connect(({ ui }) => ({ loaded: ui.loaded }))(({ loaded }) => {
  return loaded ? <MapConnected /> : null;
});

const AppContainer = () => (
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <div>
        <Switch>
          <Route exact path="/" render={() => <Redirect to="/edit" />} />
          <Layout exact path="/edit" main={MainContainerConnected} />
          <Layout exact path="/edit/:id" main={MainContainerConnected} />
          <Layout exact path="/view/:id" main={MainContainerConnected} />
          <Layout exact path="/about" />
        </Switch>
        <MapWrapper />
        <ExportMenuConnected />
      </div>
    </ConnectedRouter>
  </Provider>
);

ReactDOM.render(<AppContainer />, document.getElementById("app"));
