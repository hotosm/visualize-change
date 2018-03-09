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
  Card,
  Elevation,
  Overlay
} = require("@blueprintjs/core");
const set = require("lodash.set");
const moment = require("moment");

const Map = require("./map");
const Sidebar = require("./sidebar");

require("normalize.css/normalize.css");
require("mapbox-gl/dist/mapbox-gl.css");
require("mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css");
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

class ExportMenu extends React.Component {
  constructor() {
    super();
    this.state = { email: "your-email-address@domain.com", fps: 10, format: "video" };
  }

  onEmailChange = ev => {
    this.setState({ email: ev.target.value });
  };

  onFormatChange = ev => {
    this.setState({ format: ev.target.value });
  };

  onFPSChange = ev => {
    this.setState({ fps: ev.target.value });
  };

  onExportClick = () => {
    this.props.onRenderClick({ email: this.state.email, fps: this.state.fps, format: this.state.format });
  };

  render() {
    return (
      <Card elevation={Elevation.FOUR} className="export-menu">
        <h4>Export</h4>
        <div className="form-body">
          <label className="inline-label">
            E-mail:
            <input value={this.state.email} onChange={this.onEmailChange} className="pt-input" />
          </label>
          <label className="inline-label">
            Format
            <div className="pt-select">
              <select onChange={this.onFormatChange}>
                <option value="video">Video</option>
                <option value="gif">GIF</option>
              </select>
            </div>
          </label>
          <label className="inline-label">
            FPS
            <input value={this.state.fps} onChange={this.onFPSChange} className="pt-input" />
          </label>
          <Button icon="share" onClick={this.onExportClick}>
            Export
          </Button>
        </div>
      </Card>
    );
  }
}

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      lat: -8.343,
      lng: 115.507,
      zoom: 12,
      date: { start: new Date("2018-01-01"), end: new Date("2018-02-01") },
      interval: "days",
      format: "video",
      fps: 10,
      email: "test@test.test",
      style: {
        roads: {
          enabled: true,
          base: {
            "line-color": {
              r: 2,
              g: 208,
              b: 202,
              a: 0.7
            },
            "line-width": 1
          },
          highlight: {
            enabled: true,
            "line-color": {
              r: 204,
              g: 245,
              b: 225,
              a: 0.5
            },
            "line-width": 1
          }
        },
        "buildings-outline": {
          enabled: true,
          base: {
            "line-color": {
              r: 208,
              g: 2,
              b: 68,
              a: 0.7
            },
            "line-width": 1
          },
          highlight: {
            enabled: true,
            "line-color": {
              r: 235,
              g: 150,
              b: 215,
              a: 1
            },
            "line-width": 1
          }
        }
      },
      displayExportMenu: false
    };
  }

  setCoordinates = ({ lat, lng, zoom }) => {
    this.setState({ lat, lng, zoom });
  };

  onChangeDate = ([start, end]) => {
    this.setState({ date: { start, end } });
  };

  onChangeInterval = interval => {
    console.log("in", interval);
    this.setState({ interval });
  };

  onStyleChange = (name, value) => {
    this.setState(set(this.state.style, name, value));
  };

  onShareClick = () => {
    this.setState({ displayExportMenu: true });
  };

  onOverlayClose = () => {
    this.setState({ displayExportMenu: false });
  };

  onRenderClick = ({ email, format, fps }) => {
    const mapConfig = {
      lat: this.state.lat,
      lng: this.state.lng,
      zoom: this.state.zoom,
      email,
      startDate: moment(this.state.date.start).toISOString(),
      endDate: moment(this.state.date.end).toISOString(),
      interval: this.state.interval,
      format,
      fps,
      style: this.state.style
    };

    fetch("/api/queue-render", {
      headers: {
        "Content-Type": "application/json"
      },
      method: "post",
      body: JSON.stringify(mapConfig)
    }).then(res => console.log(res));
  };

  render() {
    return (
      <div className="container">
        <Overlay isOpen={this.state.displayExportMenu} canOutsideClickClose={true} onClose={this.onOverlayClose}>
          <ExportMenu onRenderClick={this.onRenderClick} />
        </Overlay>
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
            interval={this.state.interval}
            style={this.state.style}
            setCoordinates={this.setCoordinates}
            onSliderUpdate={this.onSliderUpdate}
            sliderPos={this.state.sliderPos}
            onShareClick={this.onShareClick}
          />
        </Main>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById("app"));
