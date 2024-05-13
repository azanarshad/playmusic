console.log("hello world");
let currentSong = new Audio();
let songs = [];
let currFolder;
let currentIndex = 0;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");

    songs = Array.from(as)
        .filter(element => element.href.endsWith(".mp3"))
        .map(element => element.href.split(`/${folder}`)[1].replaceAll("%20", ""));

    displaySongs(); // Call displaySongs function after loading songs
}

function displaySongs() {
    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML += `<li>
                            <img class="invert" src="music.svg" alt="">
                            <div class="info">
                                <div>${song}</div>
                                <div>azan</div>
                            </div>
                            <div class="playnow">
                                  <span>Play now</span>
                                <img class="invert" src="play.svg" alt="">
                            </div></li>`;
    }

    Array.from(songUL.getElementsByTagName("li")).forEach((e, index) => {
        e.addEventListener("click", element => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML);
            currentIndex = index; // Update currentIndex when a song is clicked
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        });
    });
}

const playMusic = (track, pause = false) => {
    currentSong.src = `http://127.0.0.1:5500/${currFolder}/` + track;
    if (!pause) {
        currentSong.play();
        document.getElementById("play").src = "pause.svg"; // Corrected reference to play element
    }

    document.querySelector(".songinfo").innerHTML = track;
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";

};



document.addEventListener("DOMContentLoaded", async () => {
    await getSongs("songs/ncs");
    playMusic(songs[currentIndex], true);

    const play = document.getElementById("play");
    const previous = document.getElementById("previous");
    const next = document.getElementById("next");
    const hamburger = document.querySelector(".hamburger");
    const close = document.querySelector(".close");
    const leftPanel = document.querySelector(".left");

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "pause.svg";
        } else {
            currentSong.pause();
            play.src = "play.svg";
        }
    });

    currentSong.addEventListener("timeupdate", () => {
        if (!isNaN(currentSong.duration)) {
            document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)
                }/${secondsToMinutesSeconds(currentSong.duration)}`;

            document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
        }
    });

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    hamburger.addEventListener("click", () => {
        if (window.innerWidth <= 768) {
            // Toggle visibility of the left panel for smaller screens
            leftPanel.classList.toggle("show");
        } else {
            // For larger screens, directly set the left position
            leftPanel.style.left = "0";
        }
    });

    close.addEventListener("click", () => {
        if (window.innerWidth <= 768) {
            // Toggle visibility of the left panel for smaller screens
            leftPanel.classList.remove("show");
        } else {
            // For larger screens, directly set the left position
            leftPanel.style.left = "-100%";
        }
    });

    previous.addEventListener("click", () => {
        currentIndex = (currentIndex - 1 + songs.length) % songs.length;
        playMusic(songs[currentIndex]);
    });

    next.addEventListener("click", () => {
        currentIndex = (currentIndex + 1) % songs.length;
        playMusic(songs[currentIndex]);
    });

    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("input", (e) => {
        currentSong.volume = parseFloat(e.target.value) / 100;
        document.querySelector(".volume-value").innerText = e.target.value;
    });

    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            console.log(item, item.currentTarget.dataset);
            await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            currentIndex = 0; // Reset currentIndex when switching folders
            playMusic(songs[currentIndex], true); // Reset current song after loading new songs
        });
    });
});
