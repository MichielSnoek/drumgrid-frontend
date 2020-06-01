import React, { Component } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as Tone from "tone";
import "./Grid.css";

// InputRwnge Slidere
import InputRange from "react-input-range";
import "./InputSlider/InputSlider.css";

// Import initial grid data
import { gridInitData } from "./GridInitData/GridInitData";

// Samples
import C1 from "./Samples/kick.mp3";
import D1 from "./Samples/clap.mp3";
import E1 from "./Samples/closedhh.mp3";
import F1 from "./Samples/openhh.mp3";

// Font Awesome Icons
import { faPlay } from "@fortawesome/free-solid-svg-icons";
import { faPause } from "@fortawesome/free-solid-svg-icons";
import { faClock } from "@fortawesome/free-solid-svg-icons";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { faVolumeDown } from "@fortawesome/free-solid-svg-icons";


export default class Grid extends Component {
  state = {
    playButtonDisabled: true,
    showPlayIcon: true,
    yellowGridBlock: false,
    musicTransport: true,
    samplerLoaded: false,
    transport: "",
    gridData: JSON.parse(JSON.stringify(gridInitData)),
    pianoBarLeft: 364,
    pianoBarHeight: 238,
    pianoBarMaxWidth: 0,
    toneBPM: 120,
    volume: -10,
  };

  componentDidMount() {
    // Necessary for proper initialization of Tonejs
    Tone.context.latencyHint = "interactive";
    this.loadSampler();
    this.refreshData();
    
    // Calculate the width of the grid for the pianobar position
    const resizeObserver = new ResizeObserver((element) => {
      this.setState({ pianoBarMaxWidth: element[0].contentRect.width });
    });
    resizeObserver.observe(document.getElementById("gridContainer"));
  }

  componentWillUnmount() {
    clearInterval(this.intervalId);
    this.resizeObserver.current.unobserve();
  }

  handleChange = (e) => {
    const {name, value} = e.target;
    this.setState({ [name]: value });
  }

  clearGrid = () => {
    Tone.Transport.cancel();
    let newArr = this.state.gridData
    newArr[0].grid = JSON.parse(JSON.stringify(gridInitData[0].grid));
    this.setState({gridData: newArr})
  }

  changeMainParameters = () => {
    if (this.state.samplerLoaded) {
    Tone.Transport.bpm.value = this.state.toneBPM;
    this.sampler.volume.value = this.state.volume;
    }
  }

  refreshData = () => {
    const transportpos = Tone.Transport.position;
    const transportprogress = Math.round(Tone.Transport.progress * 100);
    this.setState({
      transport: transportpos,
      gridData: this.state.gridData,
      pianoBarLeft: 364 + ((this.state.pianoBarMaxWidth - 210) / 100) * transportprogress,
    });
  };

  loadSampler = () => {
    this.sampler = new Tone.Players(
      {
        C1,
        D1,
        E1,
        F1,
      },
      {
        volume: -1,
        fadeOut: "64n",
        onload: () => {
          Tone.start().then(
            console.log("Audio is ready."),
            this.setState({ samplerLoaded: true, playButtonDisabled: false })
          );
        },
      }
    ).toMaster();
  };

  playButton = (e) => {
    console.log("click");
    e.preventDefault();
    
    // Changed latency here to fix Tonejs issue and to have better timing
    Tone.context.latencyHint = "fastest";
    this.setState({ showPlayIcon: !this.state.showPlayIcon, musicTransport: !this.state.musicTransport });
    this.transportControl();
  };

  playSample = (sample) => {
    // this.sampler.get(sample).start(0, 0, "128m", 0, 0.8);
    this.sampler.get(sample).start();
  };

  scheduleTimelineBlock = (position, sound, gridSoundPosition, gridStepPosition) => {
    const gridArray = this.state.gridData[0].grid;

    const scheduleID = Tone.Transport.schedule((time) => {
      this.playSample(sound);
    }, position);

    gridArray[gridSoundPosition].steps[gridStepPosition].id = scheduleID;
  };

  clearTimelineBlock = (scheduleId, gridSoundPosition, gridStepPosition) => {
    const gridArray = this.state.gridData[0].grid;
    let gridId = gridArray[gridSoundPosition].steps[gridStepPosition].id;

    if (gridId >= 0) {
      Tone.Transport.clear(scheduleId);
      gridId = null;
    } else {
      console.log("GridID was empty");
    }
  };

  changeGridBlock = (stepValue, elemSound, elemMuted) => {
    const gridArray = this.state.gridData[0].grid;
    //console.log(`${stepValue.time}, elemSound: ${elemSound}, elemMuted: ${elemMuted}`);

    const findSoundNumber = gridArray.findIndex((x) => x.sound === elemSound);
    const findStepNumber = gridArray[findSoundNumber].steps.findIndex((y) => y.time === stepValue.time);
    gridArray[findSoundNumber].steps[findStepNumber].active = !gridArray[findSoundNumber].steps[findStepNumber].active;
    let gridActive = gridArray[findSoundNumber].steps[findStepNumber].active;
    let gridId = gridArray[findSoundNumber].steps[findStepNumber].id;

    if (gridActive) {
      this.scheduleTimelineBlock(stepValue.time, elemSound, findSoundNumber, findStepNumber);
    } else {
      this.clearTimelineBlock(gridId, findSoundNumber, findStepNumber);
    }
    this.refreshData();
  };

  transportControl = () => {
    console.log("loop");

    Tone.Transport.bpm.value = this.state.toneBPM;

    // Check for start/stop
    if (this.state.musicTransport) {
      Tone.Transport.position = "0";
      Tone.Transport.setLoopPoints(0, "1m");
      Tone.Transport.loop = true;
      Tone.Transport.start();
      this.intervalId = setInterval(this.refreshData.bind(this), 25);
    } else {
      Tone.Transport.stop();
      Tone.Transport.position = "0";
      clearInterval(this.intervalId);
      this.refreshData();
    }
  };

  render() {
    this.changeMainParameters();

    return (
      <>
        <div className="grid-container noselect">
          {/* Place pianoroll line */}
          {!this.state.showPlayIcon && (
            <div
              className="grid-pianoroll-line"
              style={{ left: this.state.pianoBarLeft, height: this.state.pianoBarHeight }}
            />
          )}
          {/* Start of transport lane */}
          <div id="gridContainer" className="grid-line">
            <div className="grid-block-transport grid-icons-play">
              {this.state.playButtonDisabled && (
                <button>
                  <FontAwesomeIcon id="grid-icons-play-button" icon={faClock} />
                </button>
              )}
              {!this.state.playButtonDisabled && this.state.showPlayIcon ? (
                <button>
                  <FontAwesomeIcon id="grid-icons-play-button" icon={faPlay} onClick={this.playButton} />
                </button>
              ) : (
                <button>
                  <FontAwesomeIcon id="grid-icons-play-button" icon={faPause} onClick={this.playButton} />
                </button>
              )}
            </div>
            <div className="grid-block-transport grid-block-pattern ">
              PATTERN
              <span className="grid-block-pattern-line" />
              <span className="grid-block-pattern-name">{this.state.transport}</span>
            </div>
            <div className="grid-block-transport grid-block-reset-grid">
              <button onClick={this.clearGrid}>
                RESET
                <br />
                GRID
              </button>
            </div>
            <div className="grid-block-transport grid-block-tempo-lane grid-block-tempo-lane-arrow">
              <FontAwesomeIcon icon={faChevronRight} />
              <span>
                <FontAwesomeIcon icon={faChevronRight} />
              </span>
              <span className="grid-block-tempo-lane-spacer">TEMPO</span>
              <span className="grid-block-tempo-lane-slider">
                <InputRange
                  minValue={60}
                  maxValue={200}
                  value={this.state.toneBPM}
                  onChange={(value) => this.setState({ toneBPM: value })}
                />
              </span>
              <span className="grid-block-tempo-lane-bpm">{this.state.toneBPM} bpm</span>
            </div>
            <div className="grid-block-transport grid-block-volume-lane grid-block-volume-lane-speaker">
              <FontAwesomeIcon icon={faVolumeDown} />
              <span className="grid-block-volume-lane-spacer">VOLUME</span>
              <span className="grid-block-volume-lane-slider">
                <InputRange
                  minValue={-60}
                  maxValue={0}
                  step={1}
                  value={this.state.volume}
                  onChange={(value) => this.setState({ volume: value })}
                />
              </span>
            </div>
            <div className="grid-block-transport grid-block-save">SAVE</div>
          </div>
          {/* Start of grid lanes */}
          {this.state.gridData[0].grid.map((elem, key) => (
            <div key={key} className="grid-line">
              <div
                className="grid-block-instrument grid-block-instrument-name"
                onClick={(e) => this.playSample(elem.sound)}
              >
                {elem.name}
              </div>
              {elem.steps.map((value, key) => {
                if (!value.active) {
                  return (
                    <div
                      key={key}
                      className="grid-block-instrument grid-block-sequence"
                      onClick={(e) => this.changeGridBlock(value, elem.sound, elem.muted)}
                    />
                  );
                } else {
                  return (
                    <div
                      key={key}
                      className="grid-block-instrument grid-block-sequence-yellow"
                      onClick={(e) => this.changeGridBlock(value, elem.sound, elem.muted)}
                    />
                  );
                }
              })}
            </div>
          ))}
          {/* Start Bottom Line */}
          <div className="grid-bottom-line">
            <div className="grid-bottom-plus">
              <FontAwesomeIcon icon={faPlus} />
            </div>
            {/* Create an array with numbers 1 to 16 and perform a map to visualize them */}
            {Array.from(Array(16).keys()).map((element, key) => (
              <div key={key} className="grid-bottom-numbers">
                {element + 1}
              </div>
            ))}
          </div>
          {/* End content */}
        </div>
      </>
    );
  }
}
