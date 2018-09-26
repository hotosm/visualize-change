const React = require("react");
const { Button } = require("@blueprintjs/core");

const Topbar = require("./topbar");

const LearnPage = () => (
  <div className="about-page">
    <Topbar
      canSave={false}
      saving={false}
      path="learn"
      isEditing={false}
      onSaveClick={() => {}}
      onToggleViewState={() => {}}
      onShareClick={null}
      isFullScreenMode={false}
    />
    <div className="about-page__content">
      <h2>Learn Page</h2>
      <p>
        Welcome to the Animation Toolkit for <a href="http://www.openstreetmap.org">OpenStreetMap </a>. With this
        platform you can create and save visualizations of your OpenStreetMap edits. These animations can provide you
        with an overall view of OpenStreetMap roads and buildings edits as well as the evolving community contributions
        for a specific area. You can find additional information on the functionality and constraints of each section on
        the
        <Button className="help-button" icon="help" />
        icons.
      </p>
      <h3>Overview</h3>
      <h5>Search</h5>
      <p>
        Search for your area of interest either by using the Search field on the upper righthand corner of the map panel
        or by selecting an custom area. Similar to other standard OpenStreetMap navigation maps, a bounding or mouse
        scroll can center you in a place.
      </p>
      <h5>Zoom Levels</h5>
      <p>
        The OpenStreetMap Animation Toolkit is designed for{" "}
        <a href="https://wiki.openstreetmap.org/wiki/Zoom_levels">Zoom levels 12 and higher</a>. This starts from a town
        perspective (zoom 12) and becomes detailed to zoom 19. To create an animation of edits for larger geographic
        region, we recommend setting up your own instance. You can find instructions on how to do that in the GitHub
        readme <a href="https://github.com/hotosm/visualize-change">here</a>.
      </p>
      <h5>Save</h5>
      <p>
        Your animations are stored locally in your browser until you choose to Save them to the HOT server. Once you are
        happy with your animation -- save it! - and share with others.
      </p>
      <h5>Share</h5>
      <p>
        Share your edit animations with your friends and networks with the
        <Button icon="share">Share</Button>
        button located on the on the right side of the main menu.This button provides you a stable URL for a saved map
        and the option to export the data file as an MP4 or GIF. Downloaded animations will be emailed you and available
        on the server for 2 days.
      </p>
      <h5>Additional Features</h5>
      <ol>
        <li>
          Preview: Play your animation while creating with the “Play” overlay found on the bottom of your map pane.
          <Button className="pt-minimal play-btn" icon="play" size={20} />
        </li>

        <li>Date: The progression of your dates of edit can be followed on the right hand side of the play bar.</li>

        <li>
          Full Screen: Want to see your edit animation in the fullscreen of your browser? Select the expand button on
          the lower left side of the play bar.
        </li>

        <li>
          Loading: Changes to your animation will take time to fully render in your browser. Watch for progress with the
          loading animation overlaid on the map when rendering.
        </li>
      </ol>
      <h3>Open Source</h3>
      <p>
        The Animation Toolkit is a collaborative open source project initially created in partnership with HOT and
        [funder here]. The source code is available on <a href="https://github.com/hotosm/visualize-change">Github</a>
      </p>
      <p>
        You can help the Toolkit by translating or reporting bugs{" "}
        <a href="https://github.com/hotosm/visualize-change/issues">on Github Issues</a>
      </p>
    </div>
  </div>
);

module.exports = LearnPage;
