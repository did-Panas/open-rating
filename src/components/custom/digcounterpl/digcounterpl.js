// ===== ANIMATED COUNTER (with delayed appearance of symbols) =======================

/**
 * Модуль анімації цифрових лічильників при попаданні в поле зору.
 */
function animatedCounters() {

	const ANIMATION_DURATION = 4000; // Фіксована тривалість анімації - 4 секунди

	/**
	 * Форматує число згідно з вказаним форматом (зараз підтримує тільки кому як роздільник тисяч).
	 * @param {number} value - Число для форматування.
	 * @param {string} format - Символ форматування (напр., ',').
	 * @returns {string} - Форматоване число.
	 */
	function formatNumber(value, format) {
		if (format === ',') {
			// Додає кому як роздільник тисяч
			return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		}
		// Повертаємо як є, якщо формат не вказано або не підтримується
		return value.toString();
	}

	/**
	 * Анімує один лічильник від 0 до цільового значення.
	 * @param {HTMLElement} counterElement - HTML елемент лічильника ([data-digits-counter]).
	 * @param {number} duration - Тривалість анімації в мілісекундах.
	 * @returns {Promise<void>} - Проміс, що вирішується після завершення анімації.
	 */
	function animateSingleCounter(counterElement, duration) {
		return new Promise((resolve, reject) => {
			const targetValueStr = counterElement.dataset.digitsCounterTarget;
			const targetValue = parseFloat(targetValueStr.replace(/,/g, '')); // Видаляємо коми для розрахунків
			const format = counterElement.dataset.digitsCounterFormat || ''; // Отримуємо формат

			// Перевірка, чи цільове значення є дійсним числом
			if (isNaN(targetValue)) {
				console.error("Неправильне цільове значення лічильника:", targetValueStr, "для елемента:", counterElement);
				counterElement.innerHTML = targetValueStr; // Показуємо початкове значення як є
				return resolve(); // Вирішуємо Проміс, щоб не блокувати Promise.all
			}

			let startTimestamp = null;

			const step = (timestamp) => {
				if (!startTimestamp) startTimestamp = timestamp;

				const progress = Math.min((timestamp - startTimestamp) / duration, 1);
				const currentValue = Math.floor(progress * targetValue); // Розрахунок поточного значення

				// Оновлення HTML з форматуванням
				counterElement.innerHTML = formatNumber(currentValue, format);

				if (progress < 1) {
					window.requestAnimationFrame(step); // Продовжуємо анімацію
				} else {
					// Переконуємося, що кінцеве значення точно встановлено (на випадок похибок float)
					counterElement.innerHTML = formatNumber(targetValue, format);
					resolve(); // Анімація завершена!
				}
			};

			// Запускаємо перший кадр анімації
			window.requestAnimationFrame(step);
		});
	}

	/**
	 * Ініціалізує та запускає анімацію для всіх лічильників всередині вказаного контейнера.
	 * @param {HTMLElement} container - Контейнер, в якому шукати лічильники (напр., блок, що з'явився на екрані).
	 */
	function initAndAnimateCounters(container) {
		const counters = container.querySelectorAll("[data-digits-counter]");
		const spans = container.querySelectorAll(".numbers__num span");
		const texts = container.querySelectorAll(".numbers__txt");

		if (!counters.length) {
			return; // Немає лічильників у цьому контейнері
		}

		const animationPromises = [];

		// Підготовка: зберігаємо цільове значення та обнуляємо
		counters.forEach(counter => {
			if (!counter.dataset.digitsCounterTarget) { // Запускаємо лише якщо ще не анімовано
				const originalValue = counter.innerHTML;
				counter.dataset.digitsCounterTarget = originalValue; // Зберігаємо ціль
				counter.innerHTML = '0'; // Починаємо з нуля
				// Додаємо Проміс анімації до масиву
				animationPromises.push(animateSingleCounter(counter, ANIMATION_DURATION));
			}
		});


		// Якщо ми почали якісь анімації
		if (animationPromises.length > 0) {
			// Чекаємо завершення ВСІХ анімацій у цьому контейнері
			Promise.all(animationPromises)
				.then(() => {
					console.log("Анімація лічильників у контейнері завершена.");
					// Робимо видимими ВСІ span'и всередині цього контейнера
					spans.forEach(span => {
						span.style.opacity = '1';
					});
					texts.forEach(text => {
						text.style.opacity = '1';
					});
				})
				.catch(error => {
					console.error("Помилка під час анімації лічильників:", error);
				});
		}
	}

	/**
	 * Обробник події від "спостерігача" (наприклад, IntersectionObserver).
	 * Ця функція викликається, коли елемент з data-watch з'являється на екрані.
	 * @param {CustomEvent} e - Подія, що містить деталі від спостерігача.
	 */
	function handleWatcherCallback(e) {
		if (!e.detail || !e.detail.entry || !e.detail.entry.target) {
			console.warn("Подія watcherCallback не містить необхідних даних.");
			return;
		}

		const targetElement = e.detail.entry.target; // Елемент, що з'явився (у вашому випадку .numbers)

		// Перевіряємо, чи елемент справді видимий (важливо для IntersectionObserver)
		if (e.detail.entry.isIntersecting) {
			// Шукаємо лічильники ТІЛЬКИ всередині елемента, що з'явився
			initAndAnimateCounters(targetElement);
		}
	}

	// Припускаємо, що у вас є зовнішній скрипт ("спостерігач"), який
	// знаходить елементи з атрибутом `data-watch` і генерує подію "watcherCallback",
	// коли вони з'являються на екрані.
	// Якщо такого скрипта немає, вам потрібно буде реалізувати IntersectionObserver
	// самостійно, щоб викликати `initAndAnimateCounters` у потрібний момент.

	// Слухаємо кастомну подію від "спостерігача"
	document.addEventListener("watcherCallback", handleWatcherCallback);

	// На випадок, якщо елемент вже видимий при завантаженні сторінки
	// (якщо ваш спостерігач не обробляє це), можна додати перевірку:
	// document.querySelectorAll("[data-watch]").forEach(watchedElement => {
	//    // Тут потрібна логіка перевірки початкової видимості,
	//    // що виходить за рамки простої анімації лічильника.
	//    // Зазвичай це робить сам скрипт "спостерігача".
	// });

}

// Запускаємо налаштування анімованих лічильників
// Краще викликати після завантаження DOM
document.addEventListener('DOMContentLoaded', animatedCounters);