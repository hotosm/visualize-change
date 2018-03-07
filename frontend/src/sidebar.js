const React = require("react");
const { Button, ButtonGroup, Icon, Label, Tab, Tabs, Card } = require("@blueprintjs/core");
const { DateRangePicker } = require("@blueprintjs/datetime");
const { SketchPicker } = require("react-color");
const set = require("lodash.set");

const { capitalizeFirstLetter, rgbaObjectToString } = require("./utils");

const DescribePanel = () => (
  <Card>
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
  </Card>
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
    <Card>
      <label className="inline-label">
        Interval:
        <ButtonGroup>
          {["hours", "days", "weeks"].map(v => (
            <Button key={v} active={interval === v} onClick={() => onChangeInterval(v)}>
              {capitalizeFirstLetter(v)}
            </Button>
          ))}
        </ButtonGroup>
      </label>
    </Card>
  </div>
);

class StyleColorPicker extends React.Component {
  constructor(props) {
    super(props);
    this.state = { displayColorPicker: false, color: { r: 0, g: 0, b: 0, a: 0 }, width: 1 };
  }

  componentDidMount() {
    if (this.props.style) {
      this.setState({ color: this.props.style["line-color"], width: this.props.style["line-width"] });
    }
  }

  onColorChange = color => {
    this.setState({ color: color.rgb });
  };

  onWidthChange = ev => {
    this.setState({ width: ev.target.value }, () =>
      this.props.onStyleChange(Object.assign({}, this.props.style, { "line-width": this.state.width }))
    );
  };

  onCloseClick = () => {
    this.props.onStyleChange(Object.assign({}, this.props.style, { "line-color": this.state.color }));
    this.setState({ displayColorPicker: false });
  };

  onOpenClick = () => {
    this.setState({ displayColorPicker: true });
  };

  render() {
    if (!this.props.style) return null;
    return (
      <div className="color-picker">
        <div className="color-picker__swatch" onClick={this.onOpenClick}>
          <div
            className="color-picker__color"
            style={{ background: rgbaObjectToString(this.props.style["line-color"]) }}
          />
        </div>
        {this.state.displayColorPicker ? (
          <div className="popover">
            <div className="cover" onClick={this.onCloseClick} />
            <SketchPicker color={this.state.color} onChange={this.onColorChange} />
          </div>
        ) : null}
        <input type="number" onChange={this.onWidthChange} value={this.state.width} />
      </div>
    );
  }
}

class StyleSection extends React.Component {
  render() {
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
          <StyleColorPicker
            style={this.props.style.base}
            onStyleChange={value => this.props.onStyleChange(set(this.props.style, "base", value))}
          />
        </label>
        <label className="inline-label">
          Highlight Color
          <StyleColorPicker
            style={this.props.style.highlight}
            onStyleChange={value => this.props.onStyleChange(set(this.props.style, "highlight", value))}
          />
        </label>
      </Card>
    );
  }
}

const StylePanel = ({ style, onStyleChange }) => (
  <div>
    {/*
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
    */}
    <StyleSection
      sectionName="buildings"
      style={style["buildings-outline"]}
      onStyleChange={style => onStyleChange("buildings-outline", style)}
    />
    <StyleSection sectionName="roads" style={style["roads"]} onStyleChange={style => onStyleChange("roads", style)} />
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
