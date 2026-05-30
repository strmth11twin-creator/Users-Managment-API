const addBtn = document.querySelector("[data-add-btn]");
const modal = document.querySelector("[data-modal]");
const container = document.querySelector("[data-container]");
const modalRemoveBtn = document.querySelector("[data-modal-remove-btn]");
const modalCancelBtn = document.querySelector("[data-modal-cancel-btn]");
const form = document.querySelector("[data-form]");
const containerUsers = document.querySelector("[data-container-users]");
const userTemplate = document.querySelector("[data-user-template]");
const searchInput = document.querySelector("[data-search-Input]");
const userDialog = document.querySelector("[data-user-dialog]");
const sidebarNavigation = document.querySelector("[data-sidebar-navigation]");
const navigationItems = document.querySelectorAll(".sidebar_navigation--container");

const allCount = document.querySelector("[data-all-count]");
const activeCount = document.querySelector("[data-active-count]");
const adminsCount = document.querySelector("[data-admins-count]");
const inactiveCount = document.querySelector("[data-inactive-count]");

const MOCK_API = "https://69715bdf78fec16a6300b083.mockapi.io/api/Users-Managment";

let users = [];
let filterList = [];
let current = "all";
let list = [];

form.addEventListener("submit", (e) => {
    e.preventDefault();

    const objData = new FormData(form);
    const createdUserObj = Object.fromEntries(objData);

    const newUserObj = {
        name: createdUserObj.userName,
        email: createdUserObj.userEmail,
        role: createdUserObj.userRole,
        status: createdUserObj.userStatus,
        avatar: createdUserObj.userImage,
    }

    console.log(newUserObj)
    createNewUser(newUserObj);
})

async function getUsers() {
    try {
        const response = await fetch(MOCK_API);

        if (!response.ok) {
            throw new Error(`Ошибка ${response.status}`)
        }

        const data = await response.json();

        users = data;
        render();
        updateCounts();

    } catch (err) {
        console.error("Ошибка при получении пользователей", message.err)
    }
}

async function updateUser(user) {
    try {
        const response = await fetch(`${MOCK_API}/${user.id}`, {
            method: "PUT",
            body: JSON.stringify(user),
            headers: {
                "Content-type": "application/json"
            }
        })

        if(!response.ok) {
            throw new Error(`Ошибка ${response.status}`);
        }

        const data = await response.json();

        users = users.map(t => {
            if(t.id === data.id) {
                return data
            }

            return t;
        })

        render();
        updateCounts();

        userDialog.close();
        alert("Пользователь успешно обновлен")
    } catch (err) {
        console.error("Ошибка при обновлении пользователя")
    }

}

async function createNewUser(newUser) {
    try {
        const response = await fetch(MOCK_API, {
            method: "POST",
            body: JSON.stringify(newUser),
            headers: {
                "Content-type": "application/json"
            }
        })

        if (!response.ok) {
            throw new Error(`Ошибка ${response.status}`);
        }

        modal.classList.remove("modal-visible");
        container.classList.remove("container-blur");

        const data = await response.json();
        users.unshift(data);
        form.reset();
        render();
        updateCounts();

        console.log(data)
        alert("Новый пользователь успешно создан");
    } catch (err) {
        console.error("Ошибка при создании нового пользователя", message.err)
    }
}

async function deleteUser(user) {
    try {
        const response = await fetch(`${MOCK_API}/${user.id}`, {
            method: "DELETE"
        })

    } catch (err) {
        console.error("Ошибка при удалении пользователя")
    }
}

sidebarNavigation.addEventListener("click", (e) => {
    const navItem = e.target.closest(".sidebar_navigation--container");

    if(!navItem) return;

    navigationItems.forEach(item => item.classList.remove("active"));
    navItem.classList.add("active");

    current = navItem.dataset.filter;

    render();
})

addBtn.addEventListener("click", () => {
    modal.classList.add("modal-visible");
    container.classList.add("container-blur")
})

modalCancelBtn.addEventListener("click", () => {
    modal.classList.remove("modal-visible");
    container.classList.remove("container-blur");
})

modalRemoveBtn.addEventListener("click", () => {
    modal.classList.remove("modal-visible");
    container.classList.remove("container-blur");
})

searchInput.addEventListener("input", (e) => {
    const searchValue = e.target.value.trim();

    renderAndRenderFilteredTodos(searchValue);
})

function renderAndRenderFilteredTodos(searchValue) {
    filterList = users.filter(t => t.name.toLowerCase().includes(searchValue));

    renderFiltered();
}

function updateCounts() {
    allCount.textContent = users.length;
    activeCount.textContent = users.filter(user => user.status === "Active").length
    adminsCount.textContent = users.filter(user => user.role === "Admin").length
    inactiveCount.textContent = users.filter(user => user.status === "Inactive").length
}

function createdUserLayout(user) {
    const userElement = document.importNode(userTemplate.content, true);

    const userImage = userElement.querySelector("[data-user-image]");
    userImage.src = user.avatar;
    userImage.alt = `Фото ${user.id}`;

    const userName = userElement.querySelector("[data-user-name]");
    userName.textContent = user.name;

    const userEmail = userElement.querySelector("[data-user-email]");
    userEmail.textContent = user.email;

    const userRole = userElement.querySelector("[data-user-role]");
    userRole.textContent = user.role;
    userRole.textContent === "User" ? userRole.classList.add("role-user") :
    userRole.textContent === "Admin" ? userRole.classList.add("role-admin") :
    userRole.textContent === "Moderator" ? userRole.classList.add("role-moderator") : "";

    const userStatus = userElement.querySelector("[data-user-status]");
    userStatus.textContent = user.status;
    userStatus.textContent === "Active" ? userStatus.textContent = "🟢 Active" :
    userStatus.textContent === "Inactive" ? userStatus.textContent = "🔴 Inactive" : "";

    const removeBtn = userElement.querySelector("[data-remove-btn]");

    removeBtn.addEventListener("click", () => {
        users = users.filter(t => t.id !== user.id);

        render();
        deleteUser(user);
    })

    const editBtn = userElement.querySelector("[data-edit-btn]");

    editBtn.addEventListener("click", (e) => {
        populateDialog(user);
        userDialog.showModal();
    })

    return userElement;
}

function populateDialog(user) {
    userDialog.innerHTML = "";

    const dialogForm = document.createElement("form");
    dialogForm.classList.add("dialog-form");

    const closeDialogBtn = document.createElement("button");
    closeDialogBtn.textContent = "x"
    closeDialogBtn.classList.add("close-btn");

    closeDialogBtn.addEventListener("click", () => userDialog.close());

    dialogForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const objData = new FormData(dialogForm);
        const createdUserObj = Object.fromEntries(objData);

        const newUserObj = {
            id: createdUserObj.userId,
            name: createdUserObj.userName,
            email: createdUserObj.userEmail,
            role: createdUserObj.userRole,
            status: createdUserObj.userStatus,
            avatar: createdUserObj.userImage,
        }

        updateUser(newUserObj);
    })

    userDialog.append(dialogForm, closeDialogBtn);

    dialogForm.innerHTML = `
            <input type="text" name="userId" value="${user.id}" hidden/>

            <div class="modal_container">
                <h3 class="modal_container--title">Edit User</h3>
            </div>

            <div class="modal_container--control">
                <label for="name-id" class="control_label">Name</label>
                <input type="text" class="control_input" id="name-id" name="userName" placeholder="Enter Name" required>
            </div>

            <div class="modal_container--control">
                <label for="email-id" class="control_label">Email</label>
                <input type="email" class="control_input" id="email-id" name="userEmail" placeholder="Enter Email"
                    required>
            </div>

            <div class="modal_container--control">
                <label for="role-id" class="control_label">Role</label>
                <select name="userRole" id="role-id" class="control_input" required>
                    <option value="" class="option" disabled selected>Select role</option>
                    <option value="User" class="option">User</option>
                    <option value="Admin" class="option">Admin</option>
                    <option value="Moderator" class="option">Moderator</option>
                </select>
            </div>

            <div class="modal_container--control">
                <label for="status-id" class="control_label">Status</label>
                <select name="userStatus" id="status-id" class="control_input" required>
                    <option value="" class="option" disabled selected>Select status</option>
                    <option value="Active" class="option">Active</option>
                    <option value="Inactive" class="option">Inactive</option>
                </select>
            </div>

            <div class="modal_container--control">
                <label for="image-id" class="control_label">Image</label>
                <select name="userImage" id="image-id" class="control_input" required>
                    <option value="" class="option" disabled selected>Images Url</option>
                    <option
                        value="https://images.openai.com/static-rsc-4/W1bwvMMaXMGnjcp4TosjDemwlZ51Vif8tkD1pzLKBiC7eSBzRLUprmusSlxXEJWEFwcAep_nZjTx3LIDqf8miK8pX91KbEVptfrPsRU390hc6gX2GOMwJhNu75BmhU_YsLfiSsL4I5RZ0Yu25gWyAx_KW1URJgNC-jubTLgG6FM?purpose=inline"
                        class="option">Фотография 1</option>
                    <option
                        value="https://images.openai.com/static-rsc-4/lCZul59mLdqemYyXl9Vhub-VqRgBbPO2iSffLfjRImIW60SqWI_ij9sDSS-ENQwhmgNNzT4s5vTB2g5RrY3WDnPk6FwXWNO6sl3kTWFdefnwhunrJT_fWW9U8M8gjufEylrMMTsm_s2QjAzp9LBvU4ihoCDTkep5vE2xedwGmN8?purpose=inline"
                        class="option">Фотография 2</option>
                    <option
                        value="https://images.openai.com/static-rsc-4/tem5V4fDp37S_ekFOQUAmwjRM6h9KbeN3i2SPU5SZ9GaP37qd27rRq5IFuG5v6F_4HCUL-_R547pbLUV_5uW1bY6cdYURxmKIF6Q3moXwHU0Jh2H4VvqBoySL2CWiK3vQ4GAFDzw4yoccJ-vw_T6MPklxQ8dkXNzuZlzEqzHtjy346xIDdWQfEQSqrSsZVzM?purpose=inline"
                        class="option">Фотография 3</option>
                    <option
                        value="https://images.openai.com/static-rsc-4/rVbtyMaYB4BXKgkpMrGxmWXhseSXnoxefbBUtq-inLYPFYzTH0FRnm-8fu2qwtyTJrPsJ4vVRoI35hX-UiIaA1TXaMpr7SOTwfP0VMFEsMXTk5DRrjDTiPu_rlrdJhl6NCnFQdX2l40h97WVrqwz2j6wn345C4oyObsaTdI96xae1NapjRasjRi1DYvH83IN?purpose=fullsize"
                        class="option">Фотография 4</option>
                    <option
                        value="https://images.openai.com/static-rsc-4/0Huhwmt3B42RJuQvL7hgvDA0GMUPLbulHMCZNuGjR7X-_vtHkbqqevCjZUESKLNPPDbXIte7hFE65vM1lhF2wToJErPahGFBDWMlXE9VM_54yFWF4VHpGW4tJvSQkVgW9X2uQogfEqanT1s35ouDJLELZ3s01XR6llevrqgc0eBHNQiV3auPn3fq__7ZLcq4?purpose=fullsize"
                        class="option">Фотография 5</option>
                    <option
                        value="https://images.openai.com/static-rsc-4/H54n1yv0z3ezJJD0r60l_YkqyMxrfrdI0qtxJOeYKKVpuT4b6XZuIWHHf9KcnNhIsIUEiLN068HqRaswZBuq0kXgbngBxMzN-E0LeRFqFJH-nTrwwJChRRy8Wjn0GXpI24LP4fqnWg1O4DAvhLx8mAlU7orCUulJrt8hb-73_Jjlt1k1C4tvUFu48-EoLGXM?purpose=fullsize"
                        class="option">Фотография 6</option>
                    <option
                        value="https://images.openai.com/static-rsc-4/lOYg2m8DUZgKmlv-p85UEPgzz1WB5N8kRs27PAIxul6jQUV2dgNzZiKNZyMe-hH6fBQpzmGoh9c_xpOh2Gc1WFry3LUAg0OwYGj3gO8Cq-bV6GPF8C55PzSbJiNPtCKWsDkvg5A30d96OSUl2osMs2AghWGZtvfrVo2kFT4LBzU3diKsAUnPP28iWuNBalJu?purpose=fullsize"
                        class="option">Фотография 7</option>
                    <option
                        value="https://images.openai.com/static-rsc-4/l7RrHo21ZsoelhYjWxNNBN582QMDG5Cg4QusPJy3gWyAFHF_YntgKCY0Iq92vfhJzDElIVynhLPEMXpY8h16UCz1QpewR8kmjRfrE6LMN_vE-HbTximDsEkdtfeKPQ1Bwozxmxto-mbjv5g7bI7_2D1hQdC423vbZhUmqSuh6WbG6hWegcGcbJHBNXWxi6N6?purpose=inline"
                        class="option">Фотография 8</option>
                    <option
                        value="https://images.openai.com/static-rsc-4/msZDUoT1FgwKUwl8D0HP4wLuJUxPAzb7VkaxEy6-LgmwVHlQz9ey8qYDEpRqil_5AYLRM5GjMzwDVtQg5FQXpmDrX1Zt9d6pU6ImqDvXqSoLeso0yEkIjgUHWTdZ-Xszex7p_ZH7oHwW9rgDd48dgRbjfLzTDbyVIAB4HE9ZSrBXSsCjIoeYxcYBGtRJ6V28?purpose=inline"
                        class="option">Фотография 9</option>
                </select>
            </div>

            <div class="modal_container--buttons">
                <button class="create-btn" type="submit">Edit User</button>
            </div>
    `
}

function renderFiltered() {
    containerUsers.innerHTML = "";

    if(filterList.length === 0) {
        return containerUsers.innerHTML = "<h3>Нет найденных задач...</h3>"
    }

    if (current === "admins") {
        list = filterList.filter(t => t.role === "Admin");
    }

    if (current === "moderators") {
        list = filterList.filter(t => t.role === "Moderator");
    }

    list.forEach(user => {
        const userElement = createdUserLayout(user);

        containerUsers.append(userElement);
    })
}

function render() {
    containerUsers.innerHTML = "";

    if(users.length === 0) {
        return containerUsers.innerHTML = "<h3>Нет задач...</h3>"
    }

     list = users;

    if(current === "admins") {
        list = users.filter(t => t.role === "Admin");
    }

    if(current === "moderators") {
        list = users.filter(t => t.role === "Moderator");
    }

    list.forEach(user => {
        const userElement = createdUserLayout(user);

        containerUsers.append(userElement);
    })
}

getUsers();