/*
 * If not stated otherwise in this file or this component's license file the
 * following copyright and licenses apply:
 *
 * Copyright 2018 RDK Management
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
*/

var controlObj = null;
var bitrateList = [];
var ccStatus = false;
const defaultCCOptions = { textItalicized: false, textEdgeStyle:"none", textEdgeColor:"black", textSize: "small", windowFillColor: "black", fontStyle: "default", textForegroundColor: "white", windowFillOpacity: "transparent", textForegroundOpacity: "solid", textBackgroundColor: "black", textBackgroundOpacity:"solid", windowBorderEdgeStyle: "none", windowBorderEdgeColor: "black", textUnderline: false }

function playPause() {
    console.log("playPause");

    if (playerState === playerStatesEnum.idle) {
        //Play first video when clicking Play button first time
        document.getElementById("contentURL").innerHTML = "URL: " + urls[0].url;
        resetPlayer();
        resetUIOnNewAsset();
        loadUrl(urls[0], true);
    } else {
        // If it was a trick play operation
        if ( playbackSpeeds[playbackRateIndex] != 1 ) {
            // Change to normal speed
            playerObj.play();
        } else {
            if (playerState === playerStatesEnum.paused) {
                // Play the video
                playerObj.play();
            } else { // Pause the video
                playerObj.pause();
            }
        }
        playbackRateIndex = playbackSpeeds.indexOf(1);
    }
};

function mutePlayer() {
    if (mutedStatus === false) {
        // Mute
        playerObj.setVolume(0);
        mutedStatus = true;
        document.getElementById("muteIcon").src = "../icons/mute.png";
    } else {
        // Unmute
        playerObj.setVolume(100);
        mutedStatus = false;
        document.getElementById("muteIcon").src = "../icons/unMute.png";
    }
};

function toggleCC() {
    if (ccStatus === false) {
        // CC ON
        XREReceiver.onEvent("onClosedCaptions", { enable: true });
        XREReceiver.onEvent("onClosedCaptions", { setOptions: defaultCCOptions});
        ccStatus = true;
        document.getElementById("ccIcon").src = "../icons/closedCaptioning.png";
        document.getElementById('ccContent').innerHTML = "CC Enabled";    
    } else {
        // CC OFF
        XREReceiver.onEvent("onClosedCaptions", { enable: false });
        ccStatus = false;
        document.getElementById("ccIcon").src = "../icons/closedCaptioningDisabled.png";
        document.getElementById('ccContent').innerHTML = "CC Disabled";
    }
    document.getElementById('ccModal').style.display = "block";
    setTimeout(function(){  document.getElementById('ccModal').style.display = "none"; }, 2000);
};

function goToHome() {
    window.location.href = "../index.html";
}

function skipTime(tValue) {
    //if no video is loaded, this throws an exception
    try {
        var position = playerObj.getCurrentPosition();
        if (!isNaN(position)) {
            playerObj.seek(position + tValue);
        }
    } catch (err) {
        // errMessage(err) // show exception
        errMessage("Video content might not be loaded: " + err);
    }
}

function skipBackward() {
    skipTime(-300);
};

function skipForward() {
    skipTime(300);
};

function fastrwd() {
    var newSpeedIndex = playbackRateIndex - 1;
    if (newSpeedIndex < 0) {
        newSpeedIndex = 0;
    }
    if (newSpeedIndex !== playbackRateIndex) {
        console.log("Change speed from [" + playbackSpeeds[playbackRateIndex] + "] -> [" + playbackSpeeds[newSpeedIndex] + "]");
        playerObj.setPlaybackRate(playbackSpeeds[newSpeedIndex]);
    }
};

function fastfwd() {
    var newSpeedIndex = playbackRateIndex + 1;
    if (newSpeedIndex >= playbackSpeeds.length) {
        newSpeedIndex = playbackSpeeds.length - 1;
    }
    if (newSpeedIndex !== playbackRateIndex) {
        console.log("Change speed from [" + playbackSpeeds[playbackRateIndex] + "] -> [" + playbackSpeeds[newSpeedIndex] + "]");
        playerObj.setPlaybackRate(playbackSpeeds[newSpeedIndex]);
    }
};

//  load video file from select field
function getVideo(cache_only) {
    var fileURLContent = document.getElementById("videoURLs").value; // get select field
    if (fileURLContent != "") {
        var newFileURLContent = fileURLContent;
        document.getElementById("contentURL").innerHTML = "URL: " + fileURLContent;
        //get the selected index of the URL List
        var selectedURL = document.getElementById("videoURLs");
        var optionIndex = selectedURL.selectedIndex;
        //set the index to the selected field
        document.getElementById("videoURLs").selectedIndex = optionIndex;

        console.log(newFileURLContent);
        if(cache_only)
        {
	        for ( urlIndex = 0; urlIndex < urls.length; urlIndex++) {
	            if (newFileURLContent === urls[urlIndex].url) {
	                console.log("FOUND at index: " + urlIndex);
	                cacheStream(urls[urlIndex], (0 == urlIndex));
	                break;
	            }
	        }
        }
        else
        {
            resetPlayer();
            resetUIOnNewAsset();
            for ( urlIndex = 0; urlIndex < urls.length; urlIndex++) {
                if (newFileURLContent === urls[urlIndex].url) {
                    console.log("FOUND at index: " + urlIndex);
                    loadUrl(urls[urlIndex], (0 == urlIndex));
                    break;
                }
            }
        }
    } else {
        errMessage("Enter a valid video URL"); // fail silently
    }
}

//function to Change the Closed Captioning Track
function changeCCTrack() {
    if (ccStatus === true) {
        //if CC is enabled
        var trackID =  document.getElementById("ccTracks").value; // get selected cc track
        XREReceiver.onEvent("onClosedCaptions", { setTrack: trackID });
    }
}

//function to jump to user entered position
function jumpToPPosition() {
    if(document.getElementById("jumpPosition").value) {
        var position = Number(document.getElementById("jumpPosition").value)/1000;
        if (!isNaN(position)) {
            playerObj.seek(position);
        }
        document.getElementById("jumpPosition").value = "";
    }
}

//function to toggle Overlay widget
function toggleOverlay() {
    var overlay = document.getElementById('overlayModal');
    var urlMod = document.getElementById('urlModal');
    document.getElementById("logCheck").checked = !document.getElementById("logCheck").checked;
    if(document.getElementById("logCheck").checked) {
        overlay.style.display = "block";
        urlMod.style.display = "block";
    } else {
        overlay.style.display = "none";
        urlMod.style.display = "none";
    }
}

function loadNextAsset() {
    resetPlayer();
    resetUIOnNewAsset();
    urlIndex++;
    if (urlIndex >= urls.length) {
        urlIndex = 0;
    }
    loadUrl(urls[urlIndex], (0 == urlIndex));
}

function cacheNextAsset() {
    urlIndex++;
    if (urlIndex >= urls.length) {
        urlIndex = 0;
    }
    cacheStream(urls[urlIndex], (0 == urlIndex));
}

function loadPrevAsset() {
    resetPlayer();
    resetUIOnNewAsset();
    urlIndex--;
    if (urlIndex < 0) {
        urlIndex = urls.length - 1;
    }
    loadUrl(urls[urlIndex], (0 == urlIndex));
}

var HTML5PlayerControls = function() {
    var that = this;
    this.init = function() {
        this.video = document.getElementById("video");

        // Buttons
        this.videoToggleButton = document.getElementById("videoToggleButton");
        this.playButton = document.getElementById("playOrPauseButton");
        this.rwdButton = document.getElementById("rewindButton");
        this.skipBwdButton = document.getElementById("skipBackwardButton");
        this.skipFwdButton = document.getElementById("skipForwardButton");
        this.fwdButton = document.getElementById("fastForwardButton");
        this.muteButton = document.getElementById("muteVideoButton");
        this.ccButton = document.getElementById("ccButton");
        this.autoVideoLogButton = document.getElementById("autoLogButton");
        this.jumpButton = document.getElementById("jumpButton");
        this.homeContentButton = document.getElementById('homeButton');

        // Sliders
        this.seekBar = document.getElementById("seekBar");
        this.cacheOnlyButton = document.getElementById("cacheOnlyButton");
        this.videoFileList = document.getElementById("videoURLs");
        this.ccTracksList = document.getElementById("ccTracks");
        this.jumpPositionInput = document.getElementById("jumpPosition");

        this.currentObj = this.playButton;
        this.components = [this.playButton, this.videoToggleButton, this.rwdButton, this.skipBwdButton, this.skipFwdButton, this.fwdButton, this.muteButton, this.ccButton, this.ccTracksList, this.cacheOnlyButton, this.videoFileList, this.jumpPositionInput, this.jumpButton, this.autoVideoLogButton, this.homeContentButton];
        this.currentPos = 0;
        this.dropDownListVisible = false;
        this.ccListVisible = false;
        this.selectListIndex = 0;
        this.selectCCListIndex = 0;
        this.selectBitrateListIndex = 0;
        this.prevObj = null;
        this.addFocus();
        this.seekBar.style.backgroundColor = "red";

        document.getElementById('ffModal').style.display = "none";
        document.getElementById('ffSpeed').style.display = "none";

        // Event listener for the play/pause button
        this.playButton.addEventListener("click", function() {
            playPause();
        });

        // Event listener for the home button
        this.homeContentButton.addEventListener("click", function() {
            goToHome();
        });

        // Event listener for the mute button
        this.muteButton.addEventListener("click", function() {
            mutePlayer();
        });

        // Event listener for the mute button
        this.ccButton.addEventListener("click", function() {
            toggleCC();
        });

        // Event listener for the rewind button
        this.rwdButton.addEventListener("click", function() {
            fastrwd();
        });

        // Event listener for the skip Backward button
        this.skipBwdButton.addEventListener("click", function() {
            skipBackward();
        });

        // Event listener for the skip Forward button
        this.skipFwdButton.addEventListener("click", function() {
            skipForward();
        });

        // Event listener for the fast Forward button
        this.fwdButton.addEventListener("click", function() {
            fastfwd();
        });

        this.seekBar.addEventListener("change", function() {
            // Calculate the new time
            var duration = playerObj.getDurationSec();
            var time = duration * (seekBar.value / 100);
            console.log("seek cursor time: " + time);
            playerObj.seek(time);
        });

        // Pause the video when the seek handle is being dragged
        this.seekBar.addEventListener("keydown", function() {
            playerObj.pause();
        });

        // Play the video when the seek handle is dropped
        this.seekBar.addEventListener("keyup", function() {
            playerObj.play();
        });
    };

    this.reset = function() {

        var value = 0;
        this.playButton.src = "../icons/play.png";
        this.seekBar.value = value;
        this.seekBar.style.width = value+"%";
    };

    this.keyLeft = function() {
        this.gotoPrevious();
    };

    this.keyRight = function() {
        this.gotoNext();
    };

    this.keyUp = function() {
        if ((this.components[this.currentPos] == this.videoFileList) && (this.dropDownListVisible)) {
            this.prevVideoSelect();
        } else if ((this.components[this.currentPos] == this.ccTracksList) && (this.ccListVisible)) {
            this.prevCCSelect();
        } else if ((this.components[this.currentPos] == this.playButton) || (this.components[this.currentPos] == this.videoToggleButton) || (this.components[this.currentPos] == this.rwdButton) || (this.components[this.currentPos] == this.skipBwdButton) || (this.components[this.currentPos] == this.skipFwdButton) || (this.components[this.currentPos] == this.fwdButton) || (this.components[this.currentPos] == this.muteButton) || (this.components[this.currentPos] == this.ccButton)) {
            //when a keyUp is received from the buttons in the bottom navigation bar
            this.removeFocus();
            this.currentObj = this.ccTracksList;
            //move focus to the first element in the top navigation bar
            this.currentPos = this.components.indexOf(this.ccTracksList);
            this.addFocus();
        }
    };

    this.keyDown = function() {
        if ((this.components[this.currentPos] == this.videoFileList) && (this.dropDownListVisible)) {
            this.nextVideoSelect();
        } else if ((this.components[this.currentPos] == this.ccTracksList) && (this.ccListVisible)) {
            this.nextCCSelect();
        } else if ((this.components[this.currentPos] == this.ccTracksList) || (this.components[this.currentPos] == this.videoFileList) || (this.components[this.currentPos] == this.cacheOnlyButton) || (this.components[this.currentPos] == this.jumpPositionInput) || (this.components[this.currentPos] == this.jumpButton) || (this.components[this.currentPos] == this.autoVideoLogButton) || (this.components[this.currentPos] == this.homeContentButton)) {
            //when a keyDown is received from the buttons in the top navigation bar
            this.removeFocus();
            this.currentObj = this.playButton;
            //move focus to the first element in the bottom navigation bar
            this.currentPos = 0;
            this.addFocus();
        }
    };

    this.prevVideoSelect = function() {
        if (this.selectListIndex > 0) {
            this.selectListIndex--;
        } else {
            this.selectListIndex = this.videoFileList.options.length - 1;
        }
        this.videoFileList.options[this.selectListIndex].selected = true;
    };

    this.nextVideoSelect = function() {
        if (this.selectListIndex < this.videoFileList.options.length - 1) {
            this.selectListIndex++;
        } else {
            this.selectListIndex = 0;
        }
        this.videoFileList.options[this.selectListIndex].selected = true;
    };

    this.prevCCSelect = function() {
        if (this.selectCCListIndex > 0) {
            this.selectCCListIndex--;
        } else {
            this.selectCCListIndex = this.ccTracksList.options.length - 1;
        }
        this.ccTracksList.options[this.selectCCListIndex].selected = true;
    };

    this.nextCCSelect = function() {
        if (this.selectCCListIndex < this.ccTracksList.options.length - 1) {
            this.selectCCListIndex++;
        } else {
            this.selectCCListIndex = 0;
        }
        this.ccTracksList.options[this.selectCCListIndex].selected = true;
    };

    this.showDropDown = function() {
        this.dropDownListVisible = true;
        var n = this.videoFileList.options.length;
        this.videoFileList.size = n;
    };

    this.hideDropDown = function() {
        this.dropDownListVisible = false;
        this.videoFileList.size = 1;
    };
    
    this.showCCDropDown = function() {
        this.ccListVisible = true;
        var n = this.ccTracksList.options.length;
        this.ccTracksList.size = n;
    };

    this.hideCCDropDown = function() {
        this.ccListVisible = false;
        this.ccTracksList.size = 1;
    };

    this.ok = function() {
        switch (this.currentPos) {
            case 0:
                    playPause();
                    break;
            case 1:
                    toggleVideo();
                    break;
            case 2:
                    fastrwd();
                    break;
            case 3:
                    skipBackward();
                    break;
            case 4:
                    skipForward();
                    break;
            case 5:
                    fastfwd();
                    break;
            case 6:
                    mutePlayer();
                    break;
            case 7:
                    toggleCC();
                    break;
            case 8:
                    if (this.ccListVisible == false) {
                        this.showCCDropDown();
                    } else {
                        this.hideCCDropDown();
                        changeCCTrack();
                    }
                    break;
            case 9:
                  //Cache Only check box
                  document.getElementById("cacheOnlyCheck").checked = !document.getElementById("cacheOnlyCheck").checked;
                  break;
            case 10:
                    if (this.dropDownListVisible == false) {
                        this.showDropDown();
                    } else {
                        this.hideDropDown();
                        getVideo(document.getElementById("cacheOnlyCheck").checked);
                    }
                    break;
            case 12:
                    jumpToPPosition();
                    break;
            case 13:
                    toggleOverlay();
                    break;
            case 14:
                    goToHome();
                    break;
        };
    };

    this.gotoNext = function() {
        this.removeFocus();
        if (this.currentPos < this.components.length - 1) {
            this.currentPos++;
        } else {
            this.currentPos = 0;
        }
        this.currentObj = this.components[this.currentPos];
        this.addFocus();
    };

    this.gotoPrevious = function() {
        this.removeFocus();
        if (this.currentPos > 0) {
            this.currentPos--;
        } else {
            this.currentPos = this.components.length - 1;
        }
        this.currentObj = this.components[this.currentPos];
        this.addFocus();
    };

    this.addFocus = function() {
        if (this.currentObj) {
            this.currentObj.classList.add("focus");
        } else {
            this.currentObj.focus();
        }
    };

    this.removeFocus = function() {
        if (this.currentObj) {
            this.currentObj.classList.remove("focus");
        } else {
            this.currentObj.blur();
        }
    };

    this.keyEventHandler = function(e, type) {
        var keyCode = e.which || e.keyCode;
        console.log("UVE Pressed keycode" + keyCode);
        e.preventDefault();
        if (type == "keydown") {
            switch (keyCode) {
                case 37: // Left Arrow
                        this.keyLeft();
                        break;
                case 38: // Up Arrow
                        this.keyUp();
                        break;
                case 39: // Right Arrow
                        this.keyRight();
                        break;
                case 40: // Down Arrow
                        this.keyDown();
                        break;
                case 13: // Enter
                        this.ok();
                        break;
                case 88: // X
		        case 34:
                        skipBackward();
                        break;
                case 90: // Z
		        case 33:
                        skipForward();
                        break;
                case 32:
                        this.ok();
                        break;
		        case 179:
                case 80: // P
                        playPause();
                        break;
                case 113: // F2
                        mutePlayer();
                        break;
                case 82: // R
		        case 227:
                        fastrwd();
                        break;
                case 70: // F
		        case 228:
                        fastfwd();
                        break;
                case 117: // F6
                        overlayController();
                        break;
                case 85: // U
                        loadNextAsset();
                        break;
                case 68: // D
                        loadPrevAsset();
                        break;
                case 48: // Number 0
                case 49: // Number 1
                case 50: // Number 2
                case 51: // Number 3
                case 52: // Number 4
                case 53: // Number 5
                case 54: // Number 6
                case 55: // Number 7
                case 56: // Number 8
                case 57: // Number 9
                         // If keypress is for input to the progress position field
                         if(this.currentObj === this.jumpPositionInput) {
                             document.getElementById("jumpPosition").value =  document.getElementById("jumpPosition").value + String(e.key);
                         }
                         break;
                default:
                        break;
            }
        }
        return false;
    }
};

function overlayController() {
    var navBar = document.getElementById('controlDiv');
    var navBarNext = document.getElementById('controlDivNext');
    // Get the modal
    if(navBar.style.display == "block") {
        navBar.style.display = "none";
    } else {
        navBar.style.display = "block";
    }
    if(navBarNext.style.display == "block") {
        navBarNext.style.display = "none";
    } else {
        navBarNext.style.display = "block";
    }
};

function createBitrateList(availableBitrates) {
    bitrateList = [];
    for (var iter = 0; iter < availableBitrates.length; iter++) {
        bitrate = (availableBitrates[iter] / 1000000).toFixed(1);
        bitrateList.push(bitrate);
    }
    document.getElementById("availableBitratesList").innerHTML = bitrateList;
};

function showTrickmodeOverlay(speed) {
    document.getElementById('ffSpeed').innerHTML = Math.abs(speed)+ "x";
    if (speed > 0) {
        document.getElementById('ffModal').style["-webkit-transform"]= "scaleX(1)";
    } else {
        document.getElementById('ffModal').style["-webkit-transform"]= "scaleX(-1)";
    }

    //Display Fast Forward modal
    document.getElementById('ffModal').style.display = "block";
    document.getElementById('ffSpeed').style.display = "block";

    //Set timeout to hide
    setTimeout(function() {
        document.getElementById('ffModal').style.display = "none";
        document.getElementById('ffSpeed').style.display = "none";
    }, 2000);
};

// Convert seconds to hours
function convertSStoHr(videoTime) {
    var hhTime = Math.floor(videoTime / 3600);
    var mmTime = Math.floor((videoTime - (hhTime * 3600)) / 60);
    var ssTime = videoTime - (hhTime * 3600) - (mmTime * 60);
    ssTime = Math.round(ssTime);

    var timeFormat = (hhTime < 10 ? "0" + hhTime : hhTime);
        timeFormat += ":" + (mmTime < 10 ? "0" + mmTime : mmTime);
        timeFormat += ":" + (ssTime  < 10 ? "0" + ssTime : ssTime);

    return timeFormat;
};


function resetUIOnNewAsset(){
    controlObj.reset();
    document.getElementById("muteIcon").src = "../icons/unMute.png";
    document.getElementById("currentDuration").innerHTML = "00:00:00";
    document.getElementById("totalDuration").innerHTML = "00:00:00";
    document.getElementById('ffSpeed').innerHTML = "";
    document.getElementById('ffModal').style.display = "none";
    document.getElementById('ffSpeed').style.display = "none";
    document.getElementById('errorModal').style.display = "none";
    document.getElementById("jumpPosition").value = "";
};

function initPlayerControls() {

    controlObj = new HTML5PlayerControls();
    controlObj.init();
    if (document.addEventListener) {
        document.addEventListener("keydown", function(e) {
            return controlObj.keyEventHandler(e, "keydown");
        });
    }

    //to show the navBar initially
    document.getElementById('controlDiv').style.display = "block";
    document.getElementById('controlDivNext').style.display = "block";

    //to hide the anomaly overlay widget initially
    document.getElementById("logCheck").checked = false;

    //to load URL select field
	if(urls) {
        // Iteratively adding all the options to videoURLs
        for (var iter = 0; iter < urls.length; iter++) {
            var option = document.createElement("option");
            option.value = urls[iter].url;
            option.text = urls[iter].name;
            videoURLs.add(option);
        }
    }
};
