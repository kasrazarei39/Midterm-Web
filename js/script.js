// URL for getting data from github
const API_URL = 'https://api.github.com/users/'

const userImage = document.querySelector(".user-image");
const userName = document.querySelector("#user-username");
const userBlog = document.querySelector("#user-blog");
const userLocation = document.querySelector("#user-location");
const userBio = document.querySelector("#user-bio");
const actionMessage = document.querySelector(".alert-message");
const actionResult = document.querySelector(".alert");
const favoriteLanguage = document.querySelector("#favorite-language");

// Send request to github for getting username profile
// Check if username exists in local storage
async function sendRequest(e) {
    e.preventDefault();

    // Read username from input box
    const username = document.getElementById("value-input").value;

    // Check valid input
    if (username === "") {
        showAlert("Username is required");
        return;
    }

    // Check local storage
    if (await getFromLocalStorage(username)) {
        return;
    }

    // Send request to github
    try {
        const response = await fetch(`${API_URL}${username}`);

        // Make json object from response
        const profile = await response.json();


        const most_used_lang = await getFavoriteLanguage(username); // set most used language


        // Check response status
        if (response.status === 200) {
            profile.most_used_lang = most_used_lang; // add most used language to data
            // Save profile to local storage
            await saveProfileInLocalStorage(profile);

            // Show profile in UI
            await showProfile(profile)
        }
        // Handle error status
        else {
            if (response.status === 404) {
                showAlert('Username not found')
            } else {
                showAlert('Server Error. Please try again')
            }
        }
    } catch (e) {
        showAlert(e.message);
    }
}

// Get user favorite language
async function getFavoriteLanguage(username) {
    const repositories = await fetch(
        `https://api.github.com/users/${username}/repos?per_page=5&sort=pushed`
    ).catch((err) => {
        showAlert(err.message);
    });

    const userRepositories = await repositories?.json().catch((err) => {
        showAlert(err.message);
    });

    let repositoryLanguageFrequency = 0
    let mostFavoriteLanguages = {}
    const freq_lang = [];
    for (let i = 0; i < userRepositories.length; i++) {
        const languages = userRepositories[i].language
        if (languages === null) {
            continue;
        }
        if (freq_lang[languages]) {
            freq_lang[languages]++;
        } else {
            freq_lang[languages] = 1;
        }
        if (freq_lang[languages] === repositoryLanguageFrequency) {
            mostFavoriteLanguages.push(languages);
        } else if (freq_lang[languages] > repositoryLanguageFrequency) {
            repositoryLanguageFrequency = freq_lang[languages];
            mostFavoriteLanguages = [languages];
        }
    }
    return mostFavoriteLanguages[0];
}

// Load profile from local storage
async function getFromLocalStorage(username) {
    // Loaf profile object by username
    const profile = await JSON.parse(window.localStorage.getItem(username));

    // Check if profile exists
    if (profile) {
        userImage.src = profile.avatar_url ? profile.avatar_url : '...';
        userBio.innerHTML = profile.bio ? profile.bio : '...';
        userName.innerHTML = profile.name ? profile.name : '...';
        userBlog.innerHTML = profile.blog ? profile.blog : '...';
        userLocation.innerHTML = profile.location ? profile.location : '...';
        favoriteLanguage.innerHTML = profile.most_used_lang ? profile.most_used_lang : '...';
        document.querySelector(".user-container").style.display = "block";
        return true;
    }
}

// Display profile
async function showProfile(profile) {
    userName.innerHTML = profile.name ? profile.name : '...';
    userBlog.innerHTML = profile.blog ? profile.blog : '...';
    userBio.innerHTML = profile.bio ? profile.bio.replace("\n", "<br>") : '...';
    userLocation.innerHTML = profile.location ? profile.location : '...';
    userImage.src = profile.avatar_url ? profile.avatar_url : '...';
    favoriteLanguage.innerHTML = profile.most_used_lang ? profile.most_used_lang : '...';
    document.querySelector(".user-container").style.display = "block";
}


// Save profile in local storage
async function saveProfileInLocalStorage(profile) {
    // create object from input
    const profileObject = {
        name: profile.name ? profile.name : '...',
        blog: profile.blog ? profile.blog : '...',
        bio: profile.bio ? profile.bio : '...',
        location: profile.location ? profile.location : '...',
        avatar_url: profile.avatar_url ? profile.avatar_url : '...',
        most_used_lang: profile.most_used_lang ? profile.most_used_lang : '...',
    };

    // save data to local storage
    window.localStorage.setItem(document.getElementById("value-input").value, JSON.stringify(profileObject));
    document.getElementById("value-input").value = ""; // clear input
}


// Show Error bar on the screen
function showAlert(title) {
    actionMessage.textContent = title;
    actionResult.style.display = "block";
    actionResult.style.visibility = "visible";
    // Show error for 3 seconds
    setTimeout(() => {
        actionResult.style.display = "none";
    }, 3000);
}


// Remove data from local storage
window.localStorage.clear();

// Event listener for submit button
document.getElementById("submit-button").addEventListener("click", sendRequest);


