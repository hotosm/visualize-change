const React = require("react");
const { Button, Card, Elevation } = require("@blueprintjs/core");

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

module.exports = ExportMenu;
