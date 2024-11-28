import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getDatabase, ref, set, push, get, remove } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

// Firebase 配置
const firebaseConfig = {
    apiKey: "AIzaSyB4DwEUsYBVWZIy68_SDJw8Z3_NAswNl-M",
    authDomain: "webprogramming-e9cb9.firebaseapp.com",
    databaseURL: "https://webprogramming-e9cb9-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "webprogramming-e9cb9",
    storageBucket: "webprogramming-e9cb9.firebasestorage.app",
    messagingSenderId: "1047928669829",
    appId: "1:1047928669829:web:af333892985b3a3e6c4bec"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// 定義函數，並確保它們在全局範圍內可訪問
window.editNote = function (noteId, currentTitle, currentContent) {
    // 顯示 Modal 並填入當前的筆記標題與內容
    document.getElementById('edit-note-title').value = currentTitle;
    document.getElementById('edit-note-content').value = currentContent;

    // 儲存修改按鈕的事件
    document.getElementById('save-edit-note-btn').onclick = () => {
        const newTitle = document.getElementById('edit-note-title').value;
        const newContent = document.getElementById('edit-note-content').value;

        if (newTitle && newContent) {
            const noteRef = ref(database, `notes/${auth.currentUser.uid}/${noteId}`);
            set(noteRef, {
                title: newTitle,
                content: newContent,
                timestamp: Date.now()
            }).then(() => {
                alert('筆記已更新！');
                $('#editNoteModal').modal('hide'); // 隱藏 Modal
                displayNotes(auth.currentUser.uid); // 更新筆記列表
            }).catch((error) => {
                alert('更新筆記時發生錯誤：' + error.message);
            });
        } else {
            alert('標題和內容不可為空！');
        }
    };

    // 顯示 Modal
    $('#editNoteModal').modal('show');
}

window.deleteNote = function (noteId) {
    // 顯示刪除確認 Modal
    $('#deleteNoteModal').modal('show');

    // 點擊刪除按鈕時刪除筆記
    document.getElementById('confirm-delete-note-btn').onclick = () => {
        const noteRef = ref(database, `notes/${auth.currentUser.uid}/${noteId}`);

        remove(noteRef).then(() => {
            alert('筆記已刪除！');
            $('#deleteNoteModal').modal('hide'); // 隱藏 Modal
            displayNotes(auth.currentUser.uid); // 更新筆記列表
        }).catch((error) => {
            alert('刪除筆記時發生錯誤：' + error.message);
        });
    };
}

document.addEventListener("DOMContentLoaded", () => {
    // 確保 DOM 完全加載後再處理
    const googleLoginBtn = document.getElementById("google-login-btn");
    const googleRegisterBtn = document.getElementById("google-register-btn");

    // 預設隱藏登入後的內容區域
    document.getElementById("note-form").style.display = "none";
    document.getElementById("user-actions").style.display = "none";

    // 顯示登入和註冊區域
    googleLoginBtn.style.display = "block";
    googleRegisterBtn.style.display = "block";

    // 登入按鈕點擊事件
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener("click", () => {
            const provider = new GoogleAuthProvider();
            signInWithPopup(auth, provider)
                .then((result) => {
                    const user = result.user;
                    checkIfUserExists(user); // 檢查用戶是否已註冊
                })
                .catch((error) => {
                    alert("登入時發生錯誤：" + error.message);
                });
        });
    }

    // 註冊按鈕點擊事件
    if (googleRegisterBtn) {
        googleRegisterBtn.addEventListener("click", () => {
            const provider = new GoogleAuthProvider();
            signInWithPopup(auth, provider)
                .then((result) => {
                    const user = result.user;
                    checkIfUserExists(user); // 檢查用戶是否已註冊
                })
                .catch((error) => {
                    alert("註冊時發生錯誤：" + error.message);
                });
        });
    }

    // 顯示「會員資料」按鈕的事件監聽
    document.getElementById("member-info-btn").addEventListener("click", () => {
        const user = auth.currentUser; // 取得當前登入的用戶
        if (user) {
            showUserInfo(user); // 顯示用戶資料
            $('#user-info-modal').modal('show'); // 顯示包含用戶資料的模態視窗
        }
    });
});


// 檢查用戶是否已註冊
function checkIfUserExists(user) {
    const userRef = ref(database, `users/${user.uid}`);
    get(userRef)
        .then((snapshot) => {
            if (snapshot.exists()) {
                // 用戶已註冊，顯示用戶資料並顯示筆記
                showUserInfo(user);
                displayNotes(user.uid); // 顯示筆記
            } else {
                // 用戶未註冊，提示用戶並要求先註冊
                alert("您尚未註冊，請先完成註冊！");
                saveUserInfoToDatabase(user); // 註冊用戶並儲存資料
                showUserInfo(user); // 顯示用戶資料
                displayNotes(user.uid); // 顯示筆記
            }
        })
        .catch((error) => {
            alert("檢查用戶資料時發生錯誤：" + error.message);
        });
}

// 儲存用戶資料到 Firebase Realtime Database
function saveUserInfoToDatabase(user) {
    const userRef = ref(database, `users/${user.uid}`);
    const lastLoginTime = Date.now(); // 取得當前的時間戳

    set(userRef, {
        displayName: user.displayName || "匿名使用者",
        email: user.email,
        photoURL: user.photoURL || "",
        lastLogin: lastLoginTime // 儲存最後登入時間
    });
}

function showUserInfo(user) {
    // 顯示用戶資料區域
    const userInfo = document.getElementById("user-info");
    const profilePic = document.getElementById("profile-pic");

    // 顯示用戶信息
    if (userInfo) userInfo.style.display = "block";
    if (profilePic) profilePic.src = user.photoURL || "https://via.placeholder.com/80"; // 預設圖片

    const userName = document.getElementById("user-name");
    const userEmail = document.getElementById("user-email");
    const lastLogin = document.getElementById("last-login");

    if (userName) userName.textContent = user.displayName || "匿名使用者";
    if (userEmail) userEmail.textContent = user.email;

    if (lastLogin) {
        const lastLoginTime = user.metadata.lastSignInTime
            ? new Date(user.metadata.lastSignInTime).toLocaleString()
            : "無法取得"; // 若無法取得登入時間，顯示預設文字
        lastLogin.textContent = `最後登入時間: ${lastLoginTime}`;
    }

    // 顯示登出按鈕
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) logoutBtn.style.display = "block"; // 顯示登出按鈕

    // 顯示筆記表單區域
    document.getElementById("note-form").style.display = "block"; // 顯示筆記表單
    document.getElementById("user-actions").style.display = "block"; // 顯示用戶操作區域（如登出）

    // 隱藏登入和註冊區域
    document.getElementById("google-register-btn").style.display = "none"; // 隱藏註冊表單
    document.getElementById("google-login-btn").style.display = "none"; // 隱藏登入表單
}



// 顯示筆記及操作按鈕（修改、刪除）
function displayNotes(userId) {
    const notesRef = ref(database, `notes/${userId}`);
    get(notesRef).then((snapshot) => {
        if (snapshot.exists()) {
            const notes = snapshot.val();
            let notesList = "<ul>";
            for (const noteId in notes) {
                notesList += `
                    <li id="note-${noteId}">
                        <strong>${notes[noteId].title}</strong>: ${notes[noteId].content}
                        <button onclick="editNote('${noteId}', '${notes[noteId].title}', '${notes[noteId].content}')">編輯</button>
                        <button onclick="deleteNote('${noteId}')">刪除</button>
                    </li>
                `;
            }
            notesList += "</ul>";
            document.getElementById("notes-list").innerHTML = notesList;
        } else {
            document.getElementById("notes-list").innerHTML = "<p>您尚未新增筆記。</p>";
        }
    }).catch((error) => {
        alert("載入筆記時發生錯誤：" + error.message);
    });
}
// 新增筆記功能
document.getElementById("save-note-btn").addEventListener("click", () => {
    const noteTitle = document.getElementById("note-title").value;
    const noteContent = document.getElementById("note-content").value;

    if (noteTitle && noteContent) {
        const notesRef = ref(database, `notes/${auth.currentUser.uid}`);
        const newNoteRef = push(notesRef);
        set(newNoteRef, {
            title: noteTitle,
            content: noteContent,
            timestamp: Date.now()
        }).then(() => {
            alert("筆記已儲存！");
            displayNotes(auth.currentUser.uid); // 更新筆記列表
        }).catch((error) => {
            alert("儲存筆記時發生錯誤：" + error.message);
        });
    } else {
        alert("標題和內容不可為空！");
    }
});






// 登出功能
document.getElementById("logout-btn").addEventListener("click", () => {
    signOut(auth).then(() => {
        // 登出後隱藏用戶資訊和登出按鈕
        document.getElementById("note-form").style.display = "none";
        document.getElementById("user-actions").style.display = "none";
        document.getElementById("google-register-btn").style.display = "block"; // 顯示註冊按鈕
        document.getElementById("google-login-btn").style.display = "block"; // 顯示登入按鈕
        alert("您已成功登出！");
    }).catch((error) => {
        alert("登出時發生錯誤：" + error.message);
    });
});
