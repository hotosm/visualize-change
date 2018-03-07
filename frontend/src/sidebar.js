const React = require("react");
const { Button, ButtonGroup, Icon, Label, Tab, Tabs, Card } = require("@blueprintjs/core");
const { DateRangePicker } = require("@blueprintjs/datetime");
const { SketchPicker } = require("react-color");
const set = require("lodash.set");

const { capitalizeFirstLetter } = require("./utils");

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

const DatePanel = ({ date, interval, onChangeDate, onChangeInterval }) => (
  <div>
    <DateRangePicker
      shortcuts={false}
      contiguousCalendarMonths={false}
      maxDate={new Date()}
      value={[date.start, date.end]}
      onChange={onChangeDate}
    />
    <ButtonGroup>
      Interval:
      {["hours", "days", "weeks"].map(v => (
        <Button key={v} active={interval === v} onClick={() => onChangeInterval(v)}>
          {capitalizeFirstLetter(v)}
        </Button>
      ))}
    </ButtonGroup>
  </div>
);

class StyleColorPicker extends React.Component {
  constructor(props) {
    super(props);
    this.state = { displayColorPicker: false, color: "#ffffff", opacity: 1 };
  }

  onColorChange = color => {
    this.setState({ color: color.hex, opacity: color.rgb.a });
  };

  onCloseClick = () => {
    this.setState({ displayColorPicker: false });
  };

  onOpenClick = () => {
    this.setState({ displayColorPicker: true });
  };

  render() {
    return (
      <div className="color-picker">
        <div className="color-picker__swatch" onClick={this.onOpenClick}>
          <div className="color-picker__color" style={{ background: this.state.color, opacity: this.state.opacity }} />
        </div>
        {this.state.displayColorPicker ? (
          <div className="popover">
            <div className="cover" onClick={this.onCloseClick} />
            <SketchPicker color={this.state.color} onChange={this.onColorChange} />
          </div>
        ) : null}
      </div>
    );
  }
}

class StyleSection extends React.Component {
  render() {
    console.log("styleSection", this.props);
    return (
      <Card>
        <div className="section__header">
          <h4>{capitalizeFirstLetter(this.props.sectionName)}</h4>
          <Button
            className="pt-minimal"
            icon={`eye-${this.props.style.enabled ? "open" : "off"}`}
            onClick={() => this.props.onStyleChange(set(this.props.style, "enabled", !this.props.style.enabled))}
          />
        </div>
        <label className="inline-label">
          Color
          <StyleColorPicker />
        </label>
        <label className="inline-label">
          Highlight Color
          <StyleColorPicker />
        </label>
      </Card>
    );
  }
}

const StylePanel = ({ style, onStyleChange }) => (
  <div>
    <Card>
      <div className="section__header">
        <h4>Map</h4>
      </div>
      <label className="pt-label pt-inline">
        Background Theme
        <div className="pt-select">
          <select>
            <option selected>Light</option>
            <option>Dark</option>
          </select>
        </div>
      </label>
    </Card>
    <StyleSection
      sectionName="buildings"
      style={style["buildings-outline"]}
      onStyleChange={style => onStyleChange("buildings-outline", style)}
    />
    <StyleSection sectionName="roads" style={style.roads} />
  </div>
);

module.exports = ({ date, interval, style, onChangeDate, onChangeInterval, onStyleChange }) => (
  <div className="sidebar">
    <div className="sidebar-content">
      <Tabs animate={true} id="SidebarTabs" renderActiveTabPanelOnly={true}>
        <Tab id="Describe" title="Describe" panel={<DescribePanel />} />
        <Tab
          id="Date"
          title="Date"
          panel={
            <DatePanel
              date={date}
              onChangeDate={onChangeDate}
              onChangeInterval={onChangeInterval}
              interval={interval}
            />
          }
        />
        <Tab id="Style" title="Style" panel={<StylePanel style={style} onStyleChange={onStyleChange} />} />
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
