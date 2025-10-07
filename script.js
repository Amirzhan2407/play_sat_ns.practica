document.addEventListener('DOMContentLoaded', function() {
    // Элементы интерфейса
    const levelSelect = document.getElementById('levelSelect');
    const gameContainer = document.getElementById('gameContainer');
    const taskText = document.getElementById('taskText');
    const currentLevelSpan = document.getElementById('currentLevel');
    const slotsContainer = document.getElementById('slotsContainer');
    const cardsContainer = document.getElementById('cardsContainer');
    const checkButton = document.getElementById('checkButton');
    const backButton = document.getElementById('backButton');
    const resultBlock = document.getElementById('resultBlock');
    const resultText = document.getElementById('resultText');
    const nextLevelButton = document.getElementById('nextLevelButton');
    const tryAgainButton = document.getElementById('tryAgainButton');
    const levelButtons = document.querySelectorAll('.level-btn');

    // База данных уровней
    const levels = {
        1: {
            title: "Настройка рабочего места",
            task: "Как правильно настроить рабочее место?",
            cards: [
                { text: "Сесть на удобное кресло", correct: 1 },
                { text: "Установить клавиатуру на правильной высоте", correct: 2 },
                { text: "Настроить монитор на уровне глаз", correct: 3 },
                { text: "Разместить документы в зоне доступа", correct: 4 }
            ]
        },
        2: {
            title: "Безопасность в офисе",
            task: "Правильная последовательность действий при эвакуации",
            cards: [
                { text: "Сообщить коллегам об эвакуации", correct: 1 },
                { text: "Отключить электроприборы", correct: 2 },
                { text: "Взять личные вещи", correct: 3 },
                { text: "Покинуть помещение через ближайший выход", correct: 4 }
            ]
        },
        3: {
            title: "Обслуживание клиентов",
            task: "Этапы качественного обслуживания клиента",
            cards: [
                { text: "Приветствие и установление контакта", correct: 1 },
                { text: "Выявление потребностей клиента", correct: 2 },
                { text: "Предложение решения", correct: 3 },
                { text: "Завершение взаимодействия", correct: 4 }
            ]
        }
    };

    let currentLevel = 1;
    let totalLevels = Object.keys(levels).length;
    let draggedCard = null;

    // Инициализация игры
    function initGame() {
        levelButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const level = parseInt(btn.getAttribute('data-level'));
                startLevel(level);
            });
        });

        backButton.addEventListener('click', showLevelSelect);
        checkButton.addEventListener('click', checkSequence);
        tryAgainButton.addEventListener('click', resetLevel);
        nextLevelButton.addEventListener('click', goToNextLevel);
    }

    // Запуск уровня
    function startLevel(level) {
        currentLevel = level;
        const levelData = levels[level];
        
        // Обновляем интерфейс
        currentLevelSpan.textContent = level;
        taskText.textContent = levelData.task;
        
        // Создаем слоты и карточки
        createSlots();
        createCards(levelData.cards);
        
        // Показываем игровое поле
        levelSelect.classList.add('hidden');
        gameContainer.classList.remove('hidden');
        resultBlock.classList.add('hidden');
        
        checkButton.disabled = true;
    }

    // Создание слотов
    function createSlots() {
        slotsContainer.innerHTML = '';
        for (let i = 1; i <= 4; i++) {
            const slot = document.createElement('div');
            slot.className = 'slot';
            slot.setAttribute('data-number', i);
            slot.textContent = i;
            slot.setAttribute('droppable', 'true');
            
            // Назначаем обработчики событий для drag and drop
            slot.addEventListener('dragover', handleDragOver);
            slot.addEventListener('dragenter', handleDragEnter);
            slot.addEventListener('dragleave', handleDragLeave);
            slot.addEventListener('drop', handleDrop);
            
            slotsContainer.appendChild(slot);
        }
    }

    // Создание карточек
    function createCards(cardsData) {
        cardsContainer.innerHTML = '';
        
        cardsData.forEach(cardData => {
            const card = document.createElement('div');
            card.className = 'card';
            card.setAttribute('draggable', 'true');
            card.setAttribute('data-correct', cardData.correct);
            card.textContent = cardData.text;
            
            // Важно: добавляем атрибут для drag and drop
            card.setAttribute('drag-item', 'true');
            
            // Назначаем обработчики событий
            card.addEventListener('dragstart', handleDragStart);
            card.addEventListener('dragend', handleDragEnd);
            card.addEventListener('touchstart', handleTouchStart, { passive: false });
            card.addEventListener('touchmove', handleTouchMove, { passive: false });
            card.addEventListener('touchend', handleTouchEnd);
            
            cardsContainer.appendChild(card);
        });
        
        // Перемешиваем карточки
        shuffleCards();
    }

    // ===== DRAG AND DROP ФУНКЦИИ =====
    function handleDragStart(e) {
        draggedCard = this;
        this.classList.add('dragging');
        e.dataTransfer.setData('text/plain', this.getAttribute('data-correct'));
        e.dataTransfer.effectAllowed = 'move';
    }

    function handleDragEnd() {
        this.classList.remove('dragging');
        draggedCard = null;
    }

    function handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }

    function handleDragEnter(e) {
        e.preventDefault();
        if (!this.classList.contains('filled')) {
            this.classList.add('hover');
        }
    }

    function handleDragLeave() {
        this.classList.remove('hover');
    }

    function handleDrop(e) {
        e.preventDefault();
        this.classList.remove('hover');
        
        if (!this.classList.contains('filled') && draggedCard) {
            // Проверяем, что карточка еще не в слоте
            if (draggedCard.parentElement === cardsContainer) {
                this.appendChild(draggedCard);
                this.classList.add('filled');
                draggedCard.style.margin = '0';
                
                // Проверяем, все ли слоты заполнены
                const filledSlots = document.querySelectorAll('.slot.filled').length;
                checkButton.disabled = filledSlots !== 4;
            }
        }
    }

    // ===== TOUCH EVENTS для мобильных устройств =====
    let touchStartX = 0;
    let touchStartY = 0;

    function handleTouchStart(e) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        draggedCard = this;
        this.classList.add('dragging');
        e.preventDefault();
    }

    function handleTouchMove(e) {
        if (!draggedCard) return;
        
        const touchX = e.touches[0].clientX;
        const touchY = e.touches[0].clientY;
        
        // Плавное перемещение карточки
        draggedCard.style.position = 'absolute';
        draggedCard.style.left = (touchX - draggedCard.offsetWidth / 2) + 'px';
        draggedCard.style.top = (touchY - draggedCard.offsetHeight / 2) + 'px';
        
        e.preventDefault();
    }

    function handleTouchEnd(e) {
        if (!draggedCard) return;
        
        const touchX = e.changedTouches[0].clientX;
        const touchY = e.changedTouches[0].clientY;
        
        // Находим слот, над которым отпустили карточку
        const slots = document.querySelectorAll('.slot');
        let targetSlot = null;
        
        slots.forEach(slot => {
            const rect = slot.getBoundingClientRect();
            if (
                touchX >= rect.left &&
                touchX <= rect.right &&
                touchY >= rect.top &&
                touchY <= rect.bottom &&
                !slot.classList.contains('filled')
            ) {
                targetSlot = slot;
            }
        });
        
        if (targetSlot && draggedCard.parentElement === cardsContainer) {
            targetSlot.appendChild(draggedCard);
            targetSlot.classList.add('filled');
            draggedCard.style.position = '';
            draggedCard.style.left = '';
            draggedCard.style.top = '';
            draggedCard.style.margin = '0';
            
            // Проверяем, все ли слоты заполнены
            const filledSlots = document.querySelectorAll('.slot.filled').length;
            checkButton.disabled = filledSlots !== 4;
        } else {
            // Возвращаем карточку на место
            draggedCard.style.position = '';
            draggedCard.style.left = '';
            draggedCard.style.top = '';
        }
        
        draggedCard.classList.remove('dragging');
        draggedCard = null;
    }

    // Проверка последовательности
    function checkSequence() {
        let isCorrect = true;
        const slots = document.querySelectorAll('.slot');
        
        slots.forEach(slot => {
            const card = slot.querySelector('.card');
            if (card) {
                const correctPosition = slot.getAttribute('data-number');
                const cardCorrectValue = card.getAttribute('data-correct');
                
                if (correctPosition === cardCorrectValue) {
                    card.classList.add('correct');
                    card.classList.remove('incorrect');
                } else {
                    card.classList.add('incorrect');
                    card.classList.remove('correct');
                    isCorrect = false;
                }
            }
        });
        
        // Показываем результат
        if (isCorrect) {
            resultText.textContent = `🎉 Отлично! Уровень ${currentLevel} пройден!`;
            resultBlock.className = 'result success';
            
            // Показываем кнопку следующего уровня, если он есть
            if (currentLevel < totalLevels) {
                nextLevelButton.classList.remove('hidden');
            } else {
                nextLevelButton.classList.add('hidden');
                resultText.textContent += ' Вы прошли все уровни! 🏆';
            }
        } else {
            resultText.textContent = '❌ Есть ошибки! Попробуйте снова.';
            resultBlock.className = 'result error';
            nextLevelButton.classList.add('hidden');
        }
        
        resultBlock.classList.remove('hidden');
        checkButton.disabled = true;
    }

    // Сброс уровня
    function resetLevel() {
        const slots = document.querySelectorAll('.slot');
        slots.forEach(slot => {
            slot.classList.remove('filled', 'hover');
            const card = slot.querySelector('.card');
            if (card) {
                cardsContainer.appendChild(card);
                card.classList.remove('correct', 'incorrect');
                card.style.margin = '';
                card.style.position = '';
                card.style.left = '';
                card.style.top = '';
            }
        });
        
        shuffleCards();
        resultBlock.classList.add('hidden');
        checkButton.disabled = true;
    }

    // Переход на следующий уровень
    function goToNextLevel() {
        if (currentLevel < totalLevels) {
            startLevel(currentLevel + 1);
        }
    }

    // Показать экран выбора уровня
    function showLevelSelect() {
        gameContainer.classList.add('hidden');
        levelSelect.classList.remove('hidden');
        resultBlock.classList.add('hidden');
    }

    // Перемешивание карточек
    function shuffleCards() {
        const cards = Array.from(cardsContainer.querySelectorAll('.card'));
        for (let i = cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            cardsContainer.appendChild(cards[j]);
        }
    }

    // Запускаем игру
    initGame();
});