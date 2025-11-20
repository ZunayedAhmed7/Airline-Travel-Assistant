let index = 0;
const slides = document.querySelectorAll('.hero-slide');

setInterval(() => {
    slides[index].style.opacity = 0;
    index = (index + 1) % slides.length;
    slides[index].style.opacity = 1;
}, 5000);

const tripSelect = document.getElementById("tripTypeSelect");
const returnField = document.getElementById("returnField");

tripSelect.addEventListener("change", () => {
    if (tripSelect.value === "oneway") {
        returnField.classList.add("hidden");
    } else {
        returnField.classList.remove("hidden");
    }
});
