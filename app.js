const { createClient } = supabase;

const db = createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);


// -----------------------------
// ELEMENTS
// -----------------------------

const loginScreen =
    document.getElementById("loginScreen");

const appScreen =
    document.getElementById("appScreen");

const emailInput =
    document.getElementById("email");

const passwordInput =
    document.getElementById("password");

const loginBtn =
    document.getElementById("loginBtn");

const signupBtn = document.getElementById("signupBtn");   

const loginMessage =
    document.getElementById("loginMessage");

const logoutBtn =
    document.getElementById("logoutBtn");

const userEmail =
    document.getElementById("userEmail");

const categoryInput =
    document.getElementById("category");

const amountInput =
    document.getElementById("amount");

const addBtn =
    document.getElementById("addBtn");

const appMessage =
    document.getElementById("appMessage");

const expensesElement =
    document.getElementById("expenses");

const monthTitle =
    document.getElementById("monthTitle");


// EDIT CATEGORY ELEMENTS

const editCategory =
    document.getElementById("editCategory");

const currentAmount =
    document.getElementById("currentAmount");

const newAmount =
    document.getElementById("newAmount");

const editMessage = document.getElementById("editMessage");    

const welcomeMessage =
    document.getElementById("welcomeMessage");

const minusBtn =
    document.getElementById("minusBtn");

const plusBtn =
    document.getElementById("plusBtn");

const saveAmountBtn =
    document.getElementById("saveAmountBtn");

const toggleTotalBtn =
    document.getElementById("toggleTotalBtn");

const totalElement =
    document.getElementById("total");


// -----------------------------
// CATEGORIES
// -----------------------------

const CATEGORIES = [
    "🍔 Food & Snacks",
    "🚌 Travelling",
    "🛍️ Shopping",
    "🎬 Entertainment",
    "💊 Health & Medicine",
    "📦 Other"
];


// -----------------------------
// TOTAL STATE
// -----------------------------

let totalVisible = false;

let currentTotal = 0;

let currentCategoryTotals = {};


// -----------------------------
// MONTH
// -----------------------------

function getMonthKey() {

    const date = new Date();

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    return `${year}-${month}`;
}


function getMonthName() {

    return new Date().toLocaleString(
        "en-IN",
        {
            month: "long",
            year: "numeric"
        }
    );

}


// -----------------------------
// LOGIN SCREEN
// -----------------------------

function showLogin(message = "") {

    loginScreen.classList.remove("hidden");

    appScreen.classList.add("hidden");

    loginMessage.textContent =
        message;

}


// -----------------------------
// APP SCREEN
// -----------------------------

function showApp(user) {

    loginScreen.classList.add("hidden");

    appScreen.classList.remove("hidden");

    welcomeMessage.classList.remove("hidden");

   setTimeout(() => {
    welcomeMessage.classList.add("hidden");
   }, 2000);

    userEmail.textContent =
        user.email || "";

    monthTitle.textContent =
        getMonthName();

}


// -----------------------------
// TOTAL DISPLAY
// -----------------------------

function updateTotalDisplay() {

    if (totalVisible) {

        totalElement.textContent =
            `₹${currentTotal.toFixed(2)}`;

        toggleTotalBtn.textContent =
            "🙈 Hide Total Spent";

    }

    else {

        totalElement.textContent =
            "••••••";

        toggleTotalBtn.textContent =
            "👁️ Show / Hide Total Spent";

    }

}

// -----------------------------
// PIE CHART
// -----------------------------

let pieChart = null;

function updatePieChart() {

    const canvas = document.getElementById("pieChart");

    if (!canvas) {
        return;
    }

    const labels = CATEGORIES.map(category =>
        category.replace(/^[^\w\s]+\s/, "")
    );

    const values = CATEGORIES.map(category =>
        currentCategoryTotals[category] || 0
    );

    // Same category colours as the Streamlit-style chart
    const categoryColors = [
        "#1f77b4", // Food & Snacks - Blue
        "#ff7f0e", // Travelling - Orange
        "#46c946", // Shopping - Green
        "#d62728", // Entertainment - Red
        "#e4e279", // Health & Medicine - Purple
        "#9153a8"  // Other
    ];

    if (pieChart) {
        pieChart.destroy();
    }

    pieChart = new Chart(canvas, {

        type: "pie",

        data: {
            labels: labels,

            datasets: [{
                data: values,
                backgroundColor: categoryColors,
                borderColor: "#ffffff",
                borderWidth: 3
            }]
        },

        options: {

            responsive: true,
            maintainAspectRatio: false,

            layout: {
                padding: 8
            },

            plugins: {

                legend: {
                    position: "bottom",

                    labels: {
                        boxWidth: 32,
                        boxHeight: 12,
                        padding: 12,
                        font: {
                            size: 15
                        }
                    }
                },

                datalabels: {

                    color: "#000",

                    font: {
                        weight: "bold",
                        size: 16
                    },

                    formatter: (value, context) => {

                        if (value === 0) {
                            return "";
                        }

                        const total =
                            context.chart.data.datasets[0].data
                                .reduce((sum, number) => sum + number, 0);

                        if (total === 0) {
                            return "";
                        }

                        return Math.round((value / total) * 100) + "%";
                    }
                }
            }
        },

        plugins: [ChartDataLabels]
    });
}

// bar CHART

let barChart = null;

function updateBarChart() {

    const canvas = document.getElementById("barChart");

    if (!canvas) {
        return;
    }

    const labels = [
        ["Food", "& Snacks"],
        ["Travelling"],
        ["Shopping"],
        ["Entertainment"],
        ["Health", "& Medicine"],
        ["Other"]
    ];

    const values = CATEGORIES.map(category =>
        currentCategoryTotals[category] || 0
    );

    const categoryColors = [
        "#1f77b4", // Food & Snacks - Blue
        "#ff7f0e", // Travelling - Orange
        "#7bc96f", // Shopping - Light Green
        "#d62728", // Entertainment - Red
        "#8c564b", // Health & Medicine - Brown
        "#9467bd"  // Other - Purple
    ];

    if (barChart) {
        barChart.destroy();
    }

    barChart = new Chart(canvas, {

        type: "bar",

        data: {
            labels: labels,

            datasets: [{
                label: "Amount Spent",
                data: values,
                backgroundColor: categoryColors,
                borderRadius: 8
            }]
        },

        options: {

            responsive: true,
            maintainAspectRatio: false,

            plugins: {
                legend: {
                    display: false
                }
            },

            scales: {
                y: {
                    beginAtZero: true,

                    ticks: {
                        callback: function(value) {
                            return "₹" + value;
                        }
                    }
                },
                x: {
                    display: false
                }
            }
        }
    });
}

//previous months data
async function loadPreviousMonths(user) {

    const previousMonthsElement =
        document.getElementById("previousMonths");

    if (!previousMonthsElement || !user) {
        return;
    }

    const currentMonthKey = getMonthKey();

    const { data, error } = await db
        .from("expenses")
        .select("month_key, category, amount")
        .eq("user_id", user.id)
        .lt("month_key", currentMonthKey)
        .order("month_key", { ascending: false });

    if (error) {
        previousMonthsElement.innerHTML =
            `<p class="empty">Could not load previous months.</p>`;
        return;
    }

    if (!data || data.length === 0) {
        previousMonthsElement.innerHTML =
            `<p class="empty">No previous month data.</p>`;
        return;
    }

    const months = {};

    data.forEach(row => {

        if (!months[row.month_key]) {
            months[row.month_key] = 0;
        }

        months[row.month_key] += Number(row.amount) || 0;
    });

    const monthKeys = Object.keys(months)
        .sort((a, b) => b.localeCompare(a))
        .slice(0, 12);

    previousMonthsElement.innerHTML = monthKeys.map(monthKey => {

        const [year, month] = monthKey.split("-");

        const date = new Date(
            Number(year),
            Number(month) - 1,
            1
        );

        const monthName = date.toLocaleString("en-IN", {
            month: "long",
            year: "numeric"
        });

        return `
            <div class="expense-row">
                <span>${monthName}</span>
                <span class="amount">
                    ₹${months[monthKey].toFixed(2)}
                </span>
            </div>
        `;

    }).join("");
}

//only saved 12 months data
async function cleanupOldExpenses(user) {

    if (!user) {
        return;
    }

    const now = new Date();

    // 13 months before current month
    const cutoff = new Date(
        now.getFullYear(),
        now.getMonth() - 12,
        1
    );

    const cutoffYear = cutoff.getFullYear();
    const cutoffMonth = String(cutoff.getMonth() + 1).padStart(2, "0");

    const cutoffKey = `${cutoffYear}-${cutoffMonth}`;

    const { error } = await db
        .from("expenses")
        .delete()
        .eq("user_id", user.id)
        .lt("month_key", cutoffKey);

    if (error) {
        console.log("Cleanup error:", error.message);
    }
}


// -----------------------------
// UPDATE EDIT CATEGORY DISPLAY
// -----------------------------

function updateEditCategoryDisplay() {

    const category =
        editCategory.value;

    const amount =
        currentCategoryTotals[category] || 0;

    currentAmount.textContent =
        `Current amount: ₹${amount.toFixed(2)}`;

    newAmount.value =
        amount.toFixed(2);

}


// -----------------------------
// LOAD EXPENSES
// -----------------------------

async function loadExpenses(user) {

    


    if (!user) {

        showLogin("Please log in again.");

        return;

    }


    const {
        data,
        error
    } = await db
        .from("expenses")
        .select(
            "category, amount, month_key, created_at"
        )
        .eq(
            "user_id",
            user.id
        )
        .eq(
            "month_key",
            getMonthKey()
        )
        .order(
            "created_at",
            {
                ascending: false
            }
        );


    if (error) {

        appMessage.textContent =
            "Could not load expenses: "
            + error.message;

        return;

    }


 

    // -----------------------------
    // RESET CATEGORY TOTALS
    // -----------------------------

    currentCategoryTotals = {};


    CATEGORIES.forEach(category => {

        currentCategoryTotals[category] = 0;

    });


    currentTotal = 0;


    // -----------------------------
    // CALCULATE TOTALS
    // -----------------------------

    (data || []).forEach(row => {

        const amount =
            Number(row.amount) || 0;


        if (
            Object.prototype.hasOwnProperty.call(
                currentCategoryTotals,
                row.category
            )
        ) {

            currentCategoryTotals[
                row.category
            ] += amount;

        }


        currentTotal += amount;

    });


    // -----------------------------
    // DISPLAY TOTAL
    // -----------------------------

    updateTotalDisplay();

    updatePieChart();

    updateBarChart();

    loadPreviousMonths(user);

    cleanupOldExpenses(user);


    // -----------------------------
    // DISPLAY CATEGORY CARDS
    // -----------------------------

    expensesElement.innerHTML =
        CATEGORIES
            .map(category => {

                const amount =
                    currentCategoryTotals[
                        category
                    ] || 0;


                return `
                    <div class="expense-row">

                        <span>
                            ${escapeHtml(category)}
                        </span>

                        <span class="amount">
                            ₹${amount.toFixed(2)}
                        </span>

                    </div>
                `;

            })
            .join("");


    // -----------------------------
    // UPDATE EDIT SECTION
    // -----------------------------

   function escapeHtml(value) {
     return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

    updateEditCategoryDisplay();

}
    appMessage.textContent = "";

//Sign up ................
async function signup() {

    const emailValue = email.value.trim();
    const passwordValue = password.value;

    if (!emailValue || !passwordValue) {
        loginMessage.textContent =
            "Enter email and password.";
        return;
    }

    signupBtn.disabled = true;

    const { error } = await db.auth.signUp({
        email: emailValue,
        password: passwordValue
    });

    signupBtn.disabled = false;

    if (error) {
        loginMessage.textContent =
            "Could not create account: " + error.message;
        return;
    }

    loginMessage.textContent =
        "Account created successfully! You can login now. ✅";

    password.value = "";
}

// -----------------------------
// LOGIN
// -----------------------------

async function login() {

    const email =
        emailInput.value.trim();

    const password =
        passwordInput.value;


    if (!email || !password) {

        loginMessage.textContent =
            "Enter email and password.";

        return;

    }


    loginBtn.disabled = true;

    loginMessage.textContent =
        "Logging in...";


    const {
        data,
        error
    } =
        await db.auth.signInWithPassword({

            email: email,

            password: password

        });


    loginBtn.disabled = false;


    if (error) {

        loginMessage.textContent =
            error.message;

        return;

    }


    passwordInput.value = "";


    showApp(data.user);

    await loadExpenses(data.user);

}


// -----------------------------
// LOGOUT
// -----------------------------

async function logout() {

    await db.auth.signOut();

    showLogin(
        "Logged out."
    );

}


// -----------------------------
// ADD EXPENSE
// -----------------------------

async function addExpense() {

    const amount =
        Number(amountInput.value);


    if (
        !Number.isFinite(amount)
        ||
        amount <= 0
    ) {

        appMessage.textContent =
            "Enter a valid amount.";

        return;

    }


    const {
        data: { user },
        error: userError
    } = await db.auth.getUser();


    if (userError || !user) {

        showLogin(
            "Please log in again."
        );

        return;

    }


    addBtn.disabled = true;

    

    const {
        error
    } = await db
        .from("expenses")
        .insert({

            user_id: user.id,

            month: getMonthName(),

            month_key: getMonthKey(),

            category:
                categoryInput.value,

            amount: amount

        });


    addBtn.disabled = false;


    if (error) {

        appMessage.textContent =
            "Could not add expense: "
            + error.message;

        return;

    }


    amountInput.value = "";


    await loadExpenses(user);


    appMessage.textContent =
    "Expense added successfully! 💰";

    appMessage.className =
    "message success-message";

    setTimeout(() => {
    appMessage.textContent = "";
    appMessage.className = "message";
    }, 3000);

}


// -----------------------------
// SAVE CATEGORY AMOUNT
// -----------------------------

async function saveCategoryAmount() {

    const category =
        editCategory.value;

    const targetAmount =
        Number(newAmount.value);


    if (
        !Number.isFinite(targetAmount)
        ||
        targetAmount < 0
    ) {

        editMessage.textContent =
            "Enter a valid amount.";

        return;

    }


    const {
        data: { user },
        error: userError
    } = await db.auth.getUser();


    if (userError || !user) {

        showLogin(
            "Please log in again."
        );

        return;

    }


    saveAmountBtn.disabled = true;



    // -----------------------------
    // GET SELECTED CATEGORY ROWS
    // -----------------------------

    const {
        data: rows,
        error: fetchError
    } = await db
        .from("expenses")
        .select(
            "category, amount, created_at"
        )
        .eq(
            "user_id",
            user.id
        )
        .eq(
            "month_key",
            getMonthKey()
        )
        .eq(
            "category",
            category
        )
        .order(
            "created_at",
            {
                ascending: true
            }
        );


    if (fetchError) {

        saveAmountBtn.disabled = false;

        editMessage.textContent =
            "Could not read category: "
            + fetchError.message;

        return;

    }


    const existingRows =
        rows || [];


    const oldTotal =
        existingRows.reduce(
            (sum, row) =>
                sum + (Number(row.amount) || 0),
            0
        );


    // -----------------------------
    // NOTHING TO CHANGE
    // -----------------------------

    if (
        oldTotal === targetAmount
    ) {

        saveAmountBtn.disabled = false;

        await loadExpenses(user);

        editMessage.textContent =
            "Amount is already the same.";

        return;

    }


    // -----------------------------
    // TARGET = ZERO
    // -----------------------------

    if (targetAmount === 0) {

        if (existingRows.length > 0) {

            const {
                error: deleteError
            } = await db
                .from("expenses")
                .delete()
                .eq(
                    "user_id",
                    user.id
                )
                .eq(
                    "month_key",
                    getMonthKey()
                )
                .eq(
                    "category",
                    category
                );


            if (deleteError) {

                saveAmountBtn.disabled = false;

                editMessage.textContent =
                    "Could not save amount: "
                    + deleteError.message;

                return;

            }

        }

    }


    // -----------------------------
    // NO OLD ROWS
    // -----------------------------

    else if (
        existingRows.length === 0
    ) {

        const {
            error: insertError
        } = await db
            .from("expenses")
            .insert({

                user_id: user.id,

                month: getMonthName(),

                month_key: getMonthKey(),

                category: category,

                amount: targetAmount

            });


        if (insertError) {

            saveAmountBtn.disabled = false;

            editMessage.textContent =
                "Could not save amount: "
                + insertError.message;

            return;

        }

    }


    // -----------------------------
    // EXISTING ROWS
    // -----------------------------

    else {

        let remaining =
            targetAmount;


        for (
            let i = 0;
            i < existingRows.length;
            i++
        ) {

            const row =
                existingRows[i];

            const oldAmount =
                Number(row.amount) || 0;


            let newRowAmount = 0;


            if (remaining > 0) {

                newRowAmount =
                    Math.min(
                        oldAmount,
                        remaining
                    );

            }


            if (
                newRowAmount !== oldAmount
            ) {

                const {
                    error: updateError
                } = await db
                    .from("expenses")
                    .update({

                        amount: newRowAmount

                    })
                    .eq(
                        "user_id",
                        user.id
                    )
                    .eq(
                        "month_key",
                        getMonthKey()
                    )
                    .eq(
                        "category",
                        category
                    )
                    .eq(
                        "created_at",
                        row.created_at
                    );


                if (updateError) {

                    saveAmountBtn.disabled = false;

                    editMessage.textContent =
                        "Could not save amount: "
                        + updateError.message;

                    await loadExpenses(user);

                    return;

                }

            }

            remaining -= newRowAmount;

        }

        // If target amount is greater than old total,
        // add the remaining amount as a new row.
        if (remaining > 0) {

            const {
                error: insertError
            } = await db
                .from("expenses")
                .insert({

                    user_id: user.id,

                    month: getMonthName(),

                    month_key: getMonthKey(),

                    category: category,

                    amount: remaining

                });

            if (insertError) {

                saveAmountBtn.disabled = false;

                editMessage.textContent =
                    "Could not save amount: "
                    + insertError.message;

                await loadExpenses(user);

                return;

            }

        }

    }


    saveAmountBtn.disabled = false;

    await loadExpenses(user);

    editMessage.textContent =
    "Category amount saved successfully! 💰";

    editMessage.className =
    "message success-message";

    setTimeout(() => {
    editMessage.textContent = "";
    editMessage.className = "message";
    }, 3000);

}


// -----------------------------
// BUTTON EVENTS
// -----------------------------

minusBtn.addEventListener(
    "click",
    () => {

        let value =
            Number(newAmount.value) || 0;

        value = Math.max(0, value - 1);

        newAmount.value =
            value.toFixed(2);

    }
);


plusBtn.addEventListener(
    "click",
    () => {

        let value =
            Number(newAmount.value) || 0;

        value += 1;

        newAmount.value =
            value.toFixed(2);

    }
);


editCategory.addEventListener(
    "change",
    updateEditCategoryDisplay
);


saveAmountBtn.addEventListener(
    "click",
    saveCategoryAmount
);


toggleTotalBtn.addEventListener(
    "click",
    () => {

        totalVisible =
            !totalVisible;

        updateTotalDisplay();

    }
);


// -----------------------------
// LOGIN / LOGOUT / ADD EVENTS
// -----------------------------

loginBtn.addEventListener(
    "click",
    login
);

signupBtn.addEventListener("click", signup);

logoutBtn.addEventListener(
    "click",
    logout
);


addBtn.addEventListener(
    "click",
    addExpense
);


passwordInput.addEventListener(
    "keydown",
    (event) => {

        if (event.key === "Enter") {

            login();

        }

    }
);



// -----------------------------
// AUTH STATE
// -----------------------------

db.auth.onAuthStateChange(
    async (event, session) => {

        if (session && session.user) {

            showApp(session.user);

            await loadExpenses(session.user);

        }

        else {

            showLogin();

        }

    }
);

// -----------------------------
// START APP
// -----------------------------

async function startApp() {

    const {
        data: {
            session
        }
    } = await db.auth.getSession();


    if (session && session.user) {

        showApp(session.user);

        await loadExpenses(session.user);

    }

    else {

        showLogin();

    }

}


startApp();