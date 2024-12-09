let currentSong = new Audio();
let songs;
let currFolder;

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/${currFolder}/`);
    let response = await a.text();

    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = []; // Initialize songs array here
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }
    return songs;
}

const playMusic = (track) => {
    currentSong.src = `/${currFolder}/` + track;
    currentSong.play();

    document.querySelector(".songInfo").innerHTML = currentSong.src.split('/').pop().replaceAll("%20", " ");
    document.querySelector(".songTime").innerHTML = "00:00/00:00";

    // Update song list UI
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = ""; // Clear previous song list
    for (const song of songs) {
        songUL.innerHTML += `
            <li style="display: flex; align-items: center; gap: 40px; flex-direction: row; width: 100%;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <img class="invert" src="music.svg" alt="">
                    <div class="info">
                        <div>${song.replaceAll("%20", " ")}</div>
                        <div>Vishnu</div>
                    </div>
                </div>
                <div class="playNow" style="display: flex; align-items: center; gap: 10px;">
                    <span>Play Now</span>
                    <img src="play1.svg" alt="" class="invert">
                </div>
            </li>`;
    }

    // Add click event to each song in the list
    Array.from(document.querySelectorAll(".songList li")).forEach(listItem => {
        listItem.addEventListener("click", () => {
            const info = listItem.querySelector(".info");
            if (info) {
                const child = info.firstElementChild;
                if (child) {
                    console.log(child.innerHTML);
                    playMusic(child.innerHTML.trim());
                }
            }
        });
    });
}

function formatSeconds(seconds) {
    seconds = Number(seconds);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
}

async function main() {
    songs = await getSongs("songs/ncs"); // Load initial songs from "ncs"

    // Play button event listener
    document.querySelector("#play").addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            document.querySelector("#play").src = "pause.svg";
        } else {
            currentSong.pause();
            document.querySelector("#play").src = "play.svg";
        }
    });

    // Update time and seekbar
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songTime").innerHTML = `${formatSeconds(currentSong.currentTime)}/${formatSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    // Seekbar click event
    document.querySelector(".seekbar").addEventListener("click", e => {
        const seekbarWidth = e.target.getBoundingClientRect().width;
        const newPosition = (e.offsetX / seekbarWidth) * 100;
        document.querySelector(".circle").style.left = newPosition + "%";
        currentSong.currentTime = (currentSong.duration) * newPosition / 100;
    });

    // Hamburger menu
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    // Previous and Next buttons
    document.querySelector("#previous").addEventListener("click", () => {
        console.log("Previous clicked");
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if (index > 0) {
            playMusic(songs[index - 1]);
        } else {
            console.log("No previous song available.");
        }
    });

    document.querySelector("#next").addEventListener("click", () => {
        console.log("Next clicked");
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if (index < songs.length - 1) {
            playMusic(songs[index + 1]);
        } else {
            console.log("No next song available.");
        }
    });

    // Volume control
    const volumeSlider = document.querySelector('.volume-slider');
    currentSong.volume = volumeSlider.value / 100; // Set initial volume
    volumeSlider.addEventListener('input', () => {
        const volume = volumeSlider.value / 100;
        currentSong.volume = volume;
    });

    // Load songs from folder when card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(card => {
        card.addEventListener("click", async (event) => {
            const folder = event.currentTarget.dataset.folder; // Get folder from data attribute
            songs = await getSongs(`songs/${folder}`);
            console.log(`Loaded songs from folder: ${folder}`);
            playMusic(songs[0]); // Optionally play the first song in the new folder
        });
    });
}

main();