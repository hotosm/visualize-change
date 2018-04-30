const React = require("react");
const { connect } = require("react-redux");
const { Button, Popover } = require("@blueprintjs/core");
const onClickOutside = require("react-onclickoutside").default;

const { HELP_SLIDE_ORDER } = require("../constans/index");
const { HELP_TEXTS } = require("../constans/help");

const { showPopover, hidePopover, setTutorialModeOff, goToNextInTutorial, changeSidebarTab } = require("../actions");

class HelpPopover extends React.Component {
  handleClickOutside(ev) {
    const className = ev.target.className;
    const parentClassName = ev.target.parentNode.className;

    if (
      className === "pt-button-text" ||
      className === "pt-button action-button" ||
      className === "help-popover" ||
      className === "help-content" ||
      parentClassName === "pt-button close-button" ||
      parentClassName === "help-popover"
    ) {
      return;
    }

    this.props.setTutorialModeOff();
  }

  render() {
    const {
      id,
      tutorialMode,
      content,
      targetContent,
      visiblePopovers,
      showPopover,
      hidePopover,
      setTutorialModeOff,
      goToNextInTutorial
    } = this.props;

    const slideIndex = HELP_SLIDE_ORDER.findIndex(slideId => id === slideId);
    const isLast = slideIndex >= HELP_SLIDE_ORDER.length - 1;

    const popoverContent = content || (
      <div className="help-popover" onClick={ev => ev.stopPropagation()}>
        <Button className="close-button" icon="cross" onClick={() => setTutorialModeOff() && hidePopover(id)} />
        <div className="help-content">{HELP_TEXTS[id]}</div>
        {tutorialMode && (
          <Button
            className="action-button"
            onClick={ev => {
              ev.stopPropagation();
              isLast
                ? hidePopover(id) && setTutorialModeOff() && changeSidebarTab("simpleEdit")
                : goToNextInTutorial(id);
            }}
          >
            {isLast ? "Close" : "Next"}
          </Button>
        )}
      </div>
    );

    return (
      <Popover
        isOpen={visiblePopovers.includes(id)}
        onClose={() => hidePopover(id)}
        preventOverflow={{ enabled: true, boundariesElement: "scrollParent" }}
        content={popoverContent}
        target={
          <Button
            className="help-button"
            icon="help"
            onClick={ev => {
              ev.stopPropagation();
              showPopover(id);
            }}
          >
            {targetContent || null}
          </Button>
        }
      />
    );
  }
}

const HelpPopoverConnected = connect(
  ({ ui }) => ({ tutorialMode: ui.tutorialMode, visiblePopovers: ui.visiblePopoversIds }),
  {
    showPopover,
    hidePopover,
    setTutorialModeOff,
    goToNextInTutorial
  }
)(onClickOutside(HelpPopover));

module.exports = HelpPopoverConnected;
