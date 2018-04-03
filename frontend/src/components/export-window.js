const React = require("react");
const { connect } = require("react-redux");
const { Button, Tabs, Tab, Card, Elevation, Overlay } = require("@blueprintjs/core");
const clipboardCopy = require("clipboard-copy");

const { hideExportMenu, sendToRenderer } = require("../actions");

const { getShareUrl } = require("../utils");

const URLShare = ({ url }) => (
  <div className="inside-content">
    <div className="pt-input-group">
      <input type="text" className="pt-input" value={url} onChange={() => {}} />
      <button className="pt-button pt-minimal pt-intent-warning pt-icon-clipboard" onClick={() => clipboardCopy(url)} />
    </div>
  </div>
);

class GenericMediaShare extends React.Component {
  constructor() {
    super();
    this.state = { email: "", fps: 10, size: "1280x720" };
  }

  onEmailChange = ev => {
    this.setState({ email: ev.target.value });
  };

  onFPSChange = ev => {
    this.setState({ fps: ev.target.value });
  };

  onSizeChange = ev => {
    this.setState({ size: ev.target.value });
  };

  onExportClick = () => {
    this.props.onExportClick({ email: this.state.email, size: this.state.size, fps: this.state.fps });
  };

  render() {
    return (
      <div className="inside-content">
        <div className="form-body">
          <label className="inline-label">
            E-mail:
            <input value={this.state.email} onChange={this.onEmailChange} className="pt-input" />
          </label>
          <label className="inline-label">
            FPS
            <input value={this.state.fps} onChange={this.onFPSChange} className="pt-input" />
          </label>
          <label className="inline-label">
            Size:
            <div className="pt-select">
              <select value={this.state.size} onChange={this.onSizeChange}>
                <option value="1920x1080">1920x1080</option>
                <option value="1280x720">1280x720</option>
                <option value="1024x768">1024x768</option>
                <option value="800x600">800x600</option>
                <option value="640x480">640x480</option>
              </select>
            </div>
          </label>
          <label className="info-label">Exported video will be send to you via email when it's finished</label>
          <Button icon="share" onClick={this.onExportClick}>
            Share
          </Button>
        </div>
      </div>
    );
  }
}

class ExportMenu extends React.Component {
  onExportClick = (format, { email, fps, size }) => {
    this.props.sendToRenderer({ format, email, fps, size });
  };

  render() {
    const { isOpen, hideExportMenu, location } = this.props;
    const id = location.pathname.split("/").slice(-1);
    return (
      <Overlay isOpen={isOpen} canOutsideClickClose={true} onClose={hideExportMenu}>
        <Card elevation={Elevation.FOUR} className="export-menu">
          <Tabs animate={true} id="ExportTabs" className="export-tabs" renderActiveTabPanelOnly={false}>
            <Tab id="Url" title="URL" panel={<URLShare url={getShareUrl(id)} />} />
            <Tab
              id="MP4"
              title="MP4"
              panel={<GenericMediaShare onExportClick={data => this.onExportClick("video", data)} />}
            />
            <Tab
              id="GIF"
              title="GIF"
              panel={<GenericMediaShare onExportClick={data => this.onExportClick("gif", data)} />}
            />
          </Tabs>
        </Card>
      </Overlay>
    );
  }
}

const ExportMenuConnected = connect(({ ui, router }) => ({ isOpen: ui.exportMenuOpen, location: router.location }), {
  hideExportMenu,
  sendToRenderer
})(ExportMenu);

module.exports = ExportMenuConnected;
