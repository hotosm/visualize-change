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
  Popover
} = require("@blueprintjs/core");

require("normalize.css/normalize.css");
require("mapbox-gl/dist/mapbox-gl.css");
require("@blueprintjs/core/lib/css/blueprint.css");

// mapboxgl.accessToken = process.env.MAPBOX_ACCESS_TOKEN;
// const IS_DEBUG = window.location.href.indexOf("debug") > 0;

const LanguageMenu = () => (
  <Menu>
    <MenuItem text="English" />
    <MenuItem text="Polish" />
  </Menu>
);

class App extends React.Component {
  render() {
    return (
      <div>
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
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById("app"));
