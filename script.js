const addBtn = document.querySelector("[data-add-btn]");
const modal = document.querySelector("[data-modal]");
const container = document.querySelector("[data-container]");
const modalRemoveBtn = document.querySelector("[data-modal-remove-btn]");
const modalCancelBtn = document.querySelector("[data-modal-cancel-btn]");
const form = document.querySelector("[data-form]");

const MOCK_API = "https://69715bdf78fec16a6300b083.mockapi.io/api/Users-Managment";

let users = [];

form.addEventListener("submit", (e) => {
    e.preventDefault();

    const objData = new FormData(form);
    const createdUserObj = Object.fromEntries(objData);

    const newUserObj = {
        name: createdUserObj.userName,
        email: createdUserObj.userEmail,
        role: createdUserObj.userRole,
        status: createdUserObj.userStatus,
    }

    createNewUser(newUserObj);
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