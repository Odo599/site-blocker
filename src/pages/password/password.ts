import {
    checkPassword,
    setPassword,
} from "../../scripts/passwordVerification.mjs";

document.addEventListener("DOMContentLoaded", () => {
    let passwordEnabledStorage = localStorage.getItem("passwordEnabled");
    let passwordEnabled: boolean;

    if (passwordEnabledStorage === null) {
        passwordEnabled = false;
    } else {
        passwordEnabled = JSON.parse(passwordEnabledStorage);
    }

    if (passwordEnabled) {
        const form = document.querySelector("#password-form");
        const status = document.querySelector("#status");

        const currentPasswordDiv = document.querySelector("#current-password");

        if (
            !localStorage.getItem("passwordHash") ||
            !localStorage.getItem("salt")
        ) {
            if (currentPasswordDiv !== null) {
                (currentPasswordDiv as HTMLElement).style.display = "none";
            }
        }

        if (form !== null) {
            form.addEventListener("submit", async (e) => {
                e.preventDefault();

                const currentPasswordElement =
                    document.querySelector("#current-password");
                let oldPassword = "";
                if (
                    currentPasswordElement &&
                    currentPasswordElement.childNodes[1] &&
                    (currentPasswordElement.childNodes[1] as HTMLElement)
                        .children[1]
                ) {
                    oldPassword = (
                        (currentPasswordElement.childNodes[1] as HTMLElement)
                            .children[1] as HTMLInputElement
                    ).value;
                }
                let newPasswordInput: HTMLInputElement | null = null;
                const newPasswordDiv = document.querySelector("#new-password");
                if (
                    newPasswordDiv &&
                    newPasswordDiv.childNodes[1] &&
                    (newPasswordDiv.childNodes[1] as HTMLElement).children[1]
                ) {
                    newPasswordInput = (
                        newPasswordDiv.childNodes[1] as HTMLElement
                    ).children[1] as HTMLInputElement;
                }

                let isCorrect: boolean;

                if (
                    !localStorage.getItem("passwordHash") ||
                    !localStorage.getItem("salt")
                ) {
                    isCorrect = true;
                    if (currentPasswordDiv !== null) {
                        (currentPasswordDiv as HTMLElement).style.display =
                            "none";
                    }
                } else {
                    isCorrect = await checkPassword(oldPassword);
                }
                if (!isCorrect) {
                    if (status !== null) {
                        status.innerHTML = "Incorrect Password";

                        setTimeout(() => {
                            status.innerHTML = "";
                        }, 1500);
                    }
                } else {
                    if (status !== null) {
                        status.innerHTML = "Changing Password";
                    }
                    try {
                        if (newPasswordInput !== null) {
                            await setPassword(newPasswordInput.value);
                        }
                        if (status !== null) {
                            status.innerHTML = "Sucessfully changed password";
                        }
                        if (newPasswordInput !== null) {
                            newPasswordInput.value = "";
                        }
                        if (currentPasswordDiv !== null) {
                            (currentPasswordDiv as HTMLElement).style.display =
                                "";
                        }
                    } catch (e) {
                        if (status !== null) {
                            status.innerHTML = "Failed to set password";
                        }
                        console.error(e);
                    }
                }
            });
        }
    } else {
        console.warn("You shouldn't be here. Go to settings.");
        document.children[0].innerHTML =
            "Go to the settings page to enable this feature.";
    }
});
