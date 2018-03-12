const React = require("react");
const moment = require("moment");
const { connect } = require("react-redux");
const { Button, ButtonGroup, Slider, Overlay, Card, Elevation } = require("@blueprintjs/core");

const { togglePlay, setSelectedDate, toggleSidebar, showExportMenu } = require("../actions");
const { capitalizeFirstLetter } = require("../utils");

class PlayerPanel extends React.Component {
  onSliderUpdate = value => {
    const { start, interval } = this.props.date;
    const newSelectedDate = moment(start)
      .add(value, interval)
      .valueOf();
    this.props.setSelectedDate(newSelectedDate);
  };

  calcValueFromDates = selected => {
    const { start, interval } = this.props.date;
    return moment.duration(moment(selected).diff(moment(start)))[`as${capitalizeFirstLetter(interval)}`]();
  };

  componentWillReceiveProps(nextProps) {
    // Naive implementation
    if (nextProps.date.isPlaying) {
      this.timer = setTimeout(() => {
        const next = moment(this.props.date.selected)
          .add(1, this.props.date.interval)
          .valueOf();
        this.props.setSelectedDate(next);
      }, 1000);
    } else {
      clearTimeout(this.timer);
    }
  }

  render() {
    const { date, togglePlay, toggleSidebar, showExportMenu } = this.props;
    return (
      <div className="map-footer">
        <div className="map-footer__content">
          <div className="map-footer__items">
            <Button className="pt-minimal" icon={date.isPlaying ? "pause" : "play"} onClick={togglePlay} />
            <div className="map-footer__progressbar">
              <Slider
                disabled={date.isPlaying}
                min={0}
                max={this.calcValueFromDates(this.props.date.end)}
                stepSize={1}
                labelRenderer={false}
                onChange={this.onSliderUpdate}
                value={this.calcValueFromDates(this.props.date.selected)}
              />
            </div>
            <ButtonGroup minimal={true}>
              <Button icon="fullscreen" onClick={toggleSidebar} />
              <Button icon="share" onClick={showExportMenu} />
            </ButtonGroup>
          </div>
          <div className="map-footer__date">{moment(date.selected).format("YYYY-MM-DD")}</div>
        </div>
      </div>
    );
  }
}

const PlayerPanelConnected = connect(({ date }) => ({ date }), {
  togglePlay,
  setSelectedDate,
  toggleSidebar,
  showExportMenu
})(PlayerPanel);

module.exports = PlayerPanelConnected;
