const React = require("react");
const ReactDOM = require("react-dom");
const { Provider } = require("react-redux");
const { ConnectedRouter } = require("react-router-redux");
const createHistory = require("history/createBrowserHistory").default;
const { Route, Switch } = require("react-router-dom");
const classNames = require("classnames");
const { Link } = require("react-router-dom");

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

const Main = ({ isFullScreenMode, children }) => (
  <div className={classNames("main", { "full-screen-mode": isFullScreenMode })}>{children}</div>
);

const autoBind = require("react-autobind");
const { connect } = require("react-redux");
const { push: routerPush } = require("react-router-redux");
const clipboardCopy = require("clipboard-copy");
const { Intent } = require("@blueprintjs/core");
const {
  createNewExport,
  getExportById,
  setAppReady,
  setNewEdit,
  showPlayerPanel,
  showExportMenu
} = require("./actions");
const { isChanged, isEditMode } = require("./selectors");
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

  onUnload(ev) {
    ev.preventDefault();
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

    if (nextProps.isChanged === true) {
      window.addEventListener("beforeunload", this.onUnload);
    } else {
      window.removeEventListener("beforeunload", this.onUnload);
    }
  }

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
    const id = this.props.match.params.id;
    return (
      <Main>
        <Topbar
          canSave={isEditing && this.props.isChanged}
          saving={this.props.saving}
          isEditing={isEditing}
          onShareClick={this.props.showExportMenu}
          path={isEditing ? "edit" : "view"}
          onSaveClick={this.onSaveClick}
          id={id}
          isFullScreenMode={this.props.isFullScreenMode}
        />
        <Sidebar>{this.isEditing() ? <SidebarEditConnected /> : <SidebarViewConnected />}</Sidebar>
      </Main>
    );
  }
}

const MainContainerConnected = connect(
  state => ({ isChanged: isChanged(state), saving: state.data.saving, isFullScreenMode: state.ui.fullScreenMode }),
  {
    createNewExport,
    getExportById,
    routerPush,
    setAppReady,
    setNewEdit,
    showExportMenu
  }
)(MainContainer);

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

const MapWrapper = connect(
  ({ ui, router }) => ({ isFullScreenMode: ui.fullScreenMode, loaded: ui.loaded, editMode: isEditMode(router) }),
  {
    showPlayerPanel
  }
)(({ loaded, isFullScreenMode, showPlayerPanel, editMode }) => {
  return (
    <div
      className={classNames("map-wrapper", { "edit-mode": editMode })}
      onMouseMove={isFullScreenMode ? showPlayerPanel : null}
    >
      {loaded ? <MapConnected /> : null}
    </div>
  );
});

const AboutPage = () => (
  <div className="about-page">
    <Topbar
      canSave={false}
      saving={false}
      isEditing={false}
      path="about"
      onSaveClick={() => {}}
      onToggleViewState={() => {}}
      isFullScreenMode={false}
    />
    <div className="about-page__content">
      <h2>Visualize OpenStreetMap</h2>
      <p>
        The Visualize Change tool is an open service that creates customised animations of OpenStreetMap data mapped
        over time for an area of interest. Share these mapping visualizations easily through various file formats.
      </p>
      <Link to="/edit" className="pt-button action-button start-button">
        Click here to create visualization
      </Link>
    </div>
  </div>
);

const LearnPage = () => (
  <div className="about-page">
    <Topbar
      canSave={false}
      saving={false}
      path="learn"
      isEditing={false}
      onSaveClick={() => {}}
      onToggleViewState={() => {}}
      onShareClick={null}
      isFullScreenMode={false}
    />
    <div className="about-page__content">
      <h2>Learn Page</h2>
      <p>Content how to use</p>
    </div>
  </div>
);

const AppContainer = () => (
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <div className="hot-theme">
        <Switch>
          <Layout exact path="/" main={AboutPage} />
          <Layout exact path="/learn" main={LearnPage} />
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
// <Route exact path="/" render={() => <Redirect to="/edit" />} />

ReactDOM.render(<AppContainer />, document.getElementById("app"));
