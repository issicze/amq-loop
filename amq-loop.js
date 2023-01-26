let is_looping = false
let songList = null
let loopingBtn = null

function getVideoPlayer() {
	return document.getElementById('elInputVideo')
}

function setVidPlayerAutoplay(bool) {
	let player = getVideoPlayer()
	if (bool && !player.autoplay) {
		player.setAttribute('autoplay', 'true')
	} else if (!bool) {
		player.removeAttribute('autoplay')
	}
}

function currentSongIndex() {
	if (songList) {
		// Check if a song is open in current songList
		for (let i = 1; i < songList.length; i++) {
			if (songList[i].classList.contains('open')) return i
		}
	}
	return -1 // No song is open
}

function listHasValidSongs() {
	// With the filters its possible for a season to be empty via the 'hide' class. This checks if there is at least 1 valid song.
	if (songList && songList.length > 1) {
		for (let i = 1; i < songList.length; i++) {
			if (!songList[i].classList.contains('hide')) return true
		}
	} else return false
}

function nextValidSongIndex() {
	let currentIndex = currentSongIndex()
	if (currentIndex === -1) {
		currentIndex = 1
		for (let i = 1; i <= songList.length; i++) {
			if (!songList[i].classList.contains('hide')) return i
		}
	} else {
		for (let i = currentIndex + 1; i < songList.length; i++) {
			if (!songList[i].classList.contains('hide')) return i
		}
		// Check songs before the current index
		for (let i = 1; i <= currentIndex; i++) {
			if (!songList[i].classList.contains('hide')) return i
		}
	}
	return currentIndex
}

// Add event listener to the video player
function videoEndListener(ev) {
	if (!is_looping || !listHasValidSongs()) return
	// If theres only 1 song in the season just replay it
	if (currentSongIndex() === nextValidSongIndex()) {
		getVideoPlayer().play()
	} else {
		// Go to next song
		songList[nextValidSongIndex()].dispatchEvent(new Event('click'))
	}
}
const videoPlayer = getVideoPlayer()
if (videoPlayer) {
	videoPlayer.addEventListener('ended', videoEndListener)
}

// Setup event listener to make the edits when the expanded library is open and loaded
const expandLibraryList = document.getElementById('elQuestionList')
const elObserverConfig = { childList: true }
const elObserver = new MutationObserver((mutationList, obs) => {
	for (const mutation of mutationList) {
		if (mutation.type === 'childList' && mutation.addedNodes[0]) {
			const questionNode = mutation.addedNodes[0]
			if (
				questionNode.classList.contains('elQuestion') &&
				!questionNode.classList.contains('filler')
			) {
				// The batch of elQuestions has loaded
				const songContainers = document.getElementsByClassName(
					'elQuestionSongContainer'
				)
				// For each container, add a loop button
				for (let i = 0; i < songContainers.length; i++) {
					// Create loop element
					const newLoopBtn = document.createElement('button')
					newLoopBtn.innerText = 'Loop'
					newLoopBtn.style.backgroundColor = '#612134'
					newLoopBtn.style.border = 'none'
					newLoopBtn.style.margin = '5px'
					newLoopBtn.style.fontSize = '20px'
					newLoopBtn.addEventListener('click', (ev) => {
						if (newLoopBtn.innerText === 'Looping...' && is_looping) {
							newLoopBtn.innerText = 'Loop'
							is_looping = false
							setVidPlayerAutoplay(false)
							return
						}
						if (!listHasValidSongs) return
						if (loopingBtn) loopingBtn.innerText = 'Loop'
						loopingBtn = newLoopBtn
						loopingBtn.innerText = 'Looping...'
						songList = songContainers[i].children
						setVidPlayerAutoplay(true)
						is_looping = true
						if (currentSongIndex() === -1) {
							songList[nextValidSongIndex()].dispatchEvent(new Event('click'))
						}
					})

					songContainers[i].insertBefore(
						newLoopBtn,
						songContainers[i].children[0]
					)
				}
				break
			}
		}
	}
})
elObserver.observe(expandLibraryList, elObserverConfig)
