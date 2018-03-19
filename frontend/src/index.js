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
const { push: routerPush } = require("react-router-redux");
const clipboardCopy = require("clipboard-copy");
const { Intent } = require("@blueprintjs/core");
const { createNewExport, getExportById, setAppReady } = require("./actions");
const { isChanged } = require("./selectors");
const { getShareUrl } = require("./utils");
const AppToaster = require("./components/toaster");

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
    const id = this.props.match.params.id;
    if (!id) {
      // this.props.createNewExport();
      this.props.setAppReady();
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
    if (this.props.saving === true && nextProps.saving === false) {
      AppToaster.show({
        message: "Saved successfully",
        intent: Intent.SUCCESS,
        timeout: 5000,
        action: {
          onClick: () => clipboardCopy(getShareUrl(newId)),
          text: "Copy share URL to clipboard"
        }
      });
    }
  }

  componentWillUnmount() {}

  onSaveClick() {
    const parentId = this.props.match.params.id;
    this.props.createNewExport(parentId);
  }

  onToggleViewState() {
    const id = this.props.match.params.id;
    this.props.routerPush(`/${this.isEditing() ? "view" : "edit"}/${id ? id : ""}`);
  }

  render() {
    const isEditing = this.isEditing();
    return (
      <Main>
        <Topbar
          canSave={isEditing && this.props.isChanged}
          saving={this.props.saving}
          isEditing={isEditing}
          onSaveClick={this.onSaveClick}
          onToggleViewState={this.onToggleViewState}
        />
        <Sidebar>{this.isEditing() ? <SidebarEditConnected /> : <SidebarViewConnected />}</Sidebar>
      </Main>
    );
  }
}

const MainContainerConnected = connect(state => ({ isChanged: isChanged(state), saving: state.data.saving }), {
  createNewExport,
  getExportById,
  routerPush,
  setAppReady
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
          <Layout exact path="/view" main={MainContainerConnected} />
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
