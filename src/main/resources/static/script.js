const API = "";

let complaints = [];
let categories = [];
let departments = [];
let escalations = [];


/* ================= START ================= */

document.addEventListener("DOMContentLoaded", () => {

    updateClock();

    setInterval(updateClock, 1000);

    loadDashboard();

    loadCategories();

    loadDepartments();

    loadEscalations();

});


/* ================= CLOCK ================= */

function updateClock() {

    const now = new Date();

    const time = now.toLocaleTimeString();

    const date = now.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });

    document.getElementById("clock").textContent = time;

    document.getElementById("date").textContent = date;
}


/* ================= NAVIGATION ================= */

function showSection(sectionId, button = null) {

    document.querySelectorAll(".section").forEach(section => {
        section.classList.remove("active");
    });

    const section = document.getElementById(sectionId);

    if (section) {
        section.classList.add("active");
    }

    document.querySelectorAll(".nav-btn").forEach(btn => {
        btn.classList.remove("active");
    });

    if (button) {
        button.classList.add("active");
    }

    if (sectionId === "track") {
        renderAllComplaints();
    }

    if (sectionId === "escalations") {
        loadEscalations();
    }

    if (sectionId === "analytics") {
        renderAnalytics();
    }
}


/* ================= DASHBOARD ================= */

async function loadDashboard() {

    try {

        const response = await fetch(`${API}/api/grievances`);

        if (!response.ok) {
            throw new Error("Unable to load grievances");
        }

        complaints = await response.json();

        updateStatistics();

        renderRecentComplaints(complaints);

        renderAnalytics();

    } catch (error) {

        console.error(error);

        document.getElementById("recentComplaints").innerHTML = `
            <div class="loading">
                Backend connection failed.<br>
                Make sure Spring Boot is running on port 8080.
            </div>
        `;

        showToast("Backend connection failed");

    }
}


/* ================= STATISTICS ================= */

function updateStatistics() {

    const total = complaints.length;

    const resolved = complaints.filter(c =>
        c.status === "RESOLVED" ||
        c.status === "CLOSED"
    ).length;

    const escalated = complaints.filter(c =>
        c.status === "ESCALATED"
    ).length;

    const pending = total - resolved - escalated;

    document.getElementById("totalCount").textContent = total;

    document.getElementById("pendingCount").textContent =
        pending < 0 ? 0 : pending;

    document.getElementById("resolvedCount").textContent = resolved;

    document.getElementById("escalatedCount").textContent = escalated;
}


/* ================= RECENT COMPLAINTS ================= */

function renderRecentComplaints(data) {

    const container = document.getElementById("recentComplaints");

    if (!data || data.length === 0) {

        container.innerHTML = `
            <div class="loading">
                No complaints available.
            </div>
        `;

        return;
    }

    const recent = [...data]
        .sort((a, b) => b.id - a.id)
        .slice(0, 6);

    container.innerHTML = recent.map(complaint => {

        return `
            <div class="complaint-item">

                <div class="complaint-id">
                    #${complaint.id}
                </div>

                <div>
                    <h4>${escapeHtml(complaint.title)}</h4>

                    <p>
                        ${escapeHtml(complaint.categoryName || "General")}
                        ·
                        ${escapeHtml(complaint.location || "Location unavailable")}
                    </p>
                </div>

                <span class="status ${complaint.status}">
                    ${formatStatus(complaint.status)}
                </span>

            </div>
        `;

    }).join("");
}


/* ================= CATEGORIES ================= */

async function loadCategories() {

    try {

        const response =
            await fetch(`${API}/api/categories`);

        if (!response.ok) {
            throw new Error();
        }

        categories = await response.json();

        const select =
            document.getElementById("categoryId");

        select.innerHTML =
            `<option value="">Select Category</option>`;

        categories.forEach(category => {

            select.innerHTML += `
                <option value="${category.id}">
                    ${escapeHtml(category.name)}
                    — ${category.slaDays} day SLA
                </option>
            `;

        });

    } catch (error) {

        console.error(error);

    }
}


/* ================= DEPARTMENTS ================= */

async function loadDepartments() {

    try {

        const response =
            await fetch(`${API}/api/departments`);

        if (!response.ok) {
            throw new Error();
        }

        departments = await response.json();

        const select =
            document.getElementById("departmentId");

        select.innerHTML =
            `<option value="">Select Department</option>`;

        departments.forEach(department => {

            select.innerHTML += `
                <option value="${department.id}">
                    ${escapeHtml(department.name)}
                </option>
            `;

        });

    } catch (error) {

        console.error(error);

    }
}


/* ================= SUBMIT COMPLAINT ================= */

document
    .getElementById("complaintForm")
    .addEventListener("submit", async function(event) {

        event.preventDefault();

        const complaint = {

            title:
                document.getElementById("title").value.trim(),

            description:
                document.getElementById("description").value.trim(),

            citizenName:
                document.getElementById("citizenName").value.trim(),

            citizenEmail:
                document.getElementById("citizenEmail").value.trim(),

            location:
                document.getElementById("location").value.trim(),

            categoryId:
                Number(document.getElementById("categoryId").value),

            departmentId:
                Number(document.getElementById("departmentId").value)

        };


        try {

            const response = await fetch(
                `${API}/api/grievances`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(complaint)
                }
            );


            const data = await response.json();


            if (!response.ok) {

                let message = "Unable to create complaint";

                if (data.errors) {

                    message =
                        Object.values(data.errors).join(", ");

                }

                throw new Error(message);
            }


            showToast(
                `Complaint #${data.id} submitted successfully`
            );


            document
                .getElementById("complaintForm")
                .reset();


            await loadDashboard();

            await loadEscalations();


            showSection("track");


            document.getElementById("trackId").value =
                data.id;


            trackComplaint();


        } catch (error) {

            console.error(error);

            showToast(error.message);

        }

    });


/* ================= TRACK ================= */

async function trackComplaint() {

    const id =
        document.getElementById("trackId").value.trim();

    if (!id) {

        showToast("Enter a complaint ID");

        return;
    }


    const result =
        document.getElementById("trackResult");


    result.innerHTML = `
        <div class="loading">
            Loading complaint...
        </div>
    `;


    try {

        const response =
            await fetch(`${API}/api/grievances/${id}`);


        if (!response.ok) {

            throw new Error(
                "Complaint not found"
            );

        }


        const complaint =
            await response.json();


        result.innerHTML = `

            <div class="track-card">

                <div class="track-top">

                    <div>

                        <span class="section-label">
                            COMPLAINT #${complaint.id}
                        </span>

                        <h3>
                            ${escapeHtml(complaint.title)}
                        </h3>

                        <p>
                            ${escapeHtml(complaint.description)}
                        </p>

                    </div>

                    <span class="status ${complaint.status}">
                        ${formatStatus(complaint.status)}
                    </span>

                </div>


                <div class="track-info">

                    <div class="info-box">
                        <span>Citizen</span>
                        <strong>
                            ${escapeHtml(complaint.citizenName)}
                        </strong>
                    </div>

                    <div class="info-box">
                        <span>Category</span>
                        <strong>
                            ${escapeHtml(complaint.categoryName)}
                        </strong>
                    </div>

                    <div class="info-box">
                        <span>Department</span>
                        <strong>
                            ${escapeHtml(complaint.departmentName)}
                        </strong>
                    </div>

                    <div class="info-box">
                        <span>Location</span>
                        <strong>
                            ${escapeHtml(complaint.location)}
                        </strong>
                    </div>

                    <div class="info-box">
                        <span>Created</span>
                        <strong>
                            ${formatDate(complaint.createdAt)}
                        </strong>
                    </div>

                    <div class="info-box">
                        <span>SLA Due</span>
                        <strong>
                            ${formatDate(complaint.dueDate)}
                        </strong>
                    </div>

                </div>

            </div>
        `;


    } catch (error) {

        result.innerHTML = `
            <div class="track-card">
                <strong>Complaint not found</strong>
                <p>
                    Please check the complaint ID and try again.
                </p>
            </div>
        `;

        showToast(error.message);

    }

}


/* ================= ALL COMPLAINTS ================= */

function renderAllComplaints(data = complaints) {

    const container =
        document.getElementById("allComplaints");


    if (!data || data.length === 0) {

        container.innerHTML = `
            <div class="loading">
                No complaints found.
            </div>
        `;

        return;
    }


    container.innerHTML = [...data]
        .sort((a, b) => b.id - a.id)
        .map(complaint => `

            <div
                class="complaint-item"
                onclick="quickTrack(${complaint.id})"
                style="cursor:pointer"
            >

                <div class="complaint-id">
                    #${complaint.id}
                </div>

                <div>

                    <h4>
                        ${escapeHtml(complaint.title)}
                    </h4>

                    <p>
                        ${escapeHtml(complaint.citizenName)}
                        ·
                        ${escapeHtml(complaint.location)}
                    </p>

                </div>

                <span class="status ${complaint.status}">
                    ${formatStatus(complaint.status)}
                </span>

            </div>

        `).join("");
}


/* ================= QUICK TRACK ================= */

function quickTrack(id) {

    document.getElementById("trackId").value = id;

    trackComplaint();

}


/* ================= ESCALATIONS ================= */

async function loadEscalations() {

    try {

        const response =
            await fetch(`${API}/api/escalations`);


        if (!response.ok) {
            throw new Error();
        }


        escalations =
            await response.json();


        renderEscalations();


    } catch (error) {

        console.error(error);

        document.getElementById("escalationList").innerHTML = `
            <div class="loading">
                Unable to load escalation records.
            </div>
        `;

    }

}


function renderEscalations() {

    const container =
        document.getElementById("escalationList");


    if (!escalations.length) {

        container.innerHTML = `
            <div class="content-card">
                <div class="loading">
                    ✓ No SLA escalations currently.
                </div>
            </div>
        `;

        return;
    }


    container.innerHTML =
        escalations.map(item => `

            <div class="escalation-card">

                <span class="status ESCALATED">
                    SLA ESCALATED
                </span>

                <h3>
                    Complaint #${item.grievance.id}
                </h3>

                <p>
                    <strong>
                        ${escapeHtml(item.grievance.title)}
                    </strong>
                </p>

                <p>
                    ${escapeHtml(item.reason)}
                </p>

                <div class="escalation-meta">

                    <span>
                        Officer:
                        ${escapeHtml(item.escalatedTo)}
                    </span>

                    <span>
                        ${formatDate(item.escalatedAt)}
                    </span>

                </div>

            </div>

        `).join("");

}


/* ================= ANALYTICS ================= */

function renderAnalytics() {

    renderStatusChart();

    renderCategoryChart();

}


function renderStatusChart() {

    const counts = {};

    complaints.forEach(c => {

        counts[c.status] =
            (counts[c.status] || 0) + 1;

    });


    const container =
        document.getElementById("statusChart");


    if (!Object.keys(counts).length) {

        container.innerHTML =
            `<div class="loading">No data available.</div>`;

        return;
    }


    const max =
        Math.max(...Object.values(counts));


    container.innerHTML =
        Object.entries(counts).map(([status, count]) => {

            const width =
                Math.max(5, (count / max) * 100);


            return `

                <div class="bar-row">

                    <span class="bar-label">
                        ${formatStatus(status)}
                    </span>

                    <div class="bar-bg">
                        <div
                            class="bar"
                            style="width:${width}%"
                        ></div>
                    </div>

                    <span class="bar-number">
                        ${count}
                    </span>

                </div>
            `;

        }).join("");

}


function renderCategoryChart() {

    const counts = {};


    complaints.forEach(c => {

        const category =
            c.categoryName || "Unknown";

        counts[category] =
            (counts[category] || 0) + 1;

    });


    const container =
        document.getElementById("categoryChart");


    if (!Object.keys(counts).length) {

        container.innerHTML =
            `<div class="loading">No data available.</div>`;

        return;
    }


    const max =
        Math.max(...Object.values(counts));


    container.innerHTML =
        Object.entries(counts).map(([category, count]) => {

            const width =
                Math.max(5, (count / max) * 100);


            return `

                <div class="bar-row">

                    <span class="bar-label">
                        ${escapeHtml(category)}
                    </span>

                    <div class="bar-bg">
                        <div
                            class="bar"
                            style="width:${width}%"
                        ></div>
                    </div>

                    <span class="bar-number">
                        ${count}
                    </span>

                </div>
            `;

        }).join("");

}


/* ================= SEARCH ================= */

function searchComplaints() {

    const query =
        document
            .getElementById("searchInput")
            .value
            .toLowerCase()
            .trim();


    if (!query) {

        renderRecentComplaints(complaints);

        return;
    }


    const filtered =
        complaints.filter(c => {

            return (
                String(c.id).includes(query) ||
                (c.title || "")
                    .toLowerCase()
                    .includes(query) ||
                (c.location || "")
                    .toLowerCase()
                    .includes(query) ||
                (c.citizenName || "")
                    .toLowerCase()
                    .includes(query) ||
                (c.categoryName || "")
                    .toLowerCase()
                    .includes(query)
            );

        });


    renderRecentComplaints(filtered);

}


/* ================= HELPERS ================= */

function formatStatus(status) {

    return String(status || "")
        .replaceAll("_", " ");

}


function formatDate(value) {

    if (!value) {
        return "-";
    }

    try {

        return new Date(value).toLocaleString(
            "en-IN",
            {
                dateStyle: "medium",
                timeStyle: "short"
            }
        );

    } catch {

        return value;

    }

}


function escapeHtml(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/* ================= TOAST ================= */

function showToast(message) {

    const toast =
        document.getElementById("toast");

    toast.textContent = message;

    toast.classList.add("show");


    setTimeout(() => {

        toast.classList.remove("show");

    }, 3000);

}


/* ================= KEYBOARD ================= */

document.addEventListener("keydown", event => {

    if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "k"
    ) {

        event.preventDefault();

        document
            .getElementById("searchInput")
            .focus();

    }

});