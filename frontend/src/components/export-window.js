const React = require("react");
const { connect } = require("react-redux");
const { Button, Card, Elevation, Overlay } = require("@blueprintjs/core");

const { hideExportMenu, sendToRenderer } = require("../actions");

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
    // this.props.onRenderClick({ email: this.state.email, fps: this.state.fps, format: this.state.format });
    this.props.sendToRenderer(this.state);
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
    const { isOpen, hideExportMenu } = this.props;
    return (
      <Overlay isOpen={isOpen} canOutsideClickClose={true} onClose={hideExportMenu}>
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
      </Overlay>
    );
  }
}

const ExportMenuConnected = connect(({ ui }) => ({ isOpen: ui.exportMenuOpen }), { hideExportMenu, sendToRenderer })(
  ExportMenu
);

module.exports = ExportMenuConnected;
