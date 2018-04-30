const React = require("react");
const ReactDOM = require("react-dom");
const { Provider } = require("react-redux");
const { ConnectedRouter } = require("react-router-redux");
const createHistory = require("history/createBrowserHistory").default;
const { Route, Redirect, Switch } = require("react-router-dom");
const classNames = require("classnames");

const configureStore = require("./store");

const Sidebar = require("./components/sidebar");
const Topbar = require("./components/topbar");
const MapConnected = require("./components/map");
const { PAGE_TITLE } = require("./constans/index");

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
  showExportMenu,
  showPopover,
  setCoordinates
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
    const isFirstStarted = !localStorage.getItem("hot-changevis-used");
    if (isFirstStarted) {
      this.props.showPopover("main-help");
      localStorage.setItem("hot-changevis-used", true);
    }
    if (!id) {
      // getLocation(this.props.setCoordinates);
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
    if (!newId) {
      this.props.setAppReady();
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
    showExportMenu,
    showPopover,
    setCoordinates
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

const setDocumentTitle = title => (document.title = title);

const { Button } = require("@blueprintjs/core");
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
      <p>
        Welcome to the Animation toolkit for <a href="http://www.openstreetmap.org">OpenStreetMap </a>. With this
        platform you can create and save visualizations of your OpenStreetMap edits. These animations can provide you
        with an overall view of OpenStreetMap roads and buildings edits as well as the evolving community contributions
        for a specific area. You can find additional information on the functionality and constraints of each section on
        the
        <Button className="help-button" icon="help" />
        icons.
      </p>
      <h3>Overview</h3>
      <h5>Search</h5>
      <p>
        Search for your area of interest either by using the Search field on the upper righthand corner of the map panel
        or by selecting an custom area. Similar to other standard OpenStreetMap navigation maps, a bounding or mouse
        scroll can center you in a place.
      </p>
      <h5>Zoom Levels</h5>
      <p>
        The OpenStreetMap Animation tool kit is designed for{" "}
        <a href="https://wiki.openstreetmap.org/wiki/Zoom_levels">Zoom levels 12 and higher</a>. This starts from a town
        perspective (zoom 12) and becomes detailed to zoom 19. To create an animation of edits for larger geographic
        region, we recommend setting up your own instance. You can find instructions on how to do that in the GitHub
        readme <a href="https://github.com/hotosm/visualize-change">here</a>.
      </p>
      <h5>Save</h5>
      <p>
        Your animations are stored locally in your browser until you choose to Save them to the HOT server. Once you are
        happy with your animation -- save it! - and share with others.
      </p>
      <h5>Share</h5>
      <p>
        Share your edit animations with your friends and networks with the
        <Button icon="share">Share</Button>
        button located on the on the right side of the main menu.This button provides you a stable URL for a saved map
        and the option to export the data file as an MP4 or GIF. Downloaded animations will be emailed you and available
        on the server for 2 days.
      </p>
      <h5>Additional Features</h5>
      <ol>
        <li>
          Preview: Play your animation while creating with the “Play” overlay found on the bottom of your map pane.
          <Button className="pt-minimal play-btn" icon="play" size={20} />
        </li>

        <li>Date: The progression of your dates of edit can be followed on the right hand side of the play bar.</li>

        <li>
          Full Screen: Want to see your edit animation in the fullscreen of your browser? Select the expand button on
          the lower left side of the play bar.
        </li>

        <li>
          Loading: Changes to your animation will take time to fully render in your browser. Watch for progress with the
          loading animation overlaid on the map when rendering.
        </li>
      </ol>
      <h3>Open Source</h3>
      <p>
        The Animation toolkit is a collaborative open source project initially created in partnership with HOT and
        [funder here]. The source code is available on <a href="https://github.com/hotosm/visualize-change">Github</a>
      </p>
      <p>
        You can help the Toolkit by translating or reporting bugs
        <a href="https://github.com/hotosm/visualize-change/issues">on Github Issues</a>
      </p>
    </div>
  </div>
);

const AppContainer = () => {
  setDocumentTitle(PAGE_TITLE);
  return (
    <Provider store={store}>
      <ConnectedRouter history={history}>
        <div className="hot-theme">
          <Switch>
            <Route exact path="/" render={() => <Redirect to="/edit" />} />
            <Layout exact path="/edit" main={MainContainerConnected} />
            <Layout exact path="/edit/:id" main={MainContainerConnected} />
            <Layout exact path="/view" main={MainContainerConnected} />
            <Layout exact path="/view/:id" main={MainContainerConnected} />
            <Layout exact path="/learn" main={LearnPage} />
          </Switch>
          <MapWrapper />
          <ExportMenuConnected />
        </div>
      </ConnectedRouter>
    </Provider>
  );
};

ReactDOM.render(<AppContainer />, document.getElementById("app"));
