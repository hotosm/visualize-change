const React = require("react");
const ReactDOM = require("react-dom");
const {
  AnchorButton,
  Button,
  ButtonGroup,
  Icon,
  Label,
  Menu,
  MenuItem,
  Navbar,
  NavbarGroup,
  NavbarHeading,
  Popover,
  ProgressBar,
  Tab,
  Tabs
} = require("@blueprintjs/core");
const { DateRangePicker } = require("@blueprintjs/datetime");

require("normalize.css/normalize.css");
require("mapbox-gl/dist/mapbox-gl.css");
require("@blueprintjs/core/lib/css/blueprint.css");
require("@blueprintjs/icons/lib/css/blueprint-icons.css");
require("@blueprintjs/datetime/lib/css/blueprint-datetime.css");

require("./style.less");

// mapboxgl.accessToken = process.env.MAPBOX_ACCESS_TOKEN;
// const IS_DEBUG = window.location.href.indexOf("debug") > 0;

const LanguageMenu = () => (
  <Menu>
    <MenuItem text="English" />
    <MenuItem text="Polish" />
  </Menu>
);

const Main = ({ children }) => <div className="main">{children}</div>;

const DescribePanel = () => (
  <div>
    <Label text="Name" required={true}>
      <input className="pt-input" />
    </Label>
    <Label text="Description" required={true}>
      <textarea className="pt-input" />
    </Label>
    <Label text="Project" required={true}>
      <input className="pt-input" />
    </Label>
  </div>
);

const DatePanel = () => <DateRangePicker shortcuts={false} contiguousCalendarMonths={false} maxDate={new Date()} />;

const StylePanel = () => <div>TODO</div>;

const Sidebar = () => (
  <div className="sidebar">
    <div className="sidebar-content">
      <Tabs animate={true} id="SidebarTabs" renderActiveTabPanelOnly={true}>
        <Tab id="Describe" title="Describe" panel={<DescribePanel />} />
        <Tab id="Date" title="Date" panel={<DatePanel />} />
        <Tab id="Style" title="Style" panel={<StylePanel />} />
      </Tabs>
    </div>

    <div className="sidebar-footer">
      <div className="sidebar-footer__content">
        <span>Made with </span>
        <Icon icon="heart" iconSize={12} style={{ marginTop: 3 }} />
        <span> by HOT and friends</span>
      </div>
    </div>
  </div>
);

const Map = () => (
  <div className="map">
    <div className="map-content">MAP</div>
    <div className="map-footer">
      <div className="map-footer__content">
        <div className="map-footer__items">
          <Button className="pt-minimal" icon="play" />
          <div className="map-footer__progressbar">
            <ProgressBar value={0.5} className="pt-no-animation pt-no-stripes" />
          </div>
          <ButtonGroup minimal={true}>
            <Button icon="fullscreen" />
            <Button icon="share" />
          </ButtonGroup>
        </div>
        <div className="map-footer__date">May 15, 2019 09:00AM</div>
      </div>
    </div>
  </div>
);

class App extends React.Component {
  render() {
    return (
      <div className="container">
        <Navbar>
          <NavbarGroup>
            <NavbarHeading>HOT Visualize Change</NavbarHeading>
          </NavbarGroup>

          <NavbarGroup align="right">
            <ButtonGroup minimal={true}>
              <Button>About</Button>
              <Button>Learn</Button>
              <Button>Create</Button>

              <Popover content={<LanguageMenu />}>
                <AnchorButton rightIcon="caret-down">English</AnchorButton>
              </Popover>
            </ButtonGroup>
          </NavbarGroup>
        </Navbar>

        <Main>
          <Sidebar />
          <Map />
        </Main>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById("app"));
