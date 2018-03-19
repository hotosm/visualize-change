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
  MenuItem
} = require("@blueprintjs/core");

const LanguageMenu = () => (
  <Menu>
    <MenuItem text="English" />
    <MenuItem text="Polish" />
  </Menu>
);

module.exports = ({ isEditable, isEditing, onSaveClick, onToggleViewState }) => (
  <Navbar>
    <NavbarGroup>
      <NavbarHeading>HOT Visualize Change</NavbarHeading>
    </NavbarGroup>

    <NavbarGroup align="right">
      <ButtonGroup minimal={true}>
        {isEditing && <Button onClick={onSaveClick}>Save</Button>}

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
