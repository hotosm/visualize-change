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
const set = require("lodash.set");

const Map = require("./map");
const Sidebar = require("./sidebar");

require("normalize.css/normalize.css");
require("mapbox-gl/dist/mapbox-gl.css");
require("@blueprintjs/core/lib/css/blueprint.css");
require("@blueprintjs/icons/lib/css/blueprint-icons.css");
require("@blueprintjs/datetime/lib/css/blueprint-datetime.css");

require("./style.less");

const LanguageMenu = () => (
  <Menu>
    <MenuItem text="English" />
    <MenuItem text="Polish" />
  </Menu>
);

const Main = ({ children }) => <div className="main">{children}</div>;

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      lat: -8.343,
      lng: 115.507,
      zoom: 12,
      date: { start: new Date("2018-01-01"), end: new Date("2018-02-01") },
      interval: "days",
      sliderPos: 0,
      style: {
        roads: {
          enabled: true,
          line: {
            "line-color": "#02D0CA",
            "line-opacity": 0.7,
            "line-width": 1
          },
          highlight: {
            enabled: false,
            "line-color": "#CCF5E1",
            "line-opacity": 0.5,
            "line-width": 1
          }
        },
        "buildings-outline": {
          enabled: true,
          line: {
            "line-color": "#D00244",
            "line-opacity": 0.7,
            "line-width": 1
          },
          highlight: {
            enabled: false,
            "line-color": "#EB96D7",
            "line-opacity": 0.8,
            "line-width": 1
          }
        }
      },
      features: {}
    };
  }

  setCoordinates = ({ lat, lng, zoom }) => {
    this.setState({ lat, lng, zoom });
  };

  onChangeDate = ([start, end]) => {
    this.setState({ date: { start, end } });
  };

  onChangeInterval = interval => {
    this.setState({ interval });
  };

  onStyleChange = (name, value) => {
    this.setState(set(this.state.style, name, value));
  };

  render() {
    console.log(this.state);
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
          <Sidebar
            date={this.state.date}
            interval={this.state.interval}
            style={this.state.style}
            onChangeDate={this.onChangeDate}
            onChangeInterval={this.onChangeInterval}
            onStyleChange={this.onStyleChange}
          />
          <Map
            lat={this.state.lat}
            lng={this.state.lng}
            zoom={this.state.zoom}
            date={this.state.date}
            style={this.state.style}
            setCoordinates={this.setCoordinates}
            onSliderUpdate={this.onSliderUpdate}
            sliderPos={this.state.sliderPos}
          />
        </Main>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById("app"));
