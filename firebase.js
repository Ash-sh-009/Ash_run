import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { 
    getDatabase, 
    ref, 
    push, 
    onValue, 
    query, 
    limitToLast, 
    orderByChild 
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-database.js";

// Firebase configuration (replace with your own)
const firebaseConfig = {
    apiKey: "AIzaSyD_1lWebB-jVK7fH7eDF3orLWsr40xzB_0w",
    authDomain: "ashglide.firebaseapp.com",
    databaseURL: "https://ashglide-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "ashglide",
    storageBucket: "ashglide.appspot.com",
    messagingSenderId: "556761430344",
    appId: "1:556761430344:web:9661c2658f9c26f6b25b7d",
    measurementId: "G-BH3G6VREH1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const scoresRef = ref(database, 'scores');

// Submit score to leaderboard
export function submitScore(username, score) {
    push(scoresRef, {
        username: username,
        score: score,
        timestamp: Date.now()
    });
}

// Get leaderboard data
export function getLeaderboard() {
    const leaderboardQuery = query(
        scoresRef, 
        orderByChild('score'), 
        limitToLast(10)
    );
    
    onValue(leaderboardQuery, (snapshot) => {
        const scores = [];
        snapshot.forEach(childSnapshot => {
            const scoreData = childSnapshot.val();
            scores.push({
                username: scoreData.username,
                score: scoreData.score,
                timestamp: scoreData.timestamp
            });
        });
        
        // Sort descending by score
        scores.sort((a, b) => b.score - a.score);
        updateLeaderboardUI(scores);
    });
}

// Update leaderboard UI
function updateLeaderboardUI(scores) {
    const leaderboardList = document.getElementById('leaderboardList');
    
    if (scores.length === 0) {
        leaderboardList.innerHTML = '<li>No scores yet. Be the first!</li>';
        return;
    }
    
    leaderboardList.innerHTML = '';
    
    scores.forEach((score, index) => {
        const li = document.createElement('li');
        
        // Format username
        const usernameSpan = document.createElement('span');
        usernameSpan.textContent = `${index + 1}. ${score.username}`;
        usernameSpan.className = 'username';
        
        // Format score
        const scoreSpan = document.createElement('span');
        scoreSpan.textContent = score.score;
        scoreSpan.className = 'score-value';
        
        li.appendChild(usernameSpan);
        li.appendChild(scoreSpan);
        leaderboardList.appendChild(li);
    });
}
