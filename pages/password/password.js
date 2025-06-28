import {
    checkPassword,
    setPassword,
} from "../../scripts/passwordVerification.mjs";

console.log(setPassword);

document.addEventListener("DOMContentLoaded", () => {
    if (JSON.parse(localStorage.getItem("passwordEnabled"))) {
        const form = document.querySelector("#password-form");
        const status = document.querySelector("#status");

        const currentPasswordInput =
            document.querySelector("#current-password").childNodes[1]
                .children[1].value;

        if (
            !localStorage.getItem("passwordHash") ||
            !localStorage.getItem("salt")
        ) {
            console.log(currentPasswordInput);
            currentPasswordInput.style.display = "none";
        }

        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const oldPassword =
                document.querySelector("#current-password").childNodes[1]
                    .children[1].value;
            const newPassword =
                document.querySelector("#new-password").childNodes[1]
                    .children[1];

            let isCorrect;

            if (
                !localStorage.getItem("passwordHash") ||
                !localStorage.getItem("salt")
            ) {
                isCorrect = true;
                currentPasswordInput.style.display = "";
            } else {
                isCorrect = await checkPassword(oldPassword);
            }
            if (!isCorrect) {
                status.innerHTML = "Incorrect Password";
                setTimeout(() => {
                    status.innerHTML = "";
                }, 1500);
            } else {
                status.innerHTML = "Changing Password";
                try {
                    await setPassword(newPassword.value);
                    status.innerHTML = "Sucessfully changed password";
                    console.log(currentPasswordInput);
                    newPassword.value = "";
                } catch (e) {
                    status.innerHTML = "Failed to set password";
                    console.error(e);
                }
            }
        });
    } else {
        console.warn("You shouldn't be here. Go to settings.");
        document.children[0].innerHTML =
            "Go to the settings page to enable this feature.";
    }
});
