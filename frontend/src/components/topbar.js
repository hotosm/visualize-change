const React = require("react");
const classNames = require("classnames");
const { Button, ButtonGroup, Navbar, NavbarGroup, NavbarHeading, Intent } = require("@blueprintjs/core");

const { SlideTransition } = require("./transitions");
const { Link } = require("react-router-dom");

// const LanguageMenu = () => (
//   <Menu>
//     <MenuItem text="English" />
//     <MenuItem text="Polish" />
//   </Menu>
// );

// TODO: add defaults
const isLinkDisabled = path => path !== "view" && path !== "edit";

module.exports = ({ id = null, path, canSave, saving, isEditing, onSaveClick, isFullScreenMode, onShareClick }) => (
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
          <Button icon="help">Help</Button>
        </ButtonGroup>
      </NavbarGroup>
    </Navbar>
  </SlideTransition>
);
