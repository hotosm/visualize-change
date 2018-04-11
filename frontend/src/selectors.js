const equals = require("only-shallow");
const { createExportConfig } = require("./utils");

const isChanged = state => {
  const stateFromServer = state.data.orginal;
  const stateInApp = createExportConfig(state);

  return !equals(stateFromServer, stateInApp);
};

const isEditMode = router => {
  return !!(router.location.pathname.split("/")[1] === "edit");
};

module.exports = {
  isChanged,
  isEditMode
};
