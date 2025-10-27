// Підключення функціоналу "Чертоги Фрілансера"
import { FLS } from "@js/common/functions.js";
// Docs: https://www.npmjs.com/package/gsap
import { gsap, ScrollTrigger, Draggable, MotionPathPlugin, MorphSVGPlugin } from "gsap/all";
// Стилі модуля
import './gsap.scss'

function gsapInit() {
	// Example
	const chars = document.querySelectorAll('[data-fls-splittype][data-fls-gsap] .char')
	console.log(chars);
	// gsap.from(chars, {
	// 	opacity: 0,
	// 	y: 20,
	// 	duration: 0.5,
	// 	stagger: { amount: 0.5 },
	// })



	const durationY = 3.0; // Тривалість руху Y (падіння або підйому)
	const scaleStartPoint = durationY * 0.7; // 70% від 1.0 секунди = 0.7 сек
	const scaleDuration = durationY * 0.3; // 30% від 1.0 секунди = 0.3 сек

	const tl = gsap.timeline({
		repeat: -1,
		defaults: {
			x: 0,
			transformOrigin: "center center",
			// Вмикаємо 3D-прискорення для плавного обертання
			force3D: true
		}
	});

	// ФАЗА ПАДІННЯ (ВНИЗ)

	tl.to("[data-fls-gsap]", {
		// 1. РУХ Y ВНИЗ (лінійно)
		y: 350,
		duration: durationY,
		ease: "linear"
	}, 0)

		.to("[data-fls-gsap]", {
			// 2. НАБЛИЖЕННЯ (Scale) + ОБЕРТАННЯ
			scale: 1.2,
			rotationY: 180, // 👈 ДОДАЄМО ПОВНИЙ ОБЕРТ
			duration: scaleDuration,
			ease: "power1.inOut"
		}, scaleStartPoint)

		// ФАЗА ПІДЙОМУ (ВГОРУ)

		.to("[data-fls-gsap]", {
			// 3. РУХ Y ВГОРУ (лінійно)
			y: 0,
			duration: durationY,
			ease: "linear"
		})

		.to("[data-fls-gsap]", {
			// 4. ВІДДАЛЕННЯ (Scale) + ОБЕРТАННЯ
			scale: 1,
			rotationY: 0, // 👈 ПОВЕРТАЄМО ДО ПОЧАТКОВОГО СТАНУ (0 градусів)
			duration: scaleDuration,
			ease: "power1.inOut"
		}, `-=${scaleDuration}`);




	gsap.to("[data-fls-gsap2]", {
		// 1. Властивість руху: рухаємо на 20 пікселів вгору
		y: -40,

		// 2. Тривалість анімації
		duration: 1.5,

		// 3. Згладжування (Уповільнення)
		ease: "expoScale(0.5,7,none)",

		// 4. Повторення: постійне плавання
		repeat: -1,

		// 5. Повернення (Йо-Йо): автоматичний рух назад
		yoyo: true,
	});
}

document.querySelector('[data-fls-gsap]') ?
	window.addEventListener('load', gsapInit) : null


