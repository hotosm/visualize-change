const React = require("react");
const { connect } = require("react-redux");
const { Button, Icon, Card, Elevation, Overlay } = require("@blueprintjs/core");
const clipboardCopy = require("clipboard-copy");

const { hideExportMenu, sendToRenderer } = require("../actions");

const { getShareUrl } = require("../utils");

const URLShare = ({ url }) => (
  <div className="inside-content url-share">
    <h4>URL Share</h4>
    <div className="pt-input-group">
      <input type="text" className="pt-input" value={url} onChange={() => {}} />
      <button className="pt-button pt-minimal pt-intent-warning pt-icon-clipboard" onClick={() => clipboardCopy(url)} />
    </div>
    <label className="info-label" style={{ padding: "10px 0" }}>
      Use this link to share the animation
    </label>
  </div>
);

class GenericMediaShare extends React.Component {
  constructor() {
    super();
    this.state = { email: "", format: "mp4", size: "1280x720" };
  }

  onEmailChange = ev => {
    this.setState({ email: ev.target.value });
  };

  onFormatChange = ev => {
    this.setState({ format: ev.target.value });
  };

  onSizeChange = ev => {
    this.setState({ size: ev.target.value });
  };

  onExportClick = () => {
    this.props.onExportClick({ email: this.state.email, format: this.state.format, size: this.state.size });
  };

  render() {
    return (
      <div className="inside-content generic-media-share">
        <h4>Export Media Format</h4>
        <div className="form-body">
          <label className="inline-label">
            E-mail *
            <input value={this.state.email} onChange={this.onEmailChange} className="pt-input" />
          </label>
          <label className="inline-label">
            Format
            <div className="pt-select">
              <select value={this.state.format} onChange={this.onFormatChange}>
                <option value="mp4">Video (MP4)</option>
                <option value="gif">GIF</option>
              </select>
            </div>
          </label>
          <label className="inline-label">
            Size
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
          <label className="info-label">Exported video will be send to you via email when it's finished.</label>
          <Button
            className="action-button"
            icon="share"
            style={{ width: 100 }}
            disabled={this.state.email.indexOf("@") === -1}
            onClick={this.onExportClick}
          >
            Share
          </Button>
        </div>
      </div>
    );
  }
}

const SucessMessage = () => (
  <div className="inside-content">
    <p style={{ display: "flex" }}>
      <Icon icon={"tick"} iconSize={30} style={{ paddingRight: 5, color: "green" }} />Your visualization is queued, we
      will send you E-Mail when It will be ready. Thanks!
    </p>
  </div>
);

class ExportMenu extends React.Component {
  onExportClick = ({ email, format, size }) => {
    this.props.sendToRenderer({ email, format, size });
  };

  render() {
    const { isOpen, status, hideExportMenu, location } = this.props;
    const id = location.pathname.split("/").slice(-1);
    return (
      <Overlay isOpen={isOpen} canOutsideClickClose={true} onClose={hideExportMenu}>
        <Card elevation={Elevation.FOUR} className="export-menu">
          <URLShare url={getShareUrl(id)} />
          {status === null ? <GenericMediaShare onExportClick={this.onExportClick} /> : <SucessMessage />}
        </Card>
      </Overlay>
    );
  }
}

const ExportMenuConnected = connect(
  ({ ui, router }) => ({ isOpen: ui.exportMenuOpen, status: ui.exportMenuStatus, location: router.location }),
  {
    hideExportMenu,
    sendToRenderer
  }
)(ExportMenu);

module.exports = ExportMenuConnected;
