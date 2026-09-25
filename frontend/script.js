/* =========================================================
   METRACK - Meeting Accountability Tracker
   ========================================================= */

/* =========================
   BACKEND CONFIG
========================= */

// IMPORTANT:
// Use your actual FastAPI endpoint here.
// Example:
// const BACKEND_URL = "http://localhost:8000/extract";

const BACKEND_URL = "http://localhost:8000/extract";


/* =========================
   DEMO USERS
========================= */

const USERS = [
    {
        email: "meera@demo.com",
        password: "manager123",
        name: "Meera Nair",
        role: "admin"
    },
    {
        email: "ravi@demo.com",
        password: "pass123",
        name: "Ravi Kumar",
        role: "user"
    },
    {
        email: "priya@demo.com",
        password: "pass123",
        name: "Priya Shah",
        role: "user"
    },
    {
        email: "arjun@demo.com",
        password: "pass123",
        name: "Arjun Das",
        role: "user"
    }
];


/* =========================
   HELPERS
========================= */

function getUserName(email) {
    const user = USERS.find(u => u.email === email);
    return user ? user.name : "Unassigned";
}

function getUserByName(name) {
    if (!name) return null;

    const firstName = String(name)
        .trim()
        .split(" ")[0]
        .toLowerCase();

    return USERS.find(
        u => u.name.split(" ")[0].toLowerCase() === firstName
    );
}

function todayISO() {
    const d = new Date();

    return (
        d.getFullYear() +
        "-" +
        String(d.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(d.getDate()).padStart(2, "0")
    );
}

function addDays(date, number) {
    const d = new Date(date);
    d.setDate(d.getDate() + number);
    return d;
}

function isoDate(date) {
    return (
        date.getFullYear() +
        "-" +
        String(date.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(date.getDate()).padStart(2, "0")
    );
}

function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================
   DEMO MEETINGS
========================= */

const MEETINGS = [

    {
        id: "M1",
        title: "Sprint Planning",
        date: isoDate(addDays(new Date(), -14)),

        summary:
            "Team agreed to lock the release for month end and start a pilot with the Beta vendor.",

        decisions: [
            "Go with the Beta vendor pilot"
        ],

        unresolved: [
            "Who emails the vendor about pricing was left unclear"
        ],

        lines: [
            [
                "Meera",
                "Let us lock the release for the end of the month."
            ],
            [
                "Ravi",
                "I will finish the payment API integration by Friday."
            ],
            [
                "Meera",
                "Priya, please prepare the vendor comparison sheet by Monday."
            ],
            [
                "Arjun",
                "Someone should email the vendor about pricing."
            ],
            [
                "Meera",
                "Decision: we go with the Beta vendor pilot."
            ],
            [
                "Arjun",
                "I will set up the staging server today."
            ]
        ]
    },

    {
        id: "M2",
        title: "Weekly Sync",
        date: isoDate(addDays(new Date(), -7)),

        summary:
            "Payment API is running late. Vendor sheet is drafted. QA checklist assigned.",

        decisions: [],

        unresolved: [
            "Pricing email to vendor still has no owner"
        ],

        lines: [
            [
                "Meera",
                "Ravi, how is the payment API?"
            ],
            [
                "Ravi",
                "Still in progress, I need two more days."
            ],
            [
                "Priya",
                "The vendor sheet is drafted, I will send it Monday."
            ],
            [
                "Meera",
                "Arjun, you will draft the QA checklist by Thursday."
            ],
            [
                "Meera",
                "Open question: who owns the pricing email to the vendor?"
            ]
        ]
    },

    {
        id: "M3",
        title: "Release Review",
        date: isoDate(addDays(new Date(), -1)),

        summary:
            "Release postponed by one week. Payment API and QA checklist still open.",

        decisions: [
            "Postpone the release by one week"
        ],

        unresolved: [
            "Pricing email to vendor is still unowned"
        ],

        lines: [
            [
                "Meera",
                "Ravi, the payment API is now due this Friday at 5 PM."
            ],
            [
                "Priya",
                "The vendor sheet is shared, done."
            ],
            [
                "Meera",
                "Arjun, the QA checklist is still pending."
            ],
            [
                "Meera",
                "Priya, please write the release notes by Tuesday."
            ],
            [
                "Meera",
                "Decision: we postpone the release by one week."
            ]
        ]
    }

];


/* =========================
   ACTION ITEMS
========================= */

const ITEMS = [

    {
        id: "A1",
        task: "Finish payment API integration",
        owner: "ravi@demo.com",
        deadlineText: "Friday",
        status: "active",
        meetings: ["M1", "M2", "M3"],
        source:
            "I will finish the payment API integration by Friday.",
        evidence: [
            ["M1", 2],
            ["M3", 1]
        ]
    },

    {
        id: "A2",
        task: "Prepare vendor comparison sheet",
        owner: "priya@demo.com",
        deadlineText: "Monday",
        status: "active",
        meetings: ["M1", "M2"],
        source:
            "Priya, please prepare the vendor comparison sheet by Monday.",
        evidence: [
            ["M1", 3],
            ["M2", 3]
        ]
    },

    {
        id: "A3",
        task: "Email vendor about pricing",
        owner: "",
        deadlineText: "No deadline",
        status: "active",
        meetings: ["M1", "M2", "M3"],
        source:
            "Someone should email the vendor about pricing.",
        evidence: [
            ["M1", 4],
            ["M2", 5]
        ]
    },

    {
        id: "A4",
        task: "Draft QA checklist",
        owner: "arjun@demo.com",
        deadlineText: "Thursday",
        status: "active",
        meetings: ["M2", "M3"],
        source:
            "Arjun, you will draft the QA checklist by Thursday.",
        evidence: [
            ["M2", 4],
            ["M3", 3]
        ]
    },

    {
        id: "A5",
        task: "Write release notes",
        owner: "priya@demo.com",
        deadlineText: "Tuesday",
        status: "active",
        meetings: ["M3"],
        source:
            "Priya, please write the release notes by Tuesday.",
        evidence: [
            ["M3", 4]
        ]
    },

    {
        id: "A6",
        task: "Set up staging server",
        owner: "arjun@demo.com",
        deadlineText: "Completed",
        status: "done",
        meetings: ["M1"],
        source:
            "I will set up the staging server today.",
        evidence: [
            ["M1", 6]
        ]
    }

];


/* =========================
   APP STATE
========================= */

let state = {
    user: null,
    tab: "active",
    selectedUser: "all",
    search: "",
    emails: []
};


/* =========================
   RESTORE LOGIN
========================= */

try {

    const savedUser =
        sessionStorage.getItem("metrack_user");

    if (savedUser) {

        state.user =
            USERS.find(
                u => u.email === savedUser
            ) || null;
    }

} catch (error) {

    console.log("Session storage unavailable.");

}


/* =========================
   STATUS TAG
========================= */

function statusTag(item) {

    if (item.status === "done") {

        return `
            <span class="tag done">
                Done
            </span>
        `;
    }

    if (!item.owner) {

        return `
            <span class="tag bad">
                Unassigned
            </span>
        `;
    }

    if (item.meetings.length > 1) {

        return `
            <span class="tag pending">
                Carried over (${item.meetings.length} meetings)
            </span>
        `;
    }

    return `
        <span class="tag info">
            Active
        </span>
    `;
}


/* =========================
   LOGIN PAGE
========================= */

function loginView() {

    return `

        <div class="login-page">

            <section class="login-left">

                <div class="logo-box">
                    M
                </div>

                <h1>
                    Me<span>track</span>
                </h1>

                <div class="subtitle">
                    Meeting Accountability Tracker
                </div>

                <p>
                    Turn every meeting into clear owners,
                    deadlines and follow-through.
                </p>

                <ul>

                    <li>
                        Extract action items from meetings
                    </li>

                    <li>
                        Track owners and deadlines
                    </li>

                    <li>
                        Trace every task to transcript evidence
                    </li>

                    <li>
                        Track completed and pending work
                    </li>

                </ul>

            </section>


            <section class="login-right">

                <form
                    class="login-box"
                    id="loginForm"
                >

                    <h2>
                        Welcome back
                    </h2>

                    <p class="muted">
                        Sign in with your work account.
                    </p>


                    <label>
                        Email
                    </label>

                    <input
                        id="email"
                        type="email"
                        required
                        placeholder="you@example.com"
                    >


                    <label>
                        Password
                    </label>

                    <input
                        id="password"
                        type="password"
                        required
                        placeholder="Password"
                    >


                    <div
                        id="loginError"
                        class="error"
                    ></div>


                    <button
                        class="btn primary full"
                        type="submit"
                    >
                        Sign in
                    </button>


                    <div class="demo">

                        <b>
                            Demo accounts
                        </b>

                        <br><br>

                        Admin:
                        <code>meera@demo.com</code>
                        /
                        <code>manager123</code>

                        <br>

                        User:
                        <code>ravi@demo.com</code>
                        /
                        <code>pass123</code>

                        <br>

                        User:
                        <code>priya@demo.com</code>
                        /
                        <code>pass123</code>

                    </div>

                </form>

            </section>

        </div>

    `;
}


/* =========================
   DASHBOARD
========================= */

function dashboard() {

    const user = state.user;

    const isAdmin =
        user.role === "admin";


    let items = isAdmin
        ? ITEMS
        : ITEMS.filter(
            i => i.owner === user.email
        );


    if (
        isAdmin &&
        state.selectedUser !== "all"
    ) {

        items = items.filter(
            i => i.owner === state.selectedUser
        );

    }


    if (
        isAdmin &&
        state.search.trim()
    ) {

        const search =
            state.search
                .toLowerCase()
                .trim();

        items = items.filter(
            item =>
                getUserName(item.owner)
                    .toLowerCase()
                    .includes(search)
        );

    }


    const activeItems =
        items.filter(
            i => i.status === "active"
        );


    const historyItems =
        items.filter(
            i => i.status === "done"
        );


    let content = "";


    /* ACTIVE */

    if (state.tab === "active") {

        if (isAdmin) {

            content += `

                <div class="stats">

                    <div class="stat">

                        <strong>
                            ${activeItems.length}
                        </strong>

                        <span>
                            Active items
                        </span>

                    </div>


                    <div class="stat">

                        <strong>
                            ${
                                activeItems.filter(
                                    i => !i.owner
                                ).length
                            }
                        </strong>

                        <span>
                            Need an owner
                        </span>

                    </div>


                    <div class="stat">

                        <strong>
                            ${historyItems.length}
                        </strong>

                        <span>
                            Completed
                        </span>

                    </div>


                    <div class="stat">

                        <strong>
                            ${ITEMS.length}
                        </strong>

                        <span>
                            Total action items
                        </span>

                    </div>

                </div>

            `;
        }


        content +=
            actionTable(
                activeItems,
                isAdmin
            );
    }


    /* HISTORY */

    else if (state.tab === "history") {

        content +=
            actionTable(
                historyItems,
                isAdmin
            );
    }


    /* MEETINGS */

    else if (state.tab === "meetings") {

        content += meetingsView();

    }


    /* UPLOAD */

    else if (state.tab === "upload") {

        content += uploadView();

    }


    /* EMAIL */

    else if (state.tab === "email") {

        content += emailView();

    }


    let filterHTML = "";


    if (
        isAdmin &&
        (
            state.tab === "active" ||
            state.tab === "history"
        )
    ) {

        filterHTML = `

            <div class="filters">

                <label class="muted">
                    User
                </label>

                <select id="userFilter">

                    <option value="all">
                        All users
                    </option>

                    ${
                        USERS
                            .filter(
                                u => u.role === "user"
                            )
                            .map(
                                u => `
                                    <option
                                        value="${u.email}"
                                        ${
                                            state.selectedUser === u.email
                                                ? "selected"
                                                : ""
                                        }
                                    >
                                        ${escapeHTML(u.name)}
                                    </option>
                                `
                            )
                            .join("")
                    }

                </select>


                <input
                    id="userSearch"
                    type="text"
                    placeholder="Search user..."
                    value="${escapeHTML(state.search)}"
                >

            </div>

        `;
    }


    const initials =
        user.name
            .split(" ")
            .map(
                n => n[0]
            )
            .join("");


    return `

        <div class="app-shell">

            <aside class="sidebar">

                <div class="brand">

                    <div class="brand-logo">
                        M
                    </div>

                    <div>

                        <div class="brand-name">
                            Me<span>track</span>
                        </div>

                        <small>
                            ${
                                isAdmin
                                    ? "Admin"
                                    : "User"
                            }
                            workspace
                        </small>

                    </div>

                </div>


                <nav class="nav">

                    <button
                        class="${
                            state.tab === "active"
                                ? "active"
                                : ""
                        }"
                        data-tab="active"
                    >
                        <span class="nav-icon">
                            ▣
                        </span>

                        Active
                    </button>


                    ${
                        isAdmin
                            ? `

                                <button
                                    class="${
                                        state.tab === "upload"
                                            ? "active"
                                            : ""
                                    }"
                                    data-tab="upload"
                                >

                                    <span class="nav-icon">
                                        ↑
                                    </span>

                                    Upload transcript

                                </button>

                            `
                            : ""
                    }


                    <button
                        class="${
                            state.tab === "history"
                                ? "active"
                                : ""
                        }"
                        data-tab="history"
                    >

                        <span class="nav-icon">
                            ↶
                        </span>

                        History

                    </button>


                    <button
                        class="${
                            state.tab === "meetings"
                                ? "active"
                                : ""
                        }"
                        data-tab="meetings"
                    >

                        <span class="nav-icon">
                            ☰
                        </span>

                        Meeting summaries

                    </button>


                    ${
                        isAdmin
                            ? `

                                <button
                                    class="${
                                        state.tab === "email"
                                            ? "active"
                                            : ""
                                    }"
                                    data-tab="email"
                                >

                                    <span class="nav-icon">
                                        ✉
                                    </span>

                                    Email log

                                </button>

                            `
                            : ""
                    }

                </nav>


                <div class="user-box">

                    <div class="avatar">
                        ${escapeHTML(initials)}
                    </div>

                    <div class="user-info">

                        <b>
                            ${escapeHTML(user.name)}
                        </b>

                        <small>
                            ${escapeHTML(user.email)}
                        </small>

                    </div>

                    <button
                        class="btn small"
                        id="logout"
                    >
                        Exit
                    </button>

                </div>

            </aside>


            <main class="main">

                <header class="hero">

                    <small>

                        ${
                            new Date().toLocaleDateString(
                                undefined,
                                {
                                    weekday: "long",
                                    day: "numeric",
                                    month: "long"
                                }
                            )
                        }

                    </small>


                    <h1>

                        ${
                            state.tab === "active"
                                ? (
                                    isAdmin
                                        ? "Active action items"
                                        : "My action items"
                                )
                                : state.tab === "upload"
                                    ? "Upload a transcript"
                                    : state.tab === "history"
                                        ? "History"
                                        : state.tab === "meetings"
                                            ? "Meeting summaries"
                                            : "Reminder email log"
                        }

                    </h1>

                </header>


                <div class="content">

                    ${filterHTML}

                    ${content}

                </div>

            </main>

        </div>

    `;
}


/* =========================
   ACTION TABLE
========================= */

function actionTable(items, isAdmin) {

    if (!items.length) {

        return `

            <div class="card empty">

                No action items found.

            </div>

        `;
    }


    return `

        <div class="table-wrapper">

            <table>

                <thead>

                    <tr>

                        <th>
                            Task
                        </th>

                        ${
                            isAdmin
                                ? "<th>Owner</th>"
                                : ""
                        }

                        <th>
                            Meetings
                        </th>

                        <th>
                            Deadline
                        </th>

                        <th>
                            Status
                        </th>

                        <th>
                            Evidence
                        </th>

                        ${
                            isAdmin
                                ? "<th>Action</th>"
                                : ""
                        }

                    </tr>

                </thead>


                <tbody>

                    ${
                        items.map(item => {

                            let ownerCell = "";


                            if (isAdmin) {

                                if (item.owner) {

                                    ownerCell = `

                                        <td>

                                            ${escapeHTML(
                                                getUserName(
                                                    item.owner
                                                )
                                            )}

                                        </td>

                                    `;

                                } else {

                                    ownerCell = `

                                        <td>

                                            <span class="tag bad">
                                                Unassigned
                                            </span>

                                            <br><br>

                                            <select
                                                data-assign="${item.id}"
                                            >

                                                <option value="">
                                                    Assign...
                                                </option>

                                                ${
                                                    USERS
                                                        .filter(
                                                            u =>
                                                                u.role === "user"
                                                        )
                                                        .map(
                                                            u => `
                                                                <option
                                                                    value="${u.email}"
                                                                >
                                                                    ${escapeHTML(
                                                                        u.name
                                                                    )}
                                                                </option>
                                                            `
                                                        )
                                                        .join("")
                                                }

                                            </select>

                                        </td>

                                    `;
                                }
                            }


                            const actionCell =
                                isAdmin
                                    ? `

                                        <td>

                                            ${
                                                item.status !== "done"
                                                    ? `

                                                        <button
                                                            class="btn small primary"
                                                            data-done="${item.id}"
                                                        >
                                                            Mark submitted
                                                        </button>

                                                    `
                                                    : `

                                                        <span class="muted">
                                                            Submitted
                                                        </span>

                                                    `
                                            }

                                        </td>

                                    `
                                    : "";


                            return `

                                <tr>

                                    <td>

                                        <b>
                                            ${escapeHTML(item.task)}
                                        </b>

                                        <div class="source">
                                            "${escapeHTML(item.source)}"
                                        </div>

                                        <span class="tag done">
                                            Verified
                                        </span>

                                    </td>


                                    ${ownerCell}


                                    <td>

                                        ${
                                            item.meetings
                                                .map(id => {

                                                    const meeting =
                                                        MEETINGS.find(
                                                            m =>
                                                                m.id === id
                                                        );

                                                    return escapeHTML(
                                                        meeting
                                                            ? meeting.title
                                                            : id
                                                    );

                                                })
                                                .join(", ")
                                        }

                                    </td>


                                    <td>
                                        ${escapeHTML(
                                            item.deadlineText
                                        )}
                                    </td>


                                    <td>
                                        ${statusTag(item)}
                                    </td>


                                    <td>

                                        <button
                                            class="btn small"
                                            data-evidence="${item.id}"
                                        >
                                            View source
                                        </button>

                                    </td>


                                    ${actionCell}

                                </tr>

                            `;

                        }).join("")
                    }

                </tbody>

            </table>

        </div>

    `;
}


/* =========================
   MEETINGS
========================= */

function meetingsView() {

    const isAdmin =
        state.user.role === "admin";


    return `

        <div class="grid">

            ${
                MEETINGS.map(meeting => {

                    const items =
                        ITEMS.filter(
                            item =>
                                item.meetings.includes(
                                    meeting.id
                                ) &&
                                (
                                    isAdmin ||
                                    item.owner ===
                                        state.user.email
                                )
                        );


                    return `

                        <div class="card">

                            <h2>
                                ${escapeHTML(
                                    meeting.title
                                )}
                            </h2>


                            <div class="muted">
                                ${escapeHTML(
                                    meeting.date
                                )}
                            </div>


                            <p>
                                ${escapeHTML(
                                    meeting.summary
                                )}
                            </p>


                            <h3>
                                Decisions
                            </h3>


                            ${
                                meeting.decisions.length
                                    ? `

                                        <ul>

                                            ${
                                                meeting.decisions
                                                    .map(
                                                        d =>
                                                            `<li>${escapeHTML(d)}</li>`
                                                    )
                                                    .join("")
                                            }

                                        </ul>

                                    `
                                    : `

                                        <div class="muted">
                                            None recorded
                                        </div>

                                    `
                            }


                            <h3>
                                Unresolved
                            </h3>


                            ${
                                meeting.unresolved.length
                                    ? `

                                        <ul>

                                            ${
                                                meeting.unresolved
                                                    .map(
                                                        d =>
                                                            `<li>${escapeHTML(d)}</li>`
                                                    )
                                                    .join("")
                                            }

                                        </ul>

                                    `
                                    : `

                                        <div class="muted">
                                            None
                                        </div>

                                    `
                            }


                            <h3>
                                Action items
                            </h3>


                            ${
                                items.length
                                    ? `

                                        <ul>

                                            ${
                                                items
                                                    .map(
                                                        item =>
                                                            `
                                                                <li>
                                                                    ${escapeHTML(
                                                                        item.task
                                                                    )}
                                                                    -
                                                                    ${escapeHTML(
                                                                        getUserName(
                                                                            item.owner
                                                                        )
                                                                    )}
                                                                </li>
                                                            `
                                                    )
                                                    .join("")
                                            }

                                        </ul>

                                    `
                                    : `

                                        <div class="muted">
                                            None
                                        </div>

                                    `
                            }


                            <button
                                class="btn small"
                                data-transcript="${meeting.id}"
                            >
                                View transcript
                            </button>

                        </div>

                    `;

                }).join("")
            }

        </div>

    `;
}


/* =========================
   UPLOAD VIEW
========================= */

function uploadView() {

    return `

        <div class="card upload">

            <h2>
                Upload a meeting transcript
            </h2>

            <p class="muted">
                Upload a PDF, Word document or TXT transcript.
            </p>


            <label>
                Meeting title
            </label>

            <input
                id="meetingTitle"
                type="text"
                placeholder="Weekly Sync"
            >


            <label>
                Meeting date
            </label>

            <input
                id="meetingDate"
                type="date"
                value="${todayISO()}"
            >


            <label>
                Transcript file
            </label>

            <input
                id="transcriptFile"
                type="file"
                accept=".pdf,.docx,.txt"
            >


            <br><br>


            <button
                class="btn primary"
                id="processTranscript"
            >
                Extract action items
            </button>


            <div
                id="uploadMessage"
                style="margin-top:15px"
            ></div>

        </div>

    `;
}


/* =========================
   EMAIL VIEW
========================= */

function emailView() {

    if (!state.emails.length) {

        return `

            <div class="card empty">
                No reminder emails yet.
            </div>

        `;
    }


    return `

        <div class="card">

            ${
                state.emails
                    .map(
                        email => `

                            <div class="email-item">

                                <b>
                                    To: ${escapeHTML(email.to)}
                                </b>

                                <div class="muted">
                                    ${escapeHTML(email.time)}
                                </div>

                                <strong>
                                    ${escapeHTML(email.subject)}
                                </strong>

                                <div class="muted">
                                    ${escapeHTML(email.message)}
                                </div>

                            </div>

                        `
                    )
                    .join("")
            }

        </div>

    `;
}


/* =========================
   FILE READER
========================= */

async function readFile(file) {

    const name =
        file.name.toLowerCase();


    /* TXT */

    if (name.endsWith(".txt")) {

        return await file.text();

    }


    /* DOCX */

    if (name.endsWith(".docx")) {

        if (typeof mammoth === "undefined") {

            throw new Error(
                "DOCX reader could not load. Check internet connection."
            );

        }


        const result =
            await mammoth.extractRawText({
                arrayBuffer:
                    await file.arrayBuffer()
            });


        return result.value;

    }


    /* PDF */

    if (name.endsWith(".pdf")) {

        if (typeof pdfjsLib === "undefined") {

            throw new Error(
                "PDF reader could not load. Check internet connection."
            );

        }


        pdfjsLib.GlobalWorkerOptions.workerSrc =
            "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";


        const pdf =
            await pdfjsLib.getDocument({
                data:
                    await file.arrayBuffer()
            }).promise;


        let text = "";


        for (
            let pageNumber = 1;
            pageNumber <= pdf.numPages;
            pageNumber++
        ) {

            const page =
                await pdf.getPage(
                    pageNumber
                );


            const content =
                await page.getTextContent();


            content.items.forEach(
                item => {

                    text += item.str + " ";

                }
            );


            text += "\n";

        }


        return text;

    }


    throw new Error(
        "Unsupported file. Use PDF, DOCX or TXT."
    );
}


/* =========================
   TRANSCRIPT PARSER
========================= */

function parseTranscript(text) {

    return text

        .split(/\r?\n/)

        .map(
            line => line.trim()
        )

        .filter(Boolean)

        .map(line => {

            /*
                Supports:

                Ravi: I will finish this.
                Ravi - I will finish this.
            */

            const match =
                line.match(
                    /^([A-Za-z][A-Za-z .'-]{0,30})\s*[:\-]\s*(.+)$/
                );


            if (match) {

                return {

                    speaker:
                        match[1].trim(),

                    text:
                        match[2].trim()

                };

            }


            return {

                speaker: "",

                text: line

            };

        });
}


/* =========================
   BACKEND CONNECTION
========================= */

async function extractFromBackend(
    lines,
    meetingId,
    date
) {

    // Convert transcript lines into one text string
    const transcript = lines
        .map(line => {
            return `${line.speaker}: ${line.text}`;
        })
        .join("\n");


    const payload = {
        text: transcript
    };


    console.log(
        "Sending transcript to backend:",
        payload
    );


    const response =
        await fetch(
            BACKEND_URL,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify(payload)
            }
        );


    if (!response.ok) {

        throw new Error(
            "Backend returned HTTP " +
            response.status
        );

    }


    const data =
        await response.json();


    if (data.error) {

        throw new Error(
            data.error
        );

    }


    console.log(
        "Backend response:",
        data
    );


    return data;
}
/* =========================
   LOCAL DEMO EXTRACTION
========================= */

function localExtraction(lines) {

    const actionItems = [];


    lines.forEach(line => {

        const text =
            line.text.toLowerCase();


        if (
            text.includes("i will") ||
            text.includes("i'll") ||
            text.includes("please") ||
            text.includes("you will")
        ) {

            let owner = "";


            const user =
                getUserByName(
                    line.speaker
                );


            if (user) {

                owner =
                    user.email;

            }


            let task =
                line.text

                    .replace(
                        /^i will\s+/i,
                        ""
                    )

                    .replace(
                        /^i'll\s+/i,
                        ""
                    )

                    .replace(
                        /^[A-Za-z]+,\s*please\s+/i,
                        ""
                    )

                    .replace(
                        /^[A-Za-z]+,\s*you will\s+/i,
                        ""
                    );


            actionItems.push({

                task:
                    task.replace(
                        /[.!]+$/,
                        ""
                    ),

                owner: owner,

                deadline:
                    detectDeadline(
                        line.text
                    ),

                source:
                    line.text

            });

        }


        if (
            text.includes("someone should") ||
            text.includes("who owns")
        ) {

            actionItems.push({

                task:
                    line.text

                        .replace(
                            /^someone should\s+/i,
                            ""
                        )

                        .replace(
                            /[.!]+$/,
                            ""
                        ),

                owner: "",

                deadline: "",

                source:
                    line.text

            });

        }

    });


    return {

        action_items:
            actionItems,

        decisions: [],

        unresolved_questions: []

    };
}


/* =========================
   DEADLINE
========================= */

function detectDeadline(text) {

    const days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
    ];


    for (const day of days) {

        if (
            text
                .toLowerCase()
                .includes(
                    day.toLowerCase()
                )
        ) {

            return day;

        }

    }


    if (
        text
            .toLowerCase()
            .includes("tomorrow")
    ) {

        return "Tomorrow";

    }


    if (
        text
            .toLowerCase()
            .includes("today")
    ) {

        return "Today";

    }


    return "";
}


/* =========================
   PROCESS TRANSCRIPT
========================= */

async function processTranscript() {

    const file =
        document.getElementById(
            "transcriptFile"
        ).files[0];


    const title =
        document.getElementById(
            "meetingTitle"
        ).value.trim();


    const date =
        document.getElementById(
            "meetingDate"
        ).value;


    const message =
        document.getElementById(
            "uploadMessage"
        );


    if (
        !file ||
        !title ||
        !date
    ) {

        message.innerHTML = `

            <div class="tag bad">
                Please enter title, date and transcript.
            </div>

        `;

        return;
    }


    message.innerHTML = `

        <div class="muted">
            Reading transcript...
        </div>

    `;


    try {

        const text =
            await readFile(file);


        const lines =
            parseTranscript(text);


        if (!lines.length) {

            throw new Error(
                "No readable transcript text found."
            );

        }


        let result;


        /*
            SEND TO BACKEND
        */

        message.innerHTML = `

            <div class="muted">
                Sending transcript to AI backend...
            </div>

        `;


        try {

            result =
                await extractFromBackend(
                    lines,
                    "upload-" + Date.now(),
                    date
                );

        } catch (backendError) {

            console.error(
                "Backend error:",
                backendError
            );


            /*
                FALLBACK DEMO MODE
                This keeps your demo working
                even if backend has a problem.
            */

            message.innerHTML = `

                <div class="muted">
                    Backend unavailable. Running demo extraction...
                </div>

            `;


            result =
                localExtraction(lines);

        }


        displayExtractionResult(
            result,
            title
        );


    } catch (error) {

        console.error(error);


        message.innerHTML = `

            <div class="tag bad">

                ${escapeHTML(
                    error.message ||
                    "Processing failed."
                )}

            </div>

        `;

    }

}


/* =========================
   DISPLAY RESULT
========================= */

function displayExtractionResult(
    result,
    title
) {

    const message =
        document.getElementById(
            "uploadMessage"
        );


    const actionItems =
        result.action_items || [];


    const decisions =
        result.decisions || [];


    const unresolved =
        result.unresolved_questions || [];


    message.innerHTML = `

        <div
            class="card"
            style="margin-top:20px"
        >

            <h2>
                ${escapeHTML(title)}
            </h2>


            <p class="muted">
                Meeting processed successfully.
            </p>


            <div class="stats">

                <div class="stat">

                    <strong>
                        ${actionItems.length}
                    </strong>

                    <span>
                        Action items
                    </span>

                </div>


                <div class="stat">

                    <strong>
                        ${decisions.length}
                    </strong>

                    <span>
                        Decisions
                    </span>

                </div>


                <div class="stat">

                    <strong>
                        ${unresolved.length}
                    </strong>

                    <span>
                        Unresolved
                    </span>

                </div>

            </div>


            <h3>
                Extracted Action Items
            </h3>


            ${
                actionItems.length

                    ? `

                        <div class="table-wrapper">

                            <table>

                                <thead>

                                    <tr>

                                        <th>
                                            Task
                                        </th>

                                        <th>
                                            Owner
                                        </th>

                                        <th>
                                            Deadline
                                        </th>

                                        <th>
                                            Source
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    ${
                                        actionItems
                                            .map(
                                                item => `

                                                    <tr>

                                                        <td>
                                                            <b>
                                                                ${escapeHTML(
                                                                    item.task
                                                                )}
                                                            </b>
                                                        </td>


                                                        <td>
                                                            ${escapeHTML(
                                                                item.owner ||
                                                                "Unassigned"
                                                            )}
                                                        </td>


                                                        <td>
                                                            ${escapeHTML(
                                                                item.deadline ||
                                                                "Not specified"
                                                            )}
                                                        </td>


                                                        <td>

                                                            <span class="muted">
                                                                ${escapeHTML(
                                                                    item.source ||
                                                                    ""
                                                                )}
                                                            </span>

                                                        </td>

                                                    </tr>

                                                `
                                            )
                                            .join("")
                                    }

                                </tbody>

                            </table>

                        </div>

                    `

                    : `

                        <div class="empty">
                            No action items found.
                        </div>

                    `
            }


            ${
                decisions.length

                    ? `

                        <h3>
                            Decisions
                        </h3>

                        <ul>

                            ${
                                decisions
                                    .map(
                                        d =>
                                            `<li>${escapeHTML(
                                                typeof d === "string"
                                                    ? d
                                                    : d.decision
                                            )}</li>`
                                    )
                                    .join("")
                            }

                        </ul>

                    `

                    : ""
            }


            ${
                unresolved.length

                    ? `

                        <h3>
                            Unresolved Questions
                        </h3>

                        <ul>

                            ${
                                unresolved
                                    .map(
                                        q =>
                                            `<li>${escapeHTML(
                                                typeof q === "string"
                                                    ? q
                                                    : q.question
                                            )}</li>`
                                    )
                                    .join("")
                            }

                        </ul>

                    `

                    : ""
            }

        </div>

    `;
}


/* =========================
   MODAL
========================= */

function showModal(html) {

    const modal =
        document.createElement(
            "div"
        );


    modal.className =
        "modal";


    modal.innerHTML = `

        <div class="modal-content">

            ${html}

            <br>

            <button
                class="btn"
                id="closeModal"
            >
                Close
            </button>

        </div>

    `;


    document.body.appendChild(
        modal
    );


    modal.addEventListener(
        "click",
        event => {

            if (
                event.target === modal ||
                event.target.id ===
                    "closeModal"
            ) {

                modal.remove();

            }

        }
    );
}


/* =========================
   TRANSCRIPT MODAL
========================= */

function showTranscript(
    meetingId
) {

    const meeting =
        MEETINGS.find(
            m => m.id === meetingId
        );


    if (!meeting) return;


    showModal(`

        <h2>
            ${escapeHTML(
                meeting.title
            )}
        </h2>


        <p class="muted">
            ${escapeHTML(
                meeting.date
            )}
        </p>


        ${
            meeting.lines
                .map(
                    (line, index) => `

                        <div class="transcript-line">

                            <span class="transcript-line-number">
                                Line ${index + 1}
                            </span>

                            <b>
                                ${escapeHTML(
                                    line[0]
                                )}:
                            </b>

                            ${escapeHTML(
                                line[1]
                            )}

                        </div>

                    `
                )
                .join("")
        }

    `);
}


/* =========================
   EVIDENCE MODAL
========================= */

function showEvidence(
    itemId
) {

    const item =
        ITEMS.find(
            i => i.id === itemId
        );


    if (!item) return;


    let html = `

        <h2>
            ${escapeHTML(
                item.task
            )}
        </h2>

        <p class="muted">
            Transcript evidence for this action item.
        </p>

    `;


    item.evidence.forEach(
        ([meetingId, lineNumber]) => {

            const meeting =
                MEETINGS.find(
                    m => m.id === meetingId
                );


            if (!meeting) return;


            const line =
                meeting.lines[
                    lineNumber - 1
                ];


            if (!line) return;


            html += `

                <div class="card">

                    <b>
                        ${escapeHTML(
                            meeting.title
                        )}
                    </b>


                    <div class="transcript-line highlight">

                        <span class="transcript-line-number">
                            Line ${lineNumber}
                        </span>

                        <b>
                            ${escapeHTML(
                                line[0]
                            )}:
                        </b>

                        ${escapeHTML(
                            line[1]
                        )}

                    </div>

                </div>

            `;

        }
    );


    showModal(html);
}


/* =========================
   EVENT HANDLERS
========================= */

function attachEvents() {

    /* LOGIN */

    const loginForm =
        document.getElementById(
            "loginForm"
        );


    if (loginForm) {

        loginForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();


                const email =
                    document
                        .getElementById(
                            "email"
                        )
                        .value
                        .trim()
                        .toLowerCase();


                const password =
                    document.getElementById(
                        "password"
                    ).value;


                const user =
                    USERS.find(
                        u =>
                            u.email === email &&
                            u.password === password
                    );


                if (!user) {

                    document.getElementById(
                        "loginError"
                    ).textContent =
                        "Incorrect email or password.";

                    return;
                }


                state.user =
                    user;


                try {

                    sessionStorage.setItem(
                        "metrack_user",
                        user.email
                    );

                } catch (error) {}


                render();

            }
        );


        return;
    }


    /* NAVIGATION */

    document
        .querySelectorAll(
            "[data-tab]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    state.tab =
                        button.dataset.tab;

                    render();

                }
            );

        });


    /* LOGOUT */

    const logout =
        document.getElementById(
            "logout"
        );


    if (logout) {

        logout.addEventListener(
            "click",
            () => {

                state.user = null;


                try {

                    sessionStorage.removeItem(
                        "metrack_user"
                    );

                } catch (error) {}


                render();

            }
        );

    }


    /* USER FILTER */

    const filter =
        document.getElementById(
            "userFilter"
        );


    if (filter) {

        filter.addEventListener(
            "change",
            event => {

                state.selectedUser =
                    event.target.value;

                render();

            }
        );

    }


    /* USER SEARCH */

    const search =
        document.getElementById(
            "userSearch"
        );


    if (search) {

        search.addEventListener(
            "input",
            event => {

                state.search =
                    event.target.value;

                render();

            }
        );

    }


    /* MARK DONE */

    document
        .querySelectorAll(
            "[data-done]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const item =
                        ITEMS.find(
                            i =>
                                i.id ===
                                button.dataset.done
                        );


                    if (item) {

                        item.status =
                            "done";

                    }


                    render();

                }
            );

        });


    /* ASSIGN OWNER */

    document
        .querySelectorAll(
            "[data-assign]"
        )
        .forEach(select => {

            select.addEventListener(
                "change",
                event => {

                    const item =
                        ITEMS.find(
                            i =>
                                i.id ===
                                event.target.dataset.assign
                        );


                    if (item) {

                        item.owner =
                            event.target.value;

                        render();

                    }

                }
            );

        });


    /* EVIDENCE */

    document
        .querySelectorAll(
            "[data-evidence]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    showEvidence(
                        button.dataset.evidence
                    );

                }
            );

        });


    /* TRANSCRIPT */

    document
        .querySelectorAll(
            "[data-transcript]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    showTranscript(
                        button.dataset.transcript
                    );

                }
            );

        });


    /* UPLOAD */

    const processButton =
        document.getElementById(
            "processTranscript"
        );


    if (processButton) {

        processButton.addEventListener(
            "click",
            processTranscript
        );

    }

}


/* =========================
   RENDER
========================= */

function render() {

    const app =
        document.getElementById(
            "app"
        );


    if (!app) {

        console.error(
            "ERROR: #app element not found."
        );

        return;

    }


    if (!state.user) {

        app.innerHTML =
            loginView();

    } else {

        app.innerHTML =
            dashboard();

    }


    attachEvents();
}


/* =========================
   START
========================= */

console.log(
    "MeTrack frontend loaded successfully."
);

render();