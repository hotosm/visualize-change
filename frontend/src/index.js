const React = require("react");
const ReactDOM = require("react-dom");
const {
  AnchorButton,
  Button,
  ButtonGroup,
  Menu,
  MenuItem,
  Navbar,
  NavbarGroup,
  NavbarHeading,
  Popover,
  Tab,
  Tabs,
  Label
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
      <div className="sidebar-footer__content">Made with love by HOT and friends</div>
    </div>
  </div>
);

const Map = () => <div className="map">MAP</div>;

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
