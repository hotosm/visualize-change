const React = require("react");
const {
  AnchorButton,
  Button,
  ButtonGroup,
  Navbar,
  NavbarGroup,
  NavbarHeading,
  Popover,
  Menu,
  MenuItem,
  Intent
} = require("@blueprintjs/core");

const LanguageMenu = () => (
  <Menu>
    <MenuItem text="English" />
    <MenuItem text="Polish" />
  </Menu>
);

// <Button disabled={!canSave} onClick={onSaveClick}>
//   {saving ? "Saving" : "Save"}
// </Button>
module.exports = ({ canSave, saving, isEditing, onSaveClick, onToggleViewState }) => (
  <Navbar>
    <NavbarGroup>
      <NavbarHeading>HOT Visualize Change</NavbarHeading>
    </NavbarGroup>

    <NavbarGroup align="right">
      <ButtonGroup minimal={true}>
        {isEditing && (
          <Button
            intent={canSave ? Intent.PRIMARY : Intent.SUCCESS}
            loading={saving}
            onClick={canSave ? onSaveClick : null}
          >
            {canSave ? "Save" : "Saved"}
          </Button>
        )}

        <Button disabled>About</Button>
        <Button disabled>Learn</Button>
        <Button onClick={onToggleViewState}>{isEditing ? "View" : "Edit"}</Button>

        <Popover content={<LanguageMenu />}>
          <AnchorButton disabled rightIcon="caret-down">
            English
          </AnchorButton>
        </Popover>
      </ButtonGroup>
    </NavbarGroup>
  </Navbar>
);
