const React = require("react");
const classNames = require("classnames");
const { Button, ButtonGroup, Navbar, NavbarGroup, NavbarHeading, Intent } = require("@blueprintjs/core");

const { SlideTransition } = require("./transitions");
const { connect } = require("react-redux");
const { Link } = require("react-router-dom");

const { toggleTutorialMode } = require("../actions");

const isLinkDisabled = path => path !== "view" && path !== "edit";

const Topbar = ({
  id = null,
  path,
  canSave,
  saving,
  isEditing,
  onSaveClick,
  isFullScreenMode,
  onShareClick,
  toggleTutorialMode
}) => (
  <SlideTransition className="topbar" visible={!isFullScreenMode} direction="top">
    <Navbar>
      <Link to="/">
        <NavbarGroup>
          <div className="logo" />
          <NavbarHeading>Visualize Change</NavbarHeading>
        </NavbarGroup>
      </Link>

      <NavbarGroup align="left">
        <ButtonGroup minimal={true}>
          <Link className="pt-button" to="/edit/">
            New
          </Link>

          <Button
            intent={isEditing ? (canSave ? Intent.PRIMARY : Intent.SUCCESS) : Intent.Primary}
            loading={saving}
            disabled={!isEditing}
            onClick={canSave ? onSaveClick : null}
          >
            {isEditing ? (canSave ? "Save" : "Saved") : "Save"}
          </Button>

          <Button icon="share" disabled={!onShareClick} onClick={onShareClick}>
            Share
          </Button>

          <div className="pt-button separator">|</div>

          <Link
            className={classNames("pt-button route", { active: path === "view", disabled: isLinkDisabled(path) })}
            to={`/view${id ? "/" + id : ""}`}
          >
            View
          </Link>

          <Link
            className={classNames("pt-button route", { active: path === "edit", disabled: isLinkDisabled(path) })}
            to={`/edit${id ? "/" + id : ""}`}
          >
            Edit
          </Link>

          {/*
          <Link className={classNames('pt-button route', { active: path === 'learn' })} to="/learn">
            Learn
          </Link>
          */}
        </ButtonGroup>
      </NavbarGroup>

      <NavbarGroup align="right">
        <ButtonGroup minimal={true}>
          <Button icon="help" onClick={toggleTutorialMode}>
            Help
          </Button>
        </ButtonGroup>
      </NavbarGroup>
    </Navbar>
  </SlideTransition>
);

module.exports = connect(({ ui }) => ({ ui }), { toggleTutorialMode })(Topbar);
